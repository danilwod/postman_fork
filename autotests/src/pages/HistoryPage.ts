import { Page, Locator } from '@playwright/test';

export class HistoryPage {
  readonly searchInput: Locator;
  readonly filterAll: Locator;
  readonly filter2xx: Locator;
  readonly filterErr: Locator;
  readonly clearBtn: Locator;

  constructor(page: Page) {
    this.searchInput = page.getByPlaceholder('Search history...');
    this.filterAll = page.getByText('All', { exact: true });
    this.filter2xx = page.getByText('2xx');
    this.filterErr = page.getByText('Err');
    this.clearBtn = page.getByText('Clear');
  }
}
