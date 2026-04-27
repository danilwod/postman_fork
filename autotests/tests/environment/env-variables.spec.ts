import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки работы с переменными окружения.
 * Проверяет добавление, редактирование и использование переменных.
 */
test.describe('Тесты переменных окружения', () => {
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
    await app.topMenu.btnEnv.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости вкладки Global', async () => {
    await expect(app.env.sidebarGlobalTab).toBeVisible();
  });

  test('Клик по вкладке Global', async () => {
    await app.env.sidebarGlobalTab.click();
    await expect(app.env.addVariableRow).toBeVisible();
  });

  test('Ввод baseUrl', async () => {
    const testUrls = [
      'https://api.example.com',
      'http://localhost:3000',
      'https://jsonplaceholder.typicode.com',
      'https://api.github.com'
    ];

    for (const url of testUrls) {
      await app.env.baseUrlInput.fill(url);
      await expect(app.env.baseUrlInput).toHaveValue(url);
    }
  });

  test('Очистка baseUrl', async () => {
    await app.env.baseUrlInput.fill('https://api.test.com');
    await expect(app.env.baseUrlInput).toHaveValue('https://api.test.com');
    
    await app.env.baseUrlInput.clear();
    await expect(app.env.baseUrlInput).toHaveValue('');
  });

  test('Ввод baseUrl со специальными символами', async () => {
    const specialUrls = [
      'https://api.example.com/path?query=value',
      'https://api.example.com/path#anchor',
      'https://user:pass@api.example.com',
      'https://api.example.com:8080/v1'
    ];

    for (const url of specialUrls) {
      await app.env.baseUrlInput.fill(url);
      await expect(app.env.baseUrlInput).toHaveValue(url);
    }
  });

  test('Сохранение baseUrl при переключении вкладок', async () => {
    const testUrl = 'https://persistent-api.example.com';
    
    // Вводим URL
    await app.env.baseUrlInput.fill(testUrl);
    
    // Переключаемся на другие вкладки
    await app.topMenu.btnHttp.click();
    await app.topMenu.btnGrpc.click();
    await app.topMenu.btnGenerator.click();
    
    // Возвращаемся на ENV
    await app.topMenu.btnEnv.click();
    
    // Проверяем, что URL сохранился
    await expect(app.env.baseUrlInput).toHaveValue(testUrl);
  });

  test('Ввод длинного baseUrl', async () => {
    const longUrl = 'https://api.very-long-domain-name-that-might-cause-issues.example.com/v1/very/long/path/with/many/segments';
    
    await app.env.baseUrlInput.fill(longUrl);
    await expect(app.env.baseUrlInput).toHaveValue(longUrl);
  });

  test('Ввод некорректного baseUrl', async () => {
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'javascript:alert(1)',
      'http://',
      'just-text'
    ];

    for (const url of invalidUrls) {
      await app.env.baseUrlInput.fill(url);
      await expect(app.env.baseUrlInput).toHaveValue(url);
    }
  });

  test('Проверка кнопки Extract', async () => {
    // Клик по кнопке Extract
    await app.env.extractBtn.click();
    
    // Кнопка должна быть кликабельной
    await expect(app.env.extractBtn).toBeEnabled();
  });

  test('Многократный клик по кнопке Extract', async () => {
    for (let i = 0; i < 5; i++) {
      await app.env.extractBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('Ввод baseUrl и клик Extract', async () => {
    const testUrl = 'https://api.example.com/extract-test';
    
    await app.env.baseUrlInput.fill(testUrl);
    await app.env.extractBtn.click();
    
    // Проверяем, что URL остался после клика
    await expect(app.env.baseUrlInput).toHaveValue(testUrl);
  });

  test('Проверка плейсхолдера baseUrl', async () => {
    await expect(app.env.baseUrlInput).toHaveAttribute('placeholder', 'https://api.example.com');
  });

  test('Ввод и очистка baseUrl несколько раз', async () => {
    const urls = ['https://first.com', 'https://second.com', 'https://third.com'];
    
    for (const url of urls) {
      await app.env.baseUrlInput.fill(url);
      await expect(app.env.baseUrlInput).toHaveValue(url);
    }
    
    await app.env.baseUrlInput.clear();
    await expect(app.env.baseUrlInput).toHaveValue('');
  });

  test('Быстрый ввод baseUrl', async () => {
    for (let i = 0; i < 10; i++) {
      await app.env.baseUrlInput.fill(`https://api${i}.example.com`);
    }
    await expect(app.env.baseUrlInput).toHaveValue('https://api9.example.com');
  });

  test('Ввод emoji в baseUrl', async () => {
    const emojiUrl = 'https://api.example.com/🚀/🎉';
    
    await app.env.baseUrlInput.fill(emojiUrl);
    await expect(app.env.baseUrlInput).toHaveValue(emojiUrl);
  });

  test('Ввод кириллицы в baseUrl', async () => {
    const cyrillicUrl = 'https://пример.рф/тест';
    
    await app.env.baseUrlInput.fill(cyrillicUrl);
    await expect(app.env.baseUrlInput).toHaveValue(cyrillicUrl);
  });

  test('Переключение между Global и другими вкладками', async () => {
    // Кликаем по Global
    await app.env.sidebarGlobalTab.click();
    await expect(app.env.addVariableRow).toBeVisible();
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Возвращаемся
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
  });

  test('Комбинированный тест: настройка ENV и проверка', async () => {
    const baseUrl = 'https://api.test-env.com';
    
    // Кликаем Global
    await app.env.sidebarGlobalTab.click();
    
    // Вводим baseUrl
    await app.env.baseUrlInput.fill(baseUrl);
    
    // Кликаем Extract
    await app.env.extractBtn.click();
    
    // Проверяем
    await expect(app.env.baseUrlInput).toHaveValue(baseUrl);
    await expect(app.env.extractBtn).toBeEnabled();
  });
});