import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Расширенные тесты для проверки gRPC функциональности.
 * Проверяет загрузку proto файлов, настройку соединения и отправку запросов.
 */
test.describe('Расширенные тесты gRPC', () => {
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

  test('Проверка видимости всех элементов gRPC', async () => {
    await expect(app.grpc.loadProtoBtn).toBeVisible();
    await expect(app.grpc.addressInput).toBeVisible();
    await expect(app.grpc.tlsCheckbox).toBeVisible();
    await expect(app.grpc.sendBtn).toBeVisible();
    await expect(app.grpc.bodyTab).toBeVisible();
    await expect(app.grpc.jsonEditor).toBeVisible();
  });

  test('Ввод адреса сервера', async () => {
    const addresses = [
      'localhost:50051',
      'localhost:8080',
      '127.0.0.1:50051',
      'api.example.com:443',
      'grpc.server.com:9000'
    ];

    for (const addr of addresses) {
      await app.grpc.addressInput.fill(addr);
      await expect(app.grpc.addressInput).toHaveValue(addr);
    }
  });

  test('Очистка адреса сервера', async () => {
    await app.grpc.addressInput.fill('localhost:50051');
    await expect(app.grpc.addressInput).toHaveValue('localhost:50051');
    
    await app.grpc.addressInput.clear();
    await expect(app.grpc.addressInput).toHaveValue('');
  });

  test('TLS чекбокс - включение и выключение', async () => {
    // Проверяем начальное состояние
    await expect(app.grpc.tlsCheckbox).toBeVisible();
    
    // Включаем
    await app.grpc.tlsCheckbox.click();
    await expect(app.grpc.tlsCheckbox).toBeChecked();
    
    // Выключаем
    await app.grpc.tlsCheckbox.click();
    await expect(app.grpc.tlsCheckbox).not.toBeChecked();
    
    // Снова включаем
    await app.grpc.tlsCheckbox.click();
    await expect(app.grpc.tlsCheckbox).toBeChecked();
  });

  test('Вкладка Body - клик и активация', async () => {
    await app.grpc.bodyTab.click();
    await expect(app.grpc.jsonEditor).toBeVisible();
  });

  test('Ввод JSON в редактор', async () => {
    await app.grpc.bodyTab.click();
    
    const testJsons = [
      '{"name": "test", "value": 123}',
      '{"user": {"id": 1, "name": "John"}}',
      '{"items": [1, 2, 3]}',
      '{"enabled": true, "count": 0}',
      '{"nested": {"deep": {"value": "test"}}}'
    ];

    for (const json of testJsons) {
      await app.grpc.jsonEditor.fill(json);
      await expect(app.grpc.jsonEditor).toContainText(json);
    }
  });

  test('Очистка JSON редактора', async () => {
    await app.grpc.bodyTab.click();
    
    const testJson = '{"test": "data"}';
    await app.grpc.jsonEditor.fill(testJson);
    await expect(app.grpc.jsonEditor).toContainText(testJson);
    
    await app.grpc.jsonEditor.clear();
    await expect(app.grpc.jsonEditor).toHaveText('');
  });

  test('Кнопка Send - видимость и клик', async () => {
    await expect(app.grpc.sendBtn).toBeVisible();
    await expect(app.grpc.sendBtn).toBeEnabled();
    
    await app.grpc.sendBtn.click();
  });

  test('Кнопка Load Proto - видимость и клик', async () => {
    await expect(app.grpc.loadProtoBtn).toBeVisible();
    await expect(app.grpc.loadProtoBtn).toBeEnabled();
    
    await app.grpc.loadProtoBtn.click();
  });

  test('Многократный клик по кнопке Send', async () => {
    for (let i = 0; i < 5; i++) {
      await app.grpc.sendBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('Плейсхолдер адреса сервера', async () => {
    await expect(app.grpc.addressInput).toHaveAttribute('placeholder', 'localhost:50051');
  });

  test('Сохранение адреса при переключении вкладок', async () => {
    const testAddress = 'localhost:9999';
    
    // Вводим адрес
    await app.grpc.addressInput.fill(testAddress);
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    await app.topMenu.btnEnv.click();
    
    // Возвращаемся
    await app.topMenu.btnGrpc.click();
    
    // Проверяем сохранение
    await expect(app.grpc.addressInput).toHaveValue(testAddress);
  });

  test('Сохранение JSON при переключении вкладок', async () => {
    const testJson = '{"persistent": "data"}';
    
    // Вводим JSON
    await app.grpc.bodyTab.click();
    await app.grpc.jsonEditor.fill(testJson);
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    
    // Возвращаемся
    await app.topMenu.btnGrpc.click();
    await app.grpc.bodyTab.click();
    
    // Проверяем сохранение
    await expect(app.grpc.jsonEditor).toContainText(testJson);
  });

  test('Сохранение TLS состояния при переключении', async () => {
    // Включаем TLS
    await app.grpc.tlsCheckbox.click();
    await expect(app.grpc.tlsCheckbox).toBeChecked();
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    
    // Возвращаемся
    await app.topMenu.btnGrpc.click();
    
    // Проверяем сохранение
    await expect(app.grpc.tlsCheckbox).toBeChecked();
  });

  test('Специальные символы в адресе', async () => {
    const specialAddresses = [
      'localhost:50051/path',
      'host:port?query=value',
      'user@host:port',
      'host:port#fragment'
    ];

    for (const addr of specialAddresses) {
      await app.grpc.addressInput.fill(addr);
      await expect(app.grpc.addressInput).toHaveValue(addr);
    }
  });

  test('Некорректные адреса', async () => {
    const invalidAddresses = [
      'not-an-address',
      'localhost',
      ':50051',
      'localhost:',
      'localhost:abc',
      'localhost:99999',
      'localhost:-1'
    ];

    for (const addr of invalidAddresses) {
      await app.grpc.addressInput.fill(addr);
      await expect(app.grpc.addressInput).toHaveValue(addr);
    }
  });

  test('Длинный адрес сервера', async () => {
    const longAddress = 'very-long-subdomain-name.very-long-domain-name.example.com:50051';
    
    await app.grpc.addressInput.fill(longAddress);
    await expect(app.grpc.addressInput).toHaveValue(longAddress);
  });

  test('Быстрый ввод адресов', async () => {
    for (let i = 0; i < 10; i++) {
      await app.grpc.addressInput.fill(`localhost:${5000 + i}`);
    }
    await expect(app.grpc.addressInput).toHaveValue('localhost:5009');
  });

  test('Ввод emoji в адрес', async () => {
    const emojiAddress = 'localhost:50051🚀';
    
    await app.grpc.addressInput.fill(emojiAddress);
    await expect(app.grpc.addressInput).toHaveValue(emojiAddress);
  });

  test('Hover эффекты на кнопках', async () => {
    const buttons = [
      app.grpc.sendBtn,
      app.grpc.loadProtoBtn
    ];

    for (const btn of buttons) {
      await btn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('Focus на элементах', async () => {
    await app.grpc.addressInput.focus();
    await expect(app.grpc.addressInput).toBeFocused();
    
    await app.grpc.sendBtn.focus();
    await expect(app.grpc.sendBtn).toBeFocused();
  });

  test('Комбинированный тест: полная настройка gRPC', async () => {
    const testAddress = 'localhost:8080';
    const testJson = '{"method": "TestRequest", "params": {"key": "value"}}';
    
    // Вводим адрес
    await app.grpc.addressInput.fill(testAddress);
    
    // Включаем TLS
    await app.grpc.tlsCheckbox.click();
    await expect(app.grpc.tlsCheckbox).toBeChecked();
    
    // Переходим на Body и вводим JSON
    await app.grpc.bodyTab.click();
    await app.grpc.jsonEditor.fill(testJson);
    await expect(app.grpc.jsonEditor).toContainText(testJson);
    
    // Кликаем Send
    await app.grpc.sendBtn.click();
  });

  test('Пустой JSON в редакторе', async () => {
    await app.grpc.bodyTab.click();
    await app.grpc.jsonEditor.fill('');
    await expect(app.grpc.jsonEditor).toHaveText('');
  });

  test('Невалидный JSON в редакторе', async () => {
    await app.grpc.bodyTab.click();
    
    const invalidJsons = [
      '{invalid json}',
      '{"key": value}',
      '{"key": }',
      '{key: "value"}',
      '["unclosed array"'
    ];

    for (const json of invalidJsons) {
      await app.grpc.jsonEditor.fill(json);
      await expect(app.grpc.jsonEditor).toContainText(json);
    }
  });

  test('Многократное переключение Body вкладки', async () => {
    for (let i = 0; i < 5; i++) {
      await app.grpc.bodyTab.click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    await expect(app.grpc.jsonEditor).toBeVisible();
  });
});