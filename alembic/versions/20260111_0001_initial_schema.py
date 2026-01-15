"""Initial schema with all tables.

Revision ID: 0001
Revises: 
Create Date: 2026-01-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # Create user_profiles table
    op.create_table(
        "user_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("headline", sa.String(500), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("work_history", postgresql.JSON(), nullable=True),
        sa.Column("education", postgresql.JSON(), nullable=True),
        sa.Column("skills", postgresql.JSON(), nullable=True),
        sa.Column("projects", postgresql.JSON(), nullable=True),
        sa.Column("certifications", postgresql.JSON(), nullable=True),
        sa.Column("contact_info", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    # Create job_postings table
    op.create_table(
        "job_postings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(2048), nullable=False),
        sa.Column("url_hash", sa.String(64), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("job_title", sa.String(255), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("remote_policy", sa.String(100), nullable=True),
        sa.Column("salary_range", sa.String(100), nullable=True),
        sa.Column("job_description", sa.Text(), nullable=True),
        sa.Column("requirements", postgresql.JSON(), nullable=True),
        sa.Column("benefits", postgresql.JSON(), nullable=True),
        sa.Column("structured_data", postgresql.JSON(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("extraction_confidence", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_job_postings_url_hash", "job_postings", ["url_hash"])

    # Create company_deep_dives table
    op.create_table(
        "company_deep_dives",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_posting_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("company_overview", sa.Text(), nullable=True),
        sa.Column("culture_insights", sa.Text(), nullable=True),
        sa.Column("role_analysis", sa.Text(), nullable=True),
        sa.Column("interview_tips", sa.Text(), nullable=True),
        sa.Column("summary_json", postgresql.JSON(), nullable=True),
        sa.Column("sources", postgresql.JSON(), nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column("prompt_version", sa.String(50), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["job_posting_id"], ["job_postings.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_posting_id"),
    )

    # Create application status enum
    application_status = postgresql.ENUM(
        "pending",
        "applied",
        "followup_scheduled",
        "interview_scheduled",
        "offer_received",
        "rejected",
        "withdrawn",
        "no_response_closed",
        name="applicationstatus",
    )
    application_status.create(op.get_bind())

    # Create applications table
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_posting_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending",
                "applied",
                "followup_scheduled",
                "interview_scheduled",
                "offer_received",
                "rejected",
                "withdrawn",
                "no_response_closed",
                name="applicationstatus",
                create_type=False,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["job_posting_id"], ["job_postings.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create application_events table
    op.create_table(
        "application_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "from_status",
            postgresql.ENUM(
                "pending",
                "applied",
                "followup_scheduled",
                "interview_scheduled",
                "offer_received",
                "rejected",
                "withdrawn",
                "no_response_closed",
                name="applicationstatus",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column(
            "to_status",
            postgresql.ENUM(
                "pending",
                "applied",
                "followup_scheduled",
                "interview_scheduled",
                "offer_received",
                "rejected",
                "withdrawn",
                "no_response_closed",
                name="applicationstatus",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["application_id"], ["applications.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create generated_resumes table
    op.create_table(
        "generated_resumes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_posting_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("template_id", sa.String(50), nullable=False, server_default="default"),
        sa.Column("content_json", postgresql.JSON(), nullable=True),
        sa.Column("rendered_html", sa.Text(), nullable=True),
        sa.Column("file_path", sa.String(512), nullable=True),
        sa.Column("match_score", sa.Float(), nullable=True),
        sa.Column("matched_keywords", postgresql.JSON(), nullable=True),
        sa.Column("gaps", postgresql.JSON(), nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column("prompt_version", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["job_posting_id"], ["job_postings.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("generated_resumes")
    op.drop_table("application_events")
    op.drop_table("applications")
    op.drop_table("company_deep_dives")
    op.drop_table("job_postings")
    op.drop_table("user_profiles")
    op.drop_table("users")

    # Drop enum type
    op.execute("DROP TYPE IF EXISTS applicationstatus")
