#!/usr/bin/env python3
import asyncio
import logging
import os
import sys

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Ensure environment variables are loaded
load_dotenv()

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


async def test_categories():
    """Test the categories functionality in async context"""
    from sqlalchemy.future import select

    from app.core.database import AsyncSessionLocal
    from app.models import Category

    logger.info("Testing categories functionality in async context")

    async with AsyncSessionLocal() as db:
        # Test query
        logger.info("Querying categories...")
        result = await db.execute(select(Category).limit(10))
        categories = result.scalars().all()

        logger.info(f"Found {len(categories)} categories")
        # Print first few
        for i, r in enumerate(categories[:5]):
            logger.info(f"Category {i + 1}: {r.name}")

    logger.info("Categories test completed successfully")


if __name__ == "__main__":
    logger.info("Running categories test in async context")
    asyncio.run(test_categories())
