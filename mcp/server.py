#!/usr/bin/env python3
"""
AtlasOps Dashboard MCP Server

Provides tools for project overview, analytics, and architecture insights.
"""

import os
import sys
import json
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional
from collections import Counter
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment from parent directory
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# Database connection (sync driver for simplicity)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/atlasops"
)
# Convert async URL to sync if needed
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

engine = None
SessionLocal = None

# Documentation paths
DOCS_DIR = PROJECT_ROOT / "docs" / "master_log"
MASTER_LOG = DOCS_DIR / "Master_Log.md"
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

LOG_TZ = ZoneInfo(os.getenv("LOG_TZ", "America/Kentucky/Louisville"))

def init_db():
    """Initialize database connection lazily."""
    global engine, SessionLocal
    if engine is None:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)

def get_db():
    """Get database session."""
    init_db()
    return SessionLocal()


# Initialize MCP server
server = Server("atlasops-dashboard")


# =============================================================================
# Define available tools
# =============================================================================

TOOLS = [
    Tool(
        name="get_project_stats",
        description="Get project statistics including file counts, lines of code, dependency versions, and last git commit info.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_api_inventory",
        description="List all API endpoints with their HTTP methods and descriptions. Parses FastAPI router files.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_db_schema",
        description="Get database schema overview including all tables, columns, and relationships.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_analytics_summary",
        description="Get analytics summary: site visits, API usage, error rates, response times.",
        inputSchema={
            "type": "object",
            "properties": {
                "days": {
                    "type": "integer",
                    "description": "Number of days to look back (default: 7)",
                    "default": 7
                }
            },
            "required": []
        }
    ),
    Tool(
        name="get_security_events",
        description="Get security events from the specified time period.",
        inputSchema={
            "type": "object",
            "properties": {
                "days": {
                    "type": "integer",
                    "description": "Number of days to look back (default: 7)",
                    "default": 7
                },
                "severity": {
                    "type": "string",
                    "description": "Filter by severity: low, medium, high, critical",
                    "enum": ["low", "medium", "high", "critical"]
                }
            },
            "required": []
        }
    ),
    Tool(
        name="get_user_stats",
        description="Get user statistics: signups, subscription tiers, OAuth providers, activity.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_architecture_diagram",
        description="Generate a Mermaid diagram showing the system architecture.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_celery_status",
        description="Check Celery worker status and Redis queue health.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="get_recent_activity",
        description="Get recent application activity: jobs ingested, applications created, resumes generated.",
        inputSchema={
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "Number of recent activities to return (default: 20)",
                    "default": 20
                }
            },
            "required": []
        }
    ),
    Tool(
        name="append_master_log_entry",
        description="Append a formatted entry to Master_Log.md with an auto-generated log ID.",
        inputSchema={
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Short title for the entry"},
                "entry_type": {
                    "type": "string",
                    "enum": ["Feature", "Fix", "Refactor", "Decision", "Docs", "Ops"]
                },
                "context": {"type": "string"},
                "change_summary": {
                    "anyOf": [
                        {"type": "string"},
                        {"type": "array", "items": {"type": "string"}}
                    ]
                },
                "rationale": {"type": "string"},
                "files_touched": {"type": "array", "items": {"type": "string"}},
                "commands_run": {
                    "anyOf": [
                        {"type": "string"},
                        {"type": "array", "items": {"type": "string"}}
                    ]
                },
                "verification": {"type": "string"},
                "notes": {"type": "string"},
                "concepts": {
                    "anyOf": [
                        {"type": "string"},
                        {"type": "array", "items": {"type": "string"}}
                    ]
                },
                "cycle": {"type": "string", "default": "C01"}
            },
            "required": ["title", "entry_type", "context", "change_summary"]
        }
    ),
    Tool(
        name="append_app_log_entry",
        description="Append bullets under a dated section in an app log file.",
        inputSchema={
            "type": "object",
            "properties": {
                "app_id": {
                    "type": "string",
                    "enum": ["atlas-forge", "atlas-apply", "atlas-universalis", "electracast", "atlas-meridian"]
                },
                "date": {"type": "string", "description": "YYYY-MM-DD (defaults to today)"},
                "items": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["app_id", "items"]
        }
    ),
    Tool(
        name="update_app_checklist",
        description="Add or toggle tasks in an app checklist and update the Last Updated date.",
        inputSchema={
            "type": "object",
            "properties": {
                "app_id": {
                    "type": "string",
                    "enum": ["atlas-forge", "atlas-apply", "atlas-universalis", "electracast", "atlas-meridian"]
                },
                "tasks_to_add": {"type": "array", "items": {"type": "string"}},
                "tasks_to_check": {"type": "array", "items": {"type": "string"}},
                "tasks_to_uncheck": {"type": "array", "items": {"type": "string"}},
                "last_updated": {"type": "string", "description": "YYYY-MM-DD (defaults to today)"}
            },
            "required": ["app_id"]
        }
    ),
    Tool(
        name="update_app_overview_section",
        description="Update a section in an app overview file with bullet items.",
        inputSchema={
            "type": "object",
            "properties": {
                "app_id": {
                    "type": "string",
                    "enum": ["atlas-forge", "atlas-apply", "atlas-universalis", "electracast", "atlas-meridian"]
                },
                "section": {"type": "string", "description": "Section header text (without ##)"},
                "items": {"type": "array", "items": {"type": "string"}},
                "mode": {"type": "string", "enum": ["append", "prepend", "replace"], "default": "append"}
            },
            "required": ["app_id", "section", "items"]
        }
    ),
    Tool(
        name="get_dev_status",
        description="Read the current dev portal status from dev_status.json.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
    Tool(
        name="set_dev_status",
        description="Update the dev portal status JSON (READY, PENDING, BLOCKED).",
        inputSchema={
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["READY", "PENDING", "BLOCKED"]},
                "message": {"type": "string"},
                "updated_by": {"type": "string"}
            },
            "required": ["status"]
        }
    ),
]


