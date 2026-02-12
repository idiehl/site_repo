"""Export scraped ElectraCast podcast data into tracked SPA assets.

Reads podcast folders under internal/Electracast_Codebase/electracast_podcasts/
and produces:
- electracast/src/data/catalog/podcasts.json (metadata)
- electracast/public/podcasts/<slug>.<ext> (cover images)

This keeps production deterministic since /internal is gitignored and not present
on the droplet.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


def normalize_slug(text: str) -> str:
    """Match ingest_electracast.normalize_slug behavior."""

    text = text.replace("_", "-").lower()
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    text = re.sub(r"\-+", "-", text).strip("-")
    return text


@dataclass(frozen=True)
class PodcastBundleEntry:
    slug: str
    title: str
    summary: str | None
    cover_image: str | None  # public path: /podcasts/<slug>.<ext>
    legacy_url: str | None   # https://electracast.com/podcast/<slug>/
    source_dir: str


def try_extract_title_from_html(podcast_dir: Path) -> str | None:
    """Best-effort: parse first HTML file for a title."""

    html_files = sorted(podcast_dir.glob("*.html"))
    if not html_files:
        return None

    html = html_files[0].read_text(encoding="utf-8", errors="ignore")

    # Prefer BeautifulSoup if available (it is used by the scraper).
    try:
        from bs4 import BeautifulSoup  # type: ignore

        soup = BeautifulSoup(html, "html.parser")
        # WP pages generally have a single h1 for the entry.
        h1 = soup.find("h1")
        if h1:
            text = h1.get_text(strip=True)
            if text:
                return text
        if soup.title:
            text = soup.title.get_text(strip=True)
            if text:
                # Often ends with " | Podcast | ElectraCast"
                return text.split("|")[0].strip()
    except Exception:
        pass

    # Fallback: naive regex extraction.
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, flags=re.IGNORECASE | re.DOTALL)
    if m:
        text = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if text:
            return text
    return None


def read_summary(podcast_dir: Path) -> str | None:
    summary_file = podcast_dir / "summary.txt"
    if not summary_file.exists():
        return None
    text = summary_file.read_text(encoding="utf-8", errors="ignore").strip()
    return text or None


def find_cover(podcast_dir: Path) -> Path | None:
    # Scraper uses: <dir>_Cover.<ext>
    cover = next(iter(sorted(podcast_dir.glob("*_Cover.*"))), None)
    if cover and cover.is_file():
        return cover

    # Fallback: any file containing "Cover"
    for candidate in sorted(podcast_dir.iterdir()):
        if candidate.is_file() and "cover" in candidate.name.lower():
            return candidate
    return None


def dump_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export ElectraCast scraped podcasts into tracked assets"
    )
    parser.add_argument(
        "--input",
        default="internal/Electracast_Codebase/electracast_podcasts",
        help="Input podcasts directory (scraper output).",
    )
    parser.add_argument(
        "--output-json",
        default="electracast/src/data/catalog/podcasts.json",
        help="Output JSON metadata file (tracked).",
    )
    parser.add_argument(
        "--output-images",
        default="electracast/public/podcasts",
        help="Output cover images directory (tracked).",
    )
    parser.add_argument(
        "--clean-images",
        action="store_true",
        help="Delete existing files in the output images directory before export.",
    )
    parser.add_argument("--overwrite", action="store_true", help="Overwrite covers")
    parser.add_argument("--limit", type=int, default=None, help="Limit entries")
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists():
        raise SystemExit(
            f"Input directory not found: {input_dir}\n"
            "Run the scraper first:\n"
            "  python scripts/scrape_electracast_entries.py --type podcasts\n"
        )

    output_json = Path(args.output_json)
    output_images = Path(args.output_images)
    output_images.mkdir(parents=True, exist_ok=True)
    if args.clean_images:
        for existing in output_images.iterdir():
            if existing.is_file():
                existing.unlink()

    entries: list[PodcastBundleEntry] = []

    dirs = [p for p in sorted(input_dir.iterdir()) if p.is_dir()]
    if args.limit:
        dirs = dirs[: args.limit]

    for podcast_dir in dirs:
        if podcast_dir.name.endswith("_files"):
            continue

        slug = normalize_slug(podcast_dir.name)
        if not slug:
            continue

        title = (
            try_extract_title_from_html(podcast_dir)
            or podcast_dir.name.replace("_", " ").strip()
        )
        summary = read_summary(podcast_dir)
        cover = find_cover(podcast_dir)

        cover_public_path: str | None = None
        if cover:
            ext = cover.suffix.lower() or ".jpg"
            dest = output_images / f"{slug}{ext}"
            if args.overwrite or not dest.exists():
                dest.write_bytes(cover.read_bytes())
            cover_public_path = f"/podcasts/{dest.name}"

        legacy_url = f"https://electracast.com/podcast/{slug}/"

        entries.append(
            PodcastBundleEntry(
                slug=slug,
                title=title,
                summary=summary,
                cover_image=cover_public_path,
                legacy_url=legacy_url,
                source_dir=podcast_dir.name,
            )
        )

    # Stable ordering (match WP-ish ordering on /podcasts: alphabetic).
    entries.sort(key=lambda e: e.title.lower())

    dump_json(output_json, {"count": len(entries), "podcasts": [asdict(e) for e in entries]})
    print(f"Exported {len(entries)} podcasts -> {output_json}")
    print(f"Covers written to -> {output_images}")


if __name__ == "__main__":
    main()

