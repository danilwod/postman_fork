import { Page, Locator } from '@playwright/test';

export class HistoryPage {
  readonly searchInput: Locator;
  readonly filterAll: Locator;
  readonly filter2xx: Locator;
  readonly filterErr: Locator;
  readonly clearBtn: Locator;

  constructor(page: Page) {
    // Поле поиска истории - используем несколько вариантов
    this.searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[type="text"]').first();
    
    // Фильтры - используем частичное совпадение и разные варианты
    this.filterAll = page.getByText('All');
    this.filter2xx = page.getByText('2xx');
    this.filterErr = page.getByText('Err');
    
    // Кнопка очистки
    this.clearBtn = page.getByText('Clear');
  }
}