# =============================================================================
# Tool implementations
# =============================================================================

def _now_local() -> datetime:
    return datetime.now(LOG_TZ)


def _normalize_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        items = value
    else:
        items = [value]
    normalized = []
    for item in items:
        if item is None:
            continue
        text = str(item).strip()
        if text:
            normalized.append(text)
    return normalized


def _ensure_trailing_newline(text: str) -> str:
    return text if text.endswith("\n") else text + "\n"


def _normalize_task(text: str) -> str:
    return " ".join(text.replace("\r", " ").replace("\n", " ").split()).lower()


def _get_next_log_id(cycle: str) -> str:
    date_str = _now_local().strftime("%Y%m%d")
    pattern = re.compile(rf"AU-{re.escape(cycle)}-{date_str}-(\d{{3}})")
    existing = MASTER_LOG.read_text(encoding="utf-8", errors="ignore") if MASTER_LOG.exists() else ""
    matches = [int(match.group(1)) for match in pattern.finditer(existing)]
    next_seq = (max(matches) + 1) if matches else 1
    return f"AU-{cycle}-{date_str}-{next_seq:03d}"


def _append_checklist_task(lines: list[str], task: str) -> bool:
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
        return True

    if lines and lines[-1].strip():
        lines.append("")
    lines.append(header)
    lines.append(task_line)
    return True


