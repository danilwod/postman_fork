import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../src/App';
import { config } from '../config';

/**
 * Тест для полного прохода по всем вкладкам приложения.
 * Проверяет, что каждая вкладка открывается корректно.
 */
test.describe('Полный проход по приложению', () => {
  let appProcess: ChildProcess;
  let browser: any;
  let app: App;

  test.beforeEach(async () => {
    appProcess = spawn(config.appPath, [], {
      env: { 
        WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${config.debugPort}` 
      }
    });
    
    // Ждем запуска приложения (время из конфига)
    await new Promise(resolve => setTimeout(resolve, config.appLaunchTimeout));
    
    // Подключаемся к запущенному окну
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${config.debugPort}`);
    
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    
    app = new App(page); // Инициализируем базу
  });

  test.afterEach(async () => {
    // Закрываем браузер и убиваем процесс
    if (browser) {
      await browser.close();
    }
    if (appProcess) {
      appProcess.kill();
    }
  });

  test('Проверка навигации по всем вкладкам', async () => {
    // 1. Идем в gRPC
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible(); // Проверяем, что экран загрузился

    // 2. Идем в Generator
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();

    // 3. Идем в History и ищем 200 ответы
    await app.topMenu.btnHistory.click();
    await app.history.filter2xx.click();
    await expect(app.history.filter2xx).toBeVisible();

    // 4. Идем в ENV
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();

    // 5. Идем в HTTP
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();

    // 6. Идем в Runner
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();

    // 7. Идем в EVA
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();

    // 8. Возвращаемся на HTTP для финальной проверки
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Полный цикл с проверкой всех элементов', async () => {
    // Проходим по всем вкладкам с полными проверками
    const tabs = [
      { name: 'ENV', btn: app.topMenu.btnEnv, check: app.env.sidebarGlobalTab },
      { name: 'HTTP', btn: app.topMenu.btnHttp, check: app.http.sendBtn },
      { name: 'gRPC', btn: app.topMenu.btnGrpc, check: app.grpc.sendBtn },
      { name: 'Generator', btn: app.topMenu.btnGenerator, check: app.generator.generateBtn },
      { name: 'Runner', btn: app.topMenu.btnRunner, check: app.runner.runBtn },
      { name: 'History', btn: app.topMenu.btnHistory, check: app.history.filterAll },
      { name: 'EVA', btn: app.topMenu.btnEva, check: app.eva.testFolderTab }
    ];

    for (const tab of tabs) {
      await tab.btn.click();
      await expect(tab.check).toBeVisible();
    }
  });
});