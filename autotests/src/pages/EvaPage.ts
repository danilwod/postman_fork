import { Page, Locator } from '@playwright/test';

export class EvaPage {
  readonly testFolderTab: Locator;
  readonly zipArchiveTab: Locator;
  readonly uploadZipBtn: Locator;

  constructor(page: Page) {
    this.testFolderTab = page.getByText('Папка с тестами');
    this.zipArchiveTab = page.getByText('ZIP-архив');
    this.uploadZipBtn = page.getByRole('button', { name: 'Выбрать ZIP-архив' });
  }
}