def _load_status() -> dict:
    if not STATUS_FILE.exists():
        return {
            "status": "READY",
            "message": "All systems ready.",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": "system",
        }
    try:
        return json.loads(STATUS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {
            "status": "READY",
            "message": "All systems ready.",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": "system",
        }


def impl_append_master_log_entry(arguments: dict) -> str:
    cycle = arguments.get("cycle", "C01")
    log_id = _get_next_log_id(cycle)

    title = str(arguments.get("title", "")).strip()
    entry_type = str(arguments.get("entry_type", "")).strip()
    context = str(arguments.get("context", "")).strip() or "Not provided"
    rationale = str(arguments.get("rationale", "")).strip() or "Not provided"
    verification = str(arguments.get("verification", "")).strip() or "Not provided"
    notes = str(arguments.get("notes", "")).strip() or "None"

    change_summary = _normalize_list(arguments.get("change_summary"))
    files_touched = _normalize_list(arguments.get("files_touched"))
    commands_run = _normalize_list(arguments.get("commands_run"))
    concepts = _normalize_list(arguments.get("concepts"))

    if not change_summary:
        change_summary = ["None"]
    if not files_touched:
        files_touched = ["None"]
    if not commands_run:
        commands_run = ["None"]
    if not concepts:
        concepts = ["None"]

    entry_lines = [
        "---",
        "",
        f"## {log_id} — {title}",
        "",
        f"**Type:** {entry_type}  ",
        f"**Context:** {context}  ",
        "**Change summary:**",
        *[f"- {item}" for item in change_summary],
        "",
        f"**Rationale / tradeoffs:** {rationale}  ",
        "**Files touched:**",
        *[f"- `{item}`" for item in files_touched],
        "",
        "**Commands run:**",
        "```bash",
        *commands_run,
        "```",
        "",
        f"**Verification:** {verification}  ",
        f"**Notes:** {notes}  ",
        f"**Concepts:** {' '.join(concepts)}",
        "",
    ]

    existing = MASTER_LOG.read_text(encoding="utf-8", errors="ignore") if MASTER_LOG.exists() else ""
    combined = existing
    if combined and not combined.endswith("\n"):
        combined += "\n"
    combined += "\n".join(entry_lines)
    MASTER_LOG.write_text(_ensure_trailing_newline(combined), encoding="utf-8")

    return json.dumps({"log_id": log_id, "path": str(MASTER_LOG)}, indent=2)


def impl_append_app_log_entry(arguments: dict) -> str:
    app_id = arguments.get("app_id")
    app = APP_DOCS.get(app_id)
    if not app:
        return json.dumps({"error": f"Unknown app_id: {app_id}"})

    date_str = arguments.get("date") or _now_local().strftime("%Y-%m-%d")
    items = _normalize_list(arguments.get("items"))
    if not items:
        return json.dumps({"error": "No log items provided"})

    log_path = DOCS_DIR / app["log"]
    lines = log_path.read_text(encoding="utf-8", errors="ignore").splitlines() if log_path.exists() else []
    header = f"## {date_str}"
    bullets = [f"- {item}" for item in items]

    if header in lines:
        header_index = lines.index(header)
        insert_index = header_index + 1
        while insert_index < len(lines) and not lines[insert_index].startswith("## "):
            insert_index += 1
        lines[insert_index:insert_index] = bullets
    else:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append(header)
        lines.extend(bullets)

    updated = "\n".join(lines)
    log_path.write_text(_ensure_trailing_newline(updated), encoding="utf-8")
    return json.dumps({"path": str(log_path), "date": date_str, "added": len(bullets)}, indent=2)


def impl_update_app_checklist(arguments: dict) -> str:
    app_id = arguments.get("app_id")
    app = APP_DOCS.get(app_id)
    if not app:
        return json.dumps({"error": f"Unknown app_id: {app_id}"})

    checklist_path = DOCS_DIR / app["checklist"]
    lines = checklist_path.read_text(encoding="utf-8", errors="ignore").splitlines() if checklist_path.exists() else []

    date_str = arguments.get("last_updated") or _now_local().strftime("%Y-%m-%d")
    updated_last = False
    for idx, line in enumerate(lines):
        if line.startswith("**Last Updated:**"):
            lines[idx] = f"**Last Updated:** {date_str}"
            updated_last = True
            break
    if not updated_last and lines:
        lines.insert(1, f"**Last Updated:** {date_str}")
        lines.insert(2, "")

    tasks_to_add = _normalize_list(arguments.get("tasks_to_add"))
    tasks_to_check = set(_normalize_task(t) for t in _normalize_list(arguments.get("tasks_to_check")))
    tasks_to_uncheck = set(_normalize_task(t) for t in _normalize_list(arguments.get("tasks_to_uncheck")))

    existing_tasks = set()
    checked = 0
    unchecked = 0
    for idx, line in enumerate(lines):
        match = re.match(r"- \[( |x|X)\] (.+)", line.strip())
        if not match:
            continue
        task_text = match.group(2).strip()
        key = _normalize_task(task_text)
        existing_tasks.add(key)
        if key in tasks_to_check:
            lines[idx] = f"- [x] {task_text}"
            checked += 1
        elif key in tasks_to_uncheck:
            lines[idx] = f"- [ ] {task_text}"
            unchecked += 1

    added = 0
    for task in tasks_to_add:
        key = _normalize_task(task)
        if key in existing_tasks:
            continue
        if _append_checklist_task(lines, task):
            existing_tasks.add(key)
            added += 1

    updated = "\n".join(lines)
    checklist_path.write_text(_ensure_trailing_newline(updated), encoding="utf-8")

    return json.dumps(
        {
            "path": str(checklist_path),
            "last_updated": date_str,
            "added": added,
            "checked": checked,
            "unchecked": unchecked,
        },
        indent=2,
    )


def impl_update_app_overview_section(arguments: dict) -> str:
    app_id = arguments.get("app_id")
    app = APP_DOCS.get(app_id)
    if not app:
        return json.dumps({"error": f"Unknown app_id: {app_id}"})

    section = str(arguments.get("section", "")).strip()
    if not section:
        return json.dumps({"error": "Section is required"})

    items = _normalize_list(arguments.get("items"))
    if not items:
        return json.dumps({"error": "No items provided"})

    mode = arguments.get("mode", "append")
    overview_path = DOCS_DIR / app["overview"]
    lines = overview_path.read_text(encoding="utf-8", errors="ignore").splitlines() if overview_path.exists() else []

    header_line = None
    header_index = None
    for idx, line in enumerate(lines):
        if line.strip() == f"## {section}" or line.strip() == f"### {section}":
            header_line = line.strip()
            header_index = idx
            break

    bullets = [f"- {item}" for item in items]
    if header_index is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append(f"## {section}")
        lines.extend(bullets)
    else:
        end_index = header_index + 1
        while end_index < len(lines) and not lines[end_index].startswith("## "):
            end_index += 1

        if mode == "replace":
            lines[header_index + 1:end_index] = []
            insert_at = header_index + 1
        elif mode == "prepend":
            insert_at = header_index + 1
        else:
            insert_at = end_index

        lines[insert_at:insert_at] = bullets

    overview_path.write_text(_ensure_trailing_newline("\n".join(lines)), encoding="utf-8")
    return json.dumps({"path": str(overview_path), "section": section, "mode": mode}, indent=2)


def impl_get_dev_status() -> str:
    return json.dumps(_load_status(), indent=2)


def impl_set_dev_status(arguments: dict) -> str:
    status = arguments.get("status")
    message = arguments.get("message")
    updated_by = arguments.get("updated_by") or "mcp"

    payload = {
        "status": status,
        "message": message,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": updated_by,
    }
    STATUS_FILE.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return json.dumps(payload, indent=2)


def impl_get_project_stats() -> str:
    """Get project statistics."""
    stats = {
        "file_counts": {},
        "total_lines": 0,
        "dependencies": {
            "backend": {},
            "frontend": {}
        },
        "git_info": {}
    }
    
    # Count files by extension
    total_lines = 0
    
    for ext in [".py", ".ts", ".tsx", ".vue", ".js", ".jsx", ".css", ".html", ".md"]:
        count = 0
        lines = 0
        for f in PROJECT_ROOT.rglob(f"*{ext}"):
            # Skip node_modules and venv
            if "node_modules" in str(f) or ".venv" in str(f) or "venv" in str(f):
                continue
            count += 1
            try:
                lines += len(f.read_text(encoding="utf-8", errors="ignore").splitlines())
            except Exception:
                pass
        if count > 0:
            stats["file_counts"][ext] = {"files": count, "lines": lines}
            total_lines += lines
    
    stats["total_lines"] = total_lines
    
    # Parse backend dependencies
    req_file = PROJECT_ROOT / "requirements.txt"
    if req_file.exists():
        for line in req_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                for sep in [">=", "==", "~="]:
                    if sep in line:
                        name, version = line.split(sep, 1)
                        stats["dependencies"]["backend"][name.strip()] = version.strip()
                        break
    
    # Parse frontend dependencies
    pkg_file = PROJECT_ROOT / "frontend" / "package.json"
    if pkg_file.exists():
        try:
            pkg = json.loads(pkg_file.read_text())
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            for name, version in list(deps.items())[:10]:
                stats["dependencies"]["frontend"][name] = version
        except Exception:
            pass
    
    # Git info
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%H|%an|%s|%ci"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split("|")
            if len(parts) >= 4:
                stats["git_info"] = {
                    "last_commit_hash": parts[0][:8],
                    "author": parts[1],
                    "message": parts[2],
                    "date": parts[3]
                }
    except Exception:
        pass
    
    return json.dumps(stats, indent=2)


def impl_get_api_inventory() -> str:
    """List all API endpoints."""
    import re
    
    endpoints = []
    api_dir = PROJECT_ROOT / "atlasops" / "api" / "v1"
    
    for py_file in api_dir.glob("*.py"):
        if py_file.name.startswith("_"):
            continue
            
        content = py_file.read_text(encoding="utf-8", errors="ignore")
        module_name = py_file.stem
        
        # Match @router.get/post/put/patch/delete decorators
        pattern = r'@router\.(get|post|put|patch|delete)\(["\']([^"\']+)["\']'
        matches = re.findall(pattern, content)
        
        for method, path in matches:
            full_path = f"/api/v1/{module_name.replace('_', '-')}{path}" if path != "/" else f"/api/v1/{module_name.replace('_', '-')}"
            endpoints.append({
                "module": module_name,
                "method": method.upper(),
                "path": full_path,
            })
    
    endpoints.sort(key=lambda x: (x["module"], x["path"]))
    
    return json.dumps({
        "total_endpoints": len(endpoints),
        "endpoints": endpoints
    }, indent=2)


def impl_get_db_schema() -> str:
    """Get database schema overview."""
    db = get_db()
    try:
        tables_query = text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        tables = [row[0] for row in db.execute(tables_query).fetchall()]
        
        schema = {"tables": {}}
        
        for table in tables:
            cols_query = text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = :table
                ORDER BY ordinal_position
            """)
            cols = db.execute(cols_query, {"table": table}).fetchall()
            
            schema["tables"][table] = {
                "columns": [
                    {"name": col[0], "type": col[1], "nullable": col[2] == "YES"}
                    for col in cols
                ]
            }
        
        schema["table_count"] = len(tables)
        return json.dumps(schema, indent=2)
        
    finally:
        db.close()


def impl_get_analytics_summary(days: int = 7) -> str:
    """Get analytics summary."""
    db = get_db()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        summary = {
            "period_days": days,
            "site_visits": {},
            "api_usage": {},
            "errors": {}
        }
        
        # Site visits
        try:
            visits_query = text("""
                SELECT 
                    COUNT(*) as total_visits,
                    COUNT(DISTINCT ip_address) as unique_visitors,
                    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users
                FROM site_visits
                WHERE created_at >= :cutoff
            """)
            result = db.execute(visits_query, {"cutoff": cutoff}).fetchone()
            summary["site_visits"] = {
                "total": result[0] if result else 0,
                "unique_visitors": result[1] if result else 0,
                "logged_in_users": result[2] if result else 0
            }
        except Exception as e:
            summary["site_visits"]["error"] = str(e)
        
        # API usage
        try:
            api_query = text("""
                SELECT 
                    COUNT(*) as total_requests,
                    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
                    AVG(response_time_ms) as avg_response_time
                FROM api_usage
                WHERE created_at >= :cutoff
            """)
            result = db.execute(api_query, {"cutoff": cutoff}).fetchone()
            summary["api_usage"] = {
                "total_requests": result[0] if result else 0,
                "unique_users": result[1] if result else 0,
                "avg_response_time_ms": round(result[2], 2) if result and result[2] else 0
            }
        except Exception as e:
            summary["api_usage"]["error"] = str(e)
        
        # Top endpoints
        try:
            endpoints_query = text("""
                SELECT endpoint, method, COUNT(*) as hits
                FROM api_usage
                WHERE created_at >= :cutoff
                GROUP BY endpoint, method
                ORDER BY hits DESC
                LIMIT 10
            """)
            endpoints = db.execute(endpoints_query, {"cutoff": cutoff}).fetchall()
            summary["api_usage"]["top_endpoints"] = [
                {"endpoint": e[0], "method": e[1], "hits": e[2]}
                for e in endpoints
            ]
        except Exception:
            pass
        
        # Error rates
        try:
            errors_query = text("""
                SELECT 
                    COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
                    COUNT(*) as total
                FROM api_usage
                WHERE created_at >= :cutoff
            """)
            result = db.execute(errors_query, {"cutoff": cutoff}).fetchone()
            total = result[1] if result else 1
            summary["errors"] = {
                "total_errors": result[0] if result else 0,
                "error_rate_percent": round((result[0] / total) * 100, 2) if result and total > 0 else 0
            }
        except Exception as e:
            summary["errors"]["error"] = str(e)
        
        return json.dumps(summary, indent=2)
        
    finally:
        db.close()


def impl_get_security_events(days: int = 7, severity: Optional[str] = None) -> str:
    """Get security events."""
    db = get_db()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        query = """
            SELECT event_type, severity, ip_address, resolved, created_at
            FROM security_events
            WHERE created_at >= :cutoff
        """
        params = {"cutoff": cutoff}
        
        if severity:
            query += " AND severity = :severity"
            params["severity"] = severity
        
        query += " ORDER BY created_at DESC LIMIT 50"
        
        events = db.execute(text(query), params).fetchall()
        
        return json.dumps({
            "period_days": days,
            "total_events": len(events),
            "events": [
                {
                    "type": e[0],
                    "severity": e[1],
                    "ip_address": e[2],
                    "resolved": e[3],
                    "time": e[4].isoformat() if e[4] else None
                }
                for e in events
            ]
        }, indent=2)
        
    finally:
        db.close()


def impl_get_user_stats() -> str:
    """Get user statistics."""
    db = get_db()
    try:
        stats = {}
        
        users_query = text("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
            FROM users
        """)
        result = db.execute(users_query).fetchone()
        stats["users"] = {
            "total": result[0] if result else 0,
            "signups_last_7_days": result[1] if result else 0,
            "signups_last_30_days": result[2] if result else 0
        }
        
        tiers_query = text("""
            SELECT subscription_tier, COUNT(*) as count
            FROM users
            GROUP BY subscription_tier
        """)
        tiers = db.execute(tiers_query).fetchall()
        stats["subscription_tiers"] = {t[0]: t[1] for t in tiers}
        
        oauth_query = text("""
            SELECT COALESCE(oauth_provider, 'email') as provider, COUNT(*) as count
            FROM users
            GROUP BY oauth_provider
        """)
        oauth = db.execute(oauth_query).fetchall()
        stats["auth_providers"] = {o[0]: o[1] for o in oauth}
        
        return json.dumps(stats, indent=2)
        
    finally:
        db.close()


