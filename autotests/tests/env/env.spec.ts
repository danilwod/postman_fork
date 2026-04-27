import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки ENV функциональности.
 * Проверяет управление переменными окружения, добавление и редактирование.
 */
test.describe('ENV функциональность', () => {
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
    
    // Переходим на вкладку ENV
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

  test('Переход на вкладку Global', async () => {
    await app.env.sidebarGlobalTab.click();
    // После клика должна появиться форма добавления переменной
    await expect(app.env.addVariableRow).toBeVisible();
  });

  test('Проверка текста заглушки при отсутствии переменных', async () => {
    await expect(app.env.addVariableRow).toContainText('Нет переменных. Добавьте первую ниже.');
  });

  test('Проверка поля ввода baseUrl', async () => {
    const testUrl = 'https://api.example.com';
    
    // Вводим тестовый URL
    await app.env.baseUrlInput.fill(testUrl);
    
    // Проверяем, что URL установлен корректно
    await expect(app.env.baseUrlInput).toHaveValue(testUrl);
  });

  test('Проверка плейсхолдера baseUrl', async () => {
    await expect(app.env.baseUrlInput).toHaveAttribute('placeholder', 'https://api.example.com');
  });

  test('Проверка видимости кнопки Extract from response', async () => {
    await expect(app.env.extractBtn).toBeVisible();
  });

  test('Клик по кнопке Extract from response', async () => {
    await app.env.extractBtn.click();
    // Здесь можно добавить проверку появления модального окна или формы
  });

  test('Очистка поля baseUrl', async () => {
    const testUrl = 'https://test.api.com';
    
    // Вводим URL
    await app.env.baseUrlInput.fill(testUrl);
    
    // Очищаем поле
    await app.env.baseUrlInput.clear();
    
    // Проверяем, что поле пустое
    await expect(app.env.baseUrlInput).toHaveValue('');
  });

  test('Ввод нескольких URL подряд', async () => {
    const urls = [
      'https://api.first.com',
      'https://api.second.com',
      'https://api.third.com'
    ];
    
    for (const url of urls) {
      await app.env.baseUrlInput.fill(url);
      await expect(app.env.baseUrlInput).toHaveValue(url);
    }
  });

  test('Комбинированный тест: настройка ENV переменных', async () => {
    const baseUrl = 'https://jsonplaceholder.typicode.com';
    
    // Переходим на вкладку Global
    await app.env.sidebarGlobalTab.click();
    
    // Вводим baseUrl
    await app.env.baseUrlInput.fill(baseUrl);
    
    // Проверяем, что кнопка Extract активна
    await expect(app.env.extractBtn).toBeEnabled();
  });

  test('Проверка переключения между вкладками с сохранением данных', async () => {
    const testUrl = 'https://api.test.com';
    
    // Вводим URL в ENV
    await app.env.baseUrlInput.fill(testUrl);
    
    // Переходим на другую вкладку
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Возвращаемся на ENV
    await app.topMenu.btnEnv.click();
    
    // Проверяем, что URL сохранился
    await expect(app.env.baseUrlInput).toHaveValue(testUrl);
  });
});