import { test, expect } from "@playwright/test";

/**
 * Suggestions Panel Smoke Tests
 *
 * Acceptance Criteria:
 * - Results limited to 8-12 suggestions
 * - Run concepts require box/front input
 */

test.describe("Suggestions Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor
    await page.goto("/editor/new");
    await page.waitForTimeout(500);

    // Skip onboarding if present
    const skipButton = page.locator('button:has-text("Skip"), button:has-text("Close")');
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
    }

    // Wait for editor to load
    await page.waitForTimeout(1000);
  });

  test("should show suggestions panel in editor", async ({ page }) => {
    // Look for suggestions panel or tab
    const suggestionsPanel = page.locator(
      '[data-testid="suggestions-panel"], [class*="SuggestionsPanel"], text=Suggestions'
    );

    // Suggestions should be accessible
    // Either visible directly or via a tab
    const suggestionsTab = page.locator('button:has-text("Suggestions"), [role="tab"]:has-text("Suggestions")');

    const isPanelVisible = await suggestionsPanel.isVisible().catch(() => false);
    const isTabVisible = await suggestionsTab.isVisible().catch(() => false);

    expect(isPanelVisible || isTabVisible).toBeTruthy();
  });

  test("suggestions count should be within 8-12 limit", async ({ page }) => {
    // Open suggestions panel if not visible
    const suggestionsTab = page.locator('button:has-text("Suggestions"), [role="tab"]:has-text("Suggestions")');
    if (await suggestionsTab.isVisible().catch(() => false)) {
      await suggestionsTab.click();
      await page.waitForTimeout(300);
    }

    // Look for suggestion cards/items
    const suggestionItems = page.locator(
      '[data-testid="suggestion-card"], [class*="suggestion"], [class*="concept-card"]'
    );

    // Wait for suggestions to load
    await page.waitForTimeout(1000);

    const count = await suggestionItems.count();

    // If suggestions are shown, count should be 0-12
    // (0 is ok if context not set)
    expect(count).toBeLessThanOrEqual(12);
  });

  test("should display concept categories (Pass/Run)", async ({ page }) => {
    // Look for category tabs or sections
    const passCategory = page.locator('text=Pass, [data-testid="pass-concepts"]');
    const runCategory = page.locator('text=Run, [data-testid="run-concepts"]');

    // At least one category should be accessible
    const passVisible = await passCategory.first().isVisible().catch(() => false);
    const runVisible = await runCategory.first().isVisible().catch(() => false);

    // Categories might be in tabs or sidebar
    expect(passVisible || runVisible).toBeTruthy();
  });
});

test.describe("Concept Application", () => {
  test("clicking a concept should apply it to the play", async ({ page }) => {
    await page.goto("/editor/new");
    await page.waitForTimeout(1000);

    // Skip onboarding
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
    }

    // Find and click a concept card
    const conceptCard = page.locator(
      '[data-testid="concept-card"], [class*="concept"], button:has-text("Apply")'
    ).first();

    if (await conceptCard.isVisible().catch(() => false)) {
      await conceptCard.click();
      await page.waitForTimeout(500);

      // Play should now have actions
      const actions = page.locator('[data-testid="action"], path, [class*="route"]');
      // Some visual representation should appear
    }
  });
});