def impl_get_architecture_diagram() -> str:
    """Generate architecture diagram."""
    return """```mermaid
flowchart TB
    subgraph Frontend["Frontend (Vue 3 + Vite)"]
        UI[Vue Components]
        Router[Vue Router]
        Store[Pinia Store]
        API_Client[Axios API Client]
    end
    
    subgraph Backend["Backend (FastAPI)"]
        App[FastAPI App]
        Auth[Auth Routes]
        Jobs[Jobs Routes]
        Apps[Applications Routes]
        Profile[Profile Routes]
        Billing[Billing Routes]
        Admin[Admin Routes]
        
        subgraph Services
            LLM[LLM Client]
            Scraper[Job Scraper]
            ResumeGen[Resume Generator]
        end
    end
    
    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        Redis[(Redis)]
        Celery[Celery Workers]
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API]
        Stripe[Stripe]
        OAuth[OAuth Providers]
    end
    
    UI --> Router --> Store --> API_Client --> App
    App --> Auth & Jobs & Apps & Profile & Billing & Admin
    Auth & Jobs & Apps & Profile --> DB
    Billing --> Stripe
    Celery --> Redis
    Celery --> LLM --> OpenAI
    Auth --> OAuth
```

## Tech Stack
- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia
- **Backend**: FastAPI, SQLAlchemy 2.0, Alembic
- **Database**: PostgreSQL, Redis
- **Background**: Celery
- **External**: OpenAI, Stripe, LinkedIn/Google OAuth
"""


