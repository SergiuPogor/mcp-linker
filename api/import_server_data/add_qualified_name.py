import argparse
import asyncio
import logging
from typing import Optional
from urllib.parse import urlparse

from prisma import Prisma

# Constants
ACTIVE_SERVER_NAMES = {
    "everything",
    "fetch",
    "filesystem",
    "git",
    "memory",
    "sequentialthinking",
    "time",
}

GITHUB_BASE_URL = "https://github.com"
MCP_ORG_PREFIX = "https://github.com/modelcontextprotocol/"
SERVERS_PATH = "servers"
ARCHIVED_SERVERS_PATH = "servers-archived"

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def extract_qualified_name(url: str) -> Optional[str]:
    """Extract qualified name from GitHub URL."""
    if not url.startswith(GITHUB_BASE_URL):
        return None

    try:
        parsed = urlparse(url)
        path_parts = [part for part in parsed.path.split("/") if part]

        if len(path_parts) < 2:
            return None

        owner = path_parts[0]
        repo = path_parts[1]

        # For MCP organization, use org/repo format
        if url.startswith(MCP_ORG_PREFIX):
            return f"{owner}/{repo}"

        # For other orgs, use owner/repo format
        return f"{owner}/{repo}"

    except Exception as e:
        logger.warning(f"Failed to parse URL {url}: {e}")
        return None


def get_archived_url(original_url: str) -> str:
    """Convert servers URL to archived servers URL."""
    return original_url.replace(SERVERS_PATH, ARCHIVED_SERVERS_PATH)


def extract_server_name_from_url(url: str) -> Optional[str]:
    """Extract server name from GitHub URL."""
    try:
        parsed = urlparse(url)
        path_parts = [part for part in parsed.path.split("/") if part]
        return path_parts[-1] if path_parts else None
    except Exception as e:
        logger.warning(f"Failed to extract server name from URL {url}: {e}")
        return None


async def update_qualified_names(db: Prisma) -> int:
    """Update qualified names for servers that don't have them."""
    try:
        servers_without_qualified_name = await db.server.find_many(
            where={"qualified_name": None}
        )

        updates_count = 0
        for server in servers_without_qualified_name:
            qualified_name = extract_qualified_name(server.source)
            if qualified_name:
                await db.server.update(
                    where={"id": server.id}, data={"qualified_name": qualified_name}
                )
                updates_count += 1
                logger.info(
                    f"Updated qualified name for server {server.id}: {qualified_name}"
                )

        return updates_count

    except Exception as e:
        logger.error(f"Failed to update qualified names: {e}")
        raise


async def update_archived_servers(db: Prisma) -> int:
    """Update URLs for archived servers."""
    try:
        mcp_servers = await db.server.find_many(
            where={"source": {"startswith": MCP_ORG_PREFIX}}
        )

        updates_count = 0
        for server in mcp_servers:
            server_name = extract_server_name_from_url(server.source)

            if server_name and server_name not in ACTIVE_SERVER_NAMES:
                archived_url = get_archived_url(server.source)
                await db.server.update(
                    where={"id": server.id}, data={"source": archived_url}
                )
                updates_count += 1
                logger.info(
                    f"Updated archived URL for server {server.id}: {archived_url}"
                )

        return updates_count

    except Exception as e:
        logger.error(f"Failed to update archived servers: {e}")
        raise


async def with_db(task_func):
    db = Prisma()
    try:
        logger.info("Connecting to database...")
        await db.connect()
        return await task_func(db)
    finally:
        logger.info("Disconnecting from database...")
        await db.disconnect()


async def run(action: str):
    async def task(db: Prisma):
        if action == "qualified-names":
            logger.info("Updating qualified names...")
            updated = await update_qualified_names(db)
            logger.info(f"Updated {updated} qualified names")
        elif action == "archived-servers":
            logger.info("Updating archived server URLs...")
            updated = await update_archived_servers(db)
            logger.info(f"Updated {updated} archived server URLs")
        elif action == "all":
            logger.info("Updating qualified names...")
            qualified = await update_qualified_names(db)
            logger.info(f"Updated {qualified} qualified names")
            logger.info("Updating archived server URLs...")
            archived = await update_archived_servers(db)
            logger.info(f"Updated {archived} archived server URLs")

    await with_db(task)


def main():
    parser = argparse.ArgumentParser(description="Update server data in database")
    parser.add_argument(
        "action",
        choices=["qualified-names", "archived-servers", "all"],
        help="Action to perform: qualified-names, archived-servers, or all",
    )
    args = parser.parse_args()
    asyncio.run(run(args.action))


if __name__ == "__main__":
    main()
