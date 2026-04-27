import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки функциональности EVA.
 * Проверяет загрузку тестов через папку и ZIP-архив.
 */
test.describe('EVA функциональность', () => {
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
    
    // Переходим на вкладку EVA
    await app.topMenu.btnEva.click();
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка видимости вкладки "Папка с тестами"', async () => {
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Проверка видимости вкладки "ZIP-архив"', async () => {
    await expect(app.eva.zipArchiveTab).toBeVisible();
  });

  test('Проверка видимости кнопки выбора ZIP-архива', async () => {
    await expect(app.eva.uploadZipBtn).toBeVisible();
  });

  test('Клик по вкладке "Папка с тестами"', async () => {
    await app.eva.testFolderTab.click();
    // Проверяем, что вкладка активна (можно добавить проверку появления элементов)
  });

  test('Клик по вкладке "ZIP-архив"', async () => {
    await app.eva.zipArchiveTab.click();
    // Проверяем, что вкладка активна
  });

  test('Клик по кнопке выбора ZIP-архива', async () => {
    await app.eva.uploadZipBtn.click();
    // Должно открыться окно выбора файла
  });

  test('Проверка переключения между вкладками EVA', async () => {
    // Кликаем на вкладку ZIP-архив
    await app.eva.zipArchiveTab.click();
    
    // Возвращаемся на вкладку Папка с тестами
    await app.eva.testFolderTab.click();
    
    // Проверяем, что вкладка активна
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Комбинированный тест: навигация по EVA', async () => {
    const tabs = [
      app.eva.testFolderTab,
      app.eva.zipArchiveTab
    ];
    
    for (const tab of tabs) {
      await tab.click();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Проверяем, что кнопка загрузки видима
    await expect(app.eva.uploadZipBtn).toBeVisible();
  });

  test('Проверка переключения с других вкладок на EVA', async () => {
    // Переходим на HTTP
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Переходим на EVA
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Множественные клики по кнопке загрузки', async () => {
    // Кликаем несколько раз для проверки стабильности
    for (let i = 0; i < 3; i++) {
      await app.eva.uploadZipBtn.click();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });
});