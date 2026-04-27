import { Page, Locator } from '@playwright/test';

export class RunnerPage {
  readonly collectionDropdown: Locator;
  readonly iterationsInput: Locator;
  readonly runBtn: Locator;

  constructor(page: Page) {
    // Выпадающий список коллекций - используем разные варианты
    this.collectionDropdown = page.locator('select, [role="combobox"], [class*="select"], [class*="dropdown"], input[role="combobox"]').first();
    
    // Поле ввода итераций - используем более общие селекторы
    this.iterationsInput = page.locator('input[type="number"], input[placeholder*="iteration"], input[placeholder*="Iteration"], input[placeholder*="Итерации"]').first();
    
    // Кнопка запуска - используем разные варианты названия
    this.runBtn = page.getByRole('button', { name: /Запустить|Run|Start|Execute/i });
  }
}
