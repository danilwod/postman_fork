import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки UI элементов приложения.
 * Проверяет видимость, доступность и интерактивность элементов.
 */
test.describe('UI элементы', () => {
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

  test.describe('HTTP вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnHttp.click();
    });

    test('Проверка всех элементов HTTP вкладки', async () => {
      await expect(app.http.newCollectionInput).toBeVisible();
      await expect(app.http.emptyCollectionText).toBeVisible();
      await expect(app.http.methodDropdown).toBeVisible();
      await expect(app.http.urlInput).toBeVisible();
      await expect(app.http.sendBtn).toBeVisible();
      await expect(app.http.responseEmptyPlaceholder).toBeVisible();
    });

    test('Проверка плейсхолдера для новой коллекции', async () => {
      await expect(app.http.newCollectionInput).toHaveAttribute('placeholder', 'Новая коллекция');
    });

    test('Проверка кнопки Send - enabled состояние', async () => {
      await expect(app.http.sendBtn).toBeEnabled();
    });

    test('Ввод и очистка URL', async () => {
      const testUrl = 'https://api.example.com/test';
      
      await app.http.urlInput.fill(testUrl);
      await expect(app.http.urlInput).toHaveValue(testUrl);
      
      await app.http.urlInput.clear();
      await expect(app.http.urlInput).toHaveValue('');
    });

    test('Ввод специального текста в URL поле', async () => {
      const specialUrls = [
        'https://api.example.com/path?query=value&foo=bar',
        'http://localhost:8080/api/v1/users',
        'https://example.com/path/with/slashes',
        'https://api.example.com/endpoint#anchor'
      ];

      for (const url of specialUrls) {
        await app.http.urlInput.fill(url);
        await expect(app.http.urlInput).toHaveValue(url);
      }
    });

    test('Проверка метода GET по умолчанию', async () => {
      await expect(app.http.methodDropdown).toContainText('GET');
    });

    test('Клик по кнопке Send без URL', async () => {
      await app.http.sendBtn.click();
      // Кнопка должна быть кликабельной даже без URL
    });
  });

  test.describe('ENV вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnEnv.click();
    });

    test('Проверка всех элементов ENV вкладки', async () => {
      await expect(app.env.sidebarGlobalTab).toBeVisible();
      await expect(app.env.addVariableRow).toBeVisible();
      await expect(app.env.baseUrlInput).toBeVisible();
      await expect(app.env.extractBtn).toBeVisible();
    });

    test('Ввод и проверка baseUrl', async () => {
      const testUrls = [
        'https://api.example.com',
        'http://localhost:3000',
        'https://jsonplaceholder.typicode.com'
      ];

      for (const url of testUrls) {
        await app.env.baseUrlInput.fill(url);
        await expect(app.env.baseUrlInput).toHaveValue(url);
      }
    });

    test('Проверка плейсхолдера baseUrl', async () => {
      await expect(app.env.baseUrlInput).toHaveAttribute('placeholder', 'https://api.example.com');
    });

    test('Клик по вкладке Global', async () => {
      await app.env.sidebarGlobalTab.click();
      await expect(app.env.addVariableRow).toBeVisible();
    });

    test('Клик по кнопке Extract', async () => {
      await app.env.extractBtn.click();
      // Кнопка должна быть кликабельной
    });
  });

  test.describe('gRPC вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGrpc.click();
    });

    test('Проверка всех элементов gRPC вкладки', async () => {
      await expect(app.grpc.loadProtoBtn).toBeVisible();
      await expect(app.grpc.addressInput).toBeVisible();
      await expect(app.grpc.tlsCheckbox).toBeVisible();
      await expect(app.grpc.sendBtn).toBeVisible();
      await expect(app.grpc.bodyTab).toBeVisible();
      await expect(app.grpc.jsonEditor).toBeVisible();
    });

    test('Ввод адреса сервера', async () => {
      const addresses = [
        'localhost:50051',
        'localhost:8080',
        '127.0.0.1:50051'
      ];

      for (const addr of addresses) {
        await app.grpc.addressInput.fill(addr);
        await expect(app.grpc.addressInput).toHaveValue(addr);
      }
    });

    test('Проверка TLS чекбокса', async () => {
      await expect(app.grpc.tlsCheckbox).toBeVisible();
      await app.grpc.tlsCheckbox.click();
      await expect(app.grpc.tlsCheckbox).toBeChecked();
      
      // Снимаем галочку
      await app.grpc.tlsCheckbox.click();
      await expect(app.grpc.tlsCheckbox).not.toBeChecked();
    });

    test('Клик по вкладке Body', async () => {
      await app.grpc.bodyTab.click();
      await expect(app.grpc.jsonEditor).toBeVisible();
    });

    test('Ввод JSON в редактор', async () => {
      const testJsons = [
        '{"key": "value"}',
        '{"name": "test", "count": 42}',
        '{"nested": {"inner": "data"}}'
      ];

      await app.grpc.bodyTab.click();
      
      for (const json of testJsons) {
        await app.grpc.jsonEditor.fill(json);
        await expect(app.grpc.jsonEditor).toContainText(json);
      }
    });

    test('Клик по кнопке Load Proto', async () => {
      await app.grpc.loadProtoBtn.click();
      // Должно открыться диалоговое окно выбора файла
    });
  });

  test.describe('Generator вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnGenerator.click();
    });

    test('Проверка всех элементов Generator вкладки', async () => {
      await expect(app.generator.dropzone).toBeVisible();
      await expect(app.generator.openFileBtn).toBeVisible();
      await expect(app.generator.apiUrlInput).toBeVisible();
      await expect(app.generator.frameworkDropdown).toBeVisible();
      await expect(app.generator.negativeTestsCheckbox).toBeVisible();
      await expect(app.generator.generateBtn).toBeVisible();
      await expect(app.generator.saveFileBtn).toBeVisible();
    });

    test('Ввод API URL', async () => {
      const urls = [
        'https://api.github.com',
        'https://jsonplaceholder.typicode.com',
        'http://localhost:8080/api'
      ];

      for (const url of urls) {
        await app.generator.apiUrlInput.fill(url);
        await expect(app.generator.apiUrlInput).toHaveValue(url);
      }
    });

    test('Проверка чекбокса негативных тестов', async () => {
      await expect(app.generator.negativeTestsCheckbox).toBeVisible();
      
      await app.generator.negativeTestsCheckbox.click();
      await expect(app.generator.negativeTestsCheckbox).toBeChecked();
      
      await app.generator.negativeTestsCheckbox.click();
      await expect(app.generator.negativeTestsCheckbox).not.toBeChecked();
    });

    test('Клик по кнопке открытия файла', async () => {
      await app.generator.openFileBtn.click();
      // Должно открыться диалоговое окно
    });

    test('Клик по кнопке генерации', async () => {
      await app.generator.generateBtn.click();
      // Кнопка должна быть кликабельной
    });

    test('Клик по кнопке сохранения', async () => {
      await app.generator.saveFileBtn.click();
      // Кнопка должна быть кликабельной
    });
  });

  test.describe('Runner вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnRunner.click();
    });

    test('Проверка всех элементов Runner вкладки', async () => {
      await expect(app.runner.collectionDropdown).toBeVisible();
      await expect(app.runner.iterationsInput).toBeVisible();
      await expect(app.runner.runBtn).toBeVisible();
    });

    test('Ввод количества итераций', async () => {
      const iterations = ['1', '5', '10', '50', '100'];

      for (const iter of iterations) {
        await app.runner.iterationsInput.fill(iter);
        await expect(app.runner.iterationsInput).toHaveValue(iter);
      }
    });

    test('Очистка поля итераций', async () => {
      await app.runner.iterationsInput.fill('10');
      await app.runner.iterationsInput.clear();
      await expect(app.runner.iterationsInput).toHaveValue('');
    });

    test('Клик по кнопке запуска', async () => {
      await app.runner.runBtn.click();
      // Кнопка должна быть кликабельной
    });
  });

  test.describe('History вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnHistory.click();
    });

    test('Проверка всех элементов History вкладки', async () => {
      await expect(app.history.searchInput).toBeVisible();
      await expect(app.history.filterAll).toBeVisible();
      await expect(app.history.filter2xx).toBeVisible();
      await expect(app.history.filterErr).toBeVisible();
      await expect(app.history.clearBtn).toBeVisible();
    });

    test('Ввод текста в поиск', async () => {
      const searches = ['GET', 'POST', 'users', 'api/v1'];

      for (const search of searches) {
        await app.history.searchInput.fill(search);
        await expect(app.history.searchInput).toHaveValue(search);
      }
    });

    test('Очистка поля поиска', async () => {
      await app.history.searchInput.fill('test search');
      await app.history.searchInput.clear();
      await expect(app.history.searchInput).toHaveValue('');
    });

    test('Клик по фильтру All', async () => {
      await app.history.filterAll.click();
      // Фильтр должен стать активным
    });

    test('Клик по фильтру 2xx', async () => {
      await app.history.filter2xx.click();
      // Фильтр должен стать активным
    });

    test('Клик по фильтру Err', async () => {
      await app.history.filterErr.click();
      // Фильтр должен стать активным
    });

    test('Клик по кнопке Clear', async () => {
      await app.history.clearBtn.click();
      // История должна очиститься
    });
  });

  test.describe('EVA вкладка - UI элементы', () => {
    test.beforeEach(async () => {
      await app.topMenu.btnEva.click();
    });

    test('Проверка всех элементов EVA вкладки', async () => {
      await expect(app.eva.testFolderTab).toBeVisible();
      await expect(app.eva.zipArchiveTab).toBeVisible();
      await expect(app.eva.uploadZipBtn).toBeVisible();
    });

    test('Клик по вкладке "Папка с тестами"', async () => {
      await app.eva.testFolderTab.click();
      // Вкладка должна стать активной
    });

    test('Клик по вкладке "ZIP-архив"', async () => {
      await app.eva.zipArchiveTab.click();
      // Вкладка должна стать активной
    });

    test('Клик по кнопке загрузки ZIP', async () => {
      await app.eva.uploadZipBtn.click();
      // Должно открыться диалоговое окно
    });
  });
});