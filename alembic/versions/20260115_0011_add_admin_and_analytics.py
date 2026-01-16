"""Add admin field and analytics tables.

Revision ID: 0011
Revises: 0010
Create Date: 2026-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_admin field to users table
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"),
    )
    
    # Create site_visits table
    op.create_table(
        "site_visits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("path", sa.String(500), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("referer", sa.String(500), nullable=True),
        sa.Column("session_id", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_site_visits_user_id"), "site_visits", ["user_id"], unique=False)
    op.create_index(op.f("ix_site_visits_path"), "site_visits", ["path"], unique=False)
    op.create_index(op.f("ix_site_visits_session_id"), "site_visits", ["session_id"], unique=False)
    op.create_index(op.f("ix_site_visits_created_at"), "site_visits", ["created_at"], unique=False)
    
    # Create api_usage table
    op.create_table(
        "api_usage",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("endpoint", sa.String(500), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("response_time_ms", sa.Integer(), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_api_usage_user_id"), "api_usage", ["user_id"], unique=False)
    op.create_index(op.f("ix_api_usage_endpoint"), "api_usage", ["endpoint"], unique=False)
    op.create_index(op.f("ix_api_usage_status_code"), "api_usage", ["status_code"], unique=False)
    op.create_index(op.f("ix_api_usage_created_at"), "api_usage", ["created_at"], unique=False)
    
    # Create security_events table
    op.create_table(
        "security_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("details", postgresql.JSON(), nullable=True),
        sa.Column("resolved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_security_events_event_type"), "security_events", ["event_type"], unique=False)
    op.create_index(op.f("ix_security_events_severity"), "security_events", ["severity"], unique=False)
    op.create_index(op.f("ix_security_events_user_id"), "security_events", ["user_id"], unique=False)
    op.create_index(op.f("ix_security_events_ip_address"), "security_events", ["ip_address"], unique=False)
    op.create_index(op.f("ix_security_events_resolved"), "security_events", ["resolved"], unique=False)
    op.create_index(op.f("ix_security_events_created_at"), "security_events", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_security_events_created_at"), table_name="security_events")
    op.drop_index(op.f("ix_security_events_resolved"), table_name="security_events")
    op.drop_index(op.f("ix_security_events_ip_address"), table_name="security_events")
    op.drop_index(op.f("ix_security_events_user_id"), table_name="security_events")
    op.drop_index(op.f("ix_security_events_severity"), table_name="security_events")
    op.drop_index(op.f("ix_security_events_event_type"), table_name="security_events")
    op.drop_table("security_events")
    
    op.drop_index(op.f("ix_api_usage_created_at"), table_name="api_usage")
    op.drop_index(op.f("ix_api_usage_status_code"), table_name="api_usage")
    op.drop_index(op.f("ix_api_usage_endpoint"), table_name="api_usage")
    op.drop_index(op.f("ix_api_usage_user_id"), table_name="api_usage")
    op.drop_table("api_usage")
    
    op.drop_index(op.f("ix_site_visits_created_at"), table_name="site_visits")
    op.drop_index(op.f("ix_site_visits_session_id"), table_name="site_visits")
    op.drop_index(op.f("ix_site_visits_path"), table_name="site_visits")
    op.drop_index(op.f("ix_site_visits_user_id"), table_name="site_visits")
    op.drop_table("site_visits")
    
    op.drop_column("users", "is_admin")
