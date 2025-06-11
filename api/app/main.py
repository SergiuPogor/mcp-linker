import logging

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse

from .api import health_router, router
from .core.cache import lifespan as cache_lifespan
from .core.config import settings
from .core.exceptions import generic_exception_handler, validation_exception_handler
from .core.middleware import setup_middlewares
from .core.prisma_config import close_prisma, init_prisma

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def optimized_lifespan(app: FastAPI):
    async with cache_lifespan(app):
        logger.info("Starting up application...")
        await init_prisma()
        yield
        logger.info("Shutting down application...")
        await close_prisma()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description="MCP-Linker API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=optimized_lifespan,  # Use our optimized lifespan
)

# Configure middleware
setup_middlewares(app)

# Set up exception handlers
app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.get("/", response_class=HTMLResponse)
async def home():
    return "<html><body><h1>MCP-Linker API is running</h1></body></html>"


# Include API routers
app.include_router(health_router)  # Health check at root level
app.include_router(router)

# Remove the old tortoise initialization since we handle it in lifespan
