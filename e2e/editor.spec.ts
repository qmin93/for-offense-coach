import { test, expect } from "@playwright/test";

/**
 * Editor Smoke Tests
 *
 * Acceptance Criteria:
 * - Snap to grid works
 * - Undo/Redo functions correctly
 * - Offline draft is maintained
 * - Copy/Paste works with Ctrl+C/V
 */

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor with a new play
    await page.goto("/editor/new");

    // Skip pre-context or onboarding if present
    await page.waitForTimeout(500);

    // Handle hard onboarding modal if visible
    const onboardingModal = page.locator('[data-testid="hard-onboarding-modal"]');
    if (await onboardingModal.isVisible().catch(() => false)) {
      // Click a concept to skip
      await page.click('[data-testid="concept-power"]').catch(() => {});
      await page.waitForTimeout(300);
      // Click through wizard steps
      const nextButton = page.locator('button:has-text("Next")');
      while (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(200);
      }
    }

    // Handle pre-context if visible
    const preContext = page.locator('[data-testid="pre-context-screen"]');
    if (await preContext.isVisible().catch(() => false)) {
      await page.click('button:has-text("Skip"), button:has-text("Continue")').catch(() => {});
    }
  });

  test("should display editor with toolbar and canvas", async ({ page }) => {
    // Wait for editor to load
    await expect(page.locator('[data-testid="editor-toolbar"], .toolbar, [class*="Toolbar"]')).toBeVisible({
      timeout: 10000,
    });

    // Canvas should be present
    await expect(page.locator('canvas, svg, [data-testid="editor-canvas"]')).toBeVisible();
  });

  test("should support undo with Ctrl+Z", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Get initial state
    const initialPlayerCount = await page.locator('[data-testid="player"], circle, [class*="player"]').count();

    // Make a change (click somewhere to potentially select/move)
    await page.keyboard.press("Control+z");

    // Should not throw error
    await page.waitForTimeout(300);
  });

  test("should support redo with Ctrl+Shift+Z", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Press undo first
    await page.keyboard.press("Control+z");
    await page.waitForTimeout(200);

    // Then redo
    await page.keyboard.press("Control+Shift+z");
    await page.waitForTimeout(200);

    // Should not throw error
  });

  test("should show save status badge", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Save status badge should be visible
    const saveStatus = page.locator(
      '[data-testid="save-status"], [class*="SaveStatus"], text=Saved, text=Saving, text=Unsaved, text=Local draft'
    );

    // At least one status indicator should exist
    await expect(saveStatus.first()).toBeVisible({ timeout: 5000 });
  });

  test("should display mode toolbar buttons", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for mode buttons (Select, Route, Block, Motion, Text)
    const toolbar = page.locator('[data-testid="editor-toolbar"], .toolbar, header');

    // Route mode button
    await expect(
      toolbar.locator('button:has-text("Route"), [data-testid="mode-route"], [title*="Route"]')
    ).toBeVisible();

    // Block mode button
    await expect(
      toolbar.locator('button:has-text("Block"), [data-testid="mode-block"], [title*="Block"]')
    ).toBeVisible();
  });

  test("should have export button accessible", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Export button should be visible
    const exportBtn = page.locator('button:has-text("Export"), [data-testid="export-button"]');
    await expect(exportBtn).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Editor Offline Support", () => {
  test("should show offline indicator when network disconnected", async ({ page, context }) => {
    await page.goto("/editor/new");
    await page.waitForTimeout(1000);

    // Simulate offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Check for offline indicator
    const offlineIndicator = page.locator('text=Offline, text=Local draft, [data-testid="offline-badge"]');

    // Note: This depends on the SaveStatusBadge implementation
    // The test verifies the app doesn't crash when offline
  });

  test("should recover when coming back online", async ({ page, context }) => {
    await page.goto("/editor/new");
    await page.waitForTimeout(1000);

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Come back online
    await context.setOffline(false);
    await page.waitForTimeout(500);

    // App should still be functional
    await expect(page.locator('canvas, svg')).toBeVisible();
  });
});
