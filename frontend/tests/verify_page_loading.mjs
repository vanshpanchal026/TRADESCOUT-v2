import assert from "node:assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const routes = [
  "/",
  "/warmup",
  "/account",
  "/stock/RELIANCE",
  "/scanners/trend-template",
  "/watchlists",
  "/rrg",
  "/heatmap",
  "/intraday",
  "/leaders",
  "/results",
  "/news",
  "/login",
];

async function run() {
  console.log(`===============================================================================`);
  console.log(`TRADESCOUT Page Availability & SSR Module Loading Verification`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`===============================================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      
      // Verify no Webpack chunk errors or internal server errors
      assert.strictEqual(
        res.status,
        200,
        `Expected HTTP 200, got ${res.status} for ${route}`
      );
      assert(
        !text.includes("Cannot find module"),
        `Page ${route} returned 'Cannot find module' error!`
      );
      assert(
        !text.includes("Unhandled Runtime Error"),
        `Page ${route} returned Unhandled Runtime Error!`
      );
      assert(
        !text.includes("webpack-runtime"),
        `Page ${route} leaked webpack-runtime crash!`
      );

      console.log(`✅ PASS: ${route} (HTTP ${res.status})`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${route} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n===============================================================================`);
  console.log(`Summary: Total: ${routes.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`===============================================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
