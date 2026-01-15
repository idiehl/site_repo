"""User profile endpoints."""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.models.user import UserProfile
from atlasops.schemas.user import UserProfileResponse, UserProfileUpdate
from atlasops.services.resume_parser import ResumeParser

logger = logging.getLogger(__name__)
router = APIRouter()


class ResumeParseResponse(BaseModel):
    """Response for resume parsing."""
    
    message: str
    parsed_fields: list[str]
    confidence: float
    profile: Optional[dict] = None


@router.get("", response_model=UserProfileResponse)
async def get_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> UserProfile:
    """Get current user's profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return profile


@router.patch("", response_model=UserProfileResponse)
async def update_profile(
    profile_in: UserProfileUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> UserProfile:
    """Update current user's profile."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/enhance")
async def enhance_profile(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Use AI to enhance profile content."""
    # TODO: Implement AI enhancement
    return {"message": "Profile enhancement queued"}


@router.post("/upload-resume", response_model=ResumeParseResponse)
async def upload_resume(
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> dict:
    """
    Upload a resume file and parse it to populate profile.
    
    Supports PDF and plain text files.
    """
    # Validate file type
    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, TXT, DOC, DOCX",
        )
    
    # Read file content
    content = await file.read()
    
    # Extract text based on file type
    if file.content_type == "application/pdf":
        resume_text = await extract_text_from_pdf(content)
    elif file.content_type == "text/plain":
        resume_text = content.decode("utf-8", errors="ignore")
    else:
        # For DOC/DOCX, we'd need python-docx - for now, return error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DOC/DOCX support coming soon. Please upload PDF or TXT.",
        )
    
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract enough text from file. Please try a different format.",
        )
    
    # Parse resume with LLM
    parser = ResumeParser()
    try:
        parsed_data = await parser.parse_resume_text(resume_text)
        profile_update = parser.map_to_profile_update(parsed_data)
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}",
        )
    
    # Get user's profile
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Update profile with parsed data (only update non-null fields)
    updated_fields = []
    for field, value in profile_update.items():
        if value is not None:
            # For lists/dicts, only update if not empty
            if isinstance(value, (list, dict)) and not value:
                continue
            setattr(profile, field, value)
            updated_fields.append(field)
    
    # Update metadata
    profile.resume_parsed_at = datetime.now(timezone.utc)
    profile.completeness_score = profile.calculate_completeness()
    
    await db.commit()
    await db.refresh(profile)
    
    return {
        "message": f"Resume parsed successfully. Updated {len(updated_fields)} fields.",
        "parsed_fields": updated_fields,
        "confidence": parsed_data.get("parsing_confidence", 0.5),
        "profile": {
            "full_name": profile.full_name,
            "headline": profile.headline,
            "skills_count": len(profile.skills) if profile.skills else 0,
            "work_history_count": len(profile.work_history) if profile.work_history else 0,
            "education_count": len(profile.education) if profile.education else 0,
            "completeness_score": profile.completeness_score,
        },
    }


async def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF file content."""
    try:
        import fitz  # PyMuPDF
        
        # Open PDF from bytes
        doc = fitz.open(stream=content, filetype="pdf")
        
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        
        doc.close()
        return "\n".join(text_parts)
    
    except ImportError:
        # Fallback to PyPDF2 if pymupdf not available
        try:
            import io
            from PyPDF2 import PdfReader
            
            reader = PdfReader(io.BytesIO(content))
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
            return "\n".join(text_parts)
        
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF parsing library not installed. Please contact support.",
            )


@router.get("/completeness")
async def get_profile_completeness(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Get profile completeness score and missing fields."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    # Calculate current score
    score = profile.calculate_completeness()
    
    # Identify missing fields
    missing = []
    if not profile.full_name:
        missing.append({"field": "full_name", "label": "Full Name", "weight": 10})
    if not profile.headline:
        missing.append({"field": "headline", "label": "Professional Headline", "weight": 10})
    if not profile.summary:
        missing.append({"field": "summary", "label": "Summary", "weight": 10})
    if not profile.profile_picture_url:
        missing.append({"field": "profile_picture_url", "label": "Profile Picture", "weight": 5})
    if not profile.location:
        missing.append({"field": "location", "label": "Location", "weight": 5})
    if not profile.work_history or len(profile.work_history) == 0:
        missing.append({"field": "work_history", "label": "Work Experience", "weight": 20})
    if not profile.education or len(profile.education) == 0:
        missing.append({"field": "education", "label": "Education", "weight": 10})
    if not profile.skills or len(profile.skills) == 0:
        missing.append({"field": "skills", "label": "Skills", "weight": 15})
    
    return {
        "score": score,
        "missing_fields": missing,
        "is_complete": score >= 80,
    }
