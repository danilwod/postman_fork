import { Page, Locator } from '@playwright/test';

export class EvaPage {
  readonly testFolderTab: Locator;
  readonly zipArchiveTab: Locator;
  readonly uploadZipBtn: Locator;

  constructor(page: Page) {
    // Вкладка "Папка с тестами" - используем частичное совпадение
    this.testFolderTab = page.getByText('Папка с тестами');
    
    // Вкладка "ZIP-архив"
    this.zipArchiveTab = page.getByText('ZIP-архив');
    
    // Кнопка выбора ZIP-архива - может быть несколько вариантов
    this.uploadZipBtn = page.locator('button:has-text("Выбрать"), button:has-text("ZIP"), input[type="file"]').first();
  }
}