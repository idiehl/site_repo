"""Resume generation and matching service."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from atlasops.services.llm_client import llm_client

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "resumes"


def get_available_templates() -> List[str]:
    """Get list of available resume templates."""
    if not TEMPLATES_DIR.exists():
        return ["default"]
    return [f.stem for f in TEMPLATES_DIR.glob("*.html")]


def calculate_match_score(
    profile_data: Dict[str, Any],
    job_requirements: Dict[str, Any],
) -> Tuple[float, List[str], List[str]]:
    """
    Calculate match score between profile and job requirements.

    Returns:
        Tuple of (score, matched_keywords, gaps)
    """
    matched = []
    gaps = []

    # Extract skills from profile
    profile_skills = set()
    if profile_data.get("skills"):
        for skill in profile_data["skills"]:
            if isinstance(skill, str):
                profile_skills.add(skill.lower())
            elif isinstance(skill, dict) and "name" in skill:
                profile_skills.add(skill["name"].lower())

    # Extract work experience keywords
    work_keywords = set()
    if profile_data.get("work_history"):
        for job in profile_data["work_history"]:
            if isinstance(job, dict):
                if job.get("title"):
                    work_keywords.add(job["title"].lower())
                if job.get("description"):
                    # Simple keyword extraction
                    words = job["description"].lower().split()
                    work_keywords.update(w for w in words if len(w) > 4)

    all_profile_keywords = profile_skills | work_keywords

    # Extract required skills from job
    required_skills = set()
    if job_requirements.get("hard_skills"):
        required_skills.update(s.lower() for s in job_requirements["hard_skills"])
    if job_requirements.get("soft_skills"):
        required_skills.update(s.lower() for s in job_requirements["soft_skills"])

    # Calculate matches and gaps
    for skill in required_skills:
        skill_lower = skill.lower()
        if any(skill_lower in kw or kw in skill_lower for kw in all_profile_keywords):
            matched.append(skill)
        else:
            gaps.append(skill)

    # Calculate score
    if not required_skills:
        score = 0.5  # No requirements to match
    else:
        score = len(matched) / len(required_skills)

    return score, matched, gaps


async def generate_resume_content(
    profile_data: Dict[str, Any],
    job_data: Dict[str, Any],
    focus_keywords: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Generate tailored resume content using AI.

    Returns:
        Structured resume content ready for rendering.
    """
    # Build prompt context
    job_title = job_data.get("job_title", "the position")
    company = job_data.get("company_name", "the company")
    requirements = job_data.get("requirements", {})

    prompt = f"""Create a tailored resume for the position of {job_title} at {company}.

Job Requirements:
{requirements}

Candidate Profile:
{profile_data}

Focus Keywords: {focus_keywords or 'None specified'}

Generate a resume that:
1. Highlights relevant experience matching the job requirements
2. Uses strong action verbs and quantified achievements where possible
3. Organizes content in standard resume sections
4. Is ATS-friendly with clear section headings

Return structured JSON with sections: summary, experience, education, skills, projects (if relevant)."""

    response = await llm_client.complete(
        prompt,
        system_prompt="You are an expert resume writer. Create compelling, truthful resumes that highlight relevant experience.",
        temperature=0.5,
    )

    # Try to parse response as JSON
    import json
    import re

    try:
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError:
        pass

    # Return basic structure if parsing fails
    return {
        "summary": profile_data.get("summary", ""),
        "experience": profile_data.get("work_history", []),
        "education": profile_data.get("education", []),
        "skills": profile_data.get("skills", []),
        "generated_content": response,
    }


def render_resume_html(
    content: Dict[str, Any],
    template_id: str = "default",
) -> str:
    """Render resume content to HTML using a template."""
    template_path = TEMPLATES_DIR / f"{template_id}.html"

    if not template_path.exists():
        # Use default template
        return _default_resume_html(content)

    template = template_path.read_text(encoding="utf-8")

    # Simple template rendering (replace with Jinja2 if needed)
    # For now, just return the default
    return _default_resume_html(content)


def _default_resume_html(content: Dict[str, Any]) -> str:
    """Generate default resume HTML."""
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .experience-item { margin-bottom: 15px; }
        .company { font-weight: bold; }
        .date { color: #666; font-style: italic; }
        ul { margin: 5px 0; }
    </style>
</head>
<body>
"""

    # Summary
    if content.get("summary"):
        html += f"""
    <div class="section">
        <h2>Summary</h2>
        <p>{content['summary']}</p>
    </div>
"""

    # Experience
    if content.get("experience"):
        html += """
    <div class="section">
        <h2>Experience</h2>
"""
        for exp in content["experience"]:
            if isinstance(exp, dict):
                html += f"""
        <div class="experience-item">
            <div class="company">{exp.get('title', '')} at {exp.get('company', '')}</div>
            <div class="date">{exp.get('start_date', '')} - {exp.get('end_date', 'Present')}</div>
            <p>{exp.get('description', '')}</p>
        </div>
"""
        html += "    </div>\n"

    # Education
    if content.get("education"):
        html += """
    <div class="section">
        <h2>Education</h2>
"""
        for edu in content["education"]:
            if isinstance(edu, dict):
                html += f"""
        <div class="experience-item">
            <div class="company">{edu.get('degree', '')} - {edu.get('institution', '')}</div>
            <div class="date">{edu.get('end_date', '')}</div>
        </div>
"""
        html += "    </div>\n"

    # Skills
    if content.get("skills"):
        html += """
    <div class="section">
        <h2>Skills</h2>
        <p>"""
        skills = content["skills"]
        if isinstance(skills, list):
            skill_names = [s if isinstance(s, str) else s.get("name", "") for s in skills]
            html += ", ".join(skill_names)
        html += "</p>\n    </div>\n"

    html += """
</body>
</html>"""

    return html


async def render_resume_pdf(html: str, output_path: str) -> bool:
    """Render HTML to PDF using WeasyPrint."""
    try:
        from weasyprint import HTML

        HTML(string=html).write_pdf(output_path)
        return True
    except ImportError:
        logger.warning("WeasyPrint not installed, cannot generate PDF")
        return False
    except Exception as e:
        logger.exception("Failed to generate PDF")
        return False
