import { test, expect } from '@playwright/test'

/**
 * Core smoke tests for the app shell.
 *
 * The app defaults to Ukrainian (lng: 'ua'), so all visible strings are in UA.
 * Tests use role-based selectors where possible; Ukrainian text only where a
 * semantic role is not available.
 */
test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page title is Report Builder', async ({ page }) => {
    await expect(page).toHaveTitle('Report Builder')
  })

  test('shows the Add Slide button in the slide panel', async ({ page }) => {
    // ua: slides.addSlide = "Додати слайд"
    await expect(page.getByRole('button', { name: 'Додати слайд' })).toBeVisible()
  })

  test('canvas shows placeholder when no slide is selected', async ({ page }) => {
    // ua: canvas.noSlide = "Оберіть слайд для перегляду"
    await expect(page.getByText('Оберіть слайд для перегляду')).toBeVisible()
  })

  test('properties panel shows placeholder when no slide is selected', async ({ page }) => {
    // ua: editors.noSelection = "Оберіть слайд для редагування властивостей."
    await expect(page.getByText('Оберіть слайд для редагування властивостей.')).toBeVisible()
  })

  test('built HTML script tag has no type=module or crossorigin attribute', async ({ request }) => {
    // Verifies the file:// CORS fix: the built index.html must not contain
    // type="module" (which Chrome blocks from null-origin file:// URLs).
    const response = await request.get('/')
    const html = await response.text()
    expect(html).not.toContain('type="module"')
    expect(html).not.toContain('crossorigin')
  })
})
