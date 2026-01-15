"""Job posting scraper service."""

import hashlib
import logging
from typing import Optional, Tuple
from urllib.parse import urlparse, urlencode

import httpx

from atlasops.config import get_settings
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


async def fetch_with_scrapingbee(url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Fetch content using ScrapingBee API for anti-bot bypass.
    
    ScrapingBee handles Cloudflare, CAPTCHAs, and JS rendering.
    Sign up at https://www.scrapingbee.com/ and set SCRAPINGBEE_API_KEY.

    Returns:
        Tuple of (content, error_message)
    """
    settings = get_settings()
    api_key = settings.scrapingbee_api_key
    
    if not api_key:
        return None, "ScrapingBee API key not configured"

    try:
        params = {
            "api_key": api_key,
            "url": url,
            "render_js": "true",  # Enable JavaScript rendering
            "premium_proxy": "true",  # Use residential proxies for Indeed
            "country_code": "us",  # US-based proxy
            "wait": "3000",  # Wait 3s for JS to load
        }
        
        api_url = f"https://app.scrapingbee.com/api/v1/?{urlencode(params)}"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(api_url)
            
            if response.status_code == 200:
                return response.text, None
            elif response.status_code == 500:
                return None, "ScrapingBee: Target website error"
            elif response.status_code == 401:
                return None, "ScrapingBee: Invalid API key"
            elif response.status_code == 429:
                return None, "ScrapingBee: Rate limit exceeded"
            else:
                return None, f"ScrapingBee error: {response.status_code}"
                
    except httpx.TimeoutException:
        return None, "ScrapingBee request timed out"
    except Exception as e:
        logger.exception("ScrapingBee error")
        return None, f"ScrapingBee error: {str(e)}"


def is_blocked_content(content: str) -> bool:
    """Check if the scraped content indicates blocking."""
    if not content or len(content) < 500:
        return True
    
    blocked_indicators = [
        "blocked",
        "cloudflare",
        "captcha",
        "access denied",
        "please verify you are a human",
        "unusual traffic",
        "robot check",
    ]
    
    content_lower = content.lower()
    return any(indicator in content_lower for indicator in blocked_indicators)


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
