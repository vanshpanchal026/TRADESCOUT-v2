from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import close_redis_pool, init_redis_pool
from app.middleware.request_id import RequestIDMiddleware
from app.routers.health import router as health_router
from app.routers.market import router as market_router
from app.routers.scanners import router as scanners_router
from app.routers.stocks import router as stocks_router
from app.routers.watchlists import router as watchlists_router
from app.services.database import close_db_pool, init_db_pool

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    logger.info(
        "app.startup",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
    # Initialize Redis Pool
    try:
        app.state.redis = await init_redis_pool(settings.REDIS_URL)
    except Exception as exc:
        logger.warning("app.startup_redis_warning", error=str(exc))
        app.state.redis = None

    # Initialize PostgreSQL Pool with graceful fallback
    try:
        app.state.db_pool = await init_db_pool(settings.DATABASE_URL)
    except Exception as exc:
        logger.warning("app.startup_database_warning", error=str(exc))
        app.state.db_pool = None

    yield

    logger.info("app.shutdown")
    redis_client = getattr(app.state, "redis", None)
    if redis_client is not None:
        await close_redis_pool(redis_client)

    db_pool = getattr(app.state, "db_pool", None)
    if db_pool is not None:
        await close_db_pool(db_pool)


def create_application() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # Attach CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-request-id", "X-Request-ID"],
    )

    # Attach Request ID Middleware (outermost)
    app.add_middleware(RequestIDMiddleware)

    # Include Routes
    app.include_router(health_router)
    app.include_router(market_router, prefix="/api")
    app.include_router(scanners_router, prefix="/api")
    app.include_router(stocks_router, prefix="/api")
    app.include_router(watchlists_router, prefix="/api")

    return app


app = create_application()
