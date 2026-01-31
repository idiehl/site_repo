"""Playground API - Design persistence and management."""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from atlasops.config import get_settings

router = APIRouter(prefix="/playground", tags=["playground"])
settings = get_settings()

# Storage directory for designs
DESIGNS_DIR = Path(__file__).parent.parent.parent.parent / "internal" / "playground_designs"
DESIGNS_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic models
class ElementStyles(BaseModel):
    position: dict
    size: dict
    spacing: dict


class CanvasElement(BaseModel):
    id: str
    libraryId: str
    componentId: str
    framework: str
    props: dict
    styles: ElementStyles
    zIndex: int
    locked: bool = False
    visible: bool = True


class DesignCreate(BaseModel):
    name: str
    elements: List[CanvasElement]
    layout: str = "freeform"


class DesignUpdate(BaseModel):
    name: Optional[str] = None
    elements: Optional[List[CanvasElement]] = None
    layout: Optional[str] = None


class Design(BaseModel):
    id: str
    name: str
    elements: List[CanvasElement]
    layout: str
    createdAt: str
    updatedAt: str


def verify_dev_token(token: str) -> bool:
    """Verify the developer access token."""
    return token == settings.dev_token


def get_design_path(design_id: str) -> Path:
    """Get the file path for a design."""
    return DESIGNS_DIR / f"{design_id}.json"


def generate_design_id() -> str:
    """Generate a unique design ID."""
    return f"design-{int(datetime.now().timestamp() * 1000)}"


@router.get("/designs", response_model=List[Design])
async def list_designs(
    x_dev_token: str = Header(..., alias="X-Dev-Token")
):
    """List all saved designs."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    designs = []
    for file in DESIGNS_DIR.glob("*.json"):
        try:
            data = json.loads(file.read_text(encoding="utf-8"))
            designs.append(Design(**data))
        except Exception:
            continue
    
    # Sort by updated date, newest first
    designs.sort(key=lambda d: d.updatedAt, reverse=True)
    return designs


@router.get("/designs/{design_id}", response_model=Design)
async def get_design(
    design_id: str,
    x_dev_token: str = Header(..., alias="X-Dev-Token")
):
    """Get a specific design by ID."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    path = get_design_path(design_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Design not found")
    
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return Design(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/designs", response_model=Design)
async def create_design(
    design: DesignCreate,
    x_dev_token: str = Header(..., alias="X-Dev-Token")
):
    """Create a new design."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    design_id = generate_design_id()
    now = datetime.utcnow().isoformat() + "Z"
    
    new_design = Design(
        id=design_id,
        name=design.name,
        elements=design.elements,
        layout=design.layout,
        createdAt=now,
        updatedAt=now,
    )
    
    path = get_design_path(design_id)
    path.write_text(new_design.model_dump_json(indent=2), encoding="utf-8")
    
    return new_design


@router.put("/designs/{design_id}", response_model=Design)
async def update_design(
    design_id: str,
    updates: DesignUpdate,
    x_dev_token: str = Header(..., alias="X-Dev-Token")
):
    """Update an existing design."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    path = get_design_path(design_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Design not found")
    
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        design = Design(**data)
        
        # Apply updates
        if updates.name is not None:
            design = design.model_copy(update={"name": updates.name})
        if updates.elements is not None:
            design = design.model_copy(update={"elements": updates.elements})
        if updates.layout is not None:
            design = design.model_copy(update={"layout": updates.layout})
        
        design = design.model_copy(update={"updatedAt": datetime.utcnow().isoformat() + "Z"})
        
        path.write_text(design.model_dump_json(indent=2), encoding="utf-8")
        return design
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/designs/{design_id}")
async def delete_design(
    design_id: str,
    x_dev_token: str = Header(..., alias="X-Dev-Token")
):
    """Delete a design."""
    if not verify_dev_token(x_dev_token):
        raise HTTPException(status_code=401, detail="Invalid developer token")
    
    path = get_design_path(design_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Design not found")
    
    path.unlink()
    return {"deleted": True, "id": design_id}
