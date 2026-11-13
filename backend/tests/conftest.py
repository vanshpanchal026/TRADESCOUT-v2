from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from redis.asyncio import ConnectionError as RedisConnectionError
from redis.asyncio import Redis

from app.main import app


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client bound to FastAPI application via ASGITransport."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def mock_redis_healthy() -> AsyncMock:
    """Mock Redis client that successfully pongs."""
    mock = AsyncMock(spec=Redis)
    mock.ping = AsyncMock(return_value=True)
    return mock


@pytest.fixture
def mock_redis_unhealthy() -> AsyncMock:
    """Mock Redis client simulating connection failure."""
    mock = AsyncMock(spec=Redis)
    mock.ping = AsyncMock(side_effect=RedisConnectionError("Error connecting to Redis: Connection refused"))
    return mock
