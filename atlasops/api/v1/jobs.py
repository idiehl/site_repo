"""Job posting endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession, PaidUser
from atlasops.models.job import JobPosting
from atlasops.schemas.job import (
    JobIngestHtmlRequest,
    JobIngestRequest,
    JobIngestResponse,
    JobPostingResponse,
    JobUpdateRequest,
)
from atlasops.workers.tasks import scrape_job_posting
from atlasops.services.entitlements import enforce_resume_quota, reset_resume_quota_if_needed

router = APIRouter()


@router.post("/ingest", response_model=JobIngestResponse)
async def ingest_jobs(
    request: JobIngestRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Ingest job posting URLs for processing."""
    job_ids = []
    for url in request.urls:
        # Create job posting record
        job = JobPosting(
            user_id=current_user.id,
            url=str(url),
            status="pending",
        )
        db.add(job)
        await db.flush()
        job_ids.append(str(job.id))

        # Queue background task for scraping
        scrape_job_posting.delay(str(job.id))

    await db.commit()

    return {
        "message": f"Queued {len(job_ids)} job(s) for processing",
        "job_ids": job_ids,
    }


@router.post("/ingest-html", response_model=JobIngestResponse)
async def ingest_job_html(
    request: JobIngestHtmlRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """
    Ingest a job posting from raw HTML content (browser extension).
    
    This endpoint accepts HTML captured by the browser extension,
    bypassing the need for server-side scraping.
    """
    from atlasops.workers.tasks import extract_job_from_html
    
    # Create job posting record
    job = JobPosting(
        user_id=current_user.id,
        url=request.url,
        status="processing",
        raw_text=request.html_content[:50000],  # Limit size
    )
    db.add(job)
    await db.flush()
    
    # Queue background task for extraction (no scraping needed)
    extract_job_from_html.delay(str(job.id), request.html_content)
    
    await db.commit()
    
    return {
        "message": "Job captured and queued for processing",
        "job_ids": [str(job.id)],
    }


@router.get("", response_model=List[JobPostingResponse])
async def list_jobs(
    current_user: CurrentUser,
    db: DbSession,
) -> List[JobPosting]:
    """List all job postings for current user."""
    result = await db.execute(
        select(JobPosting)
        .where(JobPosting.user_id == current_user.id)
        .order_by(JobPosting.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{job_id}", response_model=JobPostingResponse)
async def get_job(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> JobPosting:
    """Get a specific job posting."""
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """Delete a job posting."""
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    await db.delete(job)
    await db.commit()


@router.patch("/{job_id}", response_model=JobPostingResponse)
async def update_job(
    job_id: UUID,
    request: JobUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> JobPosting:
    """Update a job posting with new details."""
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Update fields if provided
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(job, field, value)

    # Re-validate minimum requirements and update status
    has_company = bool(job.company_name and job.company_name.strip())
    has_title = bool(job.job_title and job.job_title.strip())
    has_description = bool(job.job_description and len(job.job_description.strip()) > 50)

    if has_company and has_title and has_description:
        job.status = "completed"
        job.error_message = None
    else:
        job.status = "needs_review"
        missing = []
        if not has_company:
            missing.append("company name")
        if not has_title:
            missing.append("job title")
        if not has_description:
            missing.append("job description")
        job.error_message = f"Missing required fields: {', '.join(missing)}"

    await db.commit()
    await db.refresh(job)
    return job


@router.post("/{job_id}/extract-requirements", response_model=JobPostingResponse)
async def extract_requirements(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> JobPosting:
    """Extract requirements from job description using LLM."""
    import json
    import re
    
    from atlasops.services.llm_client import llm_client
    
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    
    # Need job description to extract requirements
    description_text = job.job_description or job.raw_text
    if not description_text or len(description_text) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job needs a description to extract requirements from",
        )
    
    # Build extraction prompt
    prompt = f"""Analyze this job description and extract the requirements.

Job Title: {job.job_title or 'Unknown'}
Company: {job.company_name or 'Unknown'}

Job Description:
{description_text}

Extract and return a JSON object with these fields:
{{
  "hard_skills": ["list of technical/hard skills required"],
  "soft_skills": ["list of soft skills required"],
  "experience_years": "string describing experience requirement (e.g., '3-5 years', '5+ years', 'Entry level') or null if not specified",
  "education": "string describing education requirement (e.g., 'Bachelor's in Computer Science', 'High school diploma') or null if not specified",
  "work_schedule": "string describing work schedule (e.g., 'Full-time', 'Part-time', 'Flexible hours', '9-5 EST', 'Shift work') or null if not specified",
  "certifications": ["list of required certifications or licenses"]
}}

Be thorough - look for:
- Technical skills, programming languages, tools, frameworks
- Soft skills like communication, teamwork, leadership
- Years of experience or experience level
- Education requirements (degrees, fields of study)
- Work schedule, hours, availability requirements
- Certifications, licenses, clearances

Return ONLY the JSON object, no additional text."""

    try:
        response = await llm_client.complete(
            prompt,
            system_prompt="You are a job requirements analyst. Extract requirements from job descriptions and return structured JSON.",
            temperature=0.3,
        )
        
        # Parse the JSON response
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            requirements = json.loads(json_match.group())
        else:
            raise ValueError("No valid JSON found in response")
        
        # Clean up empty arrays/nulls
        for key in ["hard_skills", "soft_skills", "certifications"]:
            if key in requirements and not requirements[key]:
                requirements[key] = []
        
        # Update job requirements
        job.requirements = requirements
        await db.commit()
        await db.refresh(job)
        
        return job
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse requirements: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract requirements: {str(e)}",
        )


@router.post("/{job_id}/retry", response_model=JobPostingResponse)
async def retry_job(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> JobPosting:
    """Retry processing a failed job posting."""
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    
    if job.status not in ("failed", "pending"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot retry job with status '{job.status}'",
        )
    
    # Reset job status and clear error
    job.status = "pending"
    job.error_message = None
    await db.commit()
    
    # Queue for reprocessing
    scrape_job_posting.delay(str(job.id))
    
    await db.refresh(job)
    return job


@router.post("/retry-all-failed")
async def retry_all_failed_jobs(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Retry all failed job postings for the current user."""
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.user_id == current_user.id,
            JobPosting.status == "failed",
        )
    )
    failed_jobs = list(result.scalars().all())
    
    if not failed_jobs:
        return {"message": "No failed jobs to retry", "count": 0}
    
    for job in failed_jobs:
        job.status = "pending"
        job.error_message = None
        scrape_job_posting.delay(str(job.id))
    
    await db.commit()
    
    return {
        "message": f"Queued {len(failed_jobs)} job(s) for reprocessing",
        "count": len(failed_jobs),
    }


@router.post("/{job_id}/manual-content")
async def save_manual_content(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
    content: dict,
) -> dict:
    """Save manually entered job content and process with LLM."""
    from atlasops.services.llm_client import llm_client
    
    # Get job posting
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )
    
    raw_text = content.get("content", "")
    if not raw_text or len(raw_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide more job content (at least 50 characters)",
        )
    
    # Store raw text
    job.raw_text = raw_text[:50000]
    
    # Extract with LLM
    try:
        extracted = await llm_client.extract_job_posting(raw_text, job.url)
        
        # Update job with extracted data
        job.company_name = extracted.get("company_name")
        job.job_title = extracted.get("job_title")
        job.location = extracted.get("location")
        job.remote_policy = extracted.get("remote_policy")
        job.salary_range = extracted.get("salary_range")
        job.job_description = extracted.get("job_description")
        job.requirements = extracted.get("requirements")
        job.benefits = extracted.get("benefits")
        job.structured_data = extracted
        job.extraction_confidence = extracted.get("extraction_confidence", 0.8)
        job.status = "completed"
        job.error_message = None
        
        await db.commit()
        
        return {
            "message": "Job content processed successfully",
            "company_name": job.company_name,
            "job_title": job.job_title,
        }
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process content: {str(e)}",
        )


@router.post("/{job_id}/resumes")
async def generate_resume(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generate a tailored resume for a job posting."""
    from atlasops.models.resume import GeneratedResume
    from atlasops.models.user import UserProfile
    from atlasops.services.resume_generator import (
        calculate_match_score,
        generate_resume_content,
        render_resume_html,
    )

    # Check and reset quota if needed, then enforce limits
    if reset_resume_quota_if_needed(current_user):
        await db.commit()
    enforce_resume_quota(current_user)

    # Get job posting
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile first",
        )

    # Build profile data dict
    profile_data = {
        "full_name": profile.full_name,
        "headline": profile.headline,
        "summary": profile.summary,
        "work_history": profile.work_history or [],
        "education": profile.education or [],
        "skills": profile.skills or [],
        "projects": profile.projects or [],
    }

    # Build job data dict
    job_data = {
        "job_title": job.job_title,
        "company_name": job.company_name,
        "job_description": job.job_description,
        "requirements": job.requirements or {},
    }

    # Calculate match score
    score, matched, gaps = calculate_match_score(
        profile_data, job.requirements or {}
    )

    # Generate content
    content = await generate_resume_content(profile_data, job_data)

    # Render HTML
    html = render_resume_html(content)

    # Save resume
    resume = GeneratedResume(
        job_posting_id=job.id,
        content_json=content,
        rendered_html=html,
        match_score=score,
        matched_keywords={"keywords": matched},
        gaps={"missing": gaps},
    )
    current_user.resume_generations_used += 1
    db.add(resume)
    await db.commit()
    await db.refresh(resume)

    return {
        "id": str(resume.id),
        "match_score": score,
        "matched_keywords": matched,
        "gaps": gaps,
        "message": "Resume generated successfully",
    }


@router.get("/{job_id}/resumes")
async def get_job_resumes(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> List[dict]:
    """Get all generated resumes for a job posting."""
    from atlasops.models.resume import GeneratedResume
    
    # Verify job belongs to user
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get resumes for this job
    resumes_result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.job_posting_id == job_id)
        .order_by(GeneratedResume.created_at.desc())
    )
    resumes = resumes_result.scalars().all()

    return [
        {
            "id": str(r.id),
            "match_score": r.match_score,
            "matched_keywords": r.matched_keywords,
            "gaps": r.gaps,
            "created_at": r.created_at.isoformat(),
        }
        for r in resumes
    ]


@router.get("/{job_id}/resumes/{resume_id}")
async def get_resume(
    job_id: UUID,
    resume_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Get a specific generated resume with HTML content."""
    from atlasops.models.resume import GeneratedResume
    
    # Verify job belongs to user
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get the resume
    resume_result = await db.execute(
        select(GeneratedResume).where(
            GeneratedResume.id == resume_id,
            GeneratedResume.job_posting_id == job_id,
        )
    )
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return {
        "id": str(resume.id),
        "match_score": resume.match_score,
        "matched_keywords": resume.matched_keywords,
        "gaps": resume.gaps,
        "content_json": resume.content_json,
        "rendered_html": resume.rendered_html,
        "created_at": resume.created_at.isoformat(),
    }


# Cover Letter endpoints
@router.post("/{job_id}/cover-letters")
async def generate_cover_letter(
    job_id: UUID,
    current_user: PaidUser,
    db: DbSession,
) -> dict:
    """Generate a tailored cover letter for a job posting."""
    import json
    import re
    from pathlib import Path
    
    from atlasops.models.resume import GeneratedCoverLetter
    from atlasops.models.user import UserProfile
    from atlasops.services.llm_client import llm_client

    # Get job posting
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    
    # Build profile data from available fields
    profile_data = {}
    if profile:
        profile_data = {
            "name": profile.full_name or current_user.email.split('@')[0].title(),
            "headline": profile.headline,
            "summary": profile.summary,
            "work_history": profile.work_history,
            "education": profile.education,
            "skills": profile.skills,
            "projects": profile.projects,
            "certifications": profile.certifications,
        }
    
    # Check if we have at least some profile data
    has_profile_data = profile and (profile.work_history or profile.skills or profile.summary)
    if not has_profile_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile or upload a resume first",
        )

    # Check for existing deep dive for company insights
    from atlasops.models.job import CompanyDeepDive
    dd_result = await db.execute(
        select(CompanyDeepDive).where(CompanyDeepDive.job_posting_id == job.id)
    )
    deep_dive = dd_result.scalar_one_or_none()
    company_insights = ""
    if deep_dive:
        company_insights = f"""
Company Overview: {deep_dive.company_overview or 'N/A'}
Culture: {deep_dive.culture_insights or 'N/A'}
"""

    # Load prompt template
    prompt_path = Path(__file__).parent.parent.parent / "prompts" / "cover_letter_v1.md"
    prompt_template = prompt_path.read_text(encoding="utf-8")
    
    # Build the prompt
    prompt = prompt_template.format(
        job_title=job.job_title or "the position",
        company_name=job.company_name or "the company",
        job_description=job.job_description or job.raw_text or "Not available",
        requirements=json.dumps(job.requirements or {}, indent=2),
        profile=json.dumps(profile_data, indent=2),
        company_insights=company_insights or "Not available",
    )

    response = await llm_client.complete(
        prompt,
        system_prompt="You are an expert career coach and professional writer. Create compelling, personalized cover letters.",
        temperature=0.7,
    )

    # Parse the response
    try:
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            content = json.loads(json_match.group())
        else:
            content = {"full_text": response}
    except json.JSONDecodeError:
        content = {"full_text": response}

    full_text = content.get("full_text", "")
    if not full_text and content.get("greeting"):
        # Reconstruct from parts
        full_text = f"""{content.get('greeting', 'Dear Hiring Manager,')}

{content.get('opening_paragraph', '')}

{content.get('body_paragraph_1', '')}

{content.get('body_paragraph_2', '')}

{content.get('closing_paragraph', '')}

{content.get('signature', 'Sincerely,')}
{profile.full_name or current_user.email.split('@')[0].title()}"""

    # Save the cover letter
    cover_letter = GeneratedCoverLetter(
        job_posting_id=job.id,
        content_json=content,
        full_text=full_text,
        model_used="gpt-4o-mini",
        prompt_version="cover_letter_v1",
    )
    db.add(cover_letter)
    await db.commit()
    await db.refresh(cover_letter)

    return {
        "id": str(cover_letter.id),
        "content_json": cover_letter.content_json,
        "full_text": cover_letter.full_text,
        "created_at": cover_letter.created_at.isoformat(),
    }


@router.get("/{job_id}/cover-letters")
async def get_job_cover_letters(
    job_id: UUID,
    current_user: PaidUser,
    db: DbSession,
) -> List[dict]:
    """Get all generated cover letters for a job posting."""
    from atlasops.models.resume import GeneratedCoverLetter
    
    # Verify job belongs to user
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get cover letters for this job
    cl_result = await db.execute(
        select(GeneratedCoverLetter)
        .where(GeneratedCoverLetter.job_posting_id == job_id)
        .order_by(GeneratedCoverLetter.created_at.desc())
    )
    cover_letters = cl_result.scalars().all()

    return [
        {
            "id": str(cl.id),
            "created_at": cl.created_at.isoformat(),
        }
        for cl in cover_letters
    ]


@router.get("/{job_id}/cover-letters/{cover_letter_id}")
async def get_cover_letter(
    job_id: UUID,
    cover_letter_id: UUID,
    current_user: PaidUser,
    db: DbSession,
) -> dict:
    """Get a specific generated cover letter."""
    from atlasops.models.resume import GeneratedCoverLetter
    
    # Verify job belongs to user
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get the cover letter
    cl_result = await db.execute(
        select(GeneratedCoverLetter).where(
            GeneratedCoverLetter.id == cover_letter_id,
            GeneratedCoverLetter.job_posting_id == job_id,
        )
    )
    cover_letter = cl_result.scalar_one_or_none()
    if not cover_letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cover letter not found",
        )

    return {
        "id": str(cover_letter.id),
        "content_json": cover_letter.content_json,
        "full_text": cover_letter.full_text,
        "created_at": cover_letter.created_at.isoformat(),
    }


@router.get("/{job_id}/deep-dive")
async def get_deep_dive(
    job_id: UUID,
    current_user: PaidUser,
    db: DbSession,
) -> dict:
    """Get the company deep dive for a job posting."""
    from atlasops.models.job import CompanyDeepDive

    # Get job posting
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get deep dive
    dd_result = await db.execute(
        select(CompanyDeepDive).where(CompanyDeepDive.job_posting_id == job.id)
    )
    deep_dive = dd_result.scalar_one_or_none()
    if not deep_dive:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No deep dive found for this job",
        )

    return {
        "id": str(deep_dive.id),
        "job_posting_id": str(deep_dive.job_posting_id),
        "company_overview": deep_dive.company_overview,
        "culture_insights": deep_dive.culture_insights,
        "role_analysis": deep_dive.role_analysis,
        "interview_tips": deep_dive.interview_tips,
        "summary_json": deep_dive.summary_json,
        "sources": deep_dive.sources,
        "generated_at": deep_dive.generated_at.isoformat() if deep_dive.generated_at else None,
    }


@router.post("/{job_id}/deep-dive")
async def generate_deep_dive(
    job_id: UUID,
    current_user: PaidUser,
    db: DbSession,
) -> dict:
    """Generate a company deep dive for a job posting."""
    import json
    from atlasops.models.job import CompanyDeepDive
    from atlasops.services.llm_client import llm_client

    # Get job posting
    result = await db.execute(
        select(JobPosting).where(
            JobPosting.id == job_id,
            JobPosting.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    if not job.company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job must be processed before generating deep dive",
        )

    # Check if deep dive already exists
    existing = await db.execute(
        select(CompanyDeepDive).where(CompanyDeepDive.job_posting_id == job.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deep dive already exists for this job",
        )

    # Generate deep dive using LLM
    try:
        prompt_template = llm_client.load_prompt("deep_dive_v1")
    except FileNotFoundError:
        prompt_template = """Research {{company_name}} for a {{job_title}} position.

Job Description: {{job_description}}

Return a JSON object with:
{{"company_overview": "Brief company description", "culture_insights": "Work culture and values", "role_analysis": "What this role entails", "interview_tips": "Preparation advice", "key_talking_points": ["Points to mention"], "potential_concerns": ["Things to ask about"]}}"""

    prompt = prompt_template.format(
        company_name=job.company_name,
        job_title=job.job_title or "this role",
        job_description=job.job_description or "Not available",
        sources="Public information",
    )

    response = await llm_client.complete(
        prompt,
        system_prompt="You are a company research analyst. Return ONLY a valid JSON object with company research insights. No markdown, no explanation - just JSON.",
        temperature=0.5,
    )

    # Parse the JSON response
    parsed = None
    company_overview = response
    culture_insights = None
    role_analysis = None
    interview_tips = None
    
    try:
        # Try to extract JSON from the response
        json_str = response.strip()
        if json_str.startswith("```"):
            # Remove markdown code blocks
            lines = json_str.split("\n")
            json_lines = []
            in_block = False
            for line in lines:
                if line.startswith("```"):
                    in_block = not in_block
                    continue
                if in_block or not line.startswith("```"):
                    json_lines.append(line)
            json_str = "\n".join(json_lines)
        
        parsed = json.loads(json_str)
        company_overview = parsed.get("company_overview", response)
        culture_insights = parsed.get("culture_insights")
        role_analysis = parsed.get("role_analysis")
        interview_tips = parsed.get("interview_tips")
    except json.JSONDecodeError:
        # If JSON parsing fails, store raw response as overview
        parsed = {"raw_response": response}

    # Save deep dive
    deep_dive = CompanyDeepDive(
        job_posting_id=job.id,
        company_overview=company_overview,
        culture_insights=culture_insights,
        role_analysis=role_analysis,
        interview_tips=interview_tips,
        summary_json=parsed,
        model_used="gpt-4o-mini",
        prompt_version="deep_dive_v1",
    )
    db.add(deep_dive)
    await db.commit()
    await db.refresh(deep_dive)

    return {
        "id": str(deep_dive.id),
        "message": "Deep dive generated successfully",
        "company_overview": company_overview,
        "culture_insights": culture_insights,
        "role_analysis": role_analysis,
        "interview_tips": interview_tips,
        "summary_json": parsed,
    }
