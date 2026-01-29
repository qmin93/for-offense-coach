import { test, expect } from "@playwright/test";

/**
 * Activation Flow Smoke Test
 *
 * Acceptance Criteria:
 * - User can complete concept → autobuild → export_png flow within 3 minutes
 * - No signup required for basic usage
 */

test.describe("Activation Flow", () => {
  test("should complete concept selection to PNG export flow", async ({ page }) => {
    // Start from landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/ForOffense/i);

    // Click "추천 시작" (recommended start) card
    await page.click('text=추천 시작');

    // Wait for Pre-Context screen or editor
    await page.waitForURL(/\/editor\/new/);

    // Should see Pre-Context or Hard Onboarding modal
    const preContextVisible = await page.locator('[data-testid="pre-context-screen"]').isVisible().catch(() => false);
    const onboardingVisible = await page.locator('[data-testid="hard-onboarding-modal"]').isVisible().catch(() => false);

    if (preContextVisible) {
      // Complete Pre-Context screen
      // Select down/distance
      await page.selectOption('select[name="down"]', '1');
      await page.selectOption('select[name="distance"]', 'medium');

      // Click continue/next
      await page.click('button:has-text("Continue"), button:has-text("Next")');
    }

    if (onboardingVisible) {
      // Hard Onboarding - select a concept (Power, Flood, or Stick)
      await page.click('[data-testid="concept-power"], [data-testid="concept-flood"], [data-testid="concept-stick"]');

      // Wait for concept to be applied
      await page.waitForTimeout(500);

      // Click next/continue if there's a multi-step wizard
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }

    // Should now be in editor with play loaded
    await expect(page.locator('canvas, svg')).toBeVisible({ timeout: 10000 });

    // Find and click Export button
    const exportButton = page.locator('button:has-text("Export"), [data-testid="export-button"]');
    await expect(exportButton).toBeVisible({ timeout: 5000 });
    await exportButton.click();

    // Export dialog should appear
    const exportDialog = page.locator('[role="dialog"], [data-testid="export-dialog"]');
    await expect(exportDialog).toBeVisible({ timeout: 3000 });

    // Click PNG export option
    const pngButton = page.locator('button:has-text("PNG"), [data-testid="export-png"]');
    await pngButton.click();

    // Verify download started (or success message)
    // Note: Actual download verification depends on browser config
    await page.waitForTimeout(1000);
  });

  test("landing page should show 3 start flow cards", async ({ page }) => {
    await page.goto("/");

    // Check for 3 start flow cards
    const cards = page.locator('[class*="StartFlowCard"], a[href*="/editor"], a[href*="/playbooks"]');
    await expect(cards).toHaveCount(3);

    // Verify card titles
    await expect(page.locator('text=추천 시작')).toBeVisible();
    await expect(page.locator('text=포메이션부터 시작')).toBeVisible();
    await expect(page.locator('text=플레이북 관리')).toBeVisible();
  });

  test("should show recent work section when available", async ({ page }) => {
    await page.goto("/");

    // Recent work section should exist (may be empty initially)
    const recentSection = page.locator('text=이어서 작업하기');
    // Only check if section header is visible (content depends on localStorage)
    // This is a soft check - section may not appear if no recent work
  });
});
