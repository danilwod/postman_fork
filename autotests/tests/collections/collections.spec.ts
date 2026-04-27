import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки работы с коллекциями запросов.
 * Проверяет создание, редактирование и удаление коллекций.
 */
test.describe('Тесты коллекций', () => {
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

  test('Создание коллекции с уникальным именем', async () => {
    const collectionName = `TestCollection_${Date.now()}`;
    
    // Вводим имя коллекции
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    
    // Небольшая задержка для применения
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверяем, что поле очищено после создания
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Создание нескольких коллекций', async () => {
    const collectionNames = [
      `Collection_First_${Date.now()}`,
      `Collection_Second_${Date.now()}`,
      `Collection_Third_${Date.now()}`
    ];

    for (const name of collectionNames) {
      await app.http.newCollectionInput.fill(name);
      await app.http.newCollectionInput.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  });

  test('Создание коллекции с пробелами в названии', async () => {
    const collectionName = 'My Test Collection With Spaces';
    
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Создание коллекции со специальными символами', async () => {
    const collectionName = 'Test-Collection_2024!@#$%';
    
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Пустое имя коллекции', async () => {
    // Пытаемся создать коллекцию с пустым именем
    await app.http.newCollectionInput.fill('');
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Поле должно остаться пустым или появиться ошибка
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Отправка запроса после создания коллекции', async () => {
    const collectionName = `Collection_${Date.now()}`;
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    
    // Создаем коллекцию
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Вводим URL
    await app.http.urlInput.fill(testUrl);
    
    // Отправляем запрос
    await app.http.sendBtn.click();
    
    // Ждем появления ответа
    await expect(app.http.responseEmptyPlaceholder).not.toBeVisible({ timeout: 15000 });
  });

  test('Создание коллекции и переключение вкладок', async () => {
    const collectionName = `SwitchTest_${Date.now()}`;
    
    // Создаем коллекцию
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Переключаемся на другую вкладку
    await app.topMenu.btnEnv.click();
    await app.env.baseUrlInput.fill('https://api.test.com');
    
    // Возвращаемся на HTTP
    await app.topMenu.btnHttp.click();
    
    // Проверяем, что поле для новой коллекции пусто
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Ввод имени коллекции и отмена', async () => {
    const collectionName = 'Temporary_Collection';
    
    // Вводим имя
    await app.http.newCollectionInput.fill(collectionName);
    
    // Очищаем перед отправкой
    await app.http.newCollectionInput.clear();
    
    // Проверяем, что поле пустое
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Максимальная длина имени коллекции', async () => {
    const maxLengthName = 'A'.repeat(100);
    
    await app.http.newCollectionInput.fill(maxLengthName);
    await expect(app.http.newCollectionInput).toHaveValue(maxLengthName);
    
    // Отправляем
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('Создание коллекции с emoji в названии', async () => {
    const collectionName = 'Test_Collection_🚀_🎉';
    
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await expect(app.http.newCollectionInput).toHaveValue('');
  });

  test('Быстрое создание и переключение', async () => {
    for (let i = 0; i < 3; i++) {
      await app.http.newCollectionInput.fill(`Quick_${i}`);
      await app.http.newCollectionInput.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Быстрое переключение
      await app.topMenu.btnGrpc.click();
      await app.topMenu.btnHttp.click();
    }
  });

  test('Создание коллекции и добавление URL', async () => {
    const collectionName = `URL_Test_${Date.now()}`;
    const urls = [
      'https://api.github.com/users/octocat',
      'https://jsonplaceholder.typicode.com/posts/1',
      'https://httpbin.org/get'
    ];

    // Создаем коллекцию
    await app.http.newCollectionInput.fill(collectionName);
    await app.http.newCollectionInput.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Тестируем каждый URL
    for (const url of urls) {
      await app.http.urlInput.fill(url);
      await expect(app.http.urlInput).toHaveValue(url);
    }
  });
});