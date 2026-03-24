import { test, expect } from '@playwright/test'

/**
 * E2E tests for slide management: add, select, undo.
 *
 * Ukrainian string reference (ua.json):
 *   slides.addSlide    → "Додати слайд"
 *   slides.type.title  → "Титульний"
 *   slides.type.chart  → "Діаграма"
 *   canvas.noSlide     → "Оберіть слайд для перегляду"
 *   canvas.slideOf     → "Слайд {{current}} з {{total}}"
 *
 * SlideCard aria-label is built as: `${slides.type.<type>} ${index + 1}`
 *   e.g. "Титульний 1", "Діаграма 2"
 */
test.describe('slide management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('adds a title slide and shows it in the slide panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Титульний' }).click()
    await expect(page.getByRole('button', { name: 'Титульний 1' })).toBeVisible()
  })

  test('selecting a slide replaces the canvas placeholder with the slide', async ({ page }) => {
    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Титульний' }).click()
    await page.getByRole('button', { name: 'Титульний 1' }).click()

    await expect(page.getByText('Оберіть слайд для перегляду')).not.toBeVisible()
    // Status bar shows "Слайд 1 з 1" when slide 1 of 1 is selected
    await expect(page.getByText('Слайд 1 з 1')).toBeVisible()
  })

  test('Ctrl+Z undoes adding a slide', async ({ page }) => {
    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Титульний' }).click()
    await expect(page.getByRole('button', { name: 'Титульний 1' })).toBeVisible()

    await page.keyboard.press('Control+z')

    await expect(page.getByRole('button', { name: 'Титульний 1' })).not.toBeVisible()
    await expect(page.getByText('Оберіть слайд для перегляду')).toBeVisible()
  })

  test('Ctrl+Shift+Z redoes after undo', async ({ page }) => {
    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Титульний' }).click()
    await expect(page.getByRole('button', { name: 'Титульний 1' })).toBeVisible()

    await page.keyboard.press('Control+z')
    await expect(page.getByRole('button', { name: 'Титульний 1' })).not.toBeVisible()

    await page.keyboard.press('Control+Shift+z')
    await expect(page.getByRole('button', { name: 'Титульний 1' })).toBeVisible()
  })

  test('adds two different slide types and numbers them sequentially', async ({ page }) => {
    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Титульний' }).click()

    await page.getByRole('button', { name: 'Додати слайд' }).click()
    await page.getByRole('menuitem', { name: 'Діаграма' }).click()

    await expect(page.getByRole('button', { name: 'Титульний 1' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Діаграма 2' })).toBeVisible()
  })
})
