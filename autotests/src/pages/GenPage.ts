import { Page, Locator } from '@playwright/test';

export class GenPage {
  readonly dropzone: Locator;
  readonly openFileBtn: Locator;
  readonly apiUrlInput: Locator;
  readonly frameworkDropdown: Locator;
  readonly negativeTestsCheckbox: Locator;
  readonly generateBtn: Locator;
  readonly saveFileBtn: Locator;

  constructor(page: Page) {
    // Dropzone - область для перетаскивания файлов - используем более общие селекторы
    this.dropzone = page.locator('[class*="drop"], [class*="Drop"], div:has-text("Перетащите"), div:has-text("перетащите"), .upload-zone, [role="button"]').first();
    
    // Кнопка открытия файла
    this.openFileBtn = page.getByRole('button', { name: /Открыть|Open|Файл/i });
    
    // Поле ввода API URL - используем более общие селекторы
    this.apiUrlInput = page.locator('input[placeholder*="api"], input[placeholder*="API"], input[type="url"], input[type="text"][placeholder*="http"], input[placeholder*="http"]').first();
    
    // Выпадающий список фреймворка
    this.frameworkDropdown = page.locator('select, [role="combobox"], [class*="select"]').first();
    
    // Чекбокс негативных тестов
    this.negativeTestsCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    
    // Кнопка генерации
    this.generateBtn = page.getByRole('button', { name: /Сгенерировать|Generate|Генерация/i });
    
    // Кнопка сохранения файла
    this.saveFileBtn = page.getByRole('button', { name: /Сохранить|Save|Скачать/i });
  }
}
