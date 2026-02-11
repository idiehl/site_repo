"""Add ElectraCast networks table.

Revision ID: 0017
Revises: 0016
Create Date: 2026-02-11
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0017"
down_revision: Union[str, None] = "0016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create networks table
    op.create_table(
        "electracast_networks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cover_image_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_electracast_networks_slug",
        "electracast_networks",
        ["slug"],
        unique=True,
    )

    # Add network_id and cover_image_url to podcasts table
    op.add_column(
        "electracast_podcasts",
        sa.Column("network_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "electracast_podcasts",
        sa.Column("cover_image_url", sa.String(500), nullable=True),
    )
    op.create_foreign_key(
        "fk_electracast_podcasts_network_id",
        "electracast_podcasts",
        "electracast_networks",
        ["network_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_electracast_podcasts_network_id",
        "electracast_podcasts",
        type_="foreignkey",
    )
    op.drop_column("electracast_podcasts", "cover_image_url")
    op.drop_column("electracast_podcasts", "network_id")
    op.drop_index("ix_electracast_networks_slug", table_name="electracast_networks")
    op.drop_table("electracast_networks")
