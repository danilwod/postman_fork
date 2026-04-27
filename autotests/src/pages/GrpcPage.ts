import { Page, Locator } from '@playwright/test';

export class GrpcPage {
  readonly loadProtoBtn: Locator;
  readonly addressInput: Locator;
  readonly tlsCheckbox: Locator;
  readonly sendBtn: Locator;
  readonly bodyTab: Locator;
  readonly jsonEditor: Locator;

  constructor(page: Page) {
    // Кнопка загрузки .proto файла
    this.loadProtoBtn = page.getByRole('button', { name: /Load|\.proto|Прото/i });
    
    // Поле ввода адреса сервера
    this.addressInput = page.locator('input[placeholder*="localhost"], input[placeholder*="50051"], input[type="text"]').first();
    
    // TLS чекбокс
    this.tlsCheckbox = page.locator('input[type="checkbox"], [role="checkbox"], label:has-text("TLS")').first();
    
    // Кнопка отправки
    this.sendBtn = page.getByRole('button', { name: /Send|Отправить/i });
    
    // Вкладка Body
    this.bodyTab = page.getByText('Body');
    
    // JSON редактор - используем разные варианты
    this.jsonEditor = page.locator('[class*="json"], [class*="editor"], textarea, pre[contenteditable="true"]').first();
  }
}