"""Job posting scraper service."""

import hashlib
import logging
from typing import Optional, Tuple
from urllib.parse import urlparse

import httpx

from atlasops.utils.url_validator import validate_url

logger = logging.getLogger(__name__)

# User agent for web scraping
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


async def fetch_url_content(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Fetch content from a URL.

    Returns:
        Tuple of (content, error_message)
    """
    # Validate URL first
    is_valid, error = validate_url(url)
    if not is_valid:
        return None, error

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "text/html" not in content_type.lower():
                return None, f"Unexpected content type: {content_type}"

            return response.text, None

    except httpx.TimeoutException:
        return None, "Request timed out"
    except httpx.HTTPStatusError as e:
        return None, f"HTTP error: {e.response.status_code}"
    except httpx.RequestError as e:
        return None, f"Request error: {str(e)}"
    except Exception as e:
        logger.exception("Unexpected error fetching URL")
        return None, f"Unexpected error: {str(e)}"


async def fetch_with_playwright(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Fetch content using Playwright for JS-rendered pages.

    Returns:
        Tuple of (content, error_message)
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        return None, "Playwright not installed"

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=30000)
            content = await page.content()
            await browser.close()
            return content, None

    except Exception as e:
        logger.exception("Playwright error fetching URL")
        return None, f"Playwright error: {str(e)}"


def extract_text_from_html(html: str) -> str:
    """Extract readable text from HTML, removing boilerplate."""
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        # Fallback: basic tag stripping
        import re

        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()

    # Get text
    text = soup.get_text(separator=" ", strip=True)

    # Clean up whitespace
    import re

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def compute_url_hash(url: str) -> str:
    """Compute a hash of the URL for deduplication."""
    # Normalize URL
    parsed = urlparse(url)
    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    if parsed.query:
        normalized += f"?{parsed.query}"

    return hashlib.sha256(normalized.encode()).hexdigest()[:16]
