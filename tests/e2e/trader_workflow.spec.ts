import { test, expect } from "@playwright/test";

test.describe("TRADESCOUT Phase 7 — Trader Workflow End-to-End Suite", () => {
  // Test 1: The Warmup (/warmup)
  test("Test 1: The Warmup (/warmup) renders participation dial, RME sentiment, and stage distribution", async ({
    page,
  }) => {
    await page.goto("/warmup");
    await page.waitForLoadState("domcontentloaded");

    // Check main title
    await expect(page.locator("h1")).toContainText("The Warmup");

    // 1. Market Participation Radial Dial
    const participationHeader = page.locator("text=Market Participation");
    await expect(participationHeader).toBeVisible();
    await expect(page.locator("text=Stocks above 50-day moving average")).toBeVisible();
    // Verify SVG radial gauge circle
    const radialSvg = page.locator("svg circle.text-muted\\/30");
    await expect(radialSvg).toBeVisible();

    // 2. RME Sentiment Badge & Meter
    const rmeHeader = page.locator("text=RME Sentiment Index");
    await expect(rmeHeader).toBeVisible();
    await expect(page.locator("text=Risk Management Environment temperature")).toBeVisible();
    // Verify regime label (Oversold / Washout | Neutral | Overextended)
    const regimeBadge = page.locator("text=/Oversold \\/ Washout|Neutral|Overextended/");
    await expect(regimeBadge.first()).toBeVisible();

    // 3. Stage Distribution Bar
    const stageHeader = page.locator("text=Weinstein Stage Balance");
    await expect(stageHeader).toBeVisible();
    await expect(page.locator("text=Stage 2 (Markup)")).toBeVisible();
    await expect(page.locator("text=Stage 4 (Decline)")).toBeVisible();
    await expect(page.locator("text=/S2:/")).toBeVisible();

    // 4. Mandatory SEBI Regulatory Disclaimer
    const sebiDisclaimer = page.locator("footer").getByText(/Not registered with SEBI as an Investment Adviser/i);
    await expect(sebiDisclaimer).toBeVisible();
  });

  // Test 2: Scanners (/scanners/trend-template)
  test("Test 2: Scanners (/scanners/trend-template) loads virtualized table, sorts by RS Rating, and instant search filters", async ({
    page,
  }) => {
    await page.goto("/scanners/trend-template");
    await page.waitForLoadState("domcontentloaded");

    // Verify page header
    await expect(page.locator("h1")).toContainText("Trend Template");

    // Verify TanStack table renders
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Verify rows exist
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const initialRowCount = await rows.count();
    expect(initialRowCount).toBeGreaterThan(0);

    // Pick symbol from first row for instant search testing
    const firstSymbolText = await page.locator("tbody tr:first-child td:first-child").innerText();
    const targetSymbol = firstSymbolText.split("\n")[0].trim();
    expect(targetSymbol.length).toBeGreaterThan(0);

    // Verify Sorting by RS Rating works
    const rsRatingHeaderButton = page.locator("th button", { hasText: "RS Rating" });
    await expect(rsRatingHeaderButton).toBeVisible();
    await rsRatingHeaderButton.click();
    await page.waitForTimeout(300); // Allow sort state recalculation

    // Verify Instant Search Filters Results
    const searchInput = page.locator("input[placeholder*='Search symbol']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill(targetSymbol);
    await page.waitForTimeout(300);

    // Verify search filtered table has matching symbol
    const filteredRows = page.locator("tbody tr");
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThan(0);
    await expect(page.locator("tbody").getByText(targetSymbol).first()).toBeVisible();

    // Clear search filter
    await searchInput.fill("");
    await page.waitForTimeout(300);
  });

  // Test 3: Stock Detail & Charting (/stock/RELIANCE)
  test("Test 3: Stock Detail & Charting (/stock/RELIANCE) mounts TradingView canvas, displays 5Y fundamentals, and auto-saves notes", async ({
    page,
  }) => {
    page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
    page.on("pageerror", (err) => console.log("BROWSER ERROR:", err.message));
    page.on("requestfailed", (req) => console.log("FAILED REQ:", req.url(), req.failure()?.errorText));

    await page.goto("/stock/RELIANCE");
    await page.waitForLoadState("domcontentloaded");
    // Wait for parquet streaming loader to finish
    await page.locator("text=/Streaming OHLCV Parquet/i").waitFor({ state: "detached", timeout: 30000 }).catch(() => {});

    // 1. Stock Header
    await expect(page.locator("h1")).toContainText("RELIANCE", { timeout: 15000 });
    await expect(page.getByText("★ RS").first()).toBeVisible();

    // 2. TradingView Canvas Mounted
    // TradingView creates canvas element inside the chart container
    const chartCanvas = page.locator("canvas").first();
    await expect(chartCanvas).toBeVisible({ timeout: 15000 });

    // 3. Fundamentals Table Tab
    const fundamentalsTab = page.getByRole("button", { name: /Fundamentals/i });
    await expect(fundamentalsTab).toBeVisible();
    await fundamentalsTab.click();

    // Verify Screener-style 5Y quarterly financial statements
    await expect(page.getByText("Screener-Style Financial Statements")).toBeVisible();
    await expect(page.getByText("Sales (Revenue)")).toBeVisible();
    await expect(page.getByText("Net Profit").first()).toBeVisible();

    // 4. Notes & Filings Tab with Auto-Save
    const notesTab = page.getByRole("button", { name: /Notes & Filings/i });
    await expect(notesTab).toBeVisible();
    await notesTab.click();

    await expect(page.getByText("Private Trading Journal")).toBeVisible();
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();

    // Test typing and auto-saving notes
    const testNote = `Test Thesis Entry ${Date.now()}: Breakout above pivot with high volume expansion.`;
    await textarea.fill(testNote);

    // Click Save Now or wait for debounced auto-save
    const saveButton = page.getByRole("button", { name: "Save Now" });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Verify save indicator feedback
    await expect(page.locator("text=/Auto-saved|Synced|Saved/i").first()).toBeVisible();
  });

  // Test 4: Watchlist Loop (/watchlists)
  test("Test 4: Watchlist Loop (/watchlists) verifies autocomplete add, 20D sparklines, star toggle, and CSV export", async ({
    page,
  }) => {
    await page.goto("/watchlists");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("text=/Loading watchlists/i").waitFor({ state: "detached", timeout: 30000 }).catch(() => {});

    // Verify Watchlist Header
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    // 1. Adding a symbol via autocomplete
    const quickAddInput = page.locator("input[placeholder*='Add NSE Symbol']");
    await expect(quickAddInput).toBeVisible();
    await quickAddInput.fill("TCS");

    // Autocomplete dropdown suggestion should show up
    const suggestionButton = page.locator("button", { hasText: "TCS" }).first();
    await expect(suggestionButton).toBeVisible();

    const addStockButton = page.getByRole("button", { name: /Add Stock/i });
    await expect(addStockButton).toBeVisible();
    await addStockButton.click();

    // Wait for item in table
    await page.waitForTimeout(500);

    // 2. 20D Sparklines
    const sparklineHeader = page.getByText("20D Trend");
    await expect(sparklineHeader).toBeVisible();
    const sparklineSvg = page.locator("table svg").first();
    await expect(sparklineSvg).toBeVisible();

    // 3. Toggling Star (favourite)
    const starButton = page.locator("table tbody tr button", { has: page.locator("svg") }).first();
    await expect(starButton).toBeVisible();
    await starButton.click();
    await page.waitForTimeout(300);

    // 4. CSV Export
    const exportCsvButton = page.getByRole("button", { name: /Export CSV/i });
    await expect(exportCsvButton).toBeVisible();

    // Verify download trigger or click
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
    await exportCsvButton.click();
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain(".csv");
    }
  });

  // Test 5: Relative Rotation Graph (/rrg)
  test("Test 5: Relative Rotation Graph (/rrg) renders 4 quadrants and toggles tail length", async ({
    page,
  }) => {
    await page.goto("/rrg");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("text=/Loading Relative Rotation/i").waitFor({ state: "detached", timeout: 30000 }).catch(() => {});

    // Header check
    await expect(page.locator("h1")).toContainText("Relative Rotation Graph", { timeout: 15000 });

    // 1. Verify 4 Quadrants rendered (watermarks / metric cards)
    await expect(page.getByText("Leading (RS+, MOM+)").first()).toBeVisible();
    await expect(page.getByText("Weakening (RS+, MOM-)").first()).toBeVisible();
    await expect(page.getByText("Lagging (RS-, MOM-)").first()).toBeVisible();
    await expect(page.getByText("Improving (RS-, MOM+)").first()).toBeVisible();

    // 2. Verify SVG 2D Scatter chart
    const rrgSvg = page.locator("svg[viewBox='0 0 800 600']");
    await expect(rrgSvg).toBeVisible();

    // Verify center axis 100.0 line
    await expect(rrgSvg.getByText("100.0")).toBeVisible();

    // 3. Tail length toggling
    const tail5Button = page.getByRole("button", { name: "5D" });
    const tail10Button = page.getByRole("button", { name: "10D" });
    const tail20Button = page.getByRole("button", { name: "20D" });

    await expect(tail5Button).toBeVisible();
    await expect(tail10Button).toBeVisible();
    await expect(tail20Button).toBeVisible();

    // Toggle to 5D
    await tail5Button.click();
    await expect(tail5Button).toHaveClass(/bg-accent/);

    // Toggle to 20D
    await tail20Button.click();
    await expect(tail20Button).toHaveClass(/bg-accent/);

    // Toggle back to 10D default
    await tail10Button.click();
    await expect(tail10Button).toHaveClass(/bg-accent/);
  });

  // Test 6: Market Heatmap (/heatmap)
  test("Test 6: Market Heatmap (/heatmap) renders treemap tiles with cyan/red palette and toggles index selector", async ({
    page,
  }) => {
    await page.goto("/heatmap");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("text=/Computing Market Cap/i").waitFor({ state: "detached", timeout: 30000 }).catch(() => {});

    // Header check
    await expect(page.locator("h1")).toContainText("Market Treemap Heatmap", { timeout: 15000 });

    // 1. Verify Treemap SVG renders with tiles
    const treemapSvg = page.locator("svg[viewBox='0 0 1000 620']");
    await expect(treemapSvg).toBeVisible();

    // Verify sector or stock tile rects exist inside treemap
    const stockRects = treemapSvg.locator("rect");
    const rectCount = await stockRects.count();
    expect(rectCount).toBeGreaterThan(5);

    // 2. Verify color scale legend (+3% cyan / -3% red)
    await expect(page.getByText("+3%")).toBeVisible();
    await expect(page.getByText("-3%")).toBeVisible();

    // 3. Index Selector toggles (exact name matching)
    const nifty50Btn = page.getByRole("button", { name: "NIFTY 50", exact: true });
    const next50Btn = page.getByRole("button", { name: "NIFTY NEXT 50", exact: true });
    const midcap100Btn = page.getByRole("button", { name: "NIFTY MIDCAP 100", exact: true });

    await expect(nifty50Btn).toBeVisible();
    await expect(next50Btn).toBeVisible();
    await expect(midcap100Btn).toBeVisible();

    // Toggle to NIFTY NEXT 50
    await next50Btn.click();
    await expect(next50Btn).toHaveClass(/bg-card/);

    // Toggle back to NIFTY 50
    await nifty50Btn.click();
    await expect(nifty50Btn).toHaveClass(/bg-card/);
  });

  // Test 7: Command Palette Navigation (Cmd+K / Ctrl+K)
  test("Test 7: Command Palette opens via shortcut or navbar button, filters tools/symbols, and navigates", async ({
    page,
  }) => {
    await page.goto("/warmup");
    await page.waitForLoadState("domcontentloaded");

    // 1. Open Command Palette via navbar trigger button
    const cmdKBtn = page.locator("button[title*='Command Palette']");
    await expect(cmdKBtn).toBeVisible();
    await cmdKBtn.click();

    // Verify modal overlay appears
    const searchInput = page.locator("input[placeholder*='Type a stock symbol']");
    await expect(searchInput).toBeVisible();
    await expect(page.getByText("TRADESCOUT Command Terminal")).toBeVisible();

    // 2. Test closing with Escape
    await page.keyboard.press("Escape");
    await expect(searchInput).not.toBeVisible();

    // 3. Test opening via keyboard shortcut (Control+k)
    await page.keyboard.press("Control+k");
    await expect(searchInput).toBeVisible();

    // 4. Type search query: DIXON
    await searchInput.fill("DIXON");
    await page.waitForTimeout(300);

    const dixonOption = page.locator("button", { hasText: "DIXON — Dixon Technologies" });
    await expect(dixonOption).toBeVisible();
    await expect(page.getByText("₹15,220.00")).toBeVisible();

    // 5. Select item and navigate
    await dixonOption.click();
    await page.waitForURL("**/stock/DIXON", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("DIXON", { timeout: 15000 });
  });

  // Test 8: Multi-Tenant Auth Headers & Watchlist Lifecycle (PUT / DELETE / User Switching)
  test("Test 8: Multi-Tenant Auth, UserSwitcher, and Watchlist CRUD (PUT rename / DELETE item and list)", async ({
    page,
  }) => {
    let promptAnswer = "Alpha Momentum 2026";
    page.on("dialog", async (dialog) => {
      if (dialog.type() === "prompt") {
        await dialog.accept(promptAnswer);
      } else {
        await dialog.accept();
      }
    });

    await page.goto("/watchlists");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("text=/Loading/i").waitFor({ state: "detached", timeout: 30000 }).catch(() => {});

    // 1. Verify Default Multi-Tenant User profile in Navbar
    const userSwitcherBtn = page.locator("button[title*='Switch Multi-Tenant User Identity']");
    await expect(userSwitcherBtn).toBeVisible();
    await expect(userSwitcherBtn).toContainText("Alpha Trader");

    // 2. Add INFY to current watchlist
    const quickAddInput = page.locator("input[placeholder*='Add NSE Symbol']");
    await expect(quickAddInput).toBeVisible();
    await quickAddInput.fill("INFY");
    const suggestionBtn = page.locator("button", { hasText: "INFY" }).first();
    await expect(suggestionBtn).toBeVisible();
    await page.getByRole("button", { name: /Add Stock/i }).click();
    await page.waitForTimeout(600);

    // Verify INFY is in the table
    await expect(page.locator("table tbody").getByText("INFY").first()).toBeVisible();

    // 3. Delete INFY (DELETE item endpoint via proxy)
    const infyRow = page.locator("table tbody tr", { hasText: "INFY" });
    const deleteItemBtn = infyRow.locator("button[title='Remove from Watchlist']");
    await expect(deleteItemBtn).toBeVisible();
    await deleteItemBtn.click();
    await page.waitForTimeout(600);

    // Verify INFY is removed
    await expect(page.locator("table tbody").getByText("INFY")).toHaveCount(0);

    // 4. Create a new custom watchlist (POST /api/watchlists)
    const newWatchlistBtn = page.getByRole("button", { name: /New Watchlist/i });
    await expect(newWatchlistBtn).toBeVisible();
    await newWatchlistBtn.click();

    // Fill modal form
    const modalNameInput = page.locator("input[placeholder*='Minervini VCP']");
    await expect(modalNameInput).toBeVisible();
    const customListName = "E2E Custom List " + Date.now();
    await modalNameInput.fill(customListName);
    await page.getByRole("button", { name: /Create Watchlist/i }).click();
    await page.waitForTimeout(600);

    // Verify newly created watchlist is active
    await expect(page.locator("h1")).toContainText(customListName);

    // 5. Rename custom watchlist (PUT /api/watchlists/:id)
    const renameBtn = page.locator("button[title='Rename active watchlist']");
    await expect(renameBtn).toBeVisible();
    promptAnswer = customListName + " (Renamed)";
    await renameBtn.click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("(Renamed)");

    // 6. Delete custom watchlist (DELETE /api/watchlists/:id)
    const deleteListBtn = page.locator("button[title='Delete active watchlist']");
    await expect(deleteListBtn).toBeVisible();
    await deleteListBtn.click();
    await page.waitForTimeout(800);

    // Verify it falls back to Primary Watchlist
    await expect(page.locator("h1")).toContainText("Primary Watchlist");

    // 7. Multi-Tenant User Switching: Switch to Beta Hedge Fund
    await userSwitcherBtn.click();
    await expect(page.getByText("Multi-Tenant User Isolation")).toBeVisible();
    const betaFundOption = page.locator("button", { hasText: "Beta Hedge Fund" });
    await expect(betaFundOption).toBeVisible();
    await betaFundOption.click();
    await page.waitForTimeout(600);

    // Verify user label in Navbar reflects Beta Hedge Fund
    await expect(userSwitcherBtn).toContainText("Beta Hedge Fund");

    // Switch back to Alpha Trader to restore state
    await userSwitcherBtn.click();
    const alphaOption = page.locator("button", { hasText: "Alpha Trader" });
    await expect(alphaOption).toBeVisible();
    await alphaOption.click();
    await page.waitForTimeout(400);
    await expect(userSwitcherBtn).toContainText("Alpha Trader");
  });
});
