"""Add ElectraCast podcasts table.

Revision ID: 0016
Revises: 0015
Create Date: 2026-02-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0016"
down_revision: Union[str, None] = "0015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "electracast_podcasts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("subtitle", sa.Text(), nullable=True),
        sa.Column("language", sa.String(10), nullable=False),
        sa.Column("itunes_categories", postgresql.JSON(), nullable=True),
        sa.Column("website", sa.String(255), nullable=True),
        sa.Column("owner_name", sa.String(255), nullable=True),
        sa.Column("owner_email", sa.String(255), nullable=True),
        sa.Column("explicit", sa.String(20), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("megaphone_podcast_id", sa.String(120), nullable=True),
        sa.Column("sync_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_electracast_podcasts_user_id",
        "electracast_podcasts",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_electracast_podcasts_user_id", table_name="electracast_podcasts")
    op.drop_table("electracast_podcasts")
