import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки функциональности Runner.
 * Проверяет запуск коллекций тестов, настройку итераций и выполнение.
 */
test.describe('Runner функциональность', () => {
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
    
    // Переходим на вкладку Runner
    await app.topMenu.btnRunner.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости dropdown коллекций', async () => {
    await expect(app.runner.collectionDropdown).toBeVisible();
  });

  test('Проверка видимости поля ввода итераций', async () => {
    await expect(app.runner.iterationsInput).toBeVisible();
  });

  test('Проверка видимости кнопки запуска', async () => {
    await expect(app.runner.runBtn).toBeVisible();
  });

  test('Ввод количества итераций', async () => {
    const iterations = '5';
    
    await app.runner.iterationsInput.fill(iterations);
    await expect(app.runner.iterationsInput).toHaveValue(iterations);
  });

  test('Ввод максимального количества итераций', async () => {
    const maxIterations = '999';
    
    await app.runner.iterationsInput.fill(maxIterations);
    await expect(app.runner.iterationsInput).toHaveValue(maxIterations);
  });

  test('Очистка поля итераций', async () => {
    await app.runner.iterationsInput.fill('10');
    await app.runner.iterationsInput.clear();
    
    // Проверяем, что поле пустое (или имеет значение по умолчанию)
    await expect(app.runner.iterationsInput).toHaveValue('');
  });

  test('Ввод недопустимого значения итераций', async () => {
    const invalidValues = ['abc', '-5', '0', '1.5'];
    
    for (const value of invalidValues) {
      await app.runner.iterationsInput.fill(value);
      await expect(app.runner.iterationsInput).toHaveValue(value);
    }
  });

  test('Клик по кнопке запуска без выбранной коллекции', async () => {
    // Кликаем кнопку запуска (должна появиться ошибка или подсказка)
    await app.runner.runBtn.click();
    
    // Здесь можно добавить проверку появления сообщения об ошибке
  });

  test('Комбинированный тест: настройка и запуск', async () => {
    const iterations = '3';
    
    // Вводим количество итераций
    await app.runner.iterationsInput.fill(iterations);
    
    // Проверяем, что кнопка запуска видима
    await expect(app.runner.runBtn).toBeVisible();
    
    // Кликаем кнопку запуска
    await app.runner.runBtn.click();
  });

  test('Проверка переключения между вкладками с сохранением данных', async () => {
    const iterations = '7';
    
    // Вводим количество итераций
    await app.runner.iterationsInput.fill(iterations);
    
    // Переходим на другую вкладку
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Возвращаемся на Runner
    await app.topMenu.btnRunner.click();
    
    // Проверяем, что значение сохранилось
    await expect(app.runner.iterationsInput).toHaveValue(iterations);
  });

  test('Проверка быстрого ввода значений', async () => {
    const values = ['1', '5', '10', '20', '50'];
    
    for (const value of values) {
      await app.runner.iterationsInput.clear();
      await app.runner.iterationsInput.fill(value);
      await expect(app.runner.iterationsInput).toHaveValue(value);
    }
  });
});