import { Page, Locator } from '@playwright/test';

export class HttpPage {
  readonly page: Page;

  // Локаторы боковой панели
  readonly newCollectionInput: Locator;
  readonly emptyCollectionText: Locator;

  // Локаторы основной панели
  readonly methodDropdown: Locator;
  readonly urlInput: Locator;
  readonly sendBtn: Locator;
  
  // Зона ответа
  readonly responseEmptyPlaceholder: Locator;

  constructor(page: Page) {
    this.page = page;

    // Инициализация локаторов
    this.newCollectionInput = page.getByPlaceholder('Новая коллекция');
    this.emptyCollectionText = page.getByText('Нет запросов');

    // Метод - может быть GET, POST и т.д.
    this.methodDropdown = page.getByText('GET');
    
    // URL input - используем более общий placeholder
    this.urlInput = page.locator('input[placeholder*="api"], input[placeholder*="http"], input[type="url"], input[class*="url"]').first();
    
    // Кнопка Send
    this.sendBtn = page.getByRole('button', { name: /Send|Отправить/i });
    
    // Placeholder ответа
    this.responseEmptyPlaceholder = page.getByText(/Response|Ответ|empty/i);
  }
}