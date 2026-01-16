"""Celery background tasks."""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from celery import Celery

from atlasops.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    "atlasops",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max
    worker_prefetch_multiplier=1,
)


def run_async(coro):
    """Helper to run async functions in Celery tasks."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def get_fresh_session():
    """Create a fresh async session maker for Celery tasks.
    
    This avoids connection pool issues when Celery workers fork.
    """
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
    
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    
    session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    return session_maker, engine


@celery_app.task(bind=True, max_retries=3)
def scrape_job_posting(self, job_id: str):
    """
    Scrape and extract data from a job posting URL.

    This task:
    1. Fetches the URL content
    2. Extracts text
    3. Uses LLM to parse structured data
    4. Updates the database
    """
    logger.info(f"Starting scrape for job {job_id}")

    async def _scrape():
        from sqlalchemy import select

        from atlasops.models.job import JobPosting
        from atlasops.services.llm_client import llm_client
        from atlasops.services.scraper import (
            compute_url_hash,
            extract_text_from_html,
            fetch_url_content,
            fetch_with_playwright,
        )

        # Create fresh connection for this task
        session_maker, engine = get_fresh_session()
        
        async with session_maker() as db:
            # Get job posting
            result = await db.execute(
                select(JobPosting).where(JobPosting.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job:
                logger.error(f"Job {job_id} not found")
                return

            try:
                # Update status
                job.status = "processing"
                await db.commit()

                # Compute URL hash
                job.url_hash = compute_url_hash(job.url)

                # Fetch content
                content, error = await fetch_url_content(job.url)

                # Try Playwright if simple fetch fails or returns no content
                if not content or len(content) < 500:
                    logger.info(f"Trying Playwright for {job.url}")
                    content, error = await fetch_with_playwright(job.url)

                if not content:
                    job.status = "failed"
                    job.error_message = error or "Failed to fetch content"
                    await db.commit()
                    return

                # Extract text (pass URL for site-specific extraction)
                raw_text = extract_text_from_html(content, job.url)
                job.raw_text = raw_text[:50000]  # Limit storage
                logger.info(f"Extracted {len(raw_text)} chars from scraped content")

                # Use LLM to extract structured data
                extracted = await llm_client.extract_job_posting(raw_text, job.url)

                # Update job with extracted data
                job.company_name = extracted.get("company_name")
                job.job_title = extracted.get("job_title")
                job.location = extracted.get("location")
                job.remote_policy = extracted.get("remote_policy")
                job.salary_range = extracted.get("salary_range")
                job.job_description = extracted.get("job_description")
                job.requirements = extracted.get("requirements")
                job.benefits = extracted.get("benefits")
                job.structured_data = extracted

                # Validate minimum required fields
                has_company = bool(job.company_name and job.company_name.strip())
                has_title = bool(job.job_title and job.job_title.strip())
                has_description = bool(job.job_description and len(job.job_description.strip()) > 50)

                if has_company and has_title and has_description:
                    job.status = "completed"
                    logger.info(f"Successfully processed job {job_id}")
                else:
                    job.status = "needs_review"
                    missing = []
                    if not has_company:
                        missing.append("company name")
                    if not has_title:
                        missing.append("job title")
                    if not has_description:
                        missing.append("job description")
                    job.error_message = f"Missing required fields: {', '.join(missing)}. Use manual entry to add details."
                    logger.warning(f"Job {job_id} needs review - missing: {missing}")

                await db.commit()

            except Exception as e:
                logger.exception(f"Error processing job {job_id}")
                job.status = "failed"
                job.error_message = str(e)
                await db.commit()
                raise
            finally:
                # Clean up the engine to avoid connection pool issues
                await engine.dispose()

    try:
        run_async(_scrape())
    except Exception as e:
        logger.exception(f"Task failed for job {job_id}")
        self.retry(countdown=60 * (self.request.retries + 1))


@celery_app.task(bind=True, max_retries=3)
def extract_job_from_html(self, job_id: str, html_content: str):
    """
    Extract job data from raw HTML content (browser extension).
    
    This task skips scraping since we already have the HTML from the extension.
    """
    logger.info(f"Extracting job data from HTML for job {job_id}")

    async def _extract():
        from sqlalchemy import select

        from atlasops.models.job import JobPosting
        from atlasops.services.llm_client import llm_client
        from atlasops.services.scraper import extract_text_from_html

        # Create fresh connection for this task
        session_maker, engine = get_fresh_session()
        
        async with session_maker() as db:
            # Get job posting
            result = await db.execute(
                select(JobPosting).where(JobPosting.id == job_id)
            )
            job = result.scalar_one_or_none()

            if not job:
                logger.error(f"Job {job_id} not found")
                return

            try:
                # Extract text from HTML (pass URL for site-specific extraction)
                raw_text = extract_text_from_html(html_content, job.url)
                job.raw_text = raw_text[:50000]  # Limit storage
                logger.info(f"Extracted {len(raw_text)} chars of text from HTML")

                # Use LLM to extract structured data
                extracted = await llm_client.extract_job_posting(raw_text, job.url)

                # Update job with extracted data
                job.company_name = extracted.get("company_name")
                job.job_title = extracted.get("job_title")
                job.location = extracted.get("location")
                job.remote_policy = extracted.get("remote_policy")
                job.salary_range = extracted.get("salary_range")
                job.job_description = extracted.get("job_description")
                job.requirements = extracted.get("requirements")
                job.benefits = extracted.get("benefits")
                job.structured_data = extracted

                # Validate minimum required fields
                has_company = bool(job.company_name and job.company_name.strip())
                has_title = bool(job.job_title and job.job_title.strip())
                has_description = bool(job.job_description and len(job.job_description.strip()) > 50)

                if has_company and has_title and has_description:
                    job.status = "completed"
                    logger.info(f"Successfully extracted job {job_id} from extension HTML")
                else:
                    job.status = "needs_review"
                    missing = []
                    if not has_company:
                        missing.append("company name")
                    if not has_title:
                        missing.append("job title")
                    if not has_description:
                        missing.append("job description")
                    job.error_message = f"Missing required fields: {', '.join(missing)}. Use manual entry to add details."
                    logger.warning(f"Job {job_id} needs review - missing: {missing}")

                await db.commit()

            except Exception as e:
                logger.exception(f"Error extracting job {job_id}")
                job.status = "failed"
                job.error_message = str(e)
                await db.commit()
                raise
            finally:
                await engine.dispose()

    try:
        run_async(_extract())
    except Exception as e:
        logger.exception(f"Extraction task failed for job {job_id}")
        self.retry(countdown=60 * (self.request.retries + 1))


@celery_app.task
def check_stale_applications():
    """
    Check for applications that have been in 'applied' status for 30+ days
    and auto-close them.
    """
    logger.info("Checking for stale applications")

    async def _check():
        from sqlalchemy import select

        from atlasops.models.application import (
            Application,
            ApplicationEvent,
            ApplicationStatus,
        )

        cutoff = datetime.now(timezone.utc) - timedelta(days=30)

        # Create fresh connection for this task
        session_maker, engine = get_fresh_session()
        
        async with session_maker() as db:
            result = await db.execute(
                select(Application).where(
                    Application.status == ApplicationStatus.APPLIED,
                    Application.updated_at < cutoff,
                )
            )

            stale_apps = result.scalars().all()

            for app in stale_apps:
                # Create event
                event = ApplicationEvent(
                    application_id=app.id,
                    from_status=app.status,
                    to_status=ApplicationStatus.NO_RESPONSE_CLOSED,
                    notes="Auto-closed after 30 days with no response",
                )
                db.add(event)

                # Update status
                app.status = ApplicationStatus.NO_RESPONSE_CLOSED
                app.updated_at = datetime.now(timezone.utc)

            await db.commit()
            logger.info(f"Auto-closed {len(stale_apps)} stale applications")
        
        # Clean up engine
        await engine.dispose()

    run_async(_check())


# Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "check-stale-applications-daily": {
        "task": "atlasops.workers.tasks.check_stale_applications",
        "schedule": timedelta(hours=24),
    },
}
