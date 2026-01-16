"""Unified LLM client for all AI operations."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Type, TypeVar

from openai import AsyncOpenAI
from pydantic import BaseModel

from atlasops.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    """Unified LLM client with structured output support."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.prompts_dir = Path(__file__).parent.parent / "prompts"

    def load_prompt(self, prompt_name: str) -> str:
        """Load a prompt template from the prompts directory."""
        prompt_path = self.prompts_dir / f"{prompt_name}.md"
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt not found: {prompt_name}")
        return prompt_path.read_text(encoding="utf-8")

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        """Generate a text completion."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=model or settings.openai_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content or ""

    async def complete_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.3,
    ) -> T:
        """Generate a structured response validated against a Pydantic model."""
        # Build JSON schema instruction
        schema = response_model.model_json_schema()
        schema_str = json.dumps(schema, indent=2)

        full_system = (system_prompt or "") + f"""

You must respond with valid JSON that matches this schema:
{schema_str}

Do not include any text before or after the JSON. Only output the JSON object."""

        messages = [
            {"role": "system", "content": full_system},
            {"role": "user", "content": prompt},
        ]

        response = await self.client.chat.completions.create(
            model=model or settings.openai_model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"

        try:
            data = json.loads(content)
            return response_model.model_validate(data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            raise ValueError(f"Invalid JSON from LLM: {e}")
        except Exception as e:
            logger.error(f"Failed to validate LLM response: {e}")
            raise ValueError(f"Invalid response structure: {e}")

    async def extract_job_posting(
        self, raw_text: str, url: str
    ) -> Dict[str, Any]:
        """Extract structured data from job posting text."""
        try:
            prompt_template = self.load_prompt("job_extraction_v1")
        except FileNotFoundError:
            prompt_template = """Extract the following information from this job posting:
- company_name
- job_title
- location
- remote_policy (remote/hybrid/onsite/unknown)
- salary_range (if mentioned)
- job_description (summary)
- requirements (list of hard and soft skills)
- benefits (if mentioned)

If information is not available, use null.

Job posting URL: {url}

Job posting text:
{raw_text}"""

        # Use more text since site-specific extraction is cleaner
        prompt = prompt_template.format(url=url, raw_text=raw_text[:15000])

        response = await self.complete(
            prompt,
            system_prompt="You are a job posting parser. Extract structured information accurately. Never invent or hallucinate details.",
            model=settings.openai_extraction_model,
            temperature=0.1,
        )

        # Try to parse as JSON
        try:
            # Find JSON in response
            import re

            json_match = re.search(r"\{[\s\S]*\}", response)
            if json_match:
                return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

        # Return raw response if JSON parsing fails
        return {"raw_extraction": response}


# Singleton instance
llm_client = LLMClient()
