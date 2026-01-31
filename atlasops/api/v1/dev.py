"""Developer-only API endpoints for internal documentation and tools."""

from pathlib import Path
from typing import Optional

import markdown
from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel

from atlasops.config import get_settings

router = APIRouter(prefix="/dev", tags=["dev"])
settings = get_settings()

# Paths to documentation files
REPO_ROOT = Path(__file__).parent.parent.parent.parent
DOCS_DIR = REPO_ROOT / "docs" / "master_log"


class DevDocResponse(BaseModel):
    """Response for dev documentation endpoints."""
    title: str
    content_md: str
    content_html: str
    last_modified: Optional[str] = None


def verify_dev_token(token: str) -> bool:
    """Verify the developer access token."""
    return token == settings.dev_token


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


@router.get("/verify")
async def verify_access(
    token: str = Query(..., description="Developer access token")
):
    """Verify developer access token."""
    if not verify_dev_token(token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    return {"valid": True, "message": "Developer access granted"}


@router.get("/log", response_model=DevDocResponse)
async def get_master_log(
    x_dev_token: str = Header(..., alias="X-Dev-Token", description="Developer access token")
):
    """Get the Master Log documentation."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    try:
        md_content, html_content = get_markdown_content("Master_Log.md")
        filepath = DOCS_DIR / "Master_Log.md"
        last_modified = filepath.stat().st_mtime if filepath.exists() else None
        
        return DevDocResponse(
            title="Master Log",
            content_md=md_content,
            content_html=html_content,
            last_modified=str(last_modified) if last_modified else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/overview", response_model=DevDocResponse)
async def get_project_overview(
    x_dev_token: str = Header(..., alias="X-Dev-Token", description="Developer access token")
):
    """Get the Project Overview documentation."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    try:
        md_content, html_content = get_markdown_content("PROJECT_OVERVIEW.md")
        filepath = DOCS_DIR / "PROJECT_OVERVIEW.md"
        last_modified = filepath.stat().st_mtime if filepath.exists() else None
        
        return DevDocResponse(
            title="Project Overview",
            content_md=md_content,
            content_html=html_content,
            last_modified=str(last_modified) if last_modified else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/docs")
async def list_available_docs(
    x_dev_token: str = Header(..., alias="X-Dev-Token", description="Developer access token")
):
    """List available documentation files."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
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
