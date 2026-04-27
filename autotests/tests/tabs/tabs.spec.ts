import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для детальной проверки переключения между вкладками.
 * Проверяет различные сценарии переключения и состояние вкладок.
 */
test.describe('Детальные тесты вкладок', () => {
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

  test('Проверка заголовков всех вкладок в меню', async () => {
    // Проверяем, что все кнопки меню содержат правильный текст
    await expect(app.topMenu.btnEnv).toHaveText('ENV');
    await expect(app.topMenu.btnHttp).toHaveText('HTTP');
    await expect(app.topMenu.btnGrpc).toHaveText('gRPC');
    await expect(app.topMenu.btnGenerator).toHaveText('Generator');
    await expect(app.topMenu.btnRunner).toHaveText('Runner');
    await expect(app.topMenu.btnHistory).toHaveText('History');
    await expect(app.topMenu.btnEva).toHaveText('EVA');
  });

  test('Быстрое переключение между вкладками', async () => {
    const tabs = [
      app.topMenu.btnEnv,
      app.topMenu.btnHttp,
      app.topMenu.btnGrpc,
      app.topMenu.btnGenerator,
      app.topMenu.btnRunner,
      app.topMenu.btnHistory,
      app.topMenu.btnEva
    ];

    // Быстро кликаем по всем вкладкам
    for (const tab of tabs) {
      await tab.click();
    }

    // Проверяем, что последняя вкладка активна
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Двойной клик по одной вкладке', async () => {
    // Кликаем дважды по HTTP вкладке
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Переключение вкладок в обратном порядке', async () => {
    // Идем с конца в начало
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();
    
    await app.topMenu.btnHistory.click();
    await expect(app.history.filterAll).toBeVisible();
    
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();
    
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
    
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
    
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
  });

  test('Переключение вкладок через одну', async () => {
    // ENV -> gRPC -> Generator -> History -> HTTP
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
    
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
    
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
    
    await app.topMenu.btnHistory.click();
    await expect(app.history.filterAll).toBeVisible();
    
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Случайный порядок переключения вкладок', async () => {
    const tabs = [
      { btn: app.topMenu.btnHttp, check: app.http.sendBtn },
      { btn: app.topMenu.btnEnv, check: app.env.sidebarGlobalTab },
      { btn: app.topMenu.btnEva, check: app.eva.testFolderTab },
      { btn: app.topMenu.btnGrpc, check: app.grpc.sendBtn },
      { btn: app.topMenu.btnRunner, check: app.runner.runBtn },
      { btn: app.topMenu.btnGenerator, check: app.generator.generateBtn },
      { btn: app.topMenu.btnHistory, check: app.history.filterAll }
    ];

    // Перемешиваем порядок (фиксированный для воспроизводимости)
    const shuffledOrder = [1, 4, 0, 6, 2, 5, 3];
    
    for (const index of shuffledOrder) {
      await tabs[index].btn.click();
      await expect(tabs[index].check).toBeVisible();
    }
  });

  test('Множественные клики по разным вкладкам', async () => {
    // Кликаем 3 раза по каждой вкладке
    for (let i = 0; i < 3; i++) {
      await app.topMenu.btnHttp.click();
      await expect(app.http.sendBtn).toBeVisible();
      
      await app.topMenu.btnGrpc.click();
      await expect(app.grpc.sendBtn).toBeVisible();
    }
  });

  test('Проверка доступности всех кнопок меню', async () => {
    const buttons = [
      app.topMenu.btnEnv,
      app.topMenu.btnHttp,
      app.topMenu.btnGrpc,
      app.topMenu.btnGenerator,
      app.topMenu.btnRunner,
      app.topMenu.btnHistory,
      app.topMenu.btnEva
    ];

    for (const btn of buttons) {
      await expect(btn).toBeEnabled();
    }
  });

  test('Проверка видимости кнопок меню', async () => {
    const buttons = [
      app.topMenu.btnEnv,
      app.topMenu.btnHttp,
      app.topMenu.btnGrpc,
      app.topMenu.btnGenerator,
      app.topMenu.btnRunner,
      app.topMenu.btnHistory,
      app.topMenu.btnEva
    ];

    for (const btn of buttons) {
      await expect(btn).toBeVisible();
    }
  });

  test('Переключение на уже активную вкладку', async () => {
    // Кликаем на HTTP
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Снова кликаем на HTTP (уже активную)
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Циклическое переключение вкладок', async () => {
    // Проходим по кругу несколько раз
    for (let cycle = 0; cycle < 3; cycle++) {
      await app.topMenu.btnEnv.click();
      await app.topMenu.btnHttp.click();
      await app.topMenu.btnGrpc.click();
      await app.topMenu.btnGenerator.click();
      await app.topMenu.btnRunner.click();
      await app.topMenu.btnHistory.click();
      await app.topMenu.btnEva.click();
    }
    
    // Проверяем, что последняя вкладка активна
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Проверка hover эффекта на кнопках меню', async () => {
    const buttons = [
      app.topMenu.btnEnv,
      app.topMenu.btnHttp,
      app.topMenu.btnGrpc,
      app.topMenu.btnGenerator,
      app.topMenu.btnRunner,
      app.topMenu.btnHistory,
      app.topMenu.btnEva
    ];

    for (const btn of buttons) {
      await btn.hover();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });
});