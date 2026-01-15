"""Enhance user profile with new fields.

Revision ID: 0003
Revises: 0002
Create Date: 2026-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add new profile fields."""
    # Add new columns to user_profiles
    op.add_column(
        "user_profiles",
        sa.Column("profile_picture_url", sa.String(500), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("location", sa.String(255), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("phone", sa.String(50), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("social_links", sa.JSON(), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("resume_file_url", sa.String(500), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("resume_parsed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("completeness_score", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    """Remove new profile fields."""
    op.drop_column("user_profiles", "completeness_score")
    op.drop_column("user_profiles", "resume_parsed_at")
    op.drop_column("user_profiles", "resume_file_url")
    op.drop_column("user_profiles", "social_links")
    op.drop_column("user_profiles", "phone")
    op.drop_column("user_profiles", "location")
    op.drop_column("user_profiles", "profile_picture_url")
