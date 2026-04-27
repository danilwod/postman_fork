import { Page, Locator } from '@playwright/test';

export class RunnerPage {
  readonly collectionDropdown: Locator;
  readonly iterationsInput: Locator;
  readonly runBtn: Locator;

  constructor(page: Page) {
    // В Инспекторе найди этот выпадающий список
    this.collectionDropdown = page.locator('.collection-select-class'); 
    this.iterationsInput = page.locator('input[type="number"]').first(); // Пример
    this.runBtn = page.getByRole('button', { name: 'Запустить' });
  }
}
