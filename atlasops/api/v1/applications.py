"""Application tracking endpoints."""

from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.models.application import Application, ApplicationEvent, ApplicationStatus
from atlasops.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter()


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    current_user: CurrentUser,
    db: DbSession,
) -> List[Application]:
    """List all applications for current user."""
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_in: ApplicationCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> Application:
    """Create a new application."""
    application = Application(
        user_id=current_user.id,
        job_posting_id=app_in.job_posting_id,
        status=ApplicationStatus.PENDING,
        notes=app_in.notes,
    )
    db.add(application)
    await db.flush()

    # Log initial event
    event = ApplicationEvent(
        application_id=application.id,
        from_status=None,
        to_status=ApplicationStatus.PENDING,
        notes="Application created",
    )
    db.add(event)

    await db.commit()
    await db.refresh(application)
    return application


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> Application:
    """Get a specific application."""
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    return application


@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: UUID,
    app_in: ApplicationUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> Application:
    """Update an application (status, notes, reminder)."""
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    old_status = application.status

    update_data = app_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)

    # Log status change if status was updated
    if app_in.status and app_in.status != old_status:
        event = ApplicationEvent(
            application_id=application.id,
            from_status=old_status,
            to_status=app_in.status,
            notes=app_in.notes or f"Status changed to {app_in.status.value}",
        )
        db.add(event)

    application.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(application)
    return application


@router.post("/{app_id}/followup-message")
async def generate_followup_message(
    app_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generate a follow-up message for an application."""
    from atlasops.models.job import JobPosting
    from atlasops.models.user import UserProfile
    from atlasops.services.llm_client import llm_client

    # Get application
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Get job posting
    job_result = await db.execute(
        select(JobPosting).where(JobPosting.id == application.job_posting_id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    # Get user profile for name
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    
    user_name = profile.full_name if profile and profile.full_name else current_user.email.split('@')[0].title()
    
    # Calculate days since application
    days_since = (datetime.now(timezone.utc) - application.created_at).days
    
    prompt = f"""Write a professional follow-up email to check on the status of a job application.

Details:
- Position: {job.job_title or 'the position'}
- Company: {job.company_name or 'your company'}
- Applicant Name: {user_name}
- Days since application: {days_since} days

Guidelines:
1. Keep it brief and professional (3-4 sentences max)
2. Express continued interest in the role
3. Politely ask about the status or next steps
4. Don't be pushy or desperate
5. Include a professional sign-off

Return ONLY the email body text, ready to copy and paste. Do not include subject line or headers."""

    response = await llm_client.complete(
        prompt,
        system_prompt="You are an expert at writing professional, concise follow-up emails that get responses. Write naturally and warmly, not robotically.",
        temperature=0.7,
    )

    return {
        "job_title": job.job_title,
        "company_name": job.company_name,
        "days_since_applied": days_since,
        "followup_message": response.strip(),
        "suggested_subject": f"Following Up - {job.job_title} Application"
    }


@router.post("/{app_id}/interview-prep")
async def generate_interview_prep(
    app_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generate interview preparation materials."""
    from atlasops.models.job import JobPosting
    from atlasops.services.llm_client import llm_client

    # Get application with job
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Get job posting
    job_result = await db.execute(
        select(JobPosting).where(JobPosting.id == application.job_posting_id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found",
        )

    prompt = f"""Generate interview preparation materials for a {job.job_title or 'position'} at {job.company_name or 'the company'}.

Job Description:
{job.job_description or 'Not available'}

Requirements:
{job.requirements or 'Not specified'}

Please provide:
1. 5-7 likely technical interview questions with suggested answers
2. 5-7 behavioral interview questions with STAR-method answer frameworks
3. Key topics to study/review
4. Questions to ask the interviewer
5. Common pitfalls to avoid"""

    response = await llm_client.complete(
        prompt,
        system_prompt="You are an expert career coach helping candidates prepare for job interviews. Provide practical, actionable advice.",
        temperature=0.6,
    )

    return {
        "job_title": job.job_title,
        "company_name": job.company_name,
        "interview_prep": response,
    }


@router.post("/{app_id}/improvement")
async def generate_improvement_suggestions(
    app_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Generate improvement suggestions after rejection or no response."""
    from atlasops.models.job import JobPosting
    from atlasops.models.user import UserProfile
    from atlasops.services.llm_client import llm_client

    # Get application
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == current_user.id,
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Get job posting
    job_result = await db.execute(
        select(JobPosting).where(JobPosting.id == application.job_posting_id)
    )
    job = job_result.scalar_one_or_none()

    # Get user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    job_requirements = job.requirements if job else {}
    profile_skills = profile.skills if profile else []

    prompt = f"""Analyze the gap between a candidate's profile and job requirements, then provide improvement suggestions.

Job Title: {job.job_title if job else 'Unknown'}
Company: {job.company_name if job else 'Unknown'}

Job Requirements:
{job_requirements}

Candidate Skills:
{profile_skills}

Candidate Experience Summary:
{profile.summary if profile else 'Not provided'}

Please provide:
1. Gap Analysis: What skills/qualifications are missing?
2. Quick Wins: Skills that can be learned in 1-4 weeks
3. Medium-term Goals: Skills requiring 1-3 months to develop
4. Long-term Development: Career-building recommendations
5. Recommended Resources: Courses, certifications, or projects
6. Similar Roles: Alternative positions that might be a better fit"""

    response = await llm_client.complete(
        prompt,
        system_prompt="You are a career development advisor. Provide constructive, actionable feedback to help candidates improve their competitiveness.",
        temperature=0.5,
    )

    return {
        "job_title": job.job_title if job else None,
        "company_name": job.company_name if job else None,
        "application_status": application.status.value,
        "improvement_suggestions": response,
    }
