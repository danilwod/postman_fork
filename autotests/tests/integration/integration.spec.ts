import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор интеграционных тестов для проверки взаимодействия между компонентами.
 * Проверяет сложные сценарии использования приложения.
 */
test.describe('Интеграционные тесты', () => {
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

  test.describe('Сценарии работы с HTTP', () => {
    test('Полный цикл HTTP запроса', async () => {
      // Переходим на HTTP вкладку
      await app.topMenu.btnHttp.click();
      
      // Вводим URL
      const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
      await app.http.urlInput.fill(testUrl);
      
      // Проверяем метод
      await expect(app.http.methodDropdown).toContainText('GET');
      
      // Кликаем Send
      await app.http.sendBtn.click();
      
      // Ждем появления ответа
      await expect(app.http.responseEmptyPlaceholder).not.toBeVisible({ timeout: 15000 });
    });

    test('Создание коллекции и добавление запроса', async () => {
      await app.topMenu.btnHttp.click();
      
      const collectionName = `Test Collection ${Date.now()}`;
      
      // Создаем коллекцию
      await app.http.newCollectionInput.fill(collectionName);
      await app.http.newCollectionInput.press('Enter');
      
      // Вводим URL запроса
      await app.http.urlInput.fill('https://api.example.com/test');
      
      // Отправляем запрос
      await app.http.sendBtn.click();
      
      // Проверяем, что кнопка Send активна
      await expect(app.http.sendBtn).toBeEnabled();
    });

    test('Смена HTTP метода и отправка запроса', async () => {
      await app.topMenu.btnHttp.click();
      
      // Кликаем на dropdown метода
      await app.http.methodDropdown.click();
      
      // Выбираем POST (предполагается, что есть такой элемент)
      const postOption = app.page.getByText('POST', { exact: true });
      if (await postOption.isVisible()) {
        await postOption.click();
        await expect(app.http.methodDropdown).toContainText('POST');
      }
      
      // Вводим URL
      await app.http.urlInput.fill('https://jsonplaceholder.typicode.com/posts');
      
      // Отправляем
      await app.http.sendBtn.click();
    });
  });

  test.describe('Сценарии работы с ENV', () => {
    test('Настройка ENV и использование в HTTP', async () => {
      // Настраиваем ENV
      await app.topMenu.btnEnv.click();
      const baseUrl = 'https://jsonplaceholder.typicode.com';
      await app.env.baseUrlInput.fill(baseUrl);
      
      // Переходим на HTTP
      await app.topMenu.btnHttp.click();
      
      // Проверяем, что ENV сохранился
      await app.topMenu.btnEnv.click();
      await expect(app.env.baseUrlInput).toHaveValue(baseUrl);
    });

    test('Переключение между ENV и другими вкладками', async () => {
      await app.topMenu.btnEnv.click();
      await app.env.baseUrlInput.fill('https://api.test.com');
      
      // Проходим по всем вкладкам и возвращаемся
      await app.topMenu.btnHttp.click();
      await app.topMenu.btnGrpc.click();
      await app.topMenu.btnGenerator.click();
      await app.topMenu.btnEnv.click();
      
      // Проверяем сохранение значения
      await expect(app.env.baseUrlInput).toHaveValue('https://api.test.com');
    });
  });

  test.describe('Сценарии работы с gRPC', () => {
    test('Полная настройка gRPC запроса', async () => {
      await app.topMenu.btnGrpc.click();
      
      // Вводим адрес
      await app.grpc.addressInput.fill('localhost:50051');
      
      // Включаем TLS
      await app.grpc.tlsCheckbox.click();
      await expect(app.grpc.tlsCheckbox).toBeChecked();
      
      // Переходим на Body и вводим JSON
      await app.grpc.bodyTab.click();
      const testJson = '{"method": "GetUser", "id": 123}';
      await app.grpc.jsonEditor.fill(testJson);
      
      // Проверяем JSON
      await expect(app.grpc.jsonEditor).toContainText(testJson);
      
      // Кликаем Send
      await app.grpc.sendBtn.click();
    });

    test('gRPC с переключением на другие вкладки', async () => {
      await app.topMenu.btnGrpc.click();
      await app.grpc.addressInput.fill('localhost:8080');
      
      // Переключаемся и возвращаемся
      await app.topMenu.btnHttp.click();
      await app.topMenu.btnGrpc.click();
      
      // Проверяем сохранение
      await expect(app.grpc.addressInput).toHaveValue('localhost:8080');
      
      // Включаем TLS
      await app.grpc.tlsCheckbox.click();
      await expect(app.grpc.tlsCheckbox).toBeChecked();
    });
  });

  test.describe('Сценарии работы с Generator', () => {
    test('Полная настройка генератора', async () => {
      await app.topMenu.btnGenerator.click();
      
      // Вводим API URL
      const apiUrl = 'https://api.github.com';
      await app.generator.apiUrlInput.fill(apiUrl);
      
      // Включаем негативные тесты
      await app.generator.negativeTestsCheckbox.click();
      await expect(app.generator.negativeTestsCheckbox).toBeChecked();
      
      // Кликаем генерировать
      await app.generator.generateBtn.click();
    });

    test('Generator с переключением вкладок', async () => {
      await app.topMenu.btnGenerator.click();
      await app.generator.apiUrlInput.fill('https://api.example.com');
      
      // Переключаемся на HTTP и возвращаемся
      await app.topMenu.btnHttp.click();
      await app.topMenu.btnGenerator.click();
      
      // Проверяем сохранение
      await expect(app.generator.apiUrlInput).toHaveValue('https://api.example.com');
    });
  });

  test.describe('Сценарии работы с Runner', () => {
    test('Настройка Runner и запуск', async () => {
      await app.topMenu.btnRunner.click();
      
      // Вводим количество итераций
      await app.runner.iterationsInput.fill('5');
      await expect(app.runner.iterationsInput).toHaveValue('5');
      
      // Кликаем запуск
      await app.runner.runBtn.click();
    });

    test('Runner с переключением вкладок', async () => {
      await app.topMenu.btnRunner.click();
      await app.runner.iterationsInput.fill('10');
      
      // Переключаемся и возвращаемся
      await app.topMenu.btnHistory.click();
      await app.topMenu.btnRunner.click();
      
      // Проверяем сохранение
      await expect(app.runner.iterationsInput).toHaveValue('10');
    });
  });

  test.describe('Сценарии работы с History', () => {
    test('Поиск и фильтрация в History', async () => {
      await app.topMenu.btnHistory.click();
      
      // Вводим поисковый запрос
      await app.history.searchInput.fill('GET');
      await expect(app.history.searchInput).toHaveValue('GET');
      
      // Кликаем фильтр 2xx
      await app.history.filter2xx.click();
      
      // Кликаем фильтр All
      await app.history.filterAll.click();
    });

    test('Очистка истории', async () => {
      await app.topMenu.btnHistory.click();
      
      // Кликаем очистку
      await app.history.clearBtn.click();
      
      // История должна быть очищена
    });

    test('History с переключением вкладок', async () => {
      await app.topMenu.btnHistory.click();
      await app.history.searchInput.fill('test search');
      
      // Переключаемся и возвращаемся
      await app.topMenu.btnEva.click();
      await app.topMenu.btnHistory.click();
      
      // Проверяем сохранение
      await expect(app.history.searchInput).toHaveValue('test search');
    });
  });

  test.describe('Сценарии работы с EVA', () => {
    test('Переключение между вкладками EVA', async () => {
      await app.topMenu.btnEva.click();
      
      // Кликаем на вкладку ZIP-архив
      await app.eva.zipArchiveTab.click();
      
      // Возвращаемся на Папка с тестами
      await app.eva.testFolderTab.click();
      
      // Проверяем видимость
      await expect(app.eva.testFolderTab).toBeVisible();
    });

    test('EVA с переключением на другие вкладки', async () => {
      await app.topMenu.btnEva.click();
      
      // Проходим по всем вкладкам
      await app.topMenu.btnEnv.click();
      await app.topMenu.btnHttp.click();
      await app.topMenu.btnGrpc.click();
      await app.topMenu.btnEva.click();
      
      // Проверяем видимость EVA элементов
      await expect(app.eva.testFolderTab).toBeVisible();
      await expect(app.eva.zipArchiveTab).toBeVisible();
    });
  });

  test.describe('Кросс-функциональные сценарии', () => {
    test('HTTP -> ENV -> Generator -> Runner', async () => {
      // Настраиваем HTTP
      await app.topMenu.btnHttp.click();
      await app.http.urlInput.fill('https://api.example.com');
      
      // Настраиваем ENV
      await app.topMenu.btnEnv.click();
      await app.env.baseUrlInput.fill('https://env.example.com');
      
      // Настраиваем Generator
      await app.topMenu.btnGenerator.click();
      await app.generator.apiUrlInput.fill('https://gen.example.com');
      await app.generator.negativeTestsCheckbox.click();
      
      // Настраиваем Runner
      await app.topMenu.btnRunner.click();
      await app.runner.iterationsInput.fill('3');
      
      // Проверяем все значения
      await app.topMenu.btnHttp.click();
      await expect(app.http.urlInput).toHaveValue('https://api.example.com');
      
      await app.topMenu.btnEnv.click();
      await expect(app.env.baseUrlInput).toHaveValue('https://env.example.com');
      
      await app.topMenu.btnGenerator.click();
      await expect(app.generator.apiUrlInput).toHaveValue('https://gen.example.com');
      await expect(app.generator.negativeTestsCheckbox).toBeChecked();
      
      await app.topMenu.btnRunner.click();
      await expect(app.runner.iterationsInput).toHaveValue('3');
    });

    test('gRPC -> History -> EVA -> HTTP', async () => {
      // Настраиваем gRPC
      await app.topMenu.btnGrpc.click();
      await app.grpc.addressInput.fill('localhost:50051');
      await app.grpc.tlsCheckbox.click();
      
      // Настраиваем History
      await app.topMenu.btnHistory.click();
      await app.history.searchInput.fill('POST');
      
      // Настраиваем EVA
      await app.topMenu.btnEva.click();
      await app.eva.zipArchiveTab.click();
      
      // Возвращаемся на HTTP
      await app.topMenu.btnHttp.click();
      await app.http.urlInput.fill('https://final.example.com');
      
      // Проверяем все значения
      await app.topMenu.btnGrpc.click();
      await expect(app.grpc.addressInput).toHaveValue('localhost:50051');
      await expect(app.grpc.tlsCheckbox).toBeChecked();
      
      await app.topMenu.btnHistory.click();
      await expect(app.history.searchInput).toHaveValue('POST');
      
      await app.topMenu.btnHttp.click();
      await expect(app.http.urlInput).toHaveValue('https://final.example.com');
    });

    test('Полный проход со сбором данных', async () => {
      const testData = {
        http: 'https://http-test.com',
        env: 'https://env-test.com',
        grpc: 'localhost:9999',
        generator: 'https://gen-test.com',
        runner: '7',
        history: 'filter-test',
        eva: 'zip'
      };

      // HTTP
      await app.topMenu.btnHttp.click();
      await app.http.urlInput.fill(testData.http);

      // ENV
      await app.topMenu.btnEnv.click();
      await app.env.baseUrlInput.fill(testData.env);

      // gRPC
      await app.topMenu.btnGrpc.click();
      await app.grpc.addressInput.fill(testData.grpc);

      // Generator
      await app.topMenu.btnGenerator.click();
      await app.generator.apiUrlInput.fill(testData.generator);

      // Runner
      await app.topMenu.btnRunner.click();
      await app.runner.iterationsInput.fill(testData.runner);

      // History
      await app.topMenu.btnHistory.click();
      await app.history.searchInput.fill(testData.history);

      // EVA
      await app.topMenu.btnEva.click();
      await app.eva.zipArchiveTab.click();

      // Проверяем все значения в обратном порядке
      await app.topMenu.btnHistory.click();
      await expect(app.history.searchInput).toHaveValue(testData.history);

      await app.topMenu.btnRunner.click();
      await expect(app.runner.iterationsInput).toHaveValue(testData.runner);

      await app.topMenu.btnGenerator.click();
      await expect(app.generator.apiUrlInput).toHaveValue(testData.generator);

      await app.topMenu.btnGrpc.click();
      await expect(app.grpc.addressInput).toHaveValue(testData.grpc);

      await app.topMenu.btnEnv.click();
      await expect(app.env.baseUrlInput).toHaveValue(testData.env);

      await app.topMenu.btnHttp.click();
      await expect(app.http.urlInput).toHaveValue(testData.http);
    });
  });

  test.describe('Стресс тесты', () => {
    test('Быстрое переключение между всеми вкладками', async () => {
      const tabs = [
        app.topMenu.btnEnv,
        app.topMenu.btnHttp,
        app.topMenu.btnGrpc,
        app.topMenu.btnGenerator,
        app.topMenu.btnRunner,
        app.topMenu.btnHistory,
        app.topMenu.btnEva
      ];

      // Быстрое переключение 5 раз
      for (let i = 0; i < 5; i++) {
        for (const tab of tabs) {
          await tab.click();
        }
      }

      // Проверяем, что последняя вкладка активна
      await expect(app.eva.testFolderTab).toBeVisible();
    });

    test('Множественный ввод данных на разных вкладках', async () => {
      for (let i = 0; i < 3; i++) {
        await app.topMenu.btnHttp.click();
        await app.http.urlInput.fill(`https://test${i}.com`);

        await app.topMenu.btnEnv.click();
        await app.env.baseUrlInput.fill(`https://env${i}.com`);

        await app.topMenu.btnGrpc.click();
        await app.grpc.addressInput.fill(`localhost:${5000 + i}`);
      }
    });
  });
});