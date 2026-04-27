import { Page, Locator } from '@playwright/test';

export class GenPage {
  readonly dropzone: Locator; // Область "Перетащите JSON/YAML"
  readonly openFileBtn: Locator;
  readonly apiUrlInput: Locator;
  readonly frameworkDropdown: Locator; // Выбор pytest (Python)
  readonly negativeTestsCheckbox: Locator;
  readonly generateBtn: Locator;
  readonly saveFileBtn: Locator;

  constructor(page: Page) {
    this.dropzone = page.getByText('Перетащите JSON/YAML или нажмите');
    this.openFileBtn = page.getByRole('button', { name: 'Открыть файл' });
    this.apiUrlInput = page.getByPlaceholder('https://api.example.com');
    this.frameworkDropdown = page.locator('select'); // Нужно уточнить через инспектор
    this.negativeTestsCheckbox = page.getByLabel('Негативные тесты');
    this.generateBtn = page.getByRole('button', { name: 'Сгенерировать' });
    this.saveFileBtn = page.getByRole('button', { name: 'Сохранить файл' });
  }
}
