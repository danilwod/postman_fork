import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Расширенные тесты для проверки функциональности History.
 * Проверяет поиск, фильтрацию и управление историей запросов.
 */
test.describe('Расширенные тесты History', () => {
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

  test('Проверка видимости всех элементов History', async () => {
    await expect(app.history.searchInput).toBeVisible();
    await expect(app.history.filterAll).toBeVisible();
    await expect(app.history.filter2xx).toBeVisible();
    await expect(app.history.filterErr).toBeVisible();
    await expect(app.history.clearBtn).toBeVisible();
  });

  test('Поиск по истории - ввод текста', async () => {
    const searchTerms = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const term of searchTerms) {
      await app.history.searchInput.fill(term);
      await expect(app.history.searchInput).toHaveValue(term);
    }
  });

  test('Поиск по истории - очистка', async () => {
    await app.history.searchInput.fill('test search');
    await expect(app.history.searchInput).toHaveValue('test search');
    
    await app.history.searchInput.clear();
    await expect(app.history.searchInput).toHaveValue('');
  });

  test('Фильтр All - клик и активация', async () => {
    await app.history.filterAll.click();
    await expect(app.history.filterAll).toBeVisible();
  });

  test('Фильтр 2xx - клик и активация', async () => {
    await app.history.filter2xx.click();
    await expect(app.history.filter2xx).toBeVisible();
  });

  test('Фильтр Err - клик и активация', async () => {
    await app.history.filterErr.click();
    await expect(app.history.filterErr).toBeVisible();
  });

  test('Последовательное применение фильтров', async () => {
    // Кликаем All
    await app.history.filterAll.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Кликаем 2xx
    await app.history.filter2xx.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Кликаем Err
    await app.history.filterErr.click();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Возвращаемся на All
    await app.history.filterAll.click();
  });

  test('Кнопка Clear - клик', async () => {
    await app.history.clearBtn.click();
    await expect(app.history.clearBtn).toBeEnabled();
  });

  test('Многократный клик по кнопке Clear', async () => {
    for (let i = 0; i < 5; i++) {
      await app.history.clearBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('Поиск и фильтр комбинация', async () => {
    // Вводим поиск
    await app.history.searchInput.fill('GET');
    
    // Кликаем фильтр 2xx
    await app.history.filter2xx.click();
    
    // Проверяем, что поиск сохранился
    await expect(app.history.searchInput).toHaveValue('GET');
  });

  test('Специальные символы в поиске', async () => {
    const specialSearches = [
      '*?[]{}()',
      '.^$+\\|',
      '<>&"\'',
      '!@#$%^&*()',
      'test-query',
      'path/to/api'
    ];
    
    for (const search of specialSearches) {
      await app.history.searchInput.fill(search);
      await expect(app.history.searchInput).toHaveValue(search);
    }
  });

  test('Длинный поисковый запрос', async () => {
    const longSearch = 'GET /api/v1/users/123/posts/456/comments?filter=active&sort=date';
    
    await app.history.searchInput.fill(longSearch);
    await expect(app.history.searchInput).toHaveValue(longSearch);
  });

  test('Пустой поиск', async () => {
    await app.history.searchInput.fill('');
    await expect(app.history.searchInput).toHaveValue('');
  });

  test('Быстрый ввод поиска', async () => {
    for (let i = 0; i < 10; i++) {
      await app.history.searchInput.fill(`search${i}`);
    }
    await expect(app.history.searchInput).toHaveValue('search9');
  });

  test('Сохранение поиска при переключении вкладок', async () => {
    const searchTerm = 'persistent-search';
    
    // Вводим поиск
    await app.history.searchInput.fill(searchTerm);
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    await app.topMenu.btnGrpc.click();
    
    // Возвращаемся
    await app.topMenu.btnHistory.click();
    
    // Проверяем сохранение
    await expect(app.history.searchInput).toHaveValue(searchTerm);
  });

  test('Сохранение фильтра при переключении вкладок', async () => {
    // Кликаем фильтр 2xx
    await app.history.filter2xx.click();
    
    // Переключаемся
    await app.topMenu.btnHttp.click();
    
    // Возвращаемся
    await app.topMenu.btnHistory.click();
    
    // Проверяем, что фильтр все еще виден
    await expect(app.history.filter2xx).toBeVisible();
  });

  test('Комбинированный тест: поиск + фильтр + clear', async () => {
    // Вводим поиск
    await app.history.searchInput.fill('GET');
    
    // Кликаем фильтр
    await app.history.filterAll.click();
    
    // Кликаем clear
    await app.history.clearBtn.click();
    
    // Проверяем, что поиск сохранился после clear
    await expect(app.history.searchInput).toHaveValue('GET');
  });

  test('Ввод emoji в поиск', async () => {
    const emojiSearch = '🚀🎉💻';
    
    await app.history.searchInput.fill(emojiSearch);
    await expect(app.history.searchInput).toHaveValue(emojiSearch);
  });

  test('Ввод кириллицы в поиск', async () => {
    const cyrillicSearch = 'Поиск тест запрос';
    
    await app.history.searchInput.fill(cyrillicSearch);
    await expect(app.history.searchInput).toHaveValue(cyrillicSearch);
  });

  test('Hover эффекты на фильтрах', async () => {
    const filters = [
      app.history.filterAll,
      app.history.filter2xx,
      app.history.filterErr
    ];
    
    for (const filter of filters) {
      await filter.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('Focus на элементах', async () => {
    await app.history.searchInput.focus();
    await expect(app.history.searchInput).toBeFocused();
    
    await app.history.filterAll.focus();
    await expect(app.history.filterAll).toBeFocused();
    
    await app.history.clearBtn.focus();
    await expect(app.history.clearBtn).toBeFocused();
  });

  test('Плейсхолдер поля поиска', async () => {
    await expect(app.history.searchInput).toHaveAttribute('placeholder', 'Search history...');
  });

  test('Очистка после поиска', async () => {
    // Вводим поиск
    await app.history.searchInput.fill('test');
    
    // Кликаем clear
    await app.history.clearBtn.click();
    
    // Очищаем поиск
    await app.history.searchInput.clear();
    await expect(app.history.searchInput).toHaveValue('');
  });

  test('Многократное переключение фильтров', async () => {
    for (let i = 0; i < 3; i++) {
      await app.history.filterAll.click();
      await app.history.filter2xx.click();
      await app.history.filterErr.click();
    }
  });
});