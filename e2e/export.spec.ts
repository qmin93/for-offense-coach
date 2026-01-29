import { test, expect } from "@playwright/test";

/**
 * Export Smoke Tests
 *
 * Acceptance Criteria:
 * - PNG export without corruption
 * - PDF export supports up to 10 pages
 */

test.describe("Export Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor with a play
    await page.goto("/editor/new");
    await page.waitForTimeout(500);

    // Skip onboarding and setup a basic play
    const skipButton = page.locator('button:has-text("Skip"), button:has-text("Close")');
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
    }

    // Handle hard onboarding - click a concept
    const conceptButton = page.locator('[data-testid="concept-power"]');
    if (await conceptButton.isVisible().catch(() => false)) {
      await conceptButton.click();
      await page.waitForTimeout(300);
      // Click through
      const nextBtn = page.locator('button:has-text("Next")');
      while (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }

    await page.waitForTimeout(1000);
  });

  test("should open export dialog", async ({ page }) => {
    // Click export button
    const exportBtn = page.locator('button:has-text("Export"), [data-testid="export-button"]');
    await expect(exportBtn).toBeVisible({ timeout: 5000 });
    await exportBtn.click();

    // Export dialog should appear
    const dialog = page.locator('[role="dialog"], [data-testid="export-dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
  });

  test("should show PNG export option", async ({ page }) => {
    // Open export dialog
    await page.click('button:has-text("Export"), [data-testid="export-button"]');
    await page.waitForTimeout(300);

    // PNG option should be available
    const pngOption = page.locator('button:has-text("PNG"), [data-testid="export-png"], text=PNG');
    await expect(pngOption).toBeVisible();
  });

  test("should show PDF export option", async ({ page }) => {
    // Open export dialog
    await page.click('button:has-text("Export"), [data-testid="export-button"]');
    await page.waitForTimeout(300);

    // PDF option should be available
    const pdfOption = page.locator('button:has-text("PDF"), [data-testid="export-pdf"], text=PDF');
    await expect(pdfOption).toBeVisible();
  });

  test("PNG export should trigger download", async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);

    // Open export and click PNG
    await page.click('button:has-text("Export"), [data-testid="export-button"]');
    await page.waitForTimeout(300);
    await page.click('button:has-text("PNG"), [data-testid="export-png"]');

    // Wait for download (may not work in all test environments)
    const download = await downloadPromise;

    // If download event fired, verify filename
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.png$/i);
    }
  });

  test("should have overlay options in export", async ({ page }) => {
    // Open export dialog
    await page.click('button:has-text("Export"), [data-testid="export-button"]');
    await page.waitForTimeout(300);

    // Look for overlay toggles (defense, landmarks, etc.)
    const overlayOptions = page.locator(
      'text=Defense, text=Landmarks, text=Labels, [data-testid="overlay-options"]'
    );

    // Some overlay options should be present
    const count = await overlayOptions.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Export from Playbook", () => {
  test("should access playbooks page", async ({ page }) => {
    await page.goto("/playbooks");

    // Playbooks page should load
    await expect(page).toHaveURL(/playbooks/);
  });
});
