import { Page, Locator } from '@playwright/test';

export class EnvPage {
  readonly sidebarGlobalTab: Locator;
  readonly addVariableRow: Locator; // Поле добавления новой переменной
  readonly baseUrlInput: Locator;   // Строка со значением baseUrl
  readonly extractBtn: Locator;     // Кнопка Extract from response

  constructor(page: Page) {
    this.sidebarGlobalTab = page.getByText('Global');
    this.addVariableRow = page.getByText('Нет переменных. Добавьте первую ниже.');
    this.baseUrlInput = page.getByPlaceholder('https://api.example.com');
    this.extractBtn = page.getByRole('button', { name: 'Extract from response' });
  }
}
