import asyncio
from sqlalchemy import select, func
from atlasops.db import async_session_maker
from atlasops.models.electracast import ElectraCastPodcast, ElectraCastNetwork

async def main():
    async with async_session_maker() as session:
        podcasts = (await session.execute(select(func.count(ElectraCastPodcast.id)))).scalar()
        networks = (await session.execute(select(func.count(ElectraCastNetwork.id)))).scalar()
        print(f"Podcasts: {podcasts}")
        print(f"Networks: {networks}")

if __name__ == "__main__":
    asyncio.run(main())
