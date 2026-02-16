"""Megaphone API client helpers."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Optional

import httpx


class MegaphoneError(Exception):
    """Raised when Megaphone API requests fail."""

    def __init__(
        self,
        message: str,
        *,
        status_code: Optional[int] = None,
        response_body: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.response_body = response_body


@dataclass(slots=True)
class MegaphoneResult:
    """Standardized Megaphone API result."""

    podcast_id: str
    raw: dict[str, Any]


@dataclass(slots=True)
class MegaphoneInviteResult:
    """Standardized Megaphone invite result."""

    invite_id: Optional[str]
    raw: dict[str, Any]


class MegaphoneClient:
    """Lightweight Megaphone API client."""

    def __init__(
        self,
        *,
        api_base: str,
        api_token: str,
        network_id: str,
        auth_scheme: str = "Token",
        timeout: float = 20.0,
    ) -> None:
        self.api_base = api_base.rstrip("/")
        self.api_token = api_token
        self.network_id = network_id
        self.auth_scheme = auth_scheme
        self.timeout = timeout

    def _auth_header(self) -> str:
        scheme = self.auth_scheme.strip()
        if scheme.lower() == "token":
            return f'Token token="{self.api_token}"'
        return f"{scheme} {self.api_token}"

    def _headers(self, *, json_api: bool = False) -> dict[str, str]:
        content_type = "application/vnd.api+json" if json_api else "application/json"
        return {
            "Authorization": self._auth_header(),
            "Content-Type": content_type,
            "Accept": content_type,
        }

    async def _get_with_retry(self, client: httpx.AsyncClient, url: str) -> httpx.Response:
        response = await client.get(url, headers=self._headers())
        if response.status_code in {400, 415, 422}:
            response = await client.get(url, headers=self._headers(json_api=True))
        if response.status_code in {429, 503}:
            await asyncio.sleep(1)
            response = await client.get(url, headers=self._headers())
        return response

    async def _post_with_retry(
        self, client: httpx.AsyncClient, url: str, payload: dict[str, Any]
    ) -> httpx.Response:
        response = await client.post(
            url,
            json=payload,
            headers=self._headers(),
        )
        if response.status_code in {400, 415, 422}:
            response = await client.post(
                url,
                json=payload,
                headers=self._headers(json_api=True),
            )
        if response.status_code in {429, 503}:
            await asyncio.sleep(1)
            response = await client.post(
                url,
                json=payload,
                headers=self._headers(),
            )
        return response

    async def create_podcast(self, payload: dict[str, Any]) -> MegaphoneResult:
        """Create a podcast in Megaphone."""
        endpoints = [
            f"{self.api_base}/networks/{self.network_id}/podcasts",
            f"{self.api_base}/networks/{self.network_id}/shows",
        ]
        last_error: Optional[MegaphoneError] = None

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for endpoint in endpoints:
                response = await self._post_with_retry(client, endpoint, payload)
                if response.status_code == 404:
                    continue

                try:
                    data = response.json()
                except ValueError:
                    data = {}

                if 200 <= response.status_code < 300:
                    podcast_id = (
                        data.get("id")
                        or data.get("podcast", {}).get("id")
                        or data.get("data", {}).get("id")
                    )
                    if not podcast_id:
                        raise MegaphoneError(
                            "Megaphone response missing podcast ID.",
                            status_code=response.status_code,
                            response_body=response.text,
                        )
                    return MegaphoneResult(podcast_id=podcast_id, raw=data)

                last_error = MegaphoneError(
                    "Megaphone API error.",
                    status_code=response.status_code,
                    response_body=response.text,
                )

        if last_error:
            raise last_error
        raise MegaphoneError("Megaphone endpoint not found.")

    async def list_episodes(self, podcast_id: str) -> list[dict[str, Any]]:
        """List episodes for a podcast/show. Endpoint varies by Megaphone version."""

        candidates = [
            f"{self.api_base}/podcasts/{podcast_id}/episodes",
            f"{self.api_base}/shows/{podcast_id}/episodes",
            f"{self.api_base}/podcasts/{podcast_id}/episodes?per_page=100",
            f"{self.api_base}/shows/{podcast_id}/episodes?per_page=100",
        ]

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            last_error: Optional[MegaphoneError] = None
            for url in candidates:
                resp = await self._get_with_retry(client, url)
                if resp.status_code == 404:
                    continue
                if resp.status_code >= 400:
                    last_error = MegaphoneError(
                        "Megaphone API error.",
                        status_code=resp.status_code,
                        response_body=resp.text,
                    )
                    continue
                try:
                    data = resp.json()
                except ValueError:
                    data = {}

                # Normalize possible response shapes.
                if isinstance(data, list):
                    return data
                if isinstance(data, dict):
                    for key in ("episodes", "data", "items"):
                        value = data.get(key)
                        if isinstance(value, list):
                            return value
                return []

            if last_error:
                raise last_error
            return []

    @staticmethod
    def _extract_invite_id(data: dict[str, Any]) -> Optional[str]:
        invite_id = (
            data.get("id")
            or data.get("invite_id")
            or data.get("invitation", {}).get("id")
            or data.get("data", {}).get("id")
            or data.get("user", {}).get("id")
        )
        return str(invite_id) if invite_id else None

    async def invite_podcast_user(
        self,
        *,
        podcast_id: str,
        email: str,
        name: str | None = None,
        role: str | None = None,
    ) -> MegaphoneInviteResult:
        """Invite or attach a user to a podcast/show.

        Megaphone API paths vary by tenant/version; try a short list of endpoint/payload variants.
        """

        email = email.strip()
        if not email:
            raise MegaphoneError("Invite email is required.")

        endpoint_candidates = [
            f"{self.api_base}/networks/{self.network_id}/podcasts/{podcast_id}/users/invite",
            f"{self.api_base}/networks/{self.network_id}/shows/{podcast_id}/users/invite",
            f"{self.api_base}/podcasts/{podcast_id}/users/invite",
            f"{self.api_base}/shows/{podcast_id}/users/invite",
            f"{self.api_base}/networks/{self.network_id}/users/invite",
            f"{self.api_base}/users/invite",
        ]

        payload_variants: list[dict[str, Any]] = []
        compact = {"email": email}
        if role:
            compact["role"] = role
        if name:
            compact["name"] = name
        payload_variants.append(compact)

        verbose = {
            "email": email,
            "name": name,
            "role": role,
            "podcastId": podcast_id,
            "showId": podcast_id,
            "networkId": self.network_id,
        }
        payload_variants.append({k: v for k, v in verbose.items() if v is not None})

        json_api = {
            "data": {
                "type": "invitation",
                "attributes": {
                    "email": email,
                    "name": name,
                    "role": role or "editor",
                },
                "relationships": {
                    "podcast": {"data": {"id": podcast_id}},
                    "network": {"data": {"id": self.network_id}},
                },
            }
        }
        payload_variants.append(json_api)

        last_error: Optional[MegaphoneError] = None
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for endpoint in endpoint_candidates:
                for payload in payload_variants:
                    response = await self._post_with_retry(client, endpoint, payload)
                    if response.status_code == 404:
                        continue

                    try:
                        data = response.json()
                    except ValueError:
                        data = {}

                    if 200 <= response.status_code < 300:
                        return MegaphoneInviteResult(
                            invite_id=self._extract_invite_id(data),
                            raw=data if isinstance(data, dict) else {"data": data},
                        )

                    last_error = MegaphoneError(
                        "Megaphone invite API error.",
                        status_code=response.status_code,
                        response_body=response.text,
                    )

        if last_error:
            raise last_error
        raise MegaphoneError("Megaphone invite endpoint not found.")
