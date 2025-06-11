#!/usr/bin/env python3
"""
Optimized GitHub star updater with faster imports and better performance.
"""

import asyncio
from typing import Dict, List, Optional


async def update_star_from_redis():
    """Update stars data from Redis to database with optimized imports."""
    # Lazy import heavy dependencies only when needed
    import redis.asyncio as redis

    from app.core.prisma_config import close_prisma, get_prisma, init_prisma

    print("🔗 Connecting to Redis...")
    redis_conn = redis.Redis(
        decode_responses=True,  # Auto-decode responses to avoid manual decoding
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True,
        health_check_interval=30,
    )

    try:
        # Get all GitHub star keys in one go
        print("📊 Fetching GitHub URLs from Redis...")
        github_urls = await redis_conn.keys("github:stars:*")
        github_urls = list(set(github_urls))  # Remove duplicates

        if not github_urls:
            print("⚠️  No GitHub URLs found in Redis")
            return

        print(f"📍 Found {len(github_urls)} unique GitHub URLs to process")

        # Batch fetch all star data from Redis using pipeline for better performance
        print("⚡ Fetching star data in batch...")
        pipe = redis_conn.pipeline()
        for url in github_urls:
            pipe.get(url)

        stars_data = await pipe.execute()

        # Create URL to stars mapping
        url_to_stars: Dict[str, Optional[int]] = {}
        for url, stars_raw in zip(github_urls, stars_data):
            if stars_raw is not None:
                try:
                    stars = int(stars_raw)
                    clean_url = url.replace("github:stars:", "", 1)
                    url_to_stars[clean_url] = stars
                except ValueError:
                    print(f"⚠️  Invalid star count for {url}: {stars_raw}")

        if not url_to_stars:
            print("⚠️  No valid star data found")
            return

        print(f"🌟 Processing {len(url_to_stars)} GitHub repos...")

        # Initialize Prisma
        await init_prisma()
        client = await get_prisma()

        # Fetch all servers that need updating
        servers = await client.server.find_many(
            where={"source": {"in": list(url_to_stars.keys())}}
        )

        if not servers:
            print("⚠️  No matching servers found in database")
            return

        # Update star counts
        update_count = 0
        for server in servers:
            stars = url_to_stars.get(server.source)
            if stars is not None and stars != server.github_stars:
                await client.server.update(
                    where={"id": server.id}, data={"github_stars": stars}
                )
                update_count += 1

        print(f"✨ Updated {update_count} server star counts")

    except Exception as e:
        print(f"💥 Error: {e}")
        raise
    finally:
        print("🧹 Cleaning up connections...")
        await redis_conn.close()
        await close_prisma()


async def async_main():
    """Main async function with optimized database initialization."""
    # Lazy import database utilities
    from app.core.config import settings

    print(f"🔗 Database: {settings.DATABASE_URL[:50]}...")
    print("🚀 Starting GitHub stars update from Redis...")

    try:
        await update_star_from_redis()
        print("🎯 GitHub stars update completed successfully!")
    except Exception as e:
        print(f"💥 Update failed: {e}")
        raise


def main():
    """Entry point with minimal imports for faster startup."""
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        print("\n🛑 Update cancelled by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
