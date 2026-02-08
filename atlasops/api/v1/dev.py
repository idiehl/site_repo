"""Developer-only API endpoints for internal documentation and tools."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

import markdown
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from atlasops.api.deps import AdminUser

router = APIRouter(prefix="/dev", tags=["dev"])

# Paths to documentation files
REPO_ROOT = Path(__file__).parent.parent.parent.parent
DOCS_DIR = REPO_ROOT / "docs" / "master_log"
STATUS_FILE = DOCS_DIR / "dev_status.json"

APP_DOCS = {
    "atlas-forge": {
        "name": "Atlas Forge",
        "log": "Forge_Log.md",
        "overview": "Forge_Overview.md",
        "checklist": "Forge_Checklist.md",
    },
    "atlas-apply": {
        "name": "Atlas Apply",
        "log": "Apply_Log.md",
        "overview": "Apply_Overview.md",
        "checklist": "Apply_Checklist.md",
    },
    "atlas-universalis": {
        "name": "Atlas Universalis",
        "log": "Universalis_Log.md",
        "overview": "Universalis_Overview.md",
        "checklist": "Universalis_Checklist.md",
    },
    "electracast": {
        "name": "ElectraCast",
        "log": "Electracast_Log.md",
        "overview": "Electracast_Overview.md",
        "checklist": "Electracast_Checklist.md",
    },
    "atlas-meridian": {
        "name": "Atlas Meridian",
        "log": "Meridian_Log.md",
        "overview": "Meridian_Overview.md",
        "checklist": "Meridian_Checklist.md",
    },
}


class DevDocResponse(BaseModel):
    """Response for dev documentation endpoints."""
    title: str
    content_md: str
    content_html: str
    last_modified: Optional[str] = None


class DevChecklistTaskRequest(BaseModel):
    """Request payload for checklist task creation."""
    task: str


class DevStatus(BaseModel):
    """Current dev portal status."""
    status: Literal["READY", "PENDING", "BLOCKED"]
    message: Optional[str] = None
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None


class DevStatusUpdate(BaseModel):
    """Payload for updating dev portal status."""
    status: Literal["READY", "PENDING", "BLOCKED"]
    message: Optional[str] = None


def get_markdown_content(filename: str) -> tuple[str, str]:
    """Read markdown file and convert to HTML."""
    filepath = DOCS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Document not found: {filename}")
    
    md_content = filepath.read_text(encoding="utf-8")
    html_content = markdown.markdown(
        md_content,
        extensions=["tables", "fenced_code", "toc", "nl2br"]
    )
    return md_content, html_content


def normalize_checklist_task(task: str) -> str:
    """Normalize and validate a checklist task line."""
    cleaned = " ".join(task.replace("\r", " ").replace("\n", " ").split())
    if not cleaned:
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    if len(cleaned) > 240:
        raise HTTPException(status_code=400, detail="Task must be 240 characters or less")
    return cleaned


def append_checklist_task(filename: str, task: str) -> None:
    """Append a task under the Rapid Capture section."""
    filepath = DOCS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail=f"Document not found: {filename}")

    lines = filepath.read_text(encoding="utf-8").splitlines()
    header = "## Rapid Capture (Objectives)"
    placeholder = "- [ ] Add objectives here"
    task_line = f"- [ ] {task}"

    if header in lines:
        header_index = lines.index(header)
        insert_index = header_index + 1
        while insert_index < len(lines) and not lines[insert_index].strip():
            insert_index += 1
        if insert_index < len(lines) and lines[insert_index].strip() == placeholder:
            lines[insert_index] = task_line
        else:
            lines.insert(insert_index, task_line)
    else:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append(header)
        lines.append(task_line)

    updated = "\n".join(lines)
    if not updated.endswith("\n"):
        updated += "\n"
    filepath.write_text(updated, encoding="utf-8")


def build_doc_response(filename: str, title: str) -> DevDocResponse:
    """Build a DevDocResponse from a markdown file."""
    md_content, html_content = get_markdown_content(filename)
    filepath = DOCS_DIR / filename
    last_modified = filepath.stat().st_mtime if filepath.exists() else None
    return DevDocResponse(
        title=title,
        content_md=md_content,
        content_html=html_content,
        last_modified=str(last_modified) if last_modified else None,
    )


def build_default_status() -> DevStatus:
    """Create a default dev portal status payload."""
    timestamp = datetime.now(timezone.utc).isoformat()
    return DevStatus(
        status="READY",
        message="All systems ready.",
        updated_at=timestamp,
        updated_by="system",
    )


def serialize_status(status: DevStatus) -> dict:
    """Convert status model to dict across Pydantic versions."""
    if hasattr(status, "model_dump"):
        return status.model_dump()
    return status.dict()


def load_status() -> DevStatus:
    """Load status from disk, falling back to defaults."""
    if not STATUS_FILE.exists():
        status = build_default_status()
        STATUS_FILE.write_text(
            json.dumps(serialize_status(status), indent=2) + "\n",
            encoding="utf-8",
        )
        return status

    try:
        payload = json.loads(STATUS_FILE.read_text(encoding="utf-8"))
        return DevStatus(**payload)
    except (json.JSONDecodeError, ValueError):
        status = build_default_status()
        STATUS_FILE.write_text(
            json.dumps(serialize_status(status), indent=2) + "\n",
            encoding="utf-8",
        )
        return status


@router.get("/verify")
async def verify_access(admin: AdminUser):
    """Verify developer access (admin-only)."""
    return {
        "valid": True,
        "message": "Admin access granted",
        "email": admin.email,
    }


@router.get("/apps")
async def list_apps(admin: AdminUser):
    """List available applications for the dev portal."""
    apps = []
    for app_id, info in APP_DOCS.items():
        apps.append(
            {
                "id": app_id,
                "name": info["name"],
                "log": f"/api/v1/dev/apps/{app_id}/log",
                "overview": f"/api/v1/dev/apps/{app_id}/overview",
                "checklist": f"/api/v1/dev/apps/{app_id}/checklist",
            }
        )
    return {"apps": apps}


@router.get("/log", response_model=DevDocResponse)
async def get_master_log(admin: AdminUser):
    """Get the Master Log documentation."""
    try:
        return build_doc_response("Master_Log.md", "Master Log")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/overview", response_model=DevDocResponse)
async def get_project_overview(admin: AdminUser):
    """Get the Project Overview documentation."""
    try:
        return build_doc_response("PROJECT_OVERVIEW.md", "Project Overview")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/apps/{app_id}/log", response_model=DevDocResponse)
async def get_app_log(app_id: str, admin: AdminUser):
    """Get an application's log document."""
    app = APP_DOCS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Unknown application")
    try:
        return build_doc_response(app["log"], f"{app['name']} — Log")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/apps/{app_id}/overview", response_model=DevDocResponse)
