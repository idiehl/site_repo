"""URL validation and SSRF protection."""

import ipaddress
import socket
from typing import Tuple
from urllib.parse import urlparse

# Blocked URL schemes
BLOCKED_SCHEMES = {"file", "ftp", "gopher", "data", "javascript"}

# Common job posting domains (allowlist approach for extra safety)
KNOWN_JOB_SITES = {
    "linkedin.com",
    "indeed.com",
    "glassdoor.com",
    "monster.com",
    "ziprecruiter.com",
    "careerbuilder.com",
    "dice.com",
    "simplyhired.com",
    "greenhouse.io",
    "lever.co",
    "workday.com",
    "icims.com",
    "jobvite.com",
    "smartrecruiters.com",
    "ashbyhq.com",
    "bamboohr.com",
    "workable.com",
    "breezy.hr",
    "jazz.co",
    "recruitee.com",
    "jobs.lever.co",
    "boards.greenhouse.io",
}


def is_private_ip(ip: str) -> bool:
    """Check if an IP address is private/internal."""
    try:
        ip_obj = ipaddress.ip_address(ip)
        return (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
        )
    except ValueError:
        return True  # Invalid IP, treat as private for safety


def validate_url(url: str) -> Tuple[bool, str | None]:
    """
    Validate a URL for safety before fetching.

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Invalid URL format"

    # Check scheme
    if not parsed.scheme:
        return False, "URL must include scheme (http/https)"

    if parsed.scheme.lower() not in {"http", "https"}:
        return False, f"Blocked URL scheme: {parsed.scheme}"

    # Check hostname
    if not parsed.hostname:
        return False, "URL must include hostname"

    hostname = parsed.hostname.lower()

    # Block localhost variations
    if hostname in {"localhost", "127.0.0.1", "::1", "0.0.0.0"}:
        return False, "Localhost URLs are not allowed"

    # Block internal hostnames
    if hostname.endswith(".local") or hostname.endswith(".internal"):
        return False, "Internal hostnames are not allowed"

    # Resolve hostname and check IP
    try:
        ip = socket.gethostbyname(hostname)
        if is_private_ip(ip):
            return False, "URL resolves to private/internal IP"
    except socket.gaierror:
        # Can't resolve - might be valid but unreachable
        pass

    # URL is valid
    return True, None


def is_known_job_site(url: str) -> bool:
    """Check if URL is from a known job posting site."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname.lower() if parsed.hostname else ""

        # Check against known job sites
        for site in KNOWN_JOB_SITES:
            if hostname == site or hostname.endswith(f".{site}"):
                return True

        return False
    except Exception:
        return False
