import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки функциональности генератора тестов.
 * Проверяет загрузку спецификаций, настройку параметров и генерацию тестов.
 */
test.describe('Generator функциональность', () => {
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
    
    // Переходим на вкладку Generator
    await app.topMenu.btnGenerator.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости dropzone', async () => {
    await expect(app.generator.dropzone).toBeVisible();
  });

  test('Проверка видимости кнопки открытия файла', async () => {
    await expect(app.generator.openFileBtn).toBeVisible();
  });

  test('Проверка поля ввода API URL', async () => {
    const testUrl = 'https://api.example.com';
    
    await app.generator.apiUrlInput.fill(testUrl);
    await expect(app.generator.apiUrlInput).toHaveValue(testUrl);
  });

  test('Проверка плейсхолдера API URL', async () => {
    await expect(app.generator.apiUrlInput).toHaveAttribute('placeholder', 'https://api.example.com');
  });

  test('Проверка видимости dropdown фреймворка', async () => {
    await expect(app.generator.frameworkDropdown).toBeVisible();
  });

  test('Проверка видимости чекбокса негативных тестов', async () => {
    await expect(app.generator.negativeTestsCheckbox).toBeVisible();
  });

  test('Включение чекбокса негативных тестов', async () => {
    await app.generator.negativeTestsCheckbox.click();
    await expect(app.generator.negativeTestsCheckbox).toBeChecked();
  });

  test('Проверка видимости кнопки генерации', async () => {
    await expect(app.generator.generateBtn).toBeVisible();
  });

  test('Проверка видимости кнопки сохранения файла', async () => {
    await expect(app.generator.saveFileBtn).toBeVisible();
  });

  test('Очистка поля API URL', async () => {
    const testUrl = 'https://test.api.com';
    
    await app.generator.apiUrlInput.fill(testUrl);
    await app.generator.apiUrlInput.clear();
    
    await expect(app.generator.apiUrlInput).toHaveValue('');
  });

  test('Ввод валидного URL', async () => {
    const validUrls = [
      'https://api.github.com',
      'https://jsonplaceholder.typicode.com',
      'http://localhost:8080/api'
    ];
    
    for (const url of validUrls) {
      await app.generator.apiUrlInput.fill(url);
      await expect(app.generator.apiUrlInput).toHaveValue(url);
    }
  });

  test('Комбинированный тест: подготовка к генерации', async () => {
    const apiUrl = 'https://api.example.com/v1';
    
    // Вводим URL API
    await app.generator.apiUrlInput.fill(apiUrl);
    
    // Включаем негативные тесты
    await app.generator.negativeTestsCheckbox.click();
    
    // Проверяем, что кнопка генерации видима
    await expect(app.generator.generateBtn).toBeVisible();
  });

  test('Проверка переключения между вкладками с сохранением данных', async () => {
    const testUrl = 'https://api.test.com';
    
    // Вводим URL в генераторе
    await app.generator.apiUrlInput.fill(testUrl);
    
    // Переходим на другую вкладку
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Возвращаемся на генератор
    await app.topMenu.btnGenerator.click();
    
    // Проверяем, что URL сохранился
    await expect(app.generator.apiUrlInput).toHaveValue(testUrl);
  });

  test('Проверка выбора фреймворка', async () => {
    // Кликаем на dropdown
    await app.generator.frameworkDropdown.click();
    
    // Здесь можно добавить проверку появления списка фреймворков
    // await expect(app.generator.page.getByText('pytest')).toBeVisible();
  });

  test('Клик по кнопке генерации без файла', async () => {
    // Вводим URL
    await app.generator.apiUrlInput.fill('https://api.example.com');
    
    // Кликаем генерировать (должна появиться ошибка или подсказка)
    await app.generator.generateBtn.click();
    
    // Здесь можно добавить проверку появления сообщения об ошибке
  });
});