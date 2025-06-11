import asyncio

from app.core.prisma_config import get_prisma


def normalize_github_url(url):
    """Normalize GitHub URL by removing tree/blob parts"""
    if not url.startswith("https://github.com/"):
        return url

    parts = url.strip("/").split("/")
    if "tree" in parts:
        index = parts.index("tree")
        return "/".join(parts[:index])
    elif "blob" in parts:
        index = parts.index("blob")
        return "/".join(parts[:index])
    return url


async def get_github_urls_from_db():
    """Fetch GitHub URLs using Prisma"""
    try:
        print("📊 Fetching GitHub URLs from database...")

        prisma = get_prisma()
        await prisma.connect()

        servers = await prisma.server.find_many()
        urls = [
            normalize_github_url(s.source)
            for s in servers
            if s.source and "github.com" in s.source
        ]

        print(f"Retrieved {len(urls)} GitHub URLs from database")
        print(f"Unique URLs: {len(set(urls))}")

        await prisma.disconnect()
        return set(urls)

    except Exception as e:
        print(f"Error getting URLs from database: {e}")
        import traceback

        traceback.print_exc()
        exit()


if __name__ == "__main__":
    github_urls = asyncio.run(get_github_urls_from_db())
    github_urls = "\n".join(github_urls)
    path = "/tmp/github_urls.txt"
    with open(path, "w") as f:
        f.write(github_urls.strip())
