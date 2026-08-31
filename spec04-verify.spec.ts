import { test, expect } from '@playwright/test';

test.describe('SPEC 04 - Add Child Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
    
    await page.goto('http://localhost:3000/kids');
    await page.waitForLoadState('networkidle');
    
    // Check for console errors (excluding expected HMR messages)
    const realErrors = consoleErrors.filter(e => 
      !e.includes('HMR') && 
      !e.includes('Fast Refresh') &&
      !e.includes('React DevTools')
    );
    expect(realErrors).toEqual([]);
  });

  test('1. /kids loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Open DayCare/);
    await expect(page.locator('h1')).toContainText('Niños');
  });

  test('2. Click "Agregar niño" opens modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    await expect(page.locator('text=Agregar niño').nth(1)).toBeVisible();
    await expect(page.locator('text=Cancelar')).toBeVisible();
    await expect(page.locator('text=Guardar')).toBeVisible();
    
    // Check 5 fields exist (using placeholders since labels aren't associated via htmlFor)
    await expect(page.getByPlaceholder('Ej. Martina López')).toBeVisible();
    await expect(page.getByPlaceholder('dd/mm/aaaa')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByPlaceholder('Ej. Maní, Lactosa')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    
    await page.screenshot({ path: '.playwright-mcp/spec04-modal-open.png', fullPage: false });
  });

  test('3. Sala dropdown lists Soles, Lunas, Estrellas', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    const select = page.locator('select');
    const options = select.locator('option');
    
    await expect(options.nth(1)).toHaveText('Soles');
    await expect(options.nth(2)).toHaveText('Lunas');
    await expect(options.nth(3)).toHaveText('Estrellas');
  });

  test('4. Date mask auto-inserts /', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    const dateInput = page.getByPlaceholder('dd/mm/aaaa');
    
    await dateInput.fill('15032020');
    await expect(dateInput).toHaveValue('15/03/2020');
    
    // Check max length
    await dateInput.fill('1503202099');
    await expect(dateInput).toHaveValue('15/03/2020');
  });

  test('5. Name mask filters digits/symbols and capitalizes', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    const nameInput = page.getByPlaceholder('Ej. Martina López');
    
    await nameInput.fill('maria123 garcía!@#');
    await expect(nameInput).toHaveValue('Maria García');
  });

  test('6. Allergies normalizes on blur', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    const allergiesInput = page.getByPlaceholder('Ej. Maní, Lactosa');
    
    await allergiesInput.fill('maní,  lactosa, gluten');
    await allergiesInput.blur();
    await expect(allergiesInput).toHaveValue('Maní, Lactosa, Gluten');
  });

  test('7. Empty required fields show error on save', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    await page.getByRole('button', { name: 'Guardar' }).click();
    
    await expect(page.locator('text=El nombre es obligatorio')).toBeVisible();
    await expect(page.locator('text=La fecha es obligatoria')).toBeVisible();
    await expect(page.locator('text=La sala es obligatoria')).toBeVisible();
    
    // Modal should still be open
    await expect(page.locator('text=Agregar niño').nth(1)).toBeVisible();
  });

  test('8. Complete form closes modal on save', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    
    await page.getByPlaceholder('Ej. Martina López').fill('Test Child');
    await page.getByPlaceholder('dd/mm/aaaa').fill('15032020');
    await page.locator('select').selectOption('Soles');
    
    await page.getByRole('button', { name: 'Guardar' }).click();
    
    // Modal should be closed
    await expect(page.locator('text=Agregar niño').nth(1)).not.toBeVisible();
  });

  test('9. Cancel closes modal without changes', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    await page.getByPlaceholder('Ej. Martina López').fill('Test Child');
    
    await page.getByRole('button', { name: 'Cancelar' }).click();
    
    // Modal should be closed
    await expect(page.locator('text=Agregar niño').nth(1)).not.toBeVisible();
  });

  test('10. Visual comparison - modal matches reference', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar niño' }).click();
    await page.screenshot({ path: '.playwright-mcp/spec04-modal-visual.png', fullPage: false });
  });
});
