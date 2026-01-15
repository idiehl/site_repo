"""HTML and text sanitization utilities."""

import re
from typing import Optional


def sanitize_html(html: str, allowed_tags: Optional[set] = None) -> str:
    """
    Sanitize HTML content, removing potentially dangerous elements.

    Args:
        html: Raw HTML string
        allowed_tags: Set of allowed tag names (default: basic formatting)

    Returns:
        Sanitized HTML string
    """
    if allowed_tags is None:
        allowed_tags = {
            "p", "br", "strong", "em", "b", "i", "u",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li",
            "a", "span", "div",
            "table", "tr", "td", "th", "thead", "tbody",
        }

    try:
        from bs4 import BeautifulSoup
    except ImportError:
        # Fallback: strip all tags
        return strip_html_tags(html)

    soup = BeautifulSoup(html, "html.parser")

    # Remove script and style elements
    for tag in soup(["script", "style", "iframe", "object", "embed", "form"]):
        tag.decompose()

    # Remove event handlers from all elements
    for tag in soup.find_all(True):
        # Remove dangerous attributes
        for attr in list(tag.attrs.keys()):
            if attr.startswith("on") or attr in {"href", "src", "action"}:
                if attr == "href" and tag.name == "a":
                    # Sanitize href
                    href = tag.attrs.get("href", "")
                    if not href.startswith(("http://", "https://", "mailto:")):
                        del tag.attrs[attr]
                else:
                    del tag.attrs[attr]

        # Remove disallowed tags but keep content
        if tag.name not in allowed_tags:
            tag.unwrap()

    return str(soup)


def strip_html_tags(html: str) -> str:
    """Strip all HTML tags from a string."""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", html)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def sanitize_filename(filename: str) -> str:
    """Sanitize a filename to prevent path traversal."""
    # Remove path separators
    filename = filename.replace("/", "_").replace("\\", "_")
    # Remove null bytes
    filename = filename.replace("\x00", "")
    # Remove other dangerous characters
    filename = re.sub(r"[<>:\"|?*]", "_", filename)
    # Limit length
    if len(filename) > 255:
        filename = filename[:255]
    return filename


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """Truncate text to a maximum length, preserving word boundaries."""
    if len(text) <= max_length:
        return text

    truncated = text[: max_length - len(suffix)]
    # Find last space to avoid cutting words
    last_space = truncated.rfind(" ")
    if last_space > max_length // 2:
        truncated = truncated[:last_space]

    return truncated + suffix
