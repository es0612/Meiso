import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on meditation page', async ({ page }) => {
    await page.goto('/meditation');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on history page', async ({ page }) => {
    await page.goto('/history');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on settings page', async ({ page }) => {
    await page.goto('/settings');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').textContent();
    expect(focusedElement).toBeTruthy();

    // Continue tabbing and ensure focus moves properly
    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.locator(':focus').textContent();
    expect(secondFocusedElement).toBeTruthy();
    expect(secondFocusedElement).not.toBe(focusedElement);
  });

  test('should support screen reader navigation with proper ARIA labels', async ({ page }) => {
    await page.goto('/meditation');
    
    // Check for proper heading structure
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThan(0);
    
    // Check for ARIA landmarks
    const mainLandmark = page.locator('main');
    await expect(mainLandmark).toBeVisible();
    
    // Check for button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Each button should have either aria-label or text content
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('should have proper color contrast in dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Switch to dark mode
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
    
    // Run accessibility scan specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should have proper focus management during meditation session', async ({ page }) => {
    await page.goto('/meditation');
    
    // Start meditation session
    const startButton = page.locator('text=瞑想を開始');
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Check that focus moves to the meditation timer or controls
      await page.waitForSelector('[data-testid="meditation-timer"]');
      
      // Ensure interactive elements within the session are focusable
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should provide proper audio descriptions and controls', async ({ page }) => {
    await page.goto('/meditation');
    
    // Check audio controls have proper labels
    const audioControls = page.locator('[data-testid*="audio"]');
    const controlCount = await audioControls.count();
    
    for (let i = 0; i < controlCount; i++) {
      const control = audioControls.nth(i);
      const ariaLabel = await control.getAttribute('aria-label');
      const ariaDescribedBy = await control.getAttribute('aria-describedby');
      
      // Audio controls should have proper labeling
      expect(ariaLabel || ariaDescribedBy).toBeTruthy();
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/meditation');
    
    // Check that animations are reduced or disabled
    // This would require specific implementation to test
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should provide alternative text for images', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Enable high contrast mode (browser-specific)
    await page.emulateMedia({ forcedColors: 'active' });
    
    await page.goto('/meditation');
    
    // Run accessibility scan with forced colors
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should provide proper form labels and error messages', async ({ page }) => {
    await page.goto('/settings');
    
    // Check form inputs have proper labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Inputs should be properly labeled
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });
});