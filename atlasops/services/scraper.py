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


def extract_text_from_html(html: str, url: str = "") -> str:
    """Extract readable text from HTML, removing boilerplate.
    
    For known job sites (LinkedIn, Indeed), use site-specific selectors
    to extract just the job content.
    """
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        # Fallback: basic tag stripping
        import re

        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    soup = BeautifulSoup(html, "html.parser")
    
    # Try site-specific extraction first
    job_text = _extract_linkedin_job(soup) if "linkedin.com" in url else None
    if not job_text:
        job_text = _extract_indeed_job(soup) if "indeed.com" in url else None
    
    if job_text and len(job_text) > 200:
        logger.info(f"Site-specific extraction found {len(job_text)} chars")
        return job_text

    # Fallback to generic extraction
    # Remove script and style elements
    for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
        element.decompose()

    # Get text
    text = soup.get_text(separator=" ", strip=True)

    # Clean up whitespace
    import re

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def _extract_linkedin_job(soup) -> str:
    """Extract job content from LinkedIn job posting page."""
    parts = []
    
    # Job title - multiple possible selectors
    title_selectors = [
        "h1.job-details-jobs-unified-top-card__job-title",
        "h1.jobs-unified-top-card__job-title", 
        "h1.t-24",
        ".job-details-jobs-unified-top-card__job-title",
        "h1[data-test-job-title]",
    ]
    for selector in title_selectors:
        title = soup.select_one(selector)
        if title:
            parts.append(f"Job Title: {title.get_text(strip=True)}")
            break
    
    # Company name
    company_selectors = [
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name",
        ".job-details-jobs-unified-top-card__primary-description-container a",
        "a[data-test-app-aware-link]",
    ]
    for selector in company_selectors:
        company = soup.select_one(selector)
        if company:
            company_text = company.get_text(strip=True)
            if company_text and len(company_text) < 100:  # Avoid picking up wrong elements
                parts.append(f"Company: {company_text}")
                break
    
    # Location
    location_selectors = [
        ".job-details-jobs-unified-top-card__bullet",
        ".jobs-unified-top-card__bullet",
        ".job-details-jobs-unified-top-card__primary-description-container",
    ]
    for selector in location_selectors:
        location = soup.select_one(selector)
        if location:
            loc_text = location.get_text(strip=True)
            if loc_text and len(loc_text) < 200:
                parts.append(f"Location: {loc_text}")
                break
    
    # Job description - this is the main content
    description_selectors = [
        ".jobs-description__content",
        ".jobs-description-content",
        ".job-details-jobs-unified-top-card__job-insight",
        "#job-details",
        ".jobs-box__html-content",
        "article.jobs-description",
        "[data-test-id='job-details']",
    ]
    for selector in description_selectors:
        desc = soup.select_one(selector)
        if desc:
            desc_text = desc.get_text(separator="\n", strip=True)
            if len(desc_text) > 100:
                parts.append(f"Job Description:\n{desc_text}")
                break
    
    # Also try to find "About the job" section
    about_section = soup.find("h2", string=lambda t: t and "about the job" in t.lower())
    if about_section:
        parent = about_section.find_parent("section") or about_section.find_parent("div")
        if parent:
            about_text = parent.get_text(separator="\n", strip=True)
            if about_text and "About the job" not in " ".join(parts):
                parts.append(f"About:\n{about_text}")
    
    return "\n\n".join(parts)


def _extract_indeed_job(soup) -> str:
    """Extract job content from Indeed job posting page."""
    parts = []
    
    # Job title
    title = soup.select_one("h1.jobsearch-JobInfoHeader-title")
    if title:
        parts.append(f"Job Title: {title.get_text(strip=True)}")
    
    # Company
    company = soup.select_one("[data-testid='inlineHeader-companyName']") or soup.select_one(".jobsearch-InlineCompanyRating-companyHeader")
    if company:
        parts.append(f"Company: {company.get_text(strip=True)}")
    
    # Location  
    location = soup.select_one("[data-testid='inlineHeader-companyLocation']") or soup.select_one(".jobsearch-JobInfoHeader-subtitle")
    if location:
        parts.append(f"Location: {location.get_text(strip=True)}")
    
    # Description
    desc = soup.select_one("#jobDescriptionText") or soup.select_one(".jobsearch-jobDescriptionText")
    if desc:
        parts.append(f"Job Description:\n{desc.get_text(separator=chr(10), strip=True)}")
    
    return "\n\n".join(parts)


def compute_url_hash(url: str) -> str:
    """Compute a hash of the URL for deduplication."""
    # Normalize URL
    parsed = urlparse(url)
    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    if parsed.query:
        normalized += f"?{parsed.query}"

    return hashlib.sha256(normalized.encode()).hexdigest()[:16]
