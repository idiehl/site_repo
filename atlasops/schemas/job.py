"""Job posting schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class JobIngestRequest(BaseModel):
    """Schema for job ingestion request."""

    urls: List[HttpUrl]


class JobIngestResponse(BaseModel):
    """Schema for job ingestion response."""

    message: str
    job_ids: List[str]


class JobRequirements(BaseModel):
    """Structured job requirements."""

    hard_skills: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    experience_years: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[List[str]] = None


class JobUpdateRequest(BaseModel):
    """Schema for updating a job posting."""

    company_name: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    remote_policy: Optional[str] = None
    salary_range: Optional[str] = None
    job_description: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    benefits: Optional[List[str]] = None


class JobPostingResponse(BaseModel):
    """Schema for job posting response."""

    id: UUID
    user_id: UUID
    url: str
    status: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    remote_policy: Optional[str] = None
    salary_range: Optional[str] = None
    job_description: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    benefits: Optional[List[str]] = None  # Benefits are returned as a list from LLM
    extraction_confidence: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeepDiveResponse(BaseModel):
    """Schema for company deep dive response."""

    id: UUID
    job_posting_id: UUID
    company_overview: Optional[str] = None
    culture_insights: Optional[str] = None
    role_analysis: Optional[str] = None
    interview_tips: Optional[str] = None
    sources: Optional[Dict[str, Any]] = None
    generated_at: datetime

    model_config = {"from_attributes": True}
