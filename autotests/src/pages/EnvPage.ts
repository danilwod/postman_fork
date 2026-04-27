import { Page, Locator } from '@playwright/test';

export class EnvPage {
  readonly sidebarGlobalTab: Locator;
  readonly addVariableRow: Locator;
  readonly baseUrlInput: Locator;
  readonly extractBtn: Locator;

  constructor(page: Page) {
    // Вкладка Global в сайдбаре
    this.sidebarGlobalTab = page.getByText('Global');
    
    // Заглушка при отсутствии переменных
    this.addVariableRow = page.getByText('Нет переменных');
    
    // Поле ввода baseUrl - используем более общий селектор
    this.baseUrlInput = page.locator('input[placeholder*="api.example.com"]').first();
    
    // Кнопка Extract from response - может быть на другой вкладке
    this.extractBtn = page.getByRole('button', { name: /Extract/i });
  }
}