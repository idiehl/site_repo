"""Scrape ElectraCast podcast and network entries into local folders."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

BASE_URL = "https://electracast.com"
PODCASTS_URL = f"{BASE_URL}/podcasts/"
NETWORKS_URL = f"{BASE_URL}/networks/"


def sanitize_filename(value: str) -> str:
    cleaned = re.sub(r'[\\/:*?"<>|]', "_", value)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or "ElectraCast"


def slugify(value: str) -> str:
    value = re.sub(r"[^\w]+", "_", value, flags=re.UNICODE)
    value = re.sub(r"_+", "_", value).strip("_")
    return value or "ElectraCast"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def pick_first_src(srcset: str) -> str | None:
    if not srcset:
        return None
    first = srcset.split(",")[0].strip()
    if not first:
        return None
    return first.split(" ")[0].strip()


def normalize_url(base: str, url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if not url or url.startswith("data:") or url.startswith("mailto:"):
        return None
    return urljoin(base, url)


def extract_listing_links(soup: BeautifulSoup, kind: str) -> list[tuple[str, str]]:
    links: list[tuple[str, str]] = []
    if kind == "podcasts":
        selector = ".gutentor-post-title a, .gutentor-post-image-link"
        href_contains = "/podcast/"
    else:
        selector = ".gutentor-post-title a, .gutentor-post-image-link"
        href_contains = "/network/"

    for anchor in soup.select(selector):
        href = anchor.get("href")
        if not href or href_contains not in href:
            continue
        title = anchor.get_text(strip=True)
        links.append((title, href))

    # Fallback: any link that matches
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if href_contains not in href:
            continue
        title = anchor.get_text(strip=True)
        links.append((title, href))

    unique: dict[str, str] = {}
    for title, href in links:
        absolute = urljoin(BASE_URL, href)
        if absolute not in unique:
            unique[absolute] = title
    return [(title, href) for href, title in unique.items()]


def extract_summary(soup: BeautifulSoup, kind: str) -> str | None:
    if kind == "podcasts":
        candidates = soup.select(".poddesc p")
    else:
        candidates = soup.select(".netdesc p")
    for candidate in candidates:
        text = candidate.get_text(strip=True)
        if len(text) > 40:
            return text
    content = soup.select_one(".entry-content-podcast") or soup.select_one(".entry-content")
    if content:
        for paragraph in content.find_all("p"):
            text = paragraph.get_text(strip=True)
            if len(text) > 40:
                return text
    return None


def extract_cover_url(soup: BeautifulSoup, kind: str, base_url: str) -> str | None:
    meta = soup.find("meta", property="og:image")
    if meta and meta.get("content"):
        return normalize_url(base_url, meta["content"])

    if kind == "podcasts":
        cover = soup.select_one(".podtop img.podart") or soup.select_one(
            ".entry-content-podcast img.podart"
        )
    else:
        cover = soup.select_one(".netart img") or soup.select_one(
            ".entry-content-podcast .netart img"
        )
    if cover:
        return normalize_url(base_url, cover.get("src") or cover.get("data-src"))
    return None


def extract_network_podcast_links(soup: BeautifulSoup) -> list[str]:
    links = []
    container = soup.select_one(".ecsection") or soup.select_one(".entry-content-podcast")
    if not container:
        return links
    for anchor in container.select("a[href*='electracast.com/podcast/']"):
        href = anchor.get("href")
        if href:
            links.append(href.strip())
    return sorted(set(links))


def gather_asset_urls(soup: BeautifulSoup, base_url: str) -> set[str]:
    urls: set[str] = set()

    for tag in soup.find_all(["img", "script", "audio", "video", "source"]):
        src = tag.get("src") or tag.get("data-src")
        src = normalize_url(base_url, src)
        if src:
            urls.add(src)
        srcset = tag.get("srcset")
        srcset_url = normalize_url(base_url, pick_first_src(srcset) or "")
        if srcset_url:
            urls.add(srcset_url)

    for tag in soup.find_all("link"):
        rel = " ".join(tag.get("rel", []))
        if "stylesheet" not in rel and "icon" not in rel:
            continue
        href = normalize_url(base_url, tag.get("href"))
        if href:
            urls.add(href)

    return urls


def save_asset(
    client: httpx.Client, url: str, assets_dir: Path, used_names: set[str]
) -> None:
    parsed = urlparse(url)
    filename = Path(parsed.path).name
    if not filename:
        filename = "asset"
    filename = sanitize_filename(filename)

    if filename in used_names:
        digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:8]
        stem = Path(filename).stem
        suffix = Path(filename).suffix or ".bin"
        filename = f"{stem}_{digest}{suffix}"
    used_names.add(filename)

    target = assets_dir / filename
    if target.exists():
        return
    try:
        response = client.get(url, timeout=30)
        if response.status_code != 200:
            return
        target.write_bytes(response.content)
    except Exception:
        return


def save_text(path: Path, text: str) -> None:
    path.write_text(text.strip() + "\n", encoding="utf-8")


def process_entry(
    client: httpx.Client,
    kind: str,
    title: str,
    url: str,
    base_dir: Path,
    delay: float,
    overwrite: bool,
) -> None:
    response = client.get(url, timeout=30)
    response.raise_for_status()
    html = response.text
    soup = BeautifulSoup(html, "html.parser")

    page_title = soup.title.get_text(strip=True) if soup.title else title
    safe_title = sanitize_filename(page_title)
    directory_name = slugify(title or safe_title)
    entry_dir = base_dir / directory_name
    ensure_dir(entry_dir)

    assets_dir = entry_dir / f"{safe_title}_files"
    ensure_dir(assets_dir)

    html_path = entry_dir / f"{safe_title}.html"
    if overwrite or not html_path.exists():
        html_path.write_text(html, encoding="utf-8")

    summary = extract_summary(soup, kind)
    if summary:
        save_text(entry_dir / "summary.txt", summary)

    if kind == "networks":
        network_podcasts = extract_network_podcast_links(soup)
        if network_podcasts:
            save_text(entry_dir / "network_podcasts.txt", "\n".join(network_podcasts))

    cover_url = extract_cover_url(soup, kind, url)
    if cover_url:
        ext = Path(urlparse(cover_url).path).suffix or ".jpg"
        cover_path = entry_dir / f"{directory_name}_Cover{ext}"
        if overwrite or not cover_path.exists():
            try:
                cover_response = client.get(cover_url, timeout=30)
                if cover_response.status_code == 200:
                    cover_path.write_bytes(cover_response.content)
            except Exception:
                pass

    asset_urls = gather_asset_urls(soup, url)
    used_names: set[str] = set()
    for asset_url in sorted(asset_urls):
        save_asset(client, asset_url, assets_dir, used_names)

    time.sleep(delay)


def scrape(kind: str, output_dir: Path, delay: float, overwrite: bool, limit: int | None) -> None:
    listing_url = PODCASTS_URL if kind == "podcasts" else NETWORKS_URL
    target_dir = output_dir / f"electracast_{kind}"
    ensure_dir(target_dir)

    with httpx.Client(follow_redirects=True, headers={"User-Agent": "ElectraCastScraper/1.0"}) as client:
        listing_response = client.get(listing_url, timeout=30)
        listing_response.raise_for_status()
        listing_soup = BeautifulSoup(listing_response.text, "html.parser")

        entries = extract_listing_links(listing_soup, kind)
        if limit:
            entries = entries[:limit]

        print(f"[{kind}] Found {len(entries)} entries.")

        for index, (title, href) in enumerate(entries, start=1):
            print(f"[{kind}] ({index}/{len(entries)}) {title or href}")
            process_entry(
                client,
                kind,
                title,
                href,
                target_dir,
                delay=delay,
                overwrite=overwrite,
            )


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape ElectraCast podcasts and networks.")
    parser.add_argument("--output", default="internal/Electracast_Codebase")
    parser.add_argument("--type", choices=["podcasts", "networks", "all"], default="all")
    parser.add_argument("--delay", type=float, default=0.2, help="Delay between entries")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing files")
    parser.add_argument("--limit", type=int, default=None, help="Limit entries per type")
    args = parser.parse_args()

    output_dir = Path(args.output)
    ensure_dir(output_dir)

    kinds: Iterable[str] = ["podcasts", "networks"] if args.type == "all" else [args.type]
    for kind in kinds:
        scrape(kind, output_dir, delay=args.delay, overwrite=args.overwrite, limit=args.limit)


if __name__ == "__main__":
    main()
