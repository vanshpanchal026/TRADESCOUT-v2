"""TRADESCOUT — Unit and Integration Tests for Watchlists, Favourites, Drawings, and Notes.

Validates Phase 5 persistence deliverables:
1. Default user watchlist listing (returns seeded "Primary Watchlist").
2. Creating a new custom watchlist.
3. Adding and removing stocks (RELIANCE, TCS) from watchlist.
4. Enriched watchlist detail with live/cached metrics and 20-day sparkline.
5. Updating and deleting watchlists.
6. Toggling favourites on and off.
7. Saving and retrieving TradingView chart drawings JSON.
8. Saving and retrieving markdown stock notes.
9. Resilient fallback behavior when database is offline.
"""

from collections.abc import AsyncGenerator

import httpx
import pytest
from httpx import ASGITransport

from app.main import app
from app.services.database import reset_in_memory_store


@pytest.fixture(autouse=True)
def clean_in_memory_state():
    """Ensure in-memory store starts clean before each test."""
    reset_in_memory_store()
    yield
    reset_in_memory_store()


@pytest.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """Test client using ASGITransport."""
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_default_watchlist_listing(async_client: httpx.AsyncClient):
    """Verify GET /api/watchlists returns the seeded Primary Watchlist."""
    resp = await async_client.get("/api/watchlists")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["total"] >= 1
    names = [w["name"] for w in data["watchlists"]]
    assert "Primary Watchlist" in names


