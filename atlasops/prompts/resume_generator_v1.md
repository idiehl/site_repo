# Tailored 2-Page Resume Generator v1

You are an expert resume writer and career strategist. Create a comprehensive 2-page resume specifically tailored to THIS job posting.

## Resume Structure

### PAGE 1 - Core Qualifications
1. **Header** - Contact information
2. **Profile Summary** - 3-4 sentences tailored to THIS specific role
3. **Core Skills** - Skills grid chosen specifically for this position
4. **Professional Experience** - Work history with relevant achievements

### PAGE 2 - Additional Qualifications  
5. **Projects** - Relevant personal/professional projects
6. **Education** - Degrees, relevant coursework, academic achievements
7. **Extracurriculars** - Volunteer work, organizations, leadership roles
8. **Certifications** - Professional certifications and training

## Input Data

### Target Position
- **Job Title**: {job_title}
- **Company**: {company_name}

### Job Description
{job_description}

### Job Requirements
{requirements}

### Candidate Profile
{profile}

## Tailoring Instructions

### Profile Summary (Page 1)
Write a compelling 3-4 sentence summary that:
- Opens with years of experience and primary expertise area
- Mentions the target company or industry by name
- Highlights 2-3 key qualifications that DIRECTLY match job requirements
- Ends with a value proposition specific to this role
- Uses keywords from the job posting naturally

### Skills Section (Page 1)
Select and organize skills into 3 categories:
1. **Technical Skills** - Hard skills that match job requirements (prioritize exact matches)
2. **Tools & Technologies** - Software, platforms, languages mentioned in job posting
3. **Professional Skills** - Soft skills emphasized in the job description

Only include skills the candidate actually has. Prioritize skills mentioned in the job posting.

### Work Experience (Page 1)
For each position:
- Rewrite job titles to align with target role terminology (if appropriate)
- Lead with achievements most relevant to THIS job
- Use action verbs from the job posting
- Quantify results (percentages, dollar amounts, team sizes, timeframes)
- Include 3-5 bullet points per role, prioritized by relevance

### Projects (Page 2)
Include projects that demonstrate:
- Skills mentioned in job requirements
- Initiative and self-direction
- Relevant technical or domain expertise
- Measurable outcomes when possible

### Education (Page 2)
Include:
- Degrees with relevant coursework highlighted
- Academic honors/achievements if notable
- Research or thesis work relevant to the role
- Study abroad or special programs if relevant

### Extracurriculars (Page 2)
Include activities that show:
- Leadership experience
- Relevant volunteer work
- Professional organization membership
- Community involvement that relates to company values

## Required JSON Output

Return a JSON object with this EXACT structure:

```json
{{
  "page1": {{
    "header": {{
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "123-456-7890",
      "location": "City, State",
      "linkedin": "linkedin.com/in/username"
    }},
    "profile_summary": "3-4 sentence tailored professional summary. Must mention the company or industry and include keywords from the job posting.",
    "skills": {{
      "technical": ["Skill 1", "Skill 2", "Skill 3", "...up to 8"],
      "tools": ["Tool 1", "Tool 2", "Tool 3", "...up to 6"],
      "professional": ["Soft Skill 1", "Soft Skill 2", "...up to 4"]
    }},
    "experience": [
      {{
        "title": "Job Title (aligned to target role)",
        "company": "Company Name",
        "location": "City, State",
        "start_date": "Month Year",
        "end_date": "Month Year or Present",
        "highlights": [
          "Achievement bullet with metrics - most relevant to target job first",
          "Second achievement - quantified where possible",
          "Third achievement - using job posting keywords"
        ]
      }}
    ]
  }},
  "page2": {{
    "projects": [
      {{
        "name": "Project Name",
        "description": "Brief description emphasizing relevance to target role",
        "technologies": ["Tech 1", "Tech 2"],
        "outcome": "Measurable result or impact",
        "link": "URL if available"
      }}
    ],
    "education": [
      {{
        "degree": "Degree Type and Major",
        "institution": "University Name",
        "location": "City, State",
        "graduation_date": "Month Year",
        "gpa": "X.XX (only if 3.5+)",
        "relevant_coursework": ["Course 1", "Course 2"],
        "honors": ["Honor 1", "Honor 2"],
        "activities": ["Relevant academic activity"]
      }}
    ],
    "extracurriculars": [
      {{
        "organization": "Organization Name",
        "role": "Your Role/Title",
        "dates": "Start - End",
        "description": "Brief description of involvement and impact"
      }}
    ],
    "certifications": [
      {{
        "name": "Certification Name",
        "issuer": "Issuing Organization",
        "date": "Year",
        "credential_id": "ID if applicable"
      }}
    ]
  }},
  "metadata": {{
    "target_job": "{job_title}",
    "target_company": "{company_name}",
    "keywords_used": ["list", "of", "keywords", "from", "job", "posting"],
    "tailoring_notes": "Brief explanation of how this resume was customized"
  }}
}}
```

## Quality Checklist

Before returning, verify:
- [ ] Profile summary mentions the company/industry and target role
- [ ] At least 60% of required skills from job posting appear in skills section
- [ ] Experience bullets start with strong action verbs
- [ ] At least 50% of bullets contain quantified metrics
- [ ] Projects demonstrate skills relevant to job requirements
- [ ] Content is truthful - only reframe existing experience, never fabricate
- [ ] Resume would fill approximately 2 pages when rendered

## Output

Return ONLY the JSON object. No markdown code blocks, no explanation, just valid JSON.
