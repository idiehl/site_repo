import asyncio
import os
import re
import json

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from sqlalchemy import Column, MetaData, String, Table, Text, select
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

DATABASE_URL = os.environ.get("DATABASE_URL")
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))

metadata = MetaData()

pages = Table(
    "pages",
    metadata,
    Column("slug", String(128), primary_key=True),
    Column("title", String(255), nullable=False),
    Column("html", Text, nullable=False),  # body fragment
)


@dataclass
class Settings:
    engine: AsyncEngine
    session_factory: sessionmaker


@lru_cache
def get_settings() -> Settings:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is required")
    engine = create_async_engine(DATABASE_URL, echo=False, future=True)
    session_factory = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    return Settings(engine=engine, session_factory=session_factory)


class Page(BaseModel):
    slug: str
    title: str
    html: str


app = FastAPI(title="Atlas: Apocalypse")

# Static assets
app.mount("/css", StaticFiles(directory=BASE_DIR / "css"), name="css")
app.mount("/javascript", StaticFiles(directory=BASE_DIR / "javascript"), name="javascript")
app.mount("/image", StaticFiles(directory=BASE_DIR / "image"), name="image")
app.mount("/video", StaticFiles(directory=BASE_DIR / "video"), name="video")
app.mount("/svg", StaticFiles(directory=BASE_DIR / "svg"), name="svg")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

NAV_ORDER = [
    "earth_climate",
    "ice_age",
    "evolution",
    "genus_homo",
    "speech_evolution",
    "culture",
    "human_emission",
    "oral_tradition",
    "new_age",
    "coming_storm",
    "perfect_storm",
    "citations",
]


async def get_session(settings: Settings = Depends(get_settings)) -> AsyncSession:
    async with settings.session_factory() as session:
        yield session


# ---------- JSON API endpoints ----------

@app.get("/api/pages", response_model=list[Page])
async def list_pages(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(pages))
    return [Page(**row._mapping) for row in result.fetchall()]


@app.get("/api/pages/{slug}", response_model=Page)
async def get_page(slug: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(pages).where(pages.c.slug == slug))
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Page not found")
    return Page(**row._mapping)


@app.post("/api/pages", response_model=Page)
async def create_page(page: Page, session: AsyncSession = Depends(get_session)):
    await session.execute(pages.insert().values(**page.dict()))
    await session.commit()
    return page


@app.delete("/api/pages/{slug}")
async def delete_page(slug: str, session: AsyncSession = Depends(get_session)):
    await session.execute(pages.delete().where(pages.c.slug == slug))
    await session.commit()
    return {"status": "deleted"}


# ---------- HTML endpoints (templated) ----------

async def _get_nav_items(session: AsyncSession) -> list[dict]:
    result = await session.execute(select(pages.c.slug, pages.c.title))
    rows = result.fetchall()
    items = [{"slug": r.slug, "title": r.title} for r in rows]
    items.sort(
        key=lambda item: NAV_ORDER.index(item["slug"])
        if item["slug"] in NAV_ORDER
        else 999
    )
    return items


@app.get("/", response_class=HTMLResponse)
async def home(request: Request, session: AsyncSession = Depends(get_session)):
    nav_items = await _get_nav_items(session)
    nav_items_json = json.dumps(nav_items)

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "nav_items": nav_items,
            "nav_items_json": nav_items_json,
            "current_slug": None,
        },
    )



@app.get("/pages/{slug}", response_class=HTMLResponse)
async def render_page(
    slug: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(pages).where(pages.c.slug == slug))
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Page not found")

    page = Page(**row._mapping)
    nav_items = await _get_nav_items(session)
    nav_items_json = json.dumps(nav_items)

    return templates.TemplateResponse(
        "page.html",
        {
            "request": request,
            "page": page,
            "nav_items": nav_items,
            "nav_items_json": nav_items_json,
            "current_slug": slug,
        },
    )



# ---------- DB management helpers ----------

async def init_db() -> None:
    """Create DB tables defined in metadata."""
    settings = get_settings()
    async with settings.engine.begin() as conn:
        await conn.run_sync(metadata.create_all)


async def import_html_dir(html_dir: Path | str | None = None) -> None:
    """
    Import static HTML files from the /html directory into the pages table.

    - slug  = file name without .html (landing -> coming_storm)
    - title = <div class= "pagetitle"><h1>...</h1> if present, else prettified slug
    - html  = inner content of <div class= "sectioncenter">...</div>,
              with internal links rewritten to /pages/{slug}
    """
    settings = get_settings()

    if html_dir is None:
        html_dir = BASE_DIR / "html"
    else:
        html_dir = Path(html_dir)

    if not html_dir.exists():
        raise RuntimeError(f"HTML directory not found: {html_dir}")

    html_files = sorted(html_dir.glob("*.html"))
    if not html_files:
        raise RuntimeError(f"No .html files found in {html_dir}")

    # Build slug set accounting for landing -> coming_storm
    slugs: set[str] = set()
    for path in html_files:
        name = path.stem
        if name == "landing":
            name = "coming_storm"
        slugs.add(name)

    async with settings.session_factory() as session:
        for path in html_files:
            full_html = path.read_text(encoding="utf-8")

            slug = path.stem
            if slug == "landing":
                slug = "coming_storm"

            # Extract title from pagetitle block if present
            m_title = re.search(
                r'<div class= "pagetitle">\s*<h1>(.*?)</h1>',
                full_html,
                re.DOTALL,
            )
            if m_title:
                title = m_title.group(1).strip()
            else:
                title = slug.replace("_", " ").title()

            # Extract inner content of <div class= "sectioncenter"> ... <div class= "footwrapper">
            sec_tag = '<div class= "sectioncenter"'
            sec_idx = full_html.index(sec_tag)
            content_start = full_html.index(">", sec_idx) + 1
            foot_tag = '<div class= "footwrapper"'
            foot_idx = full_html.index(foot_tag)
            inner_html = full_html[content_start:foot_idx].strip()

            # Rewrite internal links in the inner content:
            for name in slugs:
                inner_html = inner_html.replace(
                    f'href="{name}.html#', f'href="/pages/{name}#'
                )
                inner_html = inner_html.replace(
                    f'href="{name}.html"', f'href="/pages/{name}"'
                )

            # Upsert into the pages table
            result = await session.execute(
                select(pages.c.slug).where(pages.c.slug == slug)
            )
            if result.fetchone():
                await session.execute(
                    pages.update()
                    .where(pages.c.slug == slug)
                    .values(title=title, html=inner_html)
                )
            else:
                await session.execute(
                    pages.insert().values(slug=slug, title=title, html=inner_html)
                )

        await session.commit()


# ---------- CLI entrypoint ----------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Manage the HTML page API")
    parser.add_argument("--init-db", action="store_true", help="Create database tables")
    parser.add_argument(
        "--import-html",
        metavar="DIR",
        help="Import static HTML files from DIR into the pages table (e.g. ./html)",
    )
    args = parser.parse_args()

    if args.init_db:
        asyncio.run(init_db())
    elif args.import_html:
        asyncio.run(import_html_dir(args.import_html))
    else:
        import uvicorn

        uvicorn.run("app:app", host=HOST, port=PORT, reload=True)
