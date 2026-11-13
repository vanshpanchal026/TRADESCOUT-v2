"""TRADESCOUT — Distributed Mutex & Single-Flight Concurrency Controls.

Prevents Cache Stampedes (Thundering Herd) across multi-worker Uvicorn and container replicas.
Ensures only one worker performs heavy Polars indicator calculations over 2,500 symbols
while other concurrent requests wait or serve stale cached snapshots.
"""

import asyncio
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from redis.asyncio import Redis

logger = structlog.get_logger(__name__)

# Process-level in-flight locks to serialize within a single worker
_process_locks: dict[str, asyncio.Lock] = {}
_process_meta_lock = asyncio.Lock()

# Atomic Redis release script: ensures worker only unlocks if the token still matches
_LUA_RELEASE_LOCK = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""


async def get_process_lock(key: str) -> asyncio.Lock:
    """Retrieve or create an in-process asyncio.Lock for a specific key."""
    async with _process_meta_lock:
        if key not in _process_locks:
            _process_locks[key] = asyncio.Lock()
        return _process_locks[key]


@asynccontextmanager
async def distributed_cache_lock(
    redis: Redis | None,
    key: str,
    timeout_secs: int = 30,
) -> AsyncGenerator[bool, None]:
    """Distributed lock using Redis SETNX with non-blocking single-flight guard.

    Yields True if this caller successfully acquired the lock and MUST perform the computation.
    Yields False immediately if another task or worker is already calculating.
    """
    proc_lock = await get_process_lock(key)
    lock_key = f"lock:{key}"
    token = str(uuid.uuid4())
    acquired = False

    # Single-flight guard: if this worker is already computing this key, yield False immediately
    if proc_lock.locked():
        yield False
        return

    await proc_lock.acquire()
    try:
        if redis is not None:
            try:
                res = await redis.set(lock_key, token, ex=timeout_secs, nx=True)
                acquired = bool(res)
            except Exception as exc:
                logger.warning("locks.redis_lock_failed_fallback_process", key=key, error=str(exc))
                acquired = True
        else:
            acquired = True

        yield acquired
    finally:
        if acquired and redis is not None:
            try:
                await redis.eval(_LUA_RELEASE_LOCK, 1, lock_key, token)
            except Exception as exc:
                logger.warning("locks.release_eval_error", key=key, error=str(exc))
        proc_lock.release()


async def wait_for_cached_payload(
    redis: Redis,
    cache_key: str,
    max_wait_secs: float = 6.0,
    interval_secs: float = 0.2,
) -> str | None:
    """Poll Redis for a precomputed cache key while another worker is calculating it."""
    elapsed = 0.0
    while elapsed < max_wait_secs:
        await asyncio.sleep(interval_secs)
        elapsed += interval_secs
        try:
            val = await redis.get(cache_key)
            if val:
                return val
        except Exception:
            break
    return None
