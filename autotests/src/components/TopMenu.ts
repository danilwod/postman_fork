import { Page, Locator } from '@playwright/test';

export class TopMenu {
  readonly btnEnv: Locator;
  readonly btnHttp: Locator;
  readonly btnGrpc: Locator;
  readonly btnGenerator: Locator;
  readonly btnRunner: Locator;
  readonly btnHistory: Locator;
  readonly btnEva: Locator;

  constructor(page: Page) {
    this.btnEnv = page.getByText('ENV', { exact: true });
    this.btnHttp = page.getByText('HTTP', { exact: true });
    this.btnGrpc = page.getByText('gRPC', { exact: true });
    this.btnGenerator = page.getByText('Generator', { exact: true });
    this.btnRunner = page.getByText('Runner', { exact: true });
    this.btnHistory = page.getByText('History', { exact: true });
    this.btnEva = page.getByText('EVA', { exact: true });
  }
}
