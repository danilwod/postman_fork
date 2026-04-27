import { test, expect, chromium, Page } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../App';
import { config } from '../../config';

/**
 * Базовый класс для тестов с общей логикой запуска и очистки.
 * Наследуйте ваши тестовые наборы от этого класса для переиспользования.
 * 
 * Конфигурация загружается из config.ts с возможностью переопределения
 * через config.local.ts (не коммитить в git!)
 */

// Экспортируем хелперы для использования в тестах
export async function launchApp(): Promise<{ appProcess: ChildProcess, browser: any, app: App, page: Page }> {
  const port = config.debugPort;
  
  // Запускаем приложение
  const appProcess = spawn(config.appPath, [], {
    env: { 
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port}` 
    }
  });
  
  // Ждем старта WebView2
  await new Promise(resolve => setTimeout(resolve, config.appLaunchTimeout));
  
  // Подключаемся к запущенному окну
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  
  const app = new App(page);
  
  return { appProcess, browser, app, page };
}

export async function closeApp(appProcess: ChildProcess, browser: any): Promise<void> {
  if (browser) {
    await browser.close();
  }
  if (appProcess) {
    appProcess.kill();
  }
}
