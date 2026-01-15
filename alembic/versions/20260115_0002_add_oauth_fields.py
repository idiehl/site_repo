"""Add OAuth fields to users table.

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make hashed_password nullable (for OAuth-only users)
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=True,
    )
    
    # Add OAuth fields
    op.add_column(
        "users",
        sa.Column("oauth_provider", sa.String(50), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("oauth_provider_id", sa.String(255), nullable=True),
    )
    
    # Create index for OAuth lookups
    op.create_index(
        "ix_users_oauth_provider_id",
        "users",
        ["oauth_provider", "oauth_provider_id"],
        unique=True,
        postgresql_where=sa.text("oauth_provider IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_users_oauth_provider_id", table_name="users")
    op.drop_column("users", "oauth_provider_id")
    op.drop_column("users", "oauth_provider")
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=False,
    )
