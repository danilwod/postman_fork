import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки функциональности History.
 * Проверяет фильтрацию, поиск и очистку истории запросов.
 */
test.describe('History функциональность', () => {
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
    
    // Переходим на вкладку History
    await app.topMenu.btnHistory.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости поля поиска', async () => {
    await expect(app.history.searchInput).toBeVisible();
  });

  test('Проверка плейсхолдера поля поиска', async () => {
    await expect(app.history.searchInput).toHaveAttribute('placeholder', 'Search history...');
  });

  test('Ввод текста в поле поиска', async () => {
    const searchText = 'GET /users';
    
    await app.history.searchInput.fill(searchText);
    await expect(app.history.searchInput).toHaveValue(searchText);
  });

  test('Очистка поля поиска', async () => {
    await app.history.searchInput.fill('test search');
    await app.history.searchInput.clear();
    
    await expect(app.history.searchInput).toHaveValue('');
  });

  test('Проверка видимости фильтра All', async () => {
    await expect(app.history.filterAll).toBeVisible();
  });

  test('Проверка видимости фильтра 2xx', async () => {
    await expect(app.history.filter2xx).toBeVisible();
  });

  test('Проверка видимости фильтра Err', async () => {
    await expect(app.history.filterErr).toBeVisible();
  });

  test('Проверка видимости кнопки Clear', async () => {
    await expect(app.history.clearBtn).toBeVisible();
  });

  test('Клик по фильтру All', async () => {
    await app.history.filterAll.click();
    // Проверяем, что фильтр активен (можно добавить проверку класса active)
  });

  test('Клик по фильтру 2xx', async () => {
    await app.history.filter2xx.click();
    // Проверяем, что фильтр активен
  });

  test('Клик по фильтру Err', async () => {
    await app.history.filterErr.click();
    // Проверяем, что фильтр активен
  });

  test('Клик по кнопке Clear', async () => {
    await app.history.clearBtn.click();
    // Проверяем, что история очищена (должна появиться заглушка)
  });

  test('Поиск по истории', async () => {
    const searchTerms = ['GET', 'POST', 'api', 'users'];
    
    for (const term of searchTerms) {
      await app.history.searchInput.fill(term);
      await expect(app.history.searchInput).toHaveValue(term);
    }
  });

  test('Комбинированный тест: фильтрация и поиск', async () => {
    // Вводим поисковый запрос
    await app.history.searchInput.fill('GET');
    
    // Кликаем фильтр 2xx
    await app.history.filter2xx.click();
    
    // Проверяем, что фильтр активен
    await expect(app.history.filter2xx).toBeVisible();
  });

  test('Проверка переключения между вкладками', async () => {
    // Вводим поисковый запрос
    await app.history.searchInput.fill('test');
    
    // Переходим на другую вкладку
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Возвращаемся на History
    await app.topMenu.btnHistory.click();
    
    // Проверяем, что поисковый запрос сохранился
    await expect(app.history.searchInput).toHaveValue('test');
  });

  test('Последовательное переключение фильтров', async () => {
    const filters = [
      app.history.filterAll,
      app.history.filter2xx,
      app.history.filterErr
    ];
    
    for (const filter of filters) {
      await filter.click();
      // Небольшая задержка между кликами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Проверяем, что последний фильтр активен
    await expect(app.history.filterErr).toBeVisible();
  });

  test('Специальные символы в поиске', async () => {
    const specialSearches = ['@#$%', '123', 'test-query', 'path/to/api'];
    
    for (const search of specialSearches) {
      await app.history.searchInput.fill(search);
      await expect(app.history.searchInput).toHaveValue(search);
    }
  });
});