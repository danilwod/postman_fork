import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки навигации по приложению.
 * Проверяет переключение между вкладками и корректное отображение элементов.
 */
test.describe('Навигация по приложению', () => {
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

  test('Переход на вкладку ENV', async () => {
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
  });

  test('Переход на вкладку HTTP', async () => {
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });

  test('Переход на вкладку gRPC', async () => {
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
  });

  test('Переход на вкладку Generator', async () => {
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
  });

  test('Переход на вкладку Runner', async () => {
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();
  });

  test('Переход на вкладку History', async () => {
    await app.topMenu.btnHistory.click();
    await expect(app.history.filterAll).toBeVisible();
  });

  test('Переход на вкладку EVA', async () => {
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Полный цикл переключения по всем вкладкам', async () => {
    // Проходим по всем вкладкам по порядку
    await app.topMenu.btnEnv.click();
    await expect(app.env.sidebarGlobalTab).toBeVisible();
    
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
    
    await app.topMenu.btnGenerator.click();
    await expect(app.generator.generateBtn).toBeVisible();
    
    await app.topMenu.btnRunner.click();
    await expect(app.runner.runBtn).toBeVisible();
    
    await app.topMenu.btnHistory.click();
    await expect(app.history.filterAll).toBeVisible();
    
    await app.topMenu.btnEva.click();
    await expect(app.eva.testFolderTab).toBeVisible();
  });

  test('Возврат на предыдущую вкладку', async () => {
    // Переходим на HTTP
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
    
    // Переходим на gRPC
    await app.topMenu.btnGrpc.click();
    await expect(app.grpc.sendBtn).toBeVisible();
    
    // Возвращаемся на HTTP
    await app.topMenu.btnHttp.click();
    await expect(app.http.sendBtn).toBeVisible();
  });
});