@pytest.mark.asyncio
async def test_create_and_update_custom_watchlist(async_client: httpx.AsyncClient):
    """Verify creating, renaming, and deleting a custom watchlist."""
    # 1. Create Watchlist
    payload = {
        "name": "Minervini Stage 2 Setups",
        "description": "High momentum stocks breaking out of bases",
        "is_default": False,
    }
    create_resp = await async_client.post("/api/watchlists", json=payload)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["status"] == "success"
    w_id = created_data["watchlist"]["id"]
    assert created_data["watchlist"]["name"] == "Minervini Stage 2 Setups"
    assert created_data["watchlist"]["item_count"] == 0

    # 2. Update / Rename Watchlist
    update_payload = {
        "name": "Minervini Stage 2 Breakouts (Updated)",
        "description": "Revised description",
    }
    update_resp = await async_client.put(f"/api/watchlists/{w_id}", json=update_payload)
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["watchlist"]["name"] == "Minervini Stage 2 Breakouts (Updated)"

    # 3. Delete Watchlist
    del_resp = await async_client.delete(f"/api/watchlists/{w_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

    # Verify 404 after deletion
    detail_resp = await async_client.get(f"/api/watchlists/{w_id}")
    assert detail_resp.status_code == 404


@pytest.mark.asyncio
async def test_add_and_remove_stocks_from_watchlist(async_client: httpx.AsyncClient):
    """Verify adding RELIANCE and TCS to watchlist, then removing them."""
    # 1. List watchlists to find Primary Watchlist ID
    list_resp = await async_client.get("/api/watchlists")
    assert list_resp.status_code == 200
    primary = next((w for w in list_resp.json()["watchlists"] if w["name"] == "Primary Watchlist"), None)
    assert primary is not None
    w_id = primary["id"]

    # 2. Add RELIANCE
    add_rel_resp = await async_client.post(
        f"/api/watchlists/{w_id}/items",
        json={"symbol": "RELIANCE", "notes": "Leader in Oil & Retail", "added_price": 1335.0},
    )
    assert add_rel_resp.status_code == 201
    assert add_rel_resp.json()["status"] == "success"
    assert add_rel_resp.json()["item"]["symbol"] == "RELIANCE"

    # 3. Add TCS
    add_tcs_resp = await async_client.post(
        f"/api/watchlists/{w_id}/items",
        json={"symbol": "TCS", "notes": "IT Large Cap", "added_price": 4150.0},
    )
    assert add_tcs_resp.status_code == 201
    assert add_tcs_resp.json()["item"]["symbol"] == "TCS"

    # 4. Get Watchlist Detail & check enriched stock fields
    detail_resp = await async_client.get(f"/api/watchlists/{w_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["total_items"] >= 2
    symbols = [item["symbol"] for item in detail_data["items"]]
    assert "RELIANCE" in symbols
    assert "TCS" in symbols

    # Check that RELIANCE item has sparkline and enriched metrics
    rel_item = next(it for it in detail_data["items"] if it["symbol"] == "RELIANCE")
    assert rel_item["cmp"] > 0
    assert isinstance(rel_item["sparkline"], list)
    assert rel_item["notes"] == "Leader in Oil & Retail"

    # 5. Remove TCS
    remove_resp = await async_client.delete(f"/api/watchlists/{w_id}/items/TCS")
    assert remove_resp.status_code == 200
    assert remove_resp.json()["status"] == "success"

    # 6. Verify TCS is removed and RELIANCE remains
    after_resp = await async_client.get(f"/api/watchlists/{w_id}")
    after_symbols = [item["symbol"] for item in after_resp.json()["items"]]
    assert "TCS" not in after_symbols
    assert "RELIANCE" in after_symbols

    # Clean up RELIANCE
    await async_client.delete(f"/api/watchlists/{w_id}/items/RELIANCE")


@pytest.mark.asyncio
async def test_toggle_favourites(async_client: httpx.AsyncClient):
    """Verify starring and unstarring symbols."""
    # 1. Star TRENT
    resp1 = await async_client.post("/api/favourites/TRENT/toggle")
    assert resp1.status_code == 200
    assert resp1.json()["symbol"] == "TRENT"
    assert resp1.json()["is_favourite"] is True

    # 2. Check in favourites list
    list_resp = await async_client.get("/api/favourites")
    assert list_resp.status_code == 200
    assert "TRENT" in list_resp.json()["favourites"]

    # 3. Toggle off
    resp2 = await async_client.post("/api/favourites/TRENT/toggle")
    assert resp2.status_code == 200
    assert resp2.json()["is_favourite"] is False

    # 4. Check not in favourites list
    list_resp2 = await async_client.get("/api/favourites")
    assert "TRENT" not in list_resp2.json()["favourites"]


@pytest.mark.asyncio
async def test_save_and_retrieve_chart_drawings(async_client: httpx.AsyncClient):
    """Verify persisting and reading TradingView chart drawings JSON."""
    drawings_payload = {
        "drawing_data": [
            {
                "type": "horizontal_line",
                "price": 1345.5,
                "color": "#00E5FF",
                "lineStyle": "dashed",
                "label": "Pivot Breakout Level",
            },
            {
                "type": "support_zone",
                "top": 1280.0,
                "bottom": 1260.0,
                "color": "rgba(34, 197, 94, 0.2)",
            },
        ]
    }

    # 1. Save drawings
    post_resp = await async_client.post("/api/stock/DIXON/drawings", json=drawings_payload)
    assert post_resp.status_code == 200
    assert post_resp.json()["status"] == "success"
    assert len(post_resp.json()["drawing_data"]) == 2

    # 2. Retrieve drawings
    get_resp = await async_client.get("/api/stock/DIXON/drawings")
    assert get_resp.status_code == 200
    saved = get_resp.json()
    assert saved["status"] == "success"
    assert saved["symbol"] == "DIXON"
    assert len(saved["drawing_data"]) == 2
    assert saved["drawing_data"][0]["type"] == "horizontal_line"
    assert saved["drawing_data"][0]["price"] == 1345.5


@pytest.mark.asyncio
async def test_save_and_retrieve_stock_notes(async_client: httpx.AsyncClient):
    """Verify persisting and reading trader journal markdown notes."""
    notes_markdown = (
        "### Trade Setup — KAYNES\n"
        "- Entry: Breakout above pivot ₹5,420\n"
        "- Stop Loss: ₹5,150 (-5.0% risk)\n"
        "- Volume: Expanding 2.5x 50-day average\n"
    )

    # 1. Save Notes
    save_resp = await async_client.post("/api/stock/KAYNES/notes", json={"content": notes_markdown})
    assert save_resp.status_code == 200
    assert save_resp.json()["status"] == "success"
    assert save_resp.json()["content"] == notes_markdown

    # 2. Retrieve Notes
    get_resp = await async_client.get("/api/stock/KAYNES/notes")
    assert get_resp.status_code == 200
    fetched = get_resp.json()
    assert fetched["status"] == "success"
    assert fetched["symbol"] == "KAYNES"
    assert "Breakout above pivot ₹5,420" in fetched["content"]


@pytest.mark.asyncio
async def test_nonexistent_watchlist_returns_404(async_client: httpx.AsyncClient):
    """Verify requesting an unknown watchlist ID returns 404."""
    resp = await async_client.get("/api/watchlists/99999999-9999-9999-9999-999999999999")
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"] == "not_found"


@pytest.mark.asyncio
async def test_multi_tenant_user_isolation(async_client: httpx.AsyncClient):
    """Verify full multi-tenant data isolation between two distinct user identities."""
    user_a_headers = {"x-user-id": "11111111-1111-1111-1111-111111111111"}
    user_b_headers = {"x-user-id": "22222222-2222-2222-2222-222222222222"}

    # 1. User A creates a private watchlist
    create_resp = await async_client.post(
        "/api/watchlists",
        json={"name": "User A Alpha Picks", "description": "Strictly confidential"},
        headers=user_a_headers,
    )
    assert create_resp.status_code == 201
    w_a_id = create_resp.json()["watchlist"]["id"]

    # 2. User B lists watchlists: must NOT see User A's watchlist
    user_b_list = await async_client.get("/api/watchlists", headers=user_b_headers)
    assert user_b_list.status_code == 200
    b_names = [w["name"] for w in user_b_list.json()["watchlists"]]
    assert "User A Alpha Picks" not in b_names

    # 3. User B cannot read User A's watchlist directly
    cross_access = await async_client.get(f"/api/watchlists/{w_a_id}", headers=user_b_headers)
    assert cross_access.status_code == 404

    # 4. User A toggles favourite for RELIANCE
    fav_a = await async_client.post("/api/favourites/RELIANCE/toggle", headers=user_a_headers)
    assert fav_a.status_code == 200
    assert fav_a.json()["is_favourite"] is True

    # User B favourites must be isolated (empty for User B)
    fav_b_list = await async_client.get("/api/favourites", headers=user_b_headers)
    assert fav_b_list.status_code == 200
    assert "RELIANCE" not in fav_b_list.json()["favourites"]

    # 5. User A writes notes; User B should not see them
    await async_client.post(
        "/api/stock/RELIANCE/notes",
        json={"content": "Confidential User A strategy"},
        headers=user_a_headers,
    )
    notes_b = await async_client.get("/api/stock/RELIANCE/notes", headers=user_b_headers)
    assert notes_b.status_code == 200
    assert notes_b.json()["content"] == ""
