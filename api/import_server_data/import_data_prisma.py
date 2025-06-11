import asyncio
import json
import sys

from app.core.config import settings
from app.core.prisma_config import get_prisma


async def check_tables_exist():
    """Check if required tables exist in the database"""
    try:
        prisma = await get_prisma()
        # Simple check - try to count servers
        await prisma.server.count()
        return True
    except Exception as e:
        print(f"Error checking tables: {e}")
        return False


async def import_servers(prisma):
    """Import servers using Prisma batch operations"""
    with open("/Users/gpt/projects/docs/mcp-server-prepare/out/servers.json") as f:
        data = json.load(f)

    # Load all categories
    categories = await prisma.category.find_many()
    cat_map = {cat.name.lower(): cat for cat in categories}

    # Load existing servers
    existing_servers = await prisma.server.find_many()
    source_map = {server.source: server for server in existing_servers}

    # Prepare batch operations
    servers_to_create = []
    servers_to_update = []

    for s in data:
        _cat = s["category"]

        # Find matching category
        category = None
        for name, cat in cat_map.items():
            if _cat.lower() in name:
                category = cat
                break

        if not category:
            print(f"Category {_cat} not found, skipping")
            continue

        server_data = {
            "name": s.get("name"),
            "description": s.get("description"),
            "developer": s.get("developer", "unknown"),
            "is_official": s.get("is_official", False),
            "source": s["url"],
            "category_id": category.id,
            "user_id": None,
        }

        if s["url"] in source_map:
            # Update existing server
            server = source_map[s["url"]]
            servers_to_update.append({"where": {"id": server.id}, "data": server_data})
        else:
            # Create new server
            servers_to_create.append(server_data)

    # Batch operations
    if servers_to_create:
        await prisma.server.create_many(data=servers_to_create)

    # Update operations need to be done one by one since Prisma doesn't support batch updates
    for update_op in servers_to_update:
        await prisma.server.update(**update_op)

    print(
        f"✅ Servers imported (new: {len(servers_to_create)}, updated: {len(servers_to_update)})"
    )


async def import_server_configs(prisma):
    """Import server configurations using Prisma batch operations"""
    with open("/Users/gpt/projects/docs/mcp-server-prepare/out/servers.json") as f:
        mcp_servers = json.load(f)

    # Load all servers and configs
    servers = await prisma.server.find_many()
    server_map = {server.source: server for server in servers}

    existing_configs = await prisma.serverconfig.find_many()
    config_map = {config.server_id: config for config in existing_configs}

    configs_to_create = []
    configs_to_update = []

    for s in mcp_servers:
        url = s["url"]
        configs = s["modes"]

        try:
            if url not in server_map:
                print(f"Server with URL {url} not found, skipping config")
                continue

            server = server_map[url]

            if server.id in config_map:
                # Update existing config
                configs_to_update.append(
                    {
                        "where": {"id": config_map[server.id].id},
                        "data": {"config_items": configs},
                    }
                )
            else:
                # Create new config
                configs_to_create.append(
                    {"server_id": server.id, "config_items": configs}
                )

        except Exception as e:
            print(f"Error processing config for {url}: {e}")
            continue

    # Batch create new configs
    if configs_to_create:
        await prisma.serverconfig.create_many(data=configs_to_create)

    # Update configs one by one (Prisma doesn't support batch updates)
    for update_op in configs_to_update:
        await prisma.serverconfig.update(**update_op)

    print(
        f"✅ Configs imported (new: {len(configs_to_create)}, updated: {len(configs_to_update)})"
    )


import time


async def async_import():
    print(f"Database URL: {settings.DATABASE_URL}")
    print("Starting optimized batch import with Prisma...")

    start_time = time.time()

    # Get Prisma client
    prisma = await get_prisma()

    cats_time = time.time()
    await import_servers(prisma)
    print(f"Servers completed in {time.time() - cats_time:.2f}s")

    servers_time = time.time()
    await import_server_configs(prisma)
    print(f"Configs completed in {time.time() - servers_time:.2f}s")

    # Disconnect Prisma client
    await prisma.disconnect()

    total_time = time.time() - start_time
    print(f"✅✅✅ Optimized batch import completed in {total_time:.2f}s!")


if __name__ == "__main__":

    async def main():
        # First check if tables exist
        tables_ok = await check_tables_exist()
        if not tables_ok:
            print("Run: uvicorn app.main:app to create tables")
            sys.exit(1)

        # If tables exist, proceed with import
        await async_import()

    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error: {e}")
        print(
            "If this is related to missing tables, please run: uvicorn app.main:app to create tables"
        )
        sys.exit(1)
