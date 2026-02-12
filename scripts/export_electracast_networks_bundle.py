"""Export scraped ElectraCast network data into tracked SPA assets.

Reads network folders under internal/Electracast_Codebase/electracast_networks/
and produces:
- electracast/src/data/catalog/networks.json (metadata + podcast slug mapping)
- electracast/public/network-covers/<slug>.<ext> (cover images)

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
from urllib.parse import urlparse


def normalize_slug(text: str) -> str:
    text = text.replace("_", "-").lower()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    text = re.sub(r"\-+", "-", text).strip("-")
    return text


@dataclass(frozen=True)
class NetworkBundleEntry:
    slug: str
    title: str
    description: str | None
    cover_image: str | None  # public path: /network-covers/<slug>.<ext>
    legacy_url: str | None   # https://electracast.com/network/<slug>/
    podcast_slugs: list[str]
    source_dir: str


def try_extract_title_from_html(network_dir: Path) -> str | None:
    html_files = sorted(network_dir.glob("*.html"))
    if not html_files:
        return None
    html = html_files[0].read_text(encoding="utf-8", errors="ignore")
    try:
        from bs4 import BeautifulSoup  # type: ignore

        soup = BeautifulSoup(html, "html.parser")
        h1 = soup.find("h1")
        if h1:
            text = h1.get_text(strip=True)
            if text:
                return text
        if soup.title:
            text = soup.title.get_text(strip=True)
            if text:
                return text.split("|")[0].strip()
    except Exception:
        pass

    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, flags=re.IGNORECASE | re.DOTALL)
    if m:
        text = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if text:
            return text
    return None


def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8", errors="ignore").strip()
    return text or None


def find_cover(network_dir: Path) -> Path | None:
    cover = next(iter(sorted(network_dir.glob("*_Cover.*"))), None)
    if cover and cover.is_file():
        return cover
    for candidate in sorted(network_dir.iterdir()):
        if candidate.is_file() and "cover" in candidate.name.lower():
            return candidate
    return None


def parse_podcast_slugs(network_dir: Path) -> list[str]:
    """Parse network_podcasts.txt which contains legacy podcast URLs."""

    file_path = network_dir / "network_podcasts.txt"
    raw = read_text(file_path)
    if not raw:
        return []
    slugs: list[str] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            path = urlparse(line).path  # /podcast/<slug>/
            parts = [p for p in path.split("/") if p]
            if len(parts) >= 2 and parts[-2] == "podcast":
                slugs.append(parts[-1])
            elif parts and parts[-1]:
                slugs.append(parts[-1])
        except Exception:
            continue
    # stable + unique
    return sorted(set(slugs))


def dump_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export ElectraCast scraped networks into tracked assets"
    )
    parser.add_argument(
        "--input",
        default="internal/Electracast_Codebase/electracast_networks",
        help="Input networks directory (scraper output).",
    )
    parser.add_argument(
        "--output-json",
        default="electracast/src/data/catalog/networks.json",
        help="Output JSON metadata file (tracked).",
    )
    parser.add_argument(
        "--output-images",
        default="electracast/public/network-covers",
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
            "  python scripts/scrape_electracast_entries.py --type networks --skip-assets\n"
        )

    output_json = Path(args.output_json)
    output_images = Path(args.output_images)
    output_images.mkdir(parents=True, exist_ok=True)
    if args.clean_images:
        for existing in output_images.iterdir():
            if existing.is_file():
                existing.unlink()

    entries: list[NetworkBundleEntry] = []
    by_slug: dict[str, NetworkBundleEntry] = {}

    dirs = [p for p in sorted(input_dir.iterdir()) if p.is_dir()]
    if args.limit:
        dirs = dirs[: args.limit]

    for network_dir in dirs:
        if network_dir.name.endswith("_files"):
            continue

        title = try_extract_title_from_html(network_dir) or network_dir.name.replace("_", " ").strip()
        slug = normalize_slug(title) or normalize_slug(network_dir.name)
        if not slug:
            continue
        description = read_text(network_dir / "summary.txt")
        cover = find_cover(network_dir)
        podcast_slugs = parse_podcast_slugs(network_dir)

        cover_public_path: str | None = None
        if cover:
            ext = cover.suffix.lower() or ".jpg"
            dest = output_images / f"{slug}{ext}"
            if args.overwrite or not dest.exists():
                dest.write_bytes(cover.read_bytes())
            cover_public_path = f"/network-covers/{dest.name}"

        legacy_url = f"https://electracast.com/network/{slug}/"

        entry = NetworkBundleEntry(
            slug=slug,
            title=title,
            description=description,
            cover_image=cover_public_path,
            legacy_url=legacy_url,
            podcast_slugs=podcast_slugs,
            source_dir=network_dir.name,
        )

        # De-dupe by slug in case internal normalization produced duplicates.
        existing = by_slug.get(slug)
        if existing is None:
            by_slug[slug] = entry
        else:
            # Prefer whichever entry has more complete data.
            existing_score = int(bool(existing.description)) + int(bool(existing.cover_image)) + len(existing.podcast_slugs)
            entry_score = int(bool(entry.description)) + int(bool(entry.cover_image)) + len(entry.podcast_slugs)
            if entry_score > existing_score:
                by_slug[slug] = entry

    entries = list(by_slug.values())

    entries.sort(key=lambda e: e.title.lower())

    dump_json(output_json, {"count": len(entries), "networks": [asdict(e) for e in entries]})
    print(f"Exported {len(entries)} networks -> {output_json}")
    print(f"Covers written to -> {output_images}")


if __name__ == "__main__":
    main()

