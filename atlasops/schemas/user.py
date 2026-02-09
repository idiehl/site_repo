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
    oauth_provider: Optional[str] = None
    is_admin: bool = False
    subscription_tier: Optional[str] = None
    subscription_status: Optional[str] = None
    resume_generations_used: int = 0
    resume_generation_reset_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    """Schema for requesting a password reset."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming a password reset."""

    token: str = Field(min_length=32)
    new_password: str = Field(min_length=8, max_length=100)


class PasswordResetResponse(BaseModel):
    """Schema for password reset responses."""

    message: str
    reset_token: Optional[str] = None
    expires_at: Optional[datetime] = None


class CurrentUserResponse(UserResponse):
    """Extended user response with entitlements."""

    resume_generation_limit: int
    can_access_premium_features: bool


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


class SocialLinks(BaseModel):
    """Social media links."""
    
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    portfolio: Optional[str] = None
    indeed: Optional[str] = None
    other: Optional[List[str]] = None


class UserProfileUpdate(BaseModel):
    """Schema for profile update."""

    full_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    profile_picture_url: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    contact_info: Optional[Dict[str, str]] = None


class UserProfileResponse(BaseModel):
    """Schema for profile response."""

    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    profile_picture_url: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None
    resume_file_url: Optional[str] = None
    resume_parsed_at: Optional[datetime] = None
    completeness_score: int = 0
    work_history: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    contact_info: Optional[Dict[str, str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
