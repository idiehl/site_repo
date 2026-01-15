"""Job posting endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.models.job import JobPosting
from atlasops.schemas.job import (
    JobIngestRequest,
    JobIngestResponse,
    JobPostingResponse,
)

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

        # TODO: Queue background task for scraping
        # celery_app.send_task("atlasops.workers.tasks.scrape_job", args=[str(job.id)])

    await db.commit()

    return {
        "message": f"Queued {len(job_ids)} job(s) for processing",
        "job_ids": job_ids,
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


@router.post("/{job_id}/deep-dive")
async def generate_deep_dive(
    job_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generate a company deep dive for a job posting."""
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
        prompt_template = """Research {company_name} for a {job_title} position.

Job Description: {job_description}

Provide:
1. Company overview
2. Culture insights
3. Role analysis
4. Interview tips"""

    prompt = prompt_template.format(
        company_name=job.company_name,
        job_title=job.job_title or "this role",
        job_description=job.job_description or "Not available",
        sources="Public information",
    )

    response = await llm_client.complete(
        prompt,
        system_prompt="You are a company research analyst helping job seekers prepare for applications and interviews.",
        temperature=0.5,
    )

    # Save deep dive
    deep_dive = CompanyDeepDive(
        job_posting_id=job.id,
        company_overview=response,
        model_used="gpt-4o-mini",
        prompt_version="deep_dive_v1",
    )
    db.add(deep_dive)
    await db.commit()

    return {
        "message": "Deep dive generated successfully",
        "company_overview": response[:500] + "..." if len(response) > 500 else response,
    }
