import { test, expect } from "@playwright/test";

test.describe("Adversarial Challenger Stress Harness", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/scanners/trend-template");
  });

  test("Target 4 Stress: FeedbackDrawer Draft Persistence across reload and mount cycles", async ({
    page,
  }) => {
    // 1. Seed structured draft into localStorage before drawer ever mounts or opens
    const testDraft = {
      category: "feature",
      feedbackText: "Adversarial Stress Test: Persistent draft across cold browser reloads",
    };

    await page.evaluate((draft) => {
      localStorage.setItem("ts-feedback-draft", JSON.stringify(draft));
    }, testDraft);

    // 2. Cold reload the page multiple times
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // 3. Empirically verify draft was NOT wiped by component mount or page hydration
    const savedDraftRaw = await page.evaluate(() =>
      localStorage.getItem("ts-feedback-draft")
    );
    expect(savedDraftRaw).not.toBeNull();
    const savedDraft = JSON.parse(savedDraftRaw!);
    expect(savedDraft.feedbackText).toBe(testDraft.feedbackText);
    expect(savedDraft.category).toBe("feature");

    // 4. Open Feedback Drawer via open-feedback-drawer CustomEvent
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("open-feedback-drawer"));
    });

    // 5. Verify the textarea in the drawer has restored the draft
    const textarea = page.locator("textarea[placeholder*='Tell us what happened']");
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await expect(textarea).toHaveValue(testDraft.feedbackText);

    // 6. Update text in drawer
    const updatedText = "Adversarial Stress Test: User typed additional notes without submitting";
    await textarea.fill(updatedText);

    // Wait 150ms for the active persistence effect to sync to localStorage
    await page.waitForTimeout(150);

    // 7. Verify draft updated in localStorage
    const intermediateDraft = await page.evaluate(() => {
      const raw = localStorage.getItem("ts-feedback-draft");
      return raw ? JSON.parse(raw) : null;
    });
    expect(intermediateDraft.feedbackText).toBe(updatedText);

    // 8. Close drawer via X button
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.locator("text=Give Feedback")).not.toBeVisible();

    // 9. Reload page again
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // 10. Verify updated draft is still preserved in localStorage
    const reloadedDraftRaw = await page.evaluate(() =>
      localStorage.getItem("ts-feedback-draft")
    );
    expect(reloadedDraftRaw).not.toBeNull();
    const reloadedDraft = JSON.parse(reloadedDraftRaw!);
    expect(reloadedDraft.feedbackText).toBe(updatedText);

    // 11. Reopen drawer, verify text is still there, and submit
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("open-feedback-drawer"));
    });
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue(updatedText);

    // Submit feedback
    const submitBtn = page.getByRole("button", { name: "Submit Feedback" });
    await submitBtn.click();

    // 12. Verify submission success: draft is deleted and added to history
    await expect(async () => {
      const draftAfterSubmit = await page.evaluate(() =>
        localStorage.getItem("ts-feedback-draft")
      );
      expect(draftAfterSubmit).toBeNull();
    }).toPass({ timeout: 5000 });

    const submissions = await page.evaluate(() => {
      const raw = localStorage.getItem("ts-feedback-submissions");
      return raw ? JSON.parse(raw) : [];
    });
    expect(submissions.length).toBeGreaterThan(0);
    expect(submissions[submissions.length - 1].text).toBe(updatedText);
  });

  test("Target 5 Stress: Freemium Gating and Dynamic Pro Identity Switch", async ({
    page,
  }) => {
    // 1. Ensure unauthenticated guest state
    await page.evaluate(() => {
      localStorage.removeItem("ts-active-user-id");
      localStorage.removeItem("stc-logged-in");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 2. Unauthenticated user must see exactly 10 real data rows + 5 blurred rows
    const dataRows = page.locator("tbody tr:not([aria-hidden='true'])");
    await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
    const count = await dataRows.count();
    expect(count).toBe(10);

    const blurredRows = page.locator("tbody tr[aria-hidden='true']");
    expect(await blurredRows.count()).toBe(5);

    // Paywall blur banner must be visible
    const paywallBanner = page.locator("text=Upgrade to TRADESCOUT Pro to unlock all");
    await expect(paywallBanner).toBeVisible();

    // 3. Switch identity to Pro dynamically via ts-user-changed CustomEvent
    const proUserId = "00000000-0000-0000-0000-000000000001";
    await page.evaluate((userId) => {
      localStorage.setItem("ts-active-user-id", userId);
      window.dispatchEvent(
        new CustomEvent("ts-user-changed", {
          detail: { userId, role: "pro" },
        })
      );
    }, proUserId);

    // 4. Wait for candidates to re-fetch and expand dynamically WITHOUT full page reload
    await expect(async () => {
      const newCount = await page.locator("tbody tr:not([aria-hidden='true'])").count();
      expect(newCount).toBeGreaterThan(10);
    }).toPass({ timeout: 10000 });

    // Blurred rows and Paywall banner must no longer be present
    expect(await page.locator("tbody tr[aria-hidden='true']").count()).toBe(0);
    await expect(page.locator("text=Upgrade to TRADESCOUT Pro to unlock all")).toHaveCount(0);

    // 5. Switch back to Guest identity dynamically
    await page.evaluate(() => {
      localStorage.removeItem("ts-active-user-id");
      window.dispatchEvent(
        new CustomEvent("ts-user-changed", {
          detail: { userId: null, role: "guest" },
        })
      );
    });

    // 6. Grid must re-lock to 10 rows, 5 blurred rows reappears, and paywall banner reappears
    await expect(async () => {
      const postGuestDataRows = page.locator("tbody tr:not([aria-hidden='true'])");
      const guestCount = await postGuestDataRows.count();
      expect(guestCount).toBe(10);
    }).toPass({ timeout: 10000 });

    expect(await page.locator("tbody tr[aria-hidden='true']").count()).toBe(5);
    await expect(page.locator("text=Upgrade to TRADESCOUT Pro to unlock all")).toBeVisible();
  });

  test("Target 1 Stress: Direct Favicon HTTP & Asset Delivery", async ({
    request,
  }) => {
    const res = await request.get("http://localhost:3000/favicon.ico");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/x-icon");

    const body = await res.body();
    expect(body.length).toBe(869);
    // Magic bytes for .ico are \x00\x00\x01\x00
    expect(body[0]).toBe(0);
    expect(body[1]).toBe(0);
    expect(body[2]).toBe(1);
    expect(body[3]).toBe(0);
  });
});
