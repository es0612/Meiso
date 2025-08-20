import { test, expect } from '@playwright/test';

test.describe('Meditation Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to meditation page and start session', async ({ page }) => {
    // Navigate to meditation page
    await page.click('text=瞑想を始める');
    await expect(page).toHaveURL('/meditation');

    // Check that meditation page loads
    await expect(page.locator('h1')).toContainText('瞑想スクリプトを選択');

    // Select a meditation script (assuming default is already selected)
    const startButton = page.locator('text=瞑想を開始');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Check that session controller appears
    await expect(page.locator('[data-testid="meditation-timer"]')).toBeVisible({ timeout: 10000 });
  });

  test('should be able to pause and resume meditation session', async ({ page }) => {
    // Navigate to meditation page and start session
    await page.click('text=瞑想を始める');
    await page.waitForSelector('text=瞑想を開始');
    await page.click('text=瞑想を開始');

    // Wait for timer to start
    await page.waitForSelector('[data-testid="meditation-timer"]');

    // Test pause functionality
    const pauseButton = page.locator('[data-testid="pause-button"]');
    if (await pauseButton.isVisible()) {
      await pauseButton.click();
      
      // Check if timer is paused
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();
      
      // Resume meditation
      await page.click('[data-testid="resume-button"]');
      await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    }
  });

  test('should complete meditation session and save to history', async ({ page }) => {
    // Navigate to meditation page
    await page.click('text=瞑想を始める');
    await page.waitForSelector('text=瞑想を開始');
    await page.click('text=瞑想を開始');

    // Wait for timer
    await page.waitForSelector('[data-testid="meditation-timer"]');

    // Let session run for a bit (in real test, we'd fast-forward time)
    await page.waitForTimeout(2000);

    // Stop session early or wait for completion
    const stopButton = page.locator('[data-testid="stop-button"]');
    if (await stopButton.isVisible()) {
      await stopButton.click();
    }

    // Check session completion feedback
    await expect(page.locator('text=お疲れ様でした')).toBeVisible({
      timeout: 10000
    });

    // Navigate to history to verify session was saved
    await page.click('text=履歴');
    await expect(page).toHaveURL('/history');
    
    // Check that session appears in history
    await expect(page.locator('[data-testid="session-history"]')).toBeVisible();
  });

  test('should work with different meditation scripts', async ({ page }) => {
    await page.click('text=瞑想を始める');
    await page.waitForSelector('h1:has-text("瞑想スクリプトを選択")');

    // Check if multiple scripts are available
    const scripts = page.locator('[data-testid="script-card"]');
    const scriptCount = await scripts.count();

    if (scriptCount > 1) {
      // Select a different script
      await scripts.nth(1).click();
      
      // Verify script selection
      await expect(page.locator('text=選択中:')).toBeVisible();
      
      // Start meditation with selected script
      await page.click('text=瞑想を開始');
      await expect(page.locator('[data-testid="meditation-timer"]')).toBeVisible();
    }
  });

  test('should handle audio controls', async ({ page }) => {
    await page.click('text=瞑想を始める');
    await page.waitForSelector('text=瞑想を開始');
    await page.click('text=瞑想を開始');

    // Wait for session to start
    await page.waitForSelector('[data-testid="meditation-timer"]');

    // Test audio mute/unmute
    const muteButton = page.locator('[data-testid="mute-button"]');
    if (await muteButton.isVisible()) {
      await muteButton.click();
      await expect(page.locator('[data-testid="unmute-button"]')).toBeVisible();
      
      await page.click('[data-testid="unmute-button"]');
      await expect(muteButton).toBeVisible();
    }

    // Test volume control
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    if (await volumeSlider.isVisible()) {
      await volumeSlider.fill('0.5');
      // Could add assertions about volume level if exposed
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/meditation');

    // Check that mobile layout is properly displayed
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=瞑想スクリプトを選択')).toBeVisible();

    // Test navigation menu on mobile
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/meditation');

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to start meditation with Enter key
    await page.keyboard.press('Enter');
    
    // Check if meditation started
    await expect(page.locator('[data-testid="meditation-timer"]')).toBeVisible({
      timeout: 5000
    });

    // Test space bar for pause/resume
    await page.keyboard.press('Space');
    // Could add assertions for pause state if exposed
  });
});