"""Resume generation schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel


class ResumeGenerateRequest(BaseModel):
    """Schema for resume generation request."""

    template_id: str = "default"
    focus_keywords: Optional[List[str]] = None


class ResumeMatchAnalysis(BaseModel):
    """Schema for resume matching analysis."""

    match_score: float
    matched_keywords: List[str]
    gaps: List[str]
    suggestions: List[str]


class ResumeResponse(BaseModel):
    """Schema for generated resume response."""

    id: UUID
    job_posting_id: UUID
    template_id: str
    content_json: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    match_score: Optional[float] = None
    matched_keywords: Optional[Dict[str, Any]] = None
    gaps: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}