def impl_get_celery_status() -> str:
    """Check Celery/Redis status."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    status = {
        "redis_connected": False,
        "queue_info": {}
    }
    
    try:
        import redis
        r = redis.from_url(redis_url)
        r.ping()
        status["redis_connected"] = True
        
        for queue in ["celery", "default"]:
            try:
                status["queue_info"][queue] = r.llen(queue)
            except Exception:
                pass
                
    except ImportError:
        status["error"] = "redis package not installed"
    except Exception as e:
        status["redis_error"] = str(e)
    
    return json.dumps(status, indent=2)


def impl_get_recent_activity(limit: int = 20) -> str:
    """Get recent activity."""
    db = get_db()
    try:
        activity = []
        
        try:
            jobs_query = text("""
                SELECT 'job_ingested' as type, company, title, created_at
                FROM job_postings
                ORDER BY created_at DESC
                LIMIT :limit
            """)
            jobs = db.execute(jobs_query, {"limit": limit}).fetchall()
            for j in jobs:
                activity.append({
                    "type": "job_ingested",
                    "details": f"{j[1]} - {j[2]}",
                    "time": j[3].isoformat() if j[3] else None
                })
        except Exception:
            pass
        
        try:
            apps_query = text("""
                SELECT 'application' as type, status, created_at
                FROM applications
                ORDER BY created_at DESC
                LIMIT :limit
            """)
            apps = db.execute(apps_query, {"limit": limit}).fetchall()
            for a in apps:
                activity.append({
                    "type": "application_created",
                    "details": f"Status: {a[1]}",
                    "time": a[2].isoformat() if a[2] else None
                })
        except Exception:
            pass
        
        activity.sort(key=lambda x: x.get("time") or "", reverse=True)
        
        return json.dumps({"recent_activity": activity[:limit]}, indent=2)
        
    finally:
        db.close()


# =============================================================================
# MCP Handlers
# =============================================================================

@server.list_tools()
async def list_tools():
    """Return list of available tools."""
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls."""
    
    try:
        if name == "get_project_stats":
            result = impl_get_project_stats()
        elif name == "get_api_inventory":
            result = impl_get_api_inventory()
        elif name == "get_db_schema":
            result = impl_get_db_schema()
        elif name == "get_analytics_summary":
            days = arguments.get("days", 7)
            result = impl_get_analytics_summary(days)
        elif name == "get_security_events":
            days = arguments.get("days", 7)
            severity = arguments.get("severity")
            result = impl_get_security_events(days, severity)
        elif name == "get_user_stats":
            result = impl_get_user_stats()
        elif name == "get_architecture_diagram":
            result = impl_get_architecture_diagram()
        elif name == "get_celery_status":
            result = impl_get_celery_status()
        elif name == "get_recent_activity":
            limit = arguments.get("limit", 20)
            result = impl_get_recent_activity(limit)
        elif name == "append_master_log_entry":
            result = impl_append_master_log_entry(arguments)
        elif name == "append_app_log_entry":
            result = impl_append_app_log_entry(arguments)
        elif name == "update_app_checklist":
            result = impl_update_app_checklist(arguments)
        elif name == "update_app_overview_section":
            result = impl_update_app_overview_section(arguments)
        elif name == "get_dev_status":
            result = impl_get_dev_status()
        elif name == "set_dev_status":
            result = impl_set_dev_status(arguments)
        else:
            result = json.dumps({"error": f"Unknown tool: {name}"})
        
        return [TextContent(type="text", text=result)]
        
    except Exception as e:
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]


# =============================================================================
# Main entry point
# =============================================================================

async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
