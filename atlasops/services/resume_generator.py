"""Resume generation and matching service for 2-page tailored resumes."""

import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from atlasops.services.llm_client import llm_client

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "resumes"
PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

# Available templates with metadata
TEMPLATE_INFO = {
    "modern": {
        "name": "Modern",
        "description": "Clean, contemporary 2-page design with accent colors and skill tags",
        "best_for": ["Tech", "Startups", "Creative roles"],
    },
    "classic": {
        "name": "Classic",
        "description": "Traditional professional 2-page format, elegant typography",
        "best_for": ["Corporate", "Finance", "Legal", "Academia"],
    },
    "executive": {
        "name": "Executive",
        "description": "Bold two-column layout with header banner",
        "best_for": ["Senior roles", "Management", "C-Suite", "Consulting"],
    },
}


def get_available_templates() -> List[Dict[str, Any]]:
    """Get list of available resume templates with metadata."""
    templates = []
    for template_id, info in TEMPLATE_INFO.items():
        template_path = TEMPLATES_DIR / f"{template_id}.html"
        if template_path.exists():
            templates.append({
                "id": template_id,
                "name": info["name"],
                "description": info["description"],
                "best_for": info["best_for"],
            })
    
    if not templates:
        templates.append({
            "id": "default",
            "name": "Default",
            "description": "Basic professional 2-page layout",
            "best_for": ["General use"],
        })
    
    return templates


def calculate_match_score(
    profile_data: Dict[str, Any],
    job_requirements: Dict[str, Any],
) -> Tuple[float, List[str], List[str]]:
    """Calculate match score between profile and job requirements."""
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

    if not required_skills:
        score = 0.5
    else:
        score = len(matched) / len(required_skills)

    return score, matched, gaps


