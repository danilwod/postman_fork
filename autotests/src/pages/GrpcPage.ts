import { Page, Locator } from '@playwright/test';

export class GrpcPage {
  readonly loadProtoBtn: Locator;
  readonly addressInput: Locator;
  readonly tlsCheckbox: Locator;
  readonly sendBtn: Locator;
  readonly bodyTab: Locator;
  readonly jsonEditor: Locator; // Поле ввода JSON

  constructor(page: Page) {
    this.loadProtoBtn = page.getByText('Load .proto');
    this.addressInput = page.getByPlaceholder('localhost:50051'); // или getByText, зависит от реализации
    this.tlsCheckbox = page.getByLabel('TLS'); // Если это чекбокс
    this.sendBtn = page.getByRole('button', { name: 'Send' });
    this.bodyTab = page.getByText('Body', { exact: true });
    this.jsonEditor = page.locator('.json-editor-class'); // Тут придется поискать через Инспектор
  }
}
