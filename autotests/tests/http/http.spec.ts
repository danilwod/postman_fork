import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки HTTP функциональности.
 * Проверяет создание коллекций, отправку запросов и обработку ответов.
 */
test.describe('HTTP функциональность', () => {
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
    
    // Переходим на вкладку HTTP
    await app.topMenu.btnHttp.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Создание новой коллекции', async () => {
    const collectionName = 'Test Collection ' + Date.now();
    
    // Вводим имя новой коллекции
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    
    // Проверяем, что коллекция появилась в списке
    // (здесь можно добавить проверку видимости созданной коллекции)
  });

  test('Проверка метода GET по умолчанию', async () => {
    // Проверяем, что метод GET выбран по умолчанию
    await expect(app.http.methodDropdown).toContainText('GET');
  });

  test('Ввод URL в поле запроса', async () => {
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    
    // Вводим тестовый URL
    await app.http.urlInput.fill(testUrl);
    
    // Проверяем, что URL установлен корректно
    await expect(app.http.urlInput).toHaveValue(testUrl);
  });

  test('Проверка видимости кнопки Send', async () => {
    // Кнопка Send должна быть видима после перехода на вкладку
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Проверка плейсхолдера URL поля', async () => {
    // Проверяем, что поле URL имеет правильный плейсхолдер
    await expect(app.http.urlInput).toHaveAttribute('placeholder', 'https://api.example.com/v1/endpoint');
  });

  test('Отправка запроса и проверка ответа', async () => {
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    
    // Вводим URL
    await app.http.urlInput.fill(testUrl);
    
    // Нажимаем кнопку Send
    await app.http.sendBtn.click();
    
    // Ждем появления ответа
    await expect(app.http.responseEmptyPlaceholder).not.toBeVisible({ timeout: 10000 });
  });

  test('Проверка пустой коллекции', async () => {
    // Проверяем текст заглушки для пустой коллекции
    await expect(app.http.emptyCollectionText).toBeVisible();
  });

  test('Смена метода запроса', async () => {
    // Кликаем на выпадающий список методов
    await app.http.methodDropdown.click();
    
    // Выбираем POST метод (нужно уточнить локаторы для выпадающего списка)
    // await app.page.getByText('POST').click();
    
    // Проверяем, что метод изменился
    // await expect(app.http.methodDropdown).toContainText('POST');
  });

  test('Комбинированный тест: создание коллекции и отправка запроса', async () => {
    const collectionName = 'Integration Test ' + Date.now();
    const testUrl = 'https://jsonplaceholder.typicode.com/users';
    
    // Создаем коллекцию
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    
    // Вводим URL
    await app.http.urlInput.fill(testUrl);
    
    // Отправляем запрос
    await app.http.sendBtn.click();
    
    // Ждем появления ответа
    await expect(app.http.responseEmptyPlaceholder).not.toBeVisible({ timeout: 10000 });
  });
});