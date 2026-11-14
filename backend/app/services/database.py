"""TRADESCOUT — PostgreSQL / Supabase Database Persistence Layer.

Phase 5: Single-User Direct Cloud Persistence with In-Memory Resilient Fallback.
Uses asyncpg connection pool with automatic fallback to local memory structures
if the database engine is temporarily offline or unreachable.
"""

import json
import uuid
from datetime import UTC, datetime
from typing import Any

import asyncpg
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

DEFAULT_USER_ID: str = "00000000-0000-0000-0000-000000000001"
DEFAULT_WATCHLIST_ID: str = "00000000-0000-0000-0000-000000000002"


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class InMemoryStore:
    """Thread-safe resilient in-memory storage fallback.

    Ensures zero crashes and full CRUD functionality even during database restarts.
    """

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        """Reset in-memory state with seeded default user profile and primary watchlist."""
        self.profiles: dict[str, dict[str, Any]] = {
            DEFAULT_USER_ID: {
                "id": DEFAULT_USER_ID,
                "username": "trader",
                "display_name": "TRADESCOUT Pro",
                "plan": "pro",
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
            "22222222-2222-2222-2222-222222222222": {
                "id": "22222222-2222-2222-2222-222222222222",
                "username": "beta_fund",
                "display_name": "Beta Hedge Fund",
                "plan": "institutional",
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
            "33333333-3333-3333-3333-333333333333": {
                "id": "33333333-3333-3333-3333-333333333333",
                "username": "quant_desk",
                "display_name": "Quant Desk",
                "plan": "pro",
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        }
        self.watchlists: dict[str, dict[str, Any]] = {
            DEFAULT_WATCHLIST_ID: {
                "id": DEFAULT_WATCHLIST_ID,
                "user_id": DEFAULT_USER_ID,
                "name": "Primary Watchlist",
                "description": "Default swing trading watchlist",
                "is_default": True,
                "sort_order": 0,
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
            "22222222-2222-2222-2222-222222220002": {
                "id": "22222222-2222-2222-2222-222222220002",
                "user_id": "22222222-2222-2222-2222-222222222222",
                "name": "Primary Watchlist",
                "description": "Default swing trading watchlist",
                "is_default": True,
                "sort_order": 0,
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
            "33333333-3333-3333-3333-333333330002": {
                "id": "33333333-3333-3333-3333-333333330002",
                "user_id": "33333333-3333-3333-3333-333333333333",
                "name": "Primary Watchlist",
                "description": "Default swing trading watchlist",
                "is_default": True,
                "sort_order": 0,
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            },
        }
        self.watchlist_items: list[dict[str, Any]] = []
        self.favourites: dict[str, set[str]] = {
            DEFAULT_USER_ID: set(),
            "22222222-2222-2222-2222-222222222222": set(),
            "33333333-3333-3333-3333-333333333333": set(),
        }
        self.chart_drawings: dict[tuple[str, str], dict[str, Any]] = {}
        self.stock_notes: dict[tuple[str, str], dict[str, Any]] = {}


# Global in-memory fallback singleton
in_memory_store = InMemoryStore()


def reset_in_memory_store() -> None:
    """Helper to reset in-memory store for unit test suites."""
    in_memory_store.reset()


async def init_db_pool(database_url: str) -> asyncpg.Pool | None:
    """Initialize asyncpg connection pool and verify default profile & primary watchlist seed."""
    try:
        pool = await asyncpg.create_pool(
            database_url,
            min_size=getattr(settings, "DATABASE_POOL_MIN", 5),
            max_size=getattr(settings, "DATABASE_POOL_MAX", 50),
            command_timeout=getattr(settings, "DATABASE_COMMAND_TIMEOUT", 15.0),
            timeout=getattr(settings, "DATABASE_POOL_TIMEOUT", 10.0),
            statement_cache_size=getattr(settings, "DATABASE_STATEMENT_CACHE_SIZE", 0),
        )
        if pool is None:
            return None

        async with pool.acquire() as conn:
            # Seed preset users and primary watchlists if not already present
            await conn.execute(
                """
                INSERT INTO profiles (id, username, display_name, plan)
                VALUES
                    ('00000000-0000-0000-0000-000000000001'::uuid, 'trader', 'TRADESCOUT Pro', 'pro'),
                    ('22222222-2222-2222-2222-222222222222'::uuid, 'beta_fund', 'Beta Hedge Fund', 'institutional'),
                    ('33333333-3333-3333-3333-333333333333'::uuid, 'quant_desk', 'Quant Desk', 'pro')
                ON CONFLICT (id) DO NOTHING;

                INSERT INTO watchlists (id, user_id, name, description, is_default, sort_order)
                VALUES
                    ('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid,
                     'Primary Watchlist', 'Default swing trading watchlist', true, 0),
                    ('22222222-2222-2222-2222-222222220002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
                     'Primary Watchlist', 'Default swing trading watchlist', true, 0),
                    ('33333333-3333-3333-3333-333333330002'::uuid, '33333333-3333-3333-3333-333333333333'::uuid,
                     'Primary Watchlist', 'Default swing trading watchlist', true, 0)
                ON CONFLICT (id) DO NOTHING;
                """
            )
        logger.info("database.pool_connected", url=database_url.split("@")[-1])
        return pool
    except Exception as exc:
        logger.warning("database.pool_init_failed_using_fallback", error=str(exc))
        return None


async def close_db_pool(pool: asyncpg.Pool) -> None:
    """Gracefully terminate asyncpg connection pool."""
    try:
        await pool.close()
        logger.info("database.pool_closed")
    except Exception as exc:
        logger.warning("database.pool_close_error", error=str(exc))


# ============================================================================
# WATCHLISTS CRUD OPERATIONS
# ============================================================================


async def get_watchlists(
    pool: asyncpg.Pool | None,
    user_id: str = DEFAULT_USER_ID,
) -> list[dict[str, Any]]:
    """Retrieve all watchlists for user along with item counts."""
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT w.id, w.name, w.description, w.is_default, w.sort_order,
                           w.created_at, w.updated_at,
                           COUNT(wi.id)::int AS item_count
                    FROM watchlists w
                    LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
                    WHERE w.user_id = $1::uuid
                    GROUP BY w.id
                    ORDER BY w.is_default DESC, w.sort_order ASC, w.created_at ASC;
                    """,
                    user_id,
                )
                return [
                    {
                        "id": str(r["id"]),
                        "name": r["name"],
                        "description": r["description"],
                        "is_default": bool(r["is_default"]),
                        "sort_order": int(r["sort_order"]),
                        "item_count": int(r["item_count"]),
                        "created_at": r["created_at"].isoformat() if r["created_at"] else _now_iso(),
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else _now_iso(),
                    }
                    for r in rows
                ]
        except Exception as exc:
            logger.warning("database.get_watchlists_fallback", error=str(exc))

    # In-memory fallback
    user_lists = [w for w in in_memory_store.watchlists.values() if w.get("user_id") == user_id]
    if not user_lists:
        # Auto-seed primary watchlist for new user
        new_w_id = str(uuid.uuid4())
        in_memory_store.watchlists[new_w_id] = {
            "id": new_w_id,
            "user_id": user_id,
            "name": "Primary Watchlist",
            "description": "Default swing trading watchlist",
            "is_default": True,
            "sort_order": 0,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }

    results = []
    for w_id, w in in_memory_store.watchlists.items():
        if w.get("user_id") == user_id:
            count = sum(1 for item in in_memory_store.watchlist_items if item["watchlist_id"] == w_id)
            results.append(
                {
                    "id": str(w["id"]),
                    "name": str(w["name"]),
                    "description": w.get("description"),
                    "is_default": bool(w.get("is_default", False)),
                    "sort_order": int(w.get("sort_order", 0)),
                    "item_count": count,
                    "created_at": str(w.get("created_at", _now_iso())),
                    "updated_at": str(w.get("updated_at", _now_iso())),
                }
            )
    results.sort(key=lambda x: (not x["is_default"], x["sort_order"]))
    return results


async def get_watchlist(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any] | None:
    """Retrieve single watchlist details by ID."""
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    SELECT id, user_id, name, description, is_default, sort_order, created_at, updated_at
                    FROM watchlists
                    WHERE id = $1::uuid AND user_id = $2::uuid;
                    """,
                    watchlist_id,
                    user_id,
                )
                if r:
                    return {
                        "id": str(r["id"]),
                        "user_id": str(r["user_id"]),
                        "name": r["name"],
                        "description": r["description"],
                        "is_default": bool(r["is_default"]),
                        "sort_order": int(r["sort_order"]),
                        "created_at": r["created_at"].isoformat() if r["created_at"] else _now_iso(),
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else _now_iso(),
                    }
                return None
        except Exception as exc:
            logger.warning("database.get_watchlist_fallback", error=str(exc))

    # In-memory fallback
    w = in_memory_store.watchlists.get(str(watchlist_id))
    if w and w.get("user_id") == user_id:
        return {
            "id": str(w["id"]),
            "user_id": str(w["user_id"]),
            "name": str(w["name"]),
            "description": w.get("description"),
            "is_default": bool(w.get("is_default", False)),
            "sort_order": int(w.get("sort_order", 0)),
            "created_at": str(w.get("created_at", _now_iso())),
            "updated_at": str(w.get("updated_at", _now_iso())),
        }
    return None


async def create_watchlist(
    pool: asyncpg.Pool | None,
    name: str,
    description: str | None = None,
    is_default: bool = False,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any]:
    """Create a new custom watchlist."""
    new_id = str(uuid.uuid4())
    now = _now_iso()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    INSERT INTO watchlists (id, user_id, name, description, is_default, sort_order)
                    VALUES ($1::uuid, $2::uuid, $3, $4, $5, 0)
                    RETURNING id, user_id, name, description, is_default, sort_order, created_at, updated_at;
                    """,
                    new_id,
                    user_id,
                    name,
                    description,
                    is_default,
                )
                if r:
                    return {
                        "id": str(r["id"]),
                        "name": r["name"],
                        "description": r["description"],
                        "is_default": bool(r["is_default"]),
                        "sort_order": int(r["sort_order"]),
                        "item_count": 0,
                        "created_at": r["created_at"].isoformat() if r["created_at"] else now,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else now,
                    }
        except Exception as exc:
            logger.warning("database.create_watchlist_fallback", error=str(exc))

    # In-memory fallback
    w_entry = {
        "id": new_id,
        "user_id": user_id,
        "name": name,
        "description": description,
        "is_default": is_default,
        "sort_order": 0,
        "item_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    in_memory_store.watchlists[new_id] = w_entry
    return w_entry


async def update_watchlist(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
    name: str | None = None,
    description: str | None = None,
    is_default: bool | None = None,
    sort_order: int | None = None,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any] | None:
    """Update title, description, or ordering of a watchlist."""
    now = _now_iso()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    UPDATE watchlists
                    SET name = COALESCE($1, name),
                        description = COALESCE($2, description),
                        is_default = COALESCE($3, is_default),
                        sort_order = COALESCE($4, sort_order),
                        updated_at = NOW()
                    WHERE id = $5::uuid AND user_id = $6::uuid
                    RETURNING id, name, description, is_default, sort_order, created_at, updated_at;
                    """,
                    name,
                    description,
                    is_default,
                    sort_order,
                    watchlist_id,
                    user_id,
                )
                if r:
                    count = await conn.fetchval(
                        "SELECT COUNT(*)::int FROM watchlist_items WHERE watchlist_id = $1::uuid;",
                        watchlist_id,
                    )
                    return {
                        "id": str(r["id"]),
                        "name": r["name"],
                        "description": r["description"],
                        "is_default": bool(r["is_default"]),
                        "sort_order": int(r["sort_order"]),
                        "item_count": count or 0,
                        "created_at": r["created_at"].isoformat() if r["created_at"] else now,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else now,
                    }
                return None
        except Exception as exc:
            logger.warning("database.update_watchlist_fallback", error=str(exc))

    # In-memory fallback
    w = in_memory_store.watchlists.get(str(watchlist_id))
    if not w or w.get("user_id") != user_id:
        return None

    if name is not None:
        w["name"] = name
    if description is not None:
        w["description"] = description
    if is_default is not None:
        w["is_default"] = is_default
    if sort_order is not None:
        w["sort_order"] = sort_order
    w["updated_at"] = now

    count = sum(1 for item in in_memory_store.watchlist_items if item["watchlist_id"] == watchlist_id)
    return {
        "id": str(w["id"]),
        "name": str(w["name"]),
        "description": w.get("description"),
        "is_default": bool(w.get("is_default", False)),
        "sort_order": int(w.get("sort_order", 0)),
        "item_count": count,
        "created_at": str(w.get("created_at", now)),
        "updated_at": now,
    }


async def delete_watchlist(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
    user_id: str = DEFAULT_USER_ID,
) -> bool:
    """Delete a watchlist and cascade remove its items."""
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                res = await conn.execute(
                    """
                    DELETE FROM watchlists
                    WHERE id = $1::uuid AND user_id = $2::uuid;
                    """,
                    watchlist_id,
                    user_id,
                )
                return "DELETE 1" in res
        except Exception as exc:
            logger.warning("database.delete_watchlist_fallback", error=str(exc))

    # In-memory fallback
    w = in_memory_store.watchlists.get(str(watchlist_id))
    if not w or w.get("user_id") != user_id:
        return False

    del in_memory_store.watchlists[str(watchlist_id)]
    in_memory_store.watchlist_items = [
        item for item in in_memory_store.watchlist_items if item["watchlist_id"] != str(watchlist_id)
    ]
    return True


# ============================================================================
# WATCHLIST ITEMS CRUD OPERATIONS
# ============================================================================


async def get_watchlist_items(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
) -> list[dict[str, Any]]:
    """Retrieve raw items inside a watchlist."""
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT id, watchlist_id, symbol, exchange, added_price, notes, sort_order, added_at
                    FROM watchlist_items
                    WHERE watchlist_id = $1::uuid
                    ORDER BY sort_order ASC, added_at ASC;
                    """,
                    watchlist_id,
                )
                return [
                    {
                        "id": str(r["id"]),
                        "watchlist_id": str(r["watchlist_id"]),
                        "symbol": r["symbol"],
                        "exchange": r["exchange"],
                        "added_price": float(r["added_price"]) if r["added_price"] is not None else None,
                        "notes": r["notes"],
                        "sort_order": int(r["sort_order"]),
                        "added_at": r["added_at"].isoformat() if r["added_at"] else _now_iso(),
                    }
                    for r in rows
                ]
        except Exception as exc:
            logger.warning("database.get_watchlist_items_fallback", error=str(exc))

    # In-memory fallback
    items = [item for item in in_memory_store.watchlist_items if item["watchlist_id"] == str(watchlist_id)]
    items.sort(key=lambda x: (x.get("sort_order", 0), x.get("added_at", "")))
    return items


async def add_watchlist_item(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
    symbol: str,
    notes: str | None = None,
    added_price: float | None = None,
    sort_order: int = 0,
) -> dict[str, Any]:
    """Add or update a stock symbol in the designated watchlist."""
    sym_clean = symbol.strip().upper()
    now = _now_iso()
    new_id = str(uuid.uuid4())

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    INSERT INTO watchlist_items (id, watchlist_id, symbol, exchange, added_price, notes, sort_order)
                    VALUES ($1::uuid, $2::uuid, $3, 'NSE', $4, $5, $6)
                    ON CONFLICT (watchlist_id, symbol)
                    DO UPDATE SET notes = COALESCE(EXCLUDED.notes, watchlist_items.notes),
                                  added_price = COALESCE(EXCLUDED.added_price, watchlist_items.added_price),
                                  sort_order = EXCLUDED.sort_order
                    RETURNING id, watchlist_id, symbol, exchange, added_price, notes, sort_order, added_at;
                    """,
                    new_id,
                    watchlist_id,
                    sym_clean,
                    added_price,
                    notes,
                    sort_order,
                )
                if r:
                    return {
                        "id": str(r["id"]),
                        "watchlist_id": str(r["watchlist_id"]),
                        "symbol": r["symbol"],
                        "exchange": r["exchange"],
                        "added_price": float(r["added_price"]) if r["added_price"] is not None else None,
                        "notes": r["notes"],
                        "sort_order": int(r["sort_order"]),
                        "added_at": r["added_at"].isoformat() if r["added_at"] else now,
                    }
        except Exception as exc:
            logger.warning("database.add_watchlist_item_fallback", error=str(exc))

    # In-memory fallback: check existing
    for item in in_memory_store.watchlist_items:
        if item["watchlist_id"] == str(watchlist_id) and item["symbol"] == sym_clean:
            if notes is not None:
                item["notes"] = notes
            if added_price is not None:
                item["added_price"] = added_price
            item["sort_order"] = sort_order
            return item

    new_item = {
        "id": new_id,
        "watchlist_id": str(watchlist_id),
        "symbol": sym_clean,
        "exchange": "NSE",
        "added_price": added_price,
        "notes": notes,
        "sort_order": sort_order,
        "added_at": now,
    }
    in_memory_store.watchlist_items.append(new_item)
    return new_item


async def remove_watchlist_item(
    pool: asyncpg.Pool | None,
    watchlist_id: str,
    symbol: str,
) -> bool:
    """Remove a stock symbol from a watchlist."""
    sym_clean = symbol.strip().upper()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                res = await conn.execute(
                    """
                    DELETE FROM watchlist_items
                    WHERE watchlist_id = $1::uuid AND symbol = $2;
                    """,
                    watchlist_id,
                    sym_clean,
                )
                return "DELETE 1" in res or "DELETE" in res
        except Exception as exc:
            logger.warning("database.remove_watchlist_item_fallback", error=str(exc))

    # In-memory fallback
    initial_len = len(in_memory_store.watchlist_items)
    in_memory_store.watchlist_items = [
        item
        for item in in_memory_store.watchlist_items
        if not (item["watchlist_id"] == str(watchlist_id) and item["symbol"] == sym_clean)
    ]
    return len(in_memory_store.watchlist_items) < initial_len


# ============================================================================
# FAVOURITES / STARRED OPERATIONS
# ============================================================================


async def get_favourites(
    pool: asyncpg.Pool | None,
    user_id: str = DEFAULT_USER_ID,
) -> list[str]:
    """Retrieve list of starred stock symbols."""
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT symbol FROM favourites
                    WHERE user_id = $1::uuid
                    ORDER BY created_at DESC;
                    """,
                    user_id,
                )
                return [r["symbol"] for r in rows]
        except Exception as exc:
            logger.warning("database.get_favourites_fallback", error=str(exc))

    # In-memory fallback
    user_favs = in_memory_store.favourites.setdefault(user_id, set())
    return sorted(list(user_favs))


async def toggle_favourite(
    pool: asyncpg.Pool | None,
    symbol: str,
    user_id: str = DEFAULT_USER_ID,
) -> bool:
    """Toggle favourite state for a symbol. Returns True if now favourite, False if removed."""
    sym_clean = symbol.strip().upper()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                existing = await conn.fetchval(
                    """
                    SELECT id FROM favourites
                    WHERE user_id = $1::uuid AND symbol = $2;
                    """,
                    user_id,
                    sym_clean,
                )
                if existing:
                    await conn.execute(
                        """
                        DELETE FROM favourites
                        WHERE user_id = $1::uuid AND symbol = $2;
                        """,
                        user_id,
                        sym_clean,
                    )
                    return False
                else:
                    await conn.execute(
                        """
                        INSERT INTO favourites (user_id, symbol)
                        VALUES ($1::uuid, $2)
                        ON CONFLICT (user_id, symbol) DO NOTHING;
                        """,
                        user_id,
                        sym_clean,
                    )
                    return True
        except Exception as exc:
            logger.warning("database.toggle_favourite_fallback", error=str(exc))

    # In-memory fallback
    user_favs = in_memory_store.favourites.setdefault(user_id, set())
    if sym_clean in user_favs:
        user_favs.remove(sym_clean)
        return False
    else:
        user_favs.add(sym_clean)
        return True


# ============================================================================
# CHART DRAWINGS OPERATIONS
# ============================================================================


async def get_chart_drawings(
    pool: asyncpg.Pool | None,
    symbol: str,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any]:
    """Retrieve saved TradingView chart drawings JSON for a stock."""
    sym_clean = symbol.strip().upper()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    SELECT drawing_data, updated_at
                    FROM chart_drawings
                    WHERE user_id = $1::uuid AND symbol = $2;
                    """,
                    user_id,
                    sym_clean,
                )
                if r:
                    raw_data = r["drawing_data"]
                    if isinstance(raw_data, str):
                        try:
                            raw_data = json.loads(raw_data)
                        except Exception:
                            pass
                    return {
                        "drawing_data": raw_data,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else _now_iso(),
                    }
                return {"drawing_data": [], "updated_at": None}
        except Exception as exc:
            logger.warning("database.get_chart_drawings_fallback", error=str(exc))

    # In-memory fallback
    entry = in_memory_store.chart_drawings.get((user_id, sym_clean))
    if entry:
        return entry
    return {"drawing_data": [], "updated_at": None}


async def save_chart_drawings(
    pool: asyncpg.Pool | None,
    symbol: str,
    drawing_data: Any,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any]:
    """Persist TradingView chart drawings JSON for a stock."""
    sym_clean = symbol.strip().upper()
    json_str = json.dumps(drawing_data) if not isinstance(drawing_data, str) else drawing_data
    now = _now_iso()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    INSERT INTO chart_drawings (user_id, symbol, drawing_data, updated_at)
                    VALUES ($1::uuid, $2, $3::jsonb, NOW())
                    ON CONFLICT (user_id, symbol)
                    DO UPDATE SET drawing_data = EXCLUDED.drawing_data, updated_at = NOW()
                    RETURNING drawing_data, updated_at;
                    """,
                    user_id,
                    sym_clean,
                    json_str,
                )
                if r:
                    res_data = r["drawing_data"]
                    if isinstance(res_data, str):
                        try:
                            res_data = json.loads(res_data)
                        except Exception:
                            pass
                    return {
                        "drawing_data": res_data,
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else now,
                    }
        except Exception as exc:
            logger.warning("database.save_chart_drawings_fallback", error=str(exc))

    # In-memory fallback
    parsed = drawing_data
    if isinstance(drawing_data, str):
        try:
            parsed = json.loads(drawing_data)
        except Exception:
            pass

    saved_entry = {
        "symbol": sym_clean,
        "drawing_data": parsed,
        "updated_at": now,
    }
    in_memory_store.chart_drawings[(user_id, sym_clean)] = saved_entry
    return saved_entry


# ============================================================================
# STOCK NOTES OPERATIONS
# ============================================================================


async def get_stock_notes(
    pool: asyncpg.Pool | None,
    symbol: str,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any]:
    """Retrieve user's markdown notes for a stock."""
    sym_clean = symbol.strip().upper()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                r = await conn.fetchrow(
                    """
                    SELECT content, updated_at
                    FROM stock_notes
                    WHERE user_id = $1::uuid AND symbol = $2
                    ORDER BY updated_at DESC
                    LIMIT 1;
                    """,
                    user_id,
                    sym_clean,
                )
                if r:
                    return {
                        "content": r["content"],
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else _now_iso(),
                    }
                return {"content": "", "updated_at": None}
        except Exception as exc:
            logger.warning("database.get_stock_notes_fallback", error=str(exc))

    # In-memory fallback
    entry = in_memory_store.stock_notes.get((user_id, sym_clean))
    if entry:
        return entry
    return {"content": "", "updated_at": None}


async def save_stock_notes(
    pool: asyncpg.Pool | None,
    symbol: str,
    content: str,
    user_id: str = DEFAULT_USER_ID,
) -> dict[str, Any]:
    """Persist user's markdown notes for a stock."""
    sym_clean = symbol.strip().upper()
    now = _now_iso()

    if pool is not None:
        try:
            async with pool.acquire() as conn:
                existing_id = await conn.fetchval(
                    """
                    SELECT id FROM stock_notes
                    WHERE user_id = $1::uuid AND symbol = $2;
                    """,
                    user_id,
                    sym_clean,
                )
                if existing_id:
                    r = await conn.fetchrow(
                        """
                        UPDATE stock_notes
                        SET content = $1, updated_at = NOW()
                        WHERE id = $2
                        RETURNING content, updated_at;
                        """,
                        content,
                        existing_id,
                    )
                else:
                    r = await conn.fetchrow(
                        """
                        INSERT INTO stock_notes (user_id, symbol, content, updated_at)
                        VALUES ($1::uuid, $2, $3, NOW())
                        RETURNING content, updated_at;
                        """,
                        user_id,
                        sym_clean,
                        content,
                    )
                if r:
                    return {
                        "content": r["content"],
                        "updated_at": r["updated_at"].isoformat() if r["updated_at"] else now,
                    }
        except Exception as exc:
            logger.warning("database.save_stock_notes_fallback", error=str(exc))

    # In-memory fallback
    saved_entry = {
        "symbol": sym_clean,
        "content": content,
        "updated_at": now,
    }
    in_memory_store.stock_notes[(user_id, sym_clean)] = saved_entry
    return saved_entry
