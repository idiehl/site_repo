# Resume Parser v1

You are an expert resume parser. Extract structured information from the resume text provided.

## Input
Resume text (may be raw text extracted from PDF):
```
{resume_text}
```

## Instructions
1. Extract all available information from the resume
2. If a field is not present or unclear, use null
3. For dates, use ISO format (YYYY-MM) when possible, or the original text if unclear
4. For skills, categorize them into technical and soft skills where possible
5. Be thorough - don't miss any work experience, education, or skills mentioned

## Output Format
Return a valid JSON object with this exact structure:

```json
{{
  "full_name": "string or null",
  "headline": "string or null - professional title/headline",
  "summary": "string or null - professional summary if present",
  "location": "string or null - city, state, country",
  "phone": "string or null",
  "email": "string or null",
  "social_links": {{
    "linkedin": "string or null",
    "github": "string or null",
    "twitter": "string or null",
    "portfolio": "string or null",
    "other": ["array of other URLs"]
  }},
  "work_history": [
    {{
      "company": "string",
      "title": "string",
      "location": "string or null",
      "start_date": "string or null (YYYY-MM or original text)",
      "end_date": "string or null (YYYY-MM, 'Present', or original text)",
      "is_current": true/false,
      "description": "string or null",
      "achievements": ["array of bullet points/achievements"]
    }}
  ],
  "education": [
    {{
      "institution": "string",
      "degree": "string",
      "field": "string or null - field of study",
      "location": "string or null",
      "start_date": "string or null",
      "end_date": "string or null",
      "gpa": "string or null",
      "honors": ["array of honors/awards if any"]
    }}
  ],
  "skills": {{
    "technical": ["array of technical/hard skills"],
    "soft": ["array of soft skills"],
    "languages": ["array of programming languages"],
    "tools": ["array of tools/software"],
    "frameworks": ["array of frameworks/libraries"],
    "other": ["array of other skills"]
  }},
  "certifications": [
    {{
      "name": "string",
      "issuer": "string or null",
      "date": "string or null",
      "credential_id": "string or null",
      "url": "string or null"
    }}
  ],
  "projects": [
    {{
      "name": "string",
      "description": "string or null",
      "technologies": ["array of technologies used"],
      "url": "string or null",
      "start_date": "string or null",
      "end_date": "string or null"
    }}
  ],
  "languages_spoken": [
    {{
      "language": "string",
      "proficiency": "string or null (native, fluent, conversational, basic)"
    }}
  ],
  "parsing_confidence": 0.0 to 1.0
}}
```

## Important Rules
- Extract ONLY what is explicitly stated in the resume
- Do NOT invent or assume information
- If the resume format is unusual, do your best to extract relevant sections
- For skills, try to dedupe and normalize (e.g., "JS" and "JavaScript" → "JavaScript")
- Order work history and education by date (most recent first)
