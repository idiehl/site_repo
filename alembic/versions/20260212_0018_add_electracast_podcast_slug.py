"""Add slug to ElectraCast podcasts.

Revision ID: 0018
Revises: 0017
Create Date: 2026-02-12
"""

from __future__ import annotations

import re
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0018"
down_revision: Union[str, None] = "0017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def normalize_slug(text: str) -> str:
    # Align with scripts/ingest_electracast.py normalize_slug
    text = text.replace("_", "-").lower()
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    text = re.sub(r"\-+", "-", text).strip("-")
    return text


def upgrade() -> None:
    op.add_column("electracast_podcasts", sa.Column("slug", sa.String(255), nullable=True))

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, title FROM electracast_podcasts")).fetchall()

    used: set[str] = set()
    for row in rows:
        pod_id = str(row.id)
        title = row.title or ""
        slug = normalize_slug(title)
        if not slug:
            slug = "podcast"
        if slug in used:
            slug = f"{slug}-{pod_id.split('-')[0]}"
        used.add(slug)
        bind.execute(
            sa.text("UPDATE electracast_podcasts SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": row.id},
        )

    op.alter_column("electracast_podcasts", "slug", existing_type=sa.String(255), nullable=False)
    op.create_index(
        "ix_electracast_podcasts_slug",
        "electracast_podcasts",
        ["slug"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_electracast_podcasts_slug", table_name="electracast_podcasts")
    op.drop_column("electracast_podcasts", "slug")

