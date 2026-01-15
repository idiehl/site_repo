"""Resume parsing service using LLM."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from atlasops.services.llm_client import LLMClient

logger = logging.getLogger(__name__)

# Load prompt template
PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "resume_parser_v1.md"


class ResumeParser:
    """Parse resumes using LLM to extract structured data."""

    def __init__(self, llm_client: Optional[LLMClient] = None):
        """Initialize parser with LLM client."""
        self.llm = llm_client or LLMClient()
        self._prompt_template = self._load_prompt()

    def _load_prompt(self) -> str:
        """Load the prompt template."""
        if PROMPT_PATH.exists():
            return PROMPT_PATH.read_text()
        raise FileNotFoundError(f"Prompt template not found: {PROMPT_PATH}")

    async def parse_resume_text(self, resume_text: str) -> dict[str, Any]:
        """
        Parse resume text and extract structured data.

        Args:
            resume_text: Raw text content of the resume

        Returns:
            Dictionary with extracted profile data
        """
        if not resume_text or not resume_text.strip():
            raise ValueError("Resume text is empty")

        # Format prompt with resume text
        prompt = self._prompt_template.format(resume_text=resume_text)

        logger.info("Parsing resume with LLM...")
        
        try:
            # Call LLM for extraction
            response = await self.llm.complete(
                prompt=prompt,
                max_tokens=4000,
                temperature=0.1,  # Low temperature for consistent extraction
            )

            # Parse JSON from response
            parsed_data = self._extract_json(response)
            
            # Validate and clean the data
            cleaned_data = self._clean_parsed_data(parsed_data)
            
            logger.info(
                f"Successfully parsed resume: {cleaned_data.get('full_name', 'Unknown')}"
            )
            
            return cleaned_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            raise ValueError(f"Invalid JSON in LLM response: {e}")
        except Exception as e:
            logger.error(f"Resume parsing failed: {e}")
            raise

    def _extract_json(self, response: str) -> dict[str, Any]:
        """Extract JSON from LLM response."""
        # Try to find JSON in the response
        response = response.strip()
        
        # Check if response starts with JSON
        if response.startswith("{"):
            # Find matching closing brace
            brace_count = 0
            end_idx = 0
            for i, char in enumerate(response):
                if char == "{":
                    brace_count += 1
                elif char == "}":
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = i + 1
                        break
            json_str = response[:end_idx]
        else:
            # Try to find JSON block in markdown code fence
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                json_str = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                json_str = response[start:end].strip()
            else:
                json_str = response

        return json.loads(json_str)

    def _clean_parsed_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Clean and validate parsed data."""
        # Ensure required structure
        cleaned = {
            "full_name": data.get("full_name"),
            "headline": data.get("headline"),
            "summary": data.get("summary"),
            "location": data.get("location"),
            "phone": data.get("phone"),
            "email": data.get("email"),
            "social_links": data.get("social_links") or {},
            "work_history": data.get("work_history") or [],
            "education": data.get("education") or [],
            "skills": data.get("skills") or {},
            "certifications": data.get("certifications") or [],
            "projects": data.get("projects") or [],
            "languages_spoken": data.get("languages_spoken") or [],
            "parsing_confidence": data.get("parsing_confidence", 0.5),
            "parsed_at": datetime.now(timezone.utc).isoformat(),
        }

        # Flatten skills into a simple list for storage if needed
        skills_data = cleaned["skills"]
        if isinstance(skills_data, dict):
            all_skills = []
            for category in ["technical", "soft", "languages", "tools", "frameworks", "other"]:
                if category in skills_data and skills_data[category]:
                    all_skills.extend(skills_data[category])
            # Dedupe while preserving order
            seen = set()
            cleaned["skills_flat"] = [
                s for s in all_skills 
                if s and s.lower() not in seen and not seen.add(s.lower())
            ]

        return cleaned

    def map_to_profile_update(self, parsed_data: dict[str, Any]) -> dict[str, Any]:
        """
        Map parsed resume data to UserProfile update format.

        Args:
            parsed_data: Data returned from parse_resume_text

        Returns:
            Dictionary ready for UserProfile update
        """
        return {
            "full_name": parsed_data.get("full_name"),
            "headline": parsed_data.get("headline"),
            "summary": parsed_data.get("summary"),
            "location": parsed_data.get("location"),
            "phone": parsed_data.get("phone"),
            "social_links": parsed_data.get("social_links"),
            "work_history": parsed_data.get("work_history"),
            "education": parsed_data.get("education"),
            "skills": parsed_data.get("skills_flat") or [],
            "certifications": parsed_data.get("certifications"),
            "projects": parsed_data.get("projects"),
            "contact_info": {
                "email": parsed_data.get("email"),
                "phone": parsed_data.get("phone"),
                "location": parsed_data.get("location"),
            },
        }
