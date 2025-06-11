import asyncio
import json

from app.core.prisma_config import get_prisma


def to_json(path, output):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)


def server_to_dict(server) -> dict:
    return {
        "id": server.id,
        "name": server.name,
        "description": server.description,
        "source": server.source,
        "developer": server.developer,
        "is_official": server.is_official,
        "category_id": server.category_id,
        "github_stars": server.github_stars,
        "downloads": server.downloads,
    }


async def async_download():
    prisma = get_prisma()
    await prisma.connect()

    server_list = await prisma.server.find_many(
        order={"github_stars": "desc"}, take=100
    )

    category_list = await prisma.category.find_many()

    to_json("/tmp/servers.json", [server_to_dict(s) for s in server_list])

    await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(async_download())