async def generate_resume_content(
    profile_data: Dict[str, Any],
    job_data: Dict[str, Any],
    focus_keywords: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Generate tailored 2-page resume content using AI.
    
    Returns structured content with page1 and page2 sections.
    """
    # Load prompt template
    prompt_path = PROMPTS_DIR / "resume_generator_v1.md"
    if prompt_path.exists():
        prompt_template = prompt_path.read_text(encoding="utf-8")
    else:
        logger.warning("Resume prompt template not found, using fallback")
        prompt_template = _get_fallback_prompt()

    # Format prompt with job and profile data
    job_title = job_data.get("job_title", "the position")
    company_name = job_data.get("company_name", "the company")
    job_description = job_data.get("job_description", "Not provided")
    requirements = job_data.get("requirements", {})

    prompt = prompt_template.format(
        job_title=job_title,
        company_name=company_name,
        job_description=job_description,
        requirements=json.dumps(requirements, indent=2) if requirements else "Not specified",
        profile=json.dumps(profile_data, indent=2),
    )

    response = await llm_client.complete(
        prompt,
        system_prompt="""You are an expert resume writer and career strategist. 
Create highly tailored 2-page resumes that maximize interview chances.
Always return valid JSON with page1 and page2 sections.
Never fabricate experience - only reframe and emphasize existing qualifications.""",
        temperature=0.5,
    )

    # Parse response as JSON
    try:
        json_match = re.search(r"\{[\s\S]*\}", response)
        if json_match:
            content = json.loads(json_match.group())
            
            # Normalize the structure
            return _normalize_resume_content(content, profile_data)
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse resume JSON: {e}")

    # Return fallback structure if parsing fails
    return _create_fallback_content(profile_data, job_data)


def _normalize_resume_content(content: Dict[str, Any], profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize the LLM output to ensure consistent structure."""
    
    # Check if we got the new page1/page2 structure
    if "page1" in content and "page2" in content:
        # New format - flatten for template rendering
        page1 = content.get("page1", {})
        page2 = content.get("page2", {})
        
        normalized = {
            # Header info from page1
            "name": page1.get("header", {}).get("name", profile_data.get("full_name", "")),
            "email": page1.get("header", {}).get("email", profile_data.get("email", "")),
            "phone": page1.get("header", {}).get("phone", profile_data.get("phone", "")),
            "location": page1.get("header", {}).get("location", profile_data.get("location", "")),
            "linkedin": page1.get("header", {}).get("linkedin", ""),
            "headline": profile_data.get("headline", ""),
            
            # Page 1 content
            "profile_summary": page1.get("profile_summary", ""),
            "skills": page1.get("skills", {}),
            "experience": page1.get("experience", []),
            
            # Page 2 content
            "projects": page2.get("projects", []),
            "education": page2.get("education", []),
            "extracurriculars": page2.get("extracurriculars", []),
            "certifications": page2.get("certifications", []),
            
            # Metadata
            "keywords_used": content.get("metadata", {}).get("keywords_used", []),
            "tailoring_notes": content.get("metadata", {}).get("tailoring_notes", ""),
        }
        return normalized
    
    # Old format - normalize to new structure
    return {
        "name": content.get("contact", {}).get("name", profile_data.get("full_name", "")),
        "email": content.get("contact", {}).get("email", profile_data.get("email", "")),
        "phone": content.get("contact", {}).get("phone", profile_data.get("phone", "")),
        "location": content.get("contact", {}).get("location", profile_data.get("location", "")),
        "linkedin": content.get("contact", {}).get("linkedin", ""),
        "headline": profile_data.get("headline", ""),
        "profile_summary": content.get("summary", content.get("profile_summary", "")),
        "skills": content.get("skills", {}),
        "experience": content.get("experience", []),
        "projects": content.get("projects", []),
        "education": content.get("education", []),
        "extracurriculars": content.get("extracurriculars", []),
        "certifications": content.get("certifications", []),
        "keywords_used": content.get("keywords_used", []),
        "tailoring_notes": content.get("tailoring_notes", ""),
    }


def _create_fallback_content(profile_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create fallback content when LLM parsing fails."""
    return {
        "name": profile_data.get("full_name", ""),
        "email": profile_data.get("email", ""),
        "phone": profile_data.get("phone", ""),
        "location": profile_data.get("location", ""),
        "linkedin": "",
        "headline": profile_data.get("headline", ""),
        "profile_summary": profile_data.get("summary", ""),
        "skills": {
            "technical": profile_data.get("skills", [])[:8] if isinstance(profile_data.get("skills"), list) else [],
            "tools": [],
            "professional": [],
        },
        "experience": profile_data.get("work_history", []),
        "projects": profile_data.get("projects", []),
        "education": profile_data.get("education", []),
        "extracurriculars": [],
        "certifications": profile_data.get("certifications", []),
        "keywords_used": [],
        "tailoring_notes": "Fallback content used - LLM parsing failed",
    }


def _get_fallback_prompt() -> str:
    """Return fallback prompt if template not found."""
    return """Create a tailored 2-page resume for {job_title} at {company_name}.

Job Description: {job_description}
Requirements: {requirements}
Profile: {profile}

Return JSON with this structure:
{{
  "page1": {{
    "header": {{"name": "", "email": "", "phone": "", "location": "", "linkedin": ""}},
    "profile_summary": "3-4 sentence tailored summary",
    "skills": {{"technical": [], "tools": [], "professional": []}},
    "experience": [{{"title": "", "company": "", "location": "", "start_date": "", "end_date": "", "highlights": []}}]
  }},
  "page2": {{
    "projects": [{{"name": "", "description": "", "technologies": [], "outcome": ""}}],
    "education": [{{"degree": "", "institution": "", "graduation_date": ""}}],
    "extracurriculars": [{{"organization": "", "role": "", "dates": "", "description": ""}}],
    "certifications": [{{"name": "", "issuer": "", "date": ""}}]
  }},
  "metadata": {{"keywords_used": [], "tailoring_notes": ""}}
}}"""


def render_resume_html(
    content: Dict[str, Any],
    template_id: str = "modern",
) -> str:
    """Render resume content to HTML using a template."""
    template_path = TEMPLATES_DIR / f"{template_id}.html"

    if not template_path.exists():
        logger.warning(f"Template {template_id} not found, using built-in renderer")
        return _render_builtin_html(content, template_id)

    template = template_path.read_text(encoding="utf-8")
    return _render_template(template, content)


def _render_template(template: str, content: Dict[str, Any]) -> str:
    """Render a Handlebars-like template with content."""
    html = template
    
    # Simple variable replacements
    replacements = {
        "{{name}}": str(content.get("name", "")),
        "{{headline}}": str(content.get("headline", "")),
        "{{email}}": str(content.get("email", "")),
        "{{phone}}": str(content.get("phone", "")),
        "{{location}}": str(content.get("location", "")),
        "{{linkedin}}": str(content.get("linkedin", "")),
        "{{profile_summary}}": str(content.get("profile_summary", "")),
    }
    
    for key, value in replacements.items():
        html = html.replace(key, value if value else "")
    
    # Handle conditional blocks {{#if field}}...{{/if}}
    def replace_conditional(match):
        field = match.group(1)
        block = match.group(2)
        
        value = content
        for part in field.split('.'):
            if isinstance(value, dict):
                value = value.get(part)
            else:
                value = None
                break
        
        if value:
            return block
        return ""
    
    html = re.sub(r'\{\{#if\s+(\S+)\}\}([\s\S]*?)\{\{/if\}\}', replace_conditional, html)
    
    # Handle skills loops
    skills = content.get("skills", {})
    if isinstance(skills, dict):
        for skill_type in ["technical", "tools", "professional"]:
            pattern = r'\{\{#each skills\.' + skill_type + r'\}\}([\s\S]*?)\{\{/each\}\}'
            match = re.search(pattern, html)
            if match:
                skill_template = match.group(1)
                skill_html = ""
                for skill in skills.get(skill_type, []):
                    skill_html += skill_template.replace("{{this}}", str(skill))
                html = html.replace(match.group(0), skill_html)
    
    # Handle experience loop
    if "{{#each experience}}" in html:
        exp_match = re.search(r'\{\{#each experience\}\}([\s\S]*?)\{\{/each\}\}', html)
        if exp_match:
            exp_template = exp_match.group(1)
            exp_html = ""
            for exp in content.get("experience", []):
                item_html = exp_template
                item_html = item_html.replace("{{title}}", str(exp.get("title", "")))
                item_html = item_html.replace("{{company}}", str(exp.get("company", "")))
                item_html = item_html.replace("{{location}}", str(exp.get("location", "")))
                item_html = item_html.replace("{{start_date}}", str(exp.get("start_date", "")))
                item_html = item_html.replace("{{end_date}}", str(exp.get("end_date", "Present")))
                
                # Handle highlights
                hl_match = re.search(r'\{\{#each highlights\}\}([\s\S]*?)\{\{/each\}\}', item_html)
                if hl_match:
                    hl_template = hl_match.group(1)
                    hl_html = ""
                    for highlight in exp.get("highlights", []):
                        hl_html += hl_template.replace("{{this}}", str(highlight))
                    item_html = item_html.replace(hl_match.group(0), hl_html)
                
                exp_html += item_html
            html = html.replace(exp_match.group(0), exp_html)
    
    # Handle projects loop
    if "{{#each projects}}" in html:
        proj_match = re.search(r'\{\{#each projects\}\}([\s\S]*?)\{\{/each\}\}', html)
        if proj_match:
            proj_template = proj_match.group(1)
            proj_html = ""
            for proj in content.get("projects", []):
                item_html = proj_template
                item_html = item_html.replace("{{name}}", str(proj.get("name", "")))
                item_html = item_html.replace("{{description}}", str(proj.get("description", "")))
                item_html = item_html.replace("{{outcome}}", str(proj.get("outcome", "")))
                item_html = item_html.replace("{{link}}", str(proj.get("link", "")))
                
                # Handle technologies
                tech_match = re.search(r'\{\{#each technologies\}\}([\s\S]*?)\{\{/each\}\}', item_html)
                if tech_match:
                    tech_template = tech_match.group(1)
                    tech_html = ""
                    techs = proj.get("technologies", [])
                    for i, tech in enumerate(techs):
                        t_html = tech_template.replace("{{this}}", str(tech))
                        unless_match = re.search(r'\{\{#unless @last\}\}([\s\S]*?)\{\{/unless\}\}', t_html)
                        if unless_match:
                            if i < len(techs) - 1:
                                t_html = t_html.replace(unless_match.group(0), unless_match.group(1))
                            else:
                                t_html = t_html.replace(unless_match.group(0), "")
                        tech_html += t_html
                    item_html = item_html.replace(tech_match.group(0), tech_html)
                
                proj_html += item_html
            html = html.replace(proj_match.group(0), proj_html)
    
    # Handle education loop
    if "{{#each education}}" in html:
        edu_match = re.search(r'\{\{#each education\}\}([\s\S]*?)\{\{/each\}\}', html)
        if edu_match:
            edu_template = edu_match.group(1)
            edu_html = ""
            for edu in content.get("education", []):
                item_html = edu_template
                item_html = item_html.replace("{{degree}}", str(edu.get("degree", "")))
                item_html = item_html.replace("{{institution}}", str(edu.get("institution", "")))
                item_html = item_html.replace("{{location}}", str(edu.get("location", "")))
                item_html = item_html.replace("{{graduation_date}}", str(edu.get("graduation_date", "")))
                item_html = item_html.replace("{{gpa}}", str(edu.get("gpa", "")))
                
                # Handle nested arrays
                for arr_name in ["relevant_coursework", "honors", "activities"]:
                    arr_match = re.search(r'\{\{#each ' + arr_name + r'\}\}([\s\S]*?)\{\{/each\}\}', item_html)
                    if arr_match:
                        arr_template = arr_match.group(1)
                        arr_html = ""
                        arr_items = edu.get(arr_name, [])
                        for i, arr_item in enumerate(arr_items):
                            a_html = arr_template.replace("{{this}}", str(arr_item))
                            unless_match = re.search(r'\{\{#unless @last\}\}([\s\S]*?)\{\{/unless\}\}', a_html)
                            if unless_match:
                                if i < len(arr_items) - 1:
                                    a_html = a_html.replace(unless_match.group(0), unless_match.group(1))
                                else:
                                    a_html = a_html.replace(unless_match.group(0), "")
                            arr_html += a_html
                        item_html = item_html.replace(arr_match.group(0), arr_html)
                
                edu_html += item_html
            html = html.replace(edu_match.group(0), edu_html)
    
    # Handle extracurriculars loop
    if "{{#each extracurriculars}}" in html:
        extra_match = re.search(r'\{\{#each extracurriculars\}\}([\s\S]*?)\{\{/each\}\}', html)
        if extra_match:
            extra_template = extra_match.group(1)
            extra_html = ""
            for extra in content.get("extracurriculars", []):
                item_html = extra_template
                item_html = item_html.replace("{{organization}}", str(extra.get("organization", "")))
                item_html = item_html.replace("{{role}}", str(extra.get("role", "")))
                item_html = item_html.replace("{{dates}}", str(extra.get("dates", "")))
                item_html = item_html.replace("{{description}}", str(extra.get("description", "")))
                extra_html += item_html
            html = html.replace(extra_match.group(0), extra_html)
    
    # Handle certifications loop
    if "{{#each certifications}}" in html:
        cert_match = re.search(r'\{\{#each certifications\}\}([\s\S]*?)\{\{/each\}\}', html)
        if cert_match:
            cert_template = cert_match.group(1)
            cert_html = ""
            for cert in content.get("certifications", []):
                item_html = cert_template
                item_html = item_html.replace("{{name}}", str(cert.get("name", "")))
                item_html = item_html.replace("{{issuer}}", str(cert.get("issuer", "")))
                item_html = item_html.replace("{{date}}", str(cert.get("date", "")))
                item_html = item_html.replace("{{credential_id}}", str(cert.get("credential_id", "")))
                cert_html += item_html
            html = html.replace(cert_match.group(0), cert_html)
    
    # Clean up remaining Handlebars syntax
    html = re.sub(r'\{\{#unless @last\}\}.*?\{\{/unless\}\}', '', html)
    html = re.sub(r'\{\{[^}]+\}\}', '', html)
    
    return html


def _render_builtin_html(content: Dict[str, Any], style: str = "modern") -> str:
    """Generate 2-page resume HTML with built-in styling."""
    name = content.get("name", "Candidate")
    
    colors = {
        "modern": {"primary": "#4361ee", "dark": "#1a1a2e", "light": "#f0f4ff"},
        "classic": {"primary": "#333333", "dark": "#222222", "light": "#f5f5f5"},
        "executive": {"primary": "#1e3a5f", "dark": "#2d5a87", "light": "#f8f9fa"},
    }
    
    c = colors.get(style, colors["modern"])
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            line-height: 1.45;
            color: {c['dark']};
        }}
        
        .page {{
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            padding: 0.5in;
            background: white;
        }}
        
        .page-break {{
            page-break-before: always;
        }}
        
        .header {{
            border-bottom: 3px solid {c['primary']};
            padding-bottom: 14px;
            margin-bottom: 18px;
        }}
        
        .header h1 {{
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 4px;
        }}
        
        .contact {{
            font-size: 9pt;
            color: #666;
        }}
        
        .section {{
            margin-bottom: 16px;
        }}
        
        .section-title {{
            font-size: 10pt;
            font-weight: 600;
            color: {c['primary']};
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            margin-bottom: 10px;
        }}
        
        .profile-summary {{
            background: {c['light']};
            padding: 12px;
            border-left: 3px solid {c['primary']};
            font-size: 10pt;
            color: #333;
        }}
        
        .skills {{ display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }}
        .skill-tag {{
            background: {c['light']};
            color: {c['primary']};
            padding: 3px 9px;
            border-radius: 10px;
            font-size: 8.5pt;
        }}
        
        .exp-item {{ margin-bottom: 14px; }}
        .job-title {{ font-weight: 600; font-size: 10.5pt; }}
        .company {{ color: {c['primary']}; }}
        .dates {{ font-size: 9pt; color: #777; }}
        
        .highlights {{ list-style: none; padding-left: 14px; }}
        .highlights li {{
            position: relative;
            padding-left: 12px;
            margin-bottom: 3px;
            font-size: 9.5pt;
        }}
        .highlights li::before {{
            content: "▸";
            position: absolute;
            left: 0;
            color: {c['primary']};
        }}
        
        .page2-header {{
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 16px;
        }}
        
        .page2-header h2 {{
            font-size: 14pt;
        }}
        
        .project-item {{
            margin-bottom: 12px;
            padding-left: 10px;
            border-left: 2px solid {c['primary']};
        }}
        
        .edu-item {{ margin-bottom: 10px; }}
        .degree {{ font-weight: 600; }}
        
        @media print {{
            .page {{ margin: 0; padding: 0.4in; }}
            .page-break {{ page-break-before: always; }}
        }}
    </style>
</head>
<body>
    <!-- PAGE 1 -->
    <div class="page">
        <header class="header">
            <h1>{name}</h1>
            <div class="contact">
                {content.get('email', '')}
                {' · ' + content.get('phone', '') if content.get('phone') else ''}
                {' · ' + content.get('location', '') if content.get('location') else ''}
            </div>
        </header>

        <section class="section">
            <h2 class="section-title">Profile</h2>
            <p class="profile-summary">{content.get('profile_summary', '')}</p>
        </section>

        <section class="section">
            <h2 class="section-title">Core Skills</h2>
            <div class="skills">
"""
    
    skills = content.get("skills", {})
    if isinstance(skills, dict):
        for skill in skills.get("technical", []):
            html += f'                <span class="skill-tag">{skill}</span>\n'
        for skill in skills.get("tools", []):
            html += f'                <span class="skill-tag">{skill}</span>\n'
    
    html += """            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Professional Experience</h2>
"""
    
    for exp in content.get("experience", []):
        html += f"""
            <div class="exp-item">
                <div>
                    <span class="job-title">{exp.get('title', '')}</span>
                    <span class="company"> · {exp.get('company', '')}</span>
                </div>
                <div class="dates">{exp.get('start_date', '')} – {exp.get('end_date', 'Present')} | {exp.get('location', '')}</div>
                <ul class="highlights">
"""
        for hl in exp.get("highlights", []):
            html += f"                    <li>{hl}</li>\n"
        html += """                </ul>
            </div>
"""
    
    html += f"""        </section>
    </div>

    <!-- PAGE 2 -->
    <div class="page page-break">
        <div class="page2-header">
            <h2>{name}</h2>
            <span style="font-size: 9pt; color: #888;">Page 2</span>
        </div>
"""
    
    # Projects
    if content.get("projects"):
        html += """
        <section class="section">
            <h2 class="section-title">Projects</h2>
"""
        for proj in content.get("projects", []):
            html += f"""
            <div class="project-item">
                <div class="job-title">{proj.get('name', '')}</div>
                <p style="font-size: 9.5pt; color: #444;">{proj.get('description', '')}</p>
            </div>
"""
        html += "        </section>\n"
    
    # Education
    if content.get("education"):
        html += """
        <section class="section">
            <h2 class="section-title">Education</h2>
"""
        for edu in content.get("education", []):
            html += f"""
            <div class="edu-item">
                <div class="degree">{edu.get('degree', '')}</div>
                <div style="font-size: 9.5pt; color: #555;">{edu.get('institution', '')} · {edu.get('graduation_date', '')}</div>
            </div>
"""
        html += "        </section>\n"
    
    html += """    </div>
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
