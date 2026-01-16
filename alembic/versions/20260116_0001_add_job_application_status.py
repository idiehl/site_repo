"""Add application status fields to job_postings.

Revision ID: 0013
Revises: 0012
Create Date: 2026-01-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add application tracking fields to job_postings
    op.add_column(
        "job_postings",
        sa.Column("application_status", sa.String(50), nullable=True)
    )
    op.add_column(
        "job_postings",
        sa.Column("interview_date", sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        "job_postings",
        sa.Column("interview_notes", sa.Text(), nullable=True)
    )
    op.add_column(
        "job_postings",
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("job_postings", "applied_at")
    op.drop_column("job_postings", "interview_notes")
    op.drop_column("job_postings", "interview_date")
    op.drop_column("job_postings", "application_status")
