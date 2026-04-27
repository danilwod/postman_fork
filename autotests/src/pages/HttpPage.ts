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
    this.newCollectionInput = page.getByPlaceholder('Новая коллекция...');
    this.emptyCollectionText = page.getByText('Нет запросов');

    this.methodDropdown = page.getByText('GET'); 
    this.urlInput = page.getByPlaceholder('https://api.example.com/v1/endpoint');
    this.sendBtn = page.getByRole('button', { name: 'Send' });
    this.responseEmptyPlaceholder = page.getByText('Response will appear here');
  }
}
