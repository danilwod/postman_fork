import { test, expect, chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { App } from '../src/App'; // Подключаем нашу Супер-Базу

test.describe('Полный проход по приложению', () => {
  let appProcess;
  let browser;
  let app: App;

test.beforeEach(async () => {
    const port = 9222;
    appProcess = spawn('C:\\Users\\w0dem\\AppData\\Local\\Pe4King\\pe4king-desktop.exe',[], {
      env: { 
        ...process.env, 
        WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port}` 
      }
    });
    
    // Ждем 5 секунд на всякий случай (иногда WebView2 стартует не моментально)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // ИСПРАВЛЕНИЕ 1: Жестко указываем 127.0.0.1 вместо localhost
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    
    app = new App(page); // Инициализируем базу
  });

  test.afterEach(async () => {
    // ИСПРАВЛЕНИЕ 2: Проверяем, удалось ли вообще создать browser, прежде чем закрывать
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
    // ... и так далее!
  });
});
