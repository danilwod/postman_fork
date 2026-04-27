import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки кнопок и их интерактивности.
 * Проверяет состояние кнопок, hover эффекты и клики.
 */
test.describe('Тесты кнопок', () => {
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

  test.describe('Кнопки меню', () => {
    test('Проверка всех кнопок меню на enabled', async () => {
      const buttons = [
        { btn: app.topMenu.btnEnv, name: 'ENV' },
        { btn: app.topMenu.btnHttp, name: 'HTTP' },
        { btn: app.topMenu.btnGrpc, name: 'gRPC' },
        { btn: app.topMenu.btnGenerator, name: 'Generator' },
        { btn: app.topMenu.btnRunner, name: 'Runner' },
        { btn: app.topMenu.btnHistory, name: 'History' },
        { btn: app.topMenu.btnEva, name: 'EVA' }
      ];

      for (const { btn, name } of buttons) {
        await expect(btn).toBeEnabled();
      }
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
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    test('Проверка focus состояния кнопок меню', async () => {
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
        await btn.focus();
        await expect(btn).toBeFocused();
      }
    });

    test('Клик по каждой кнопке меню', async () => {
      const buttons = [
        { btn: app.topMenu.btnEnv, check: app.env.sidebarGlobalTab },
        { btn: app.topMenu.btnHttp, check: app.http.sendBtn },
        { btn: app.topMenu.btnGrpc, check: app.grpc.sendBtn },
        { btn: app.topMenu.btnGenerator, check: app.generator.generateBtn },
        { btn: app.topMenu.btnRunner, check: app.runner.runBtn },
        { btn: app.topMenu.btnHistory, check: app.history.filterAll },
        { btn: app.topMenu.btnEva, check: app.eva.testFolderTab }
      ];

      for (const { btn, check } of buttons) {
        await btn.click();
        await expect(check).toBeVisible();
      }
    });
  });

  test.describe('Кнопка Send (HTTP)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnHttp.click();
    });

    test('Send кнопка видима', async () => {
      await expect(app.http.sendBtn).toBeVisible();
    });

    test('Send кнопка enabled', async () => {
      await expect(app.http.sendBtn).toBeEnabled();
    });

    test('Send кнопка hover', async () => {
      await app.http.sendBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Send кнопка focus', async () => {
      await app.http.sendBtn.focus();
      await expect(app.http.sendBtn).toBeFocused();
    });

    test('Многократный клик по Send кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.http.sendBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    test('Send кнопка после ввода URL', async () => {
      await app.http.urlInput.fill('https://api.example.com');
      await expect(app.http.sendBtn).toBeEnabled();
    });
  });

  test.describe('Кнопка Send (gRPC)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGrpc.click();
    });

    test('Send кнопка gRPC видима', async () => {
      await expect(app.grpc.sendBtn).toBeVisible();
    });

    test('Send кнопка gRPC enabled', async () => {
      await expect(app.grpc.sendBtn).toBeEnabled();
    });

    test('Send кнопка gRPC hover', async () => {
      await app.grpc.sendBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Send кнопка gRPC focus', async () => {
      await app.grpc.sendBtn.focus();
      await expect(app.grpc.sendBtn).toBeFocused();
    });

    test('Многократный клик по Send кнопке gRPC', async () => {
      for (let i = 0; i < 5; i++) {
        await app.grpc.sendBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Generate', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGenerator.click();
    });

    test('Generate кнопка видима', async () => {
      await expect(app.generator.generateBtn).toBeVisible();
    });

    test('Generate кнопка enabled', async () => {
      await expect(app.generator.generateBtn).toBeEnabled();
    });

    test('Generate кнопка hover', async () => {
      await app.generator.generateBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Generate кнопка focus', async () => {
      await app.generator.generateBtn.focus();
      await expect(app.generator.generateBtn).toBeFocused();
    });

    test('Многократный клик по Generate кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.generator.generateBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Run', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnRunner.click();
    });

    test('Run кнопка видима', async () => {
      await expect(app.runner.runBtn).toBeVisible();
    });

    test('Run кнопка enabled', async () => {
      await expect(app.runner.runBtn).toBeEnabled();
    });

    test('Run кнопка hover', async () => {
      await app.runner.runBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Run кнопка focus', async () => {
      await app.runner.runBtn.focus();
      await expect(app.runner.runBtn).toBeFocused();
    });

    test('Многократный клик по Run кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.runner.runBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Extract (ENV)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnEnv.click();
    });

    test('Extract кнопка видима', async () => {
      await expect(app.env.extractBtn).toBeVisible();
    });

    test('Extract кнопка enabled', async () => {
      await expect(app.env.extractBtn).toBeEnabled();
    });

    test('Extract кнопка hover', async () => {
      await app.env.extractBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Extract кнопка focus', async () => {
      await app.env.extractBtn.focus();
      await expect(app.env.extractBtn).toBeFocused();
    });

    test('Многократный клик по Extract кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.env.extractBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Clear (History)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnHistory.click();
    });

    test('Clear кнопка видима', async () => {
      await expect(app.history.clearBtn).toBeVisible();
    });

    test('Clear кнопка enabled', async () => {
      await expect(app.history.clearBtn).toBeEnabled();
    });

    test('Clear кнопка hover', async () => {
      await app.history.clearBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Clear кнопка focus', async () => {
      await app.history.clearBtn.focus();
      await expect(app.history.clearBtn).toBeFocused();
    });

    test('Многократный клик по Clear кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.history.clearBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Load Proto (gRPC)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGrpc.click();
    });

    test('Load Proto кнопка видима', async () => {
      await expect(app.grpc.loadProtoBtn).toBeVisible();
    });

    test('Load Proto кнопка enabled', async () => {
      await expect(app.grpc.loadProtoBtn).toBeEnabled();
    });

    test('Load Proto кнопка hover', async () => {
      await app.grpc.loadProtoBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Load Proto кнопка focus', async () => {
      await app.grpc.loadProtoBtn.focus();
      await expect(app.grpc.loadProtoBtn).toBeFocused();
    });

    test('Многократный клик по Load Proto кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.grpc.loadProtoBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Save (Generator)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGenerator.click();
    });

    test('Save кнопка видима', async () => {
      await expect(app.generator.saveFileBtn).toBeVisible();
    });

    test('Save кнопка enabled', async () => {
      await expect(app.generator.saveFileBtn).toBeEnabled();
    });

    test('Save кнопка hover', async () => {
      await app.generator.saveFileBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Save кнопка focus', async () => {
      await app.generator.saveFileBtn.focus();
      await expect(app.generator.saveFileBtn).toBeFocused();
    });

    test('Многократный клик по Save кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.generator.saveFileBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Open File (Generator)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGenerator.click();
    });

    test('Open File кнопка видима', async () => {
      await expect(app.generator.openFileBtn).toBeVisible();
    });

    test('Open File кнопка enabled', async () => {
      await expect(app.generator.openFileBtn).toBeEnabled();
    });

    test('Open File кнопка hover', async () => {
      await app.generator.openFileBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Open File кнопка focus', async () => {
      await app.generator.openFileBtn.focus();
      await expect(app.generator.openFileBtn).toBeFocused();
    });

    test('Многократный клик по Open File кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.generator.openFileBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });

  test.describe('Кнопка Upload ZIP (EVA)', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnEva.click();
    });

    test('Upload ZIP кнопка видима', async () => {
      await expect(app.eva.uploadZipBtn).toBeVisible();
    });

    test('Upload ZIP кнопка enabled', async () => {
      await expect(app.eva.uploadZipBtn).toBeEnabled();
    });

    test('Upload ZIP кнопка hover', async () => {
      await app.eva.uploadZipBtn.hover();
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    test('Upload ZIP кнопка focus', async () => {
      await app.eva.uploadZipBtn.focus();
      await expect(app.eva.uploadZipBtn).toBeFocused();
    });

    test('Многократный клик по Upload ZIP кнопке', async () => {
      for (let i = 0; i < 5; i++) {
        await app.eva.uploadZipBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
  });
});