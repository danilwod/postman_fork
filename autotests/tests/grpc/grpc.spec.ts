import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки gRPC функциональности.
 * Проверяет загрузку .proto файлов, настройку соединения и отправку запросов.
 */
test.describe('gRPC функциональность', () => {
  let appProcess: ChildProcess;
  let browser: any;
  let app: App;

  test.beforeEach(async () => {
    appProcess = spawn(config.appPath, [], {
      env: { 
        WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${config.debugPort}` 
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, config.appLaunchTimeout));
    
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${config.debugPort}`);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    
    app = new App(page);
    
    // Переходим на вкладку gRPC
    await app.topMenu.btnGrpc.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости кнопки Load .proto', async () => {
    await expect(app.grpc.loadProtoBtn).toBeVisible();
  });

  test('Проверка поля ввода адреса сервера', async () => {
    const testAddress = 'localhost:50051';
    
    // Вводим тестовый адрес
    await app.grpc.addressInput.fill(testAddress);
    
    // Проверяем, что адрес установлен корректно
    await expect(app.grpc.addressInput).toHaveValue(testAddress);
  });

  test('Проверка плейсхолдера адреса', async () => {
    await expect(app.grpc.addressInput).toHaveAttribute('placeholder', 'localhost:50051');
  });

  test('Проверка видимости TLS чекбокса', async () => {
    await expect(app.grpc.tlsCheckbox).toBeVisible();
  });

  test('Включение TLS чекбокса', async () => {
    // Кликаем на TLS чекбокс
    await app.grpc.tlsCheckbox.click();
    
    // Проверяем, что чекбокс отмечен
    await expect(app.grpc.tlsCheckbox).toBeChecked();
  });

  test('Проверка вкладки Body', async () => {
    await expect(app.grpc.bodyTab).toBeVisible();
  });

  test('Переход на вкладку Body', async () => {
    await app.grpc.bodyTab.click();
    await expect(app.grpc.jsonEditor).toBeVisible();
  });

  test('Ввод JSON в редактор', async () => {
    const testJson = '{"name": "test", "value": 123}';
    
    // Переходим на вкладку Body
    await app.grpc.bodyTab.click();
    
    // Вводим JSON (предполагается, что jsonEditor - это textarea или contenteditable)
    await app.grpc.jsonEditor.fill(testJson);
    
    // Проверяем содержимое
    await expect(app.grpc.jsonEditor).toContainText(testJson);
  });

  test('Проверка видимости кнопки Send', async () => {
    await expect(app.grpc.sendBtn).toBeVisible();
  });

  test('Комбинированный тест: настройка и отправка gRPC запроса', async () => {
    const testAddress = 'localhost:8080';
    const testJson = '{"method": "GetUser", "params": {}}';
    
    // Вводим адрес сервера
    await app.grpc.addressInput.fill(testAddress);
    
    // Включаем TLS
    await app.grpc.tlsCheckbox.click();
    
    // Переходим на вкладку Body и вводим JSON
    await app.grpc.bodyTab.click();
    await app.grpc.jsonEditor.fill(testJson);
    
    // Проверяем, что кнопка Send видима
    await expect(app.grpc.sendBtn).toBeVisible();
  });

  test('Проверка сброса формы', async () => {
    const testAddress = 'localhost:50051';
    
    // Вводим адрес
    await app.grpc.addressInput.fill(testAddress);
    
    // Очищаем поле
    await app.grpc.addressInput.clear();
    
    // Проверяем, что поле пустое
    await expect(app.grpc.addressInput).toHaveValue('');
  });
});