async def get_app_overview(app_id: str, admin: AdminUser):
    """Get an application's overview document."""
    app = APP_DOCS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Unknown application")
    try:
        return build_doc_response(app["overview"], f"{app['name']} — Overview")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/apps/{app_id}/checklist", response_model=DevDocResponse)
async def get_app_checklist(app_id: str, admin: AdminUser):
    """Get an application's checklist document."""
    app = APP_DOCS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Unknown application")
    try:
        return build_doc_response(app["checklist"], f"{app['name']} — Checklist")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apps/{app_id}/checklist/tasks", response_model=DevDocResponse)
async def add_app_checklist_task(app_id: str, payload: DevChecklistTaskRequest, admin: AdminUser):
    """Add a task to an application's checklist document."""
    app = APP_DOCS.get(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Unknown application")
    try:
        task = normalize_checklist_task(payload.task)
        append_checklist_task(app["checklist"], task)
        return build_doc_response(app["checklist"], f"{app['name']} — Checklist")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/docs")
async def list_available_docs(admin: AdminUser):
    """List available documentation files."""
    docs = []
    if DOCS_DIR.exists():
        for f in DOCS_DIR.glob("*.md"):
            docs.append({
                "name": f.stem,
                "filename": f.name,
                "size": f.stat().st_size,
                "modified": f.stat().st_mtime
            })
    
    return {"docs": docs, "docs_dir": str(DOCS_DIR)}


@router.get("/status", response_model=DevStatus)
async def get_dev_status(admin: AdminUser):
    """Get the current dev portal status."""
    return load_status()


@router.put("/status", response_model=DevStatus)
async def update_dev_status(payload: DevStatusUpdate, admin: AdminUser):
    """Update the dev portal status."""
    timestamp = datetime.now(timezone.utc).isoformat()
    updated = DevStatus(
        status=payload.status,
        message=payload.message,
        updated_at=timestamp,
        updated_by=admin.email,
    )
    STATUS_FILE.write_text(
        json.dumps(serialize_status(updated), indent=2) + "\n",
        encoding="utf-8",
    )
    return updated
