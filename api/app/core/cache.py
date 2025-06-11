"""
Cache and rate limiting configuration.
"""

import logging
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_limiter import FastAPILimiter

from .config import settings

# Configure logging
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to handle startup and shutdown events.
    Sets up Redis, cache, and rate limiter.
    Note: Database initialization is handled by Tortoise ORM separately.
    """
    # Set up Redis connection with proper timeout configuration
    redis_conn = redis.from_url(
        settings.REDIS_URL,
        encoding="utf8",
        socket_timeout=5.0,  # Timeout in seconds
        socket_connect_timeout=5.0,  # Connection timeout
        retry_on_timeout=True,
        health_check_interval=30,  # Check connection regularly
    )

    # Configure the Redis backend with serialization options
    redis_backend = RedisBackend(redis_conn)

    # Initialize cache with prefix
    FastAPICache.init(redis_backend, prefix="mcp-linker-cache-v2")

    # Initialize rate limiter
    await FastAPILimiter.init(redis_conn)

    yield

    # Clean up rate limiter connection on shutdown
    await FastAPILimiter.close()
