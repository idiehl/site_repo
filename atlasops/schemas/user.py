"""User and auth schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class UserResponse(BaseModel):
    """Schema for user response."""

    id: UUID
    email: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class WorkExperience(BaseModel):
    """Work experience entry."""

    company: str
    title: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = None


class Education(BaseModel):
    """Education entry."""

    institution: str
    degree: str
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None


class Project(BaseModel):
    """Project entry."""

    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    url: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Schema for profile update."""

    full_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    contact_info: Optional[Dict[str, str]] = None


class UserProfileResponse(BaseModel):
    """Schema for profile response."""

    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    contact_info: Optional[Dict[str, str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
