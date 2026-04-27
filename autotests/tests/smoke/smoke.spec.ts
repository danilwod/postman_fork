import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор дымовых тестов для быстрой проверки базовой работоспособности приложения.
 * Эти тесты должны выполняться быстро и проверять критический функционал.
 */
test.describe('Smoke тесты', () => {
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
  });

  test.afterEach(async () => {
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('SMOKE: Запуск приложения', async () => {
    // Базовая проверка, что приложение запустилось
    await expect(app.page).toBeDefined();
  });

  test('SMOKE: Видимость верхнего меню', async () => {
    await expect(app.topMenu.btnEnv).toBeVisible();
    await expect(app.topMenu.btnHttp).toBeVisible();
    await expect(app.topMenu.btnGrpc).toBeVisible();
    await expect(app.topMenu.btnGenerator).toBeVisible();
    await expect(app.topMenu.btnRunner).toBeVisible();
    await expect(app.topMenu.btnHistory).toBeVisible();
    await expect(app.topMenu.btnEva).toBeVisible();
  });

  test('SMOKE: Переход на HTTP вкладку', async () => {
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('SMOKE: Переход на gRPC вкладку', async () => {
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
  });

  test('SMOKE: Переход на ENV вкладку', async () => {
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
  });

  test('SMOKE: Переход на Generator вкладку', async () => {
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
  });

  test('SMOKE: Переход на Runner вкладку', async () => {
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();
  });

  test('SMOKE: Переход на History вкладку', async () => {
    await app.topMenu.btnHistory.click();
    await expect(app.history.filterAll).toBeVisible();
  });

  test('SMOKE: Переход на EVA вкладку', async () => {
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('SMOKE: Быстрый проход по всем вкладкам', async () => {
    const tabs = [
      { btn: app.topMenu.btnEnv, check: app.env.sidebarGlobalTab },
      { btn: app.topMenu.btnHttp, check: app.http.sendBtn },
      { btn: app.topMenu.btnGrpc, check: app.grpc.sendBtn },
      { btn: app.topMenu.btnGenerator, check: app.generator.generateBtn },
      { btn: app.topMenu.btnRunner, check: app.runner.runBtn },
      { btn: app.topMenu.btnHistory, check: app.history.filterAll },
      { btn: app.topMenu.btnEva, check: app.eva.testFolderTab }
    ];

    for (const tab of tabs) {
      await tab.btn.click();
      await expect(tab.check).toBeVisible();
    }
  });

  test('SMOKE: Ввод URL в HTTP форме', async () => {
    await app.topMenu.btnHttp.click();
    await app.http.urlInput.fill('https://api.example.com');
    await expect(app.http.urlInput).toHaveValue('https://api.example.com');
  });

  test('SMOKE: Кнопка Send на HTTP вкладке', async () => {
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    await expect(app.http.sendBtn).toBeEnabled();
  });

  test('SMOKE: Кнопка Send на gRPC вкладке', async () => {
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
  });

  test('SMOKE: Кнопка Generate', async () => {
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
  });

  test('SMOKE: Кнопка Run', async () => {
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();
  });
});