import fs from "fs";
import path from "path";
import assert from "assert";

console.log("===============================================================================");
console.log("TRADESCOUT UI/UX 3-Fix Verification Suite");
console.log("===============================================================================");

let passed = 0;
let failed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${title}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// Check 1: Stock Universe & Predictive Search Logic
// -------------------------------------------------------------
check("Stock Universe & Search Algorithm Integrity", () => {
  const stockUniversePath = path.resolve("frontend/src/lib/stock-universe.ts");
  assert(fs.existsSync(stockUniversePath), "stock-universe.ts must exist");
  const content = fs.readFileSync(stockUniversePath, "utf-8");

  assert(content.includes("STOCK_UNIVERSE"), "Must export STOCK_UNIVERSE");
  assert(content.includes("searchStockUniverse"), "Must export searchStockUniverse function");
  assert(content.includes("RELIANCE"), "Must contain RELIANCE");
  assert(content.includes("TRENT"), "Must contain TRENT");
  assert(content.includes("DIXON"), "Must contain DIXON");
  assert(content.includes("HDFCBANK"), "Must contain HDFCBANK");

  // Verify search bar component
  const searchBarPath = path.resolve("frontend/src/components/common/StockSearchBar.tsx");
  assert(fs.existsSync(searchBarPath), "StockSearchBar.tsx must exist");
  const sbContent = fs.readFileSync(searchBarPath, "utf-8");
  assert(sbContent.includes("searchStockUniverse"), "StockSearchBar must use searchStockUniverse");
  assert(sbContent.includes("onMouseEnter"), "StockSearchBar must support hover selection");
  assert(sbContent.includes("ArrowDown"), "StockSearchBar must support keyboard navigation");
  assert(sbContent.includes("/stock/"), "StockSearchBar must navigate to stock chart");

  // Verify TopTabBar and Navbar use StockSearchBar
  const topTabContent = fs.readFileSync(path.resolve("frontend/src/components/shell/TopTabBar.tsx"), "utf-8");
  assert(topTabContent.includes("StockSearchBar"), "TopTabBar must include StockSearchBar");

  const navbarContent = fs.readFileSync(path.resolve("frontend/src/components/common/Navbar.tsx"), "utf-8");
  assert(navbarContent.includes("StockSearchBar"), "Navbar must include StockSearchBar");
});

// -------------------------------------------------------------
// Check 2: Multi-Tenant User Isolation completely removed
// -------------------------------------------------------------
check("Multi-Tenant User Isolation Removal", () => {
  const userSwitcherPath = path.resolve("frontend/src/components/common/UserSwitcher.tsx");
  const content = fs.readFileSync(userSwitcherPath, "utf-8");

  assert(!content.includes("Multi-Tenant User Isolation"), "Multi-Tenant User Isolation title must be removed");
  assert(!content.includes("10k Scale"), "10k Scale badge must be removed");
  assert(!content.includes("Connect Custom User ID"), "Custom UUID connection input must be removed");
  assert(!content.includes("Alpha Trader"), "Preset tenant switchers must be removed from UserSwitcher");
  assert(!content.includes("Beta Hedge Fund"), "Beta Hedge Fund switcher must be removed");
  assert(!content.includes("Quant Desk"), "Quant Desk switcher must be removed");
  assert(content.includes('href="/account"'), "Must link cleanly to /account");

  // Verify TopTabBar doesn't have multi-tenant isolation title
  const topTabBar = fs.readFileSync(path.resolve("frontend/src/components/shell/TopTabBar.tsx"), "utf-8");
  assert(!topTabBar.includes("Switch Multi-Tenant User Identity"), "Obsolete title must be removed from TopTabBar");
});

// -------------------------------------------------------------
// Check 3: Chart in Light Mode & Theme Adaptability
// -------------------------------------------------------------
check("Chart Light Mode & High-Contrast Visual Styling", () => {
  const chartPath = path.resolve("frontend/src/components/chart/TradingViewChart.tsx");
  const chartContent = fs.readFileSync(chartPath, "utf-8");

  assert(chartContent.includes("useTheme"), "TradingViewChart must use useTheme hook");
  assert(chartContent.includes("getChartThemeColors"), "Must have getChartThemeColors helper");
  // Check light mode green/red candles
  assert(chartContent.includes("#16A34A"), "Must use vibrant green #16A34A for bullish candles in light mode");
  assert(chartContent.includes("#DC2626"), "Must use vibrant red #DC2626 for bearish candles in light mode");
  // Check theme change reactive hook
  assert(chartContent.includes("isDark"), "Must reactively track isDark");
  assert(chartContent.includes("applyOptions"), "Must apply updated options on theme toggle");
  // Check semantic classes
  assert(chartContent.includes("bg-card"), "Chart container must use bg-card");
  assert(chartContent.includes("border-border"), "Chart container must use border-border");
  assert(!chartContent.includes("bg-slate-900/60"), "Hardcoded dark container bg-slate-900/60 must be removed");

  // Verify Stock Detail page header card is not hardcoded dark
  const pagePath = path.resolve("frontend/src/app/stock/[symbol]/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");
  assert(!pageContent.includes("bg-slate-900/70"), "Hardcoded bg-slate-900/70 header card must be removed");
  assert(pageContent.includes("bg-card rounded-2xl border border-border"), "Stock header card must use semantic theme classes");

  // Verify RSLineChart
  const rsPath = path.resolve("frontend/src/components/chart/RSLineChart.tsx");
  const rsContent = fs.readFileSync(rsPath, "utf-8");
  assert(rsContent.includes("useTheme"), "RSLineChart must use useTheme hook");
  assert(rsContent.includes("bg-card"), "RSLineChart container must use bg-card");
});

console.log("===============================================================================");
console.log(`Summary: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log("===============================================================================");

if (failed > 0) process.exit(1);
