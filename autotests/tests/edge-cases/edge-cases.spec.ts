import { test, expect, chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { App } from '../../src/App';
import { config } from '../../config';

/**
 * Набор тестов для проверки краевых случаев и граничных условий.
 * Проверяет поведение приложения в нестандартных ситуациях.
 */
test.describe('Краевые случаи', () => {
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

  test.describe('Пустые значения и ввод', () => {
    test('Ввод пустой строки в URL поле HTTP', async () => {
      await app.topMenu.btnHttp.click();
      
      await app.http.urlInput.fill('');
      await expect(app.http.urlInput).toHaveValue('');
    });

    test('Ввод пробелов в URL поле', async () => {
      await app.topMenu.btnHttp.click();
      
      const spaceStrings = [' ', '   ', '    '];
      for (const str of spaceStrings) {
        await app.http.urlInput.fill(str);
        await expect(app.http.urlInput).toHaveValue(str);
      }
    });

    test('Ввод пустого значения в ENV baseUrl', async () => {
      await app.topMenu.btnEnv.click();
      
      await app.env.baseUrlInput.fill('');
      await expect(app.env.baseUrlInput).toHaveValue('');
    });

    test('Ввод пробелов в ENV baseUrl', async () => {
      await app.topMenu.btnEnv.click();
      
      await app.env.baseUrlInput.fill('   ');
      await expect(app.env.baseUrlInput).toHaveValue('   ');
    });

    test('Ввод пустого значения в gRPC адрес', async () => {
      await app.topMenu.btnGrpc.click();
      
      await app.grpc.addressInput.fill('');
      await expect(app.grpc.addressInput).toHaveValue('');
    });

    test('Ввод пустого значения в Generator API URL', async () => {
      await app.topMenu.btnGenerator.click();
      
      await app.generator.apiUrlInput.fill('');
      await expect(app.generator.apiUrlInput).toHaveValue('');
    });

    test('Ввод пустого значения в History поиск', async () => {
      await app.topMenu.btnHistory.click();
      
      await app.history.searchInput.fill('');
      await expect(app.history.searchInput).toHaveValue('');
    });

    test('Ввод пустого значения в Runner итерации', async () => {
      await app.topMenu.btnRunner.click();
      
      await app.runner.iterationsInput.fill('');
      await expect(app.runner.iterationsInput).toHaveValue('');
    });
  });

  test.describe('Специальные символы и экранирование', () => {
    test('Ввод специальных символов в HTTP URL', async () => {
      await app.topMenu.btnHttp.click();
      
      const specialChars = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE users; --",
        '{{constructor.constructor("alert(1)")()}}',
        '${7*7}',
        '#{7*7}',
        '{{config}}',
        '${env:PATH}',
        '%00%01%02',
        '\n\r\t',
        '你好世界',
        'Привет мир',
        '🎉🚀💻'
      ];

      for (const chars of specialChars) {
        await app.http.urlInput.fill(chars);
        await expect(app.http.urlInput).toHaveValue(chars);
      }
    });

    test('Ввод специальных символов в ENV baseUrl', async () => {
      await app.topMenu.btnEnv.click();
      
      const specialChars = [
        '<>&"\'',
        '{{variable}}',
        '${env:VAR}',
        '\\n\\r\\t',
        'éàüöß'
      ];

      for (const chars of specialChars) {
        await app.env.baseUrlInput.fill(chars);
        await expect(app.env.baseUrlInput).toHaveValue(chars);
      }
    });

    test('Ввод специальных символов в gRPC адрес', async () => {
      await app.topMenu.btnGrpc.click();
      
      const specialChars = [
        'localhost:50051<script>',
        'host:port\' OR \'1\'=\'1',
        '127.0.0.1;ls -la'
      ];

      for (const chars of specialChars) {
        await app.grpc.addressInput.fill(chars);
        await expect(app.grpc.addressInput).toHaveValue(chars);
      }
    });

    test('Ввод специальных символов в History поиск', async () => {
      await app.topMenu.btnHistory.click();
      
      const specialChars = [
        '*?[]{}()',
        '.^$+\\|',
        '%20%2F%3F',
        '<>&'
      ];

      for (const chars of specialChars) {
        await app.history.searchInput.fill(chars);
        await expect(app.history.searchInput).toHaveValue(chars);
      }
    });
  });

  test.describe('Длинные строки', () => {
    test('Ввод очень длинного URL в HTTP', async () => {
      await app.topMenu.btnHttp.click();
      
      const longUrl = 'https://api.example.com/' + 'a'.repeat(2000) + '/' + 'b'.repeat(500);
      await app.http.urlInput.fill(longUrl);
      await expect(app.http.urlInput).toHaveValue(longUrl);
    });

    test('Ввод длинного значения в ENV baseUrl', async () => {
      await app.topMenu.btnEnv.click();
      
      const longUrl = 'https://api.example.com/' + 'x'.repeat(1000);
      await app.env.baseUrlInput.fill(longUrl);
      await expect(app.env.baseUrlInput).toHaveValue(longUrl);
    });

    test('Ввод длинного поискового запроса в History', async () => {
      await app.topMenu.btnHistory.click();
      
      const longSearch = 'GET /api/' + 'resource'.repeat(100);
      await app.history.searchInput.fill(longSearch);
      await expect(app.history.searchInput).toHaveValue(longSearch);
    });

    test('Ввод длинного JSON в gRPC редактор', async () => {
      await app.topMenu.btnGrpc.click();
      await app.grpc.bodyTab.click();
      
      const longJson = '{"data": "' + 'x'.repeat(5000) + '"}';
      await app.grpc.jsonEditor.fill(longJson);
      await expect(app.grpc.jsonEditor).toContainText(longJson);
    });
  });

  test.describe('Числовые граничные значения', () => {
    test('Ввод граничных значений в итерации Runner', async () => {
      await app.topMenu.btnRunner.click();
      
      const boundaryValues = [
        '0',
        '1',
        '999',
        '9999',
        '99999',
        '-1',
        '-999',
        '1.5',
        '0.1',
        '99.99'
      ];

      for (const value of boundaryValues) {
        await app.runner.iterationsInput.fill(value);
        await expect(app.runner.iterationsInput).toHaveValue(value);
      }
    });

    test('Ввод научных обозначений в итерации Runner', async () => {
      await app.topMenu.btnRunner.click();
      
      const scientificValues = ['1e5', '1E5', '1.5e3', '2E-3'];
      
      for (const value of scientificValues) {
        await app.runner.iterationsInput.fill(value);
        await expect(app.runner.iterationsInput).toHaveValue(value);
      }
    });
  });

  test.describe('Быстрые повторные действия', () => {
    test('Многократный быстрый ввод в URL поле', async () => {
      await app.topMenu.btnHttp.click();
      
      for (let i = 0; i < 10; i++) {
        await app.http.urlInput.fill(`https://api${i}.example.com`);
      }
      await expect(app.http.urlInput).toHaveValue('https://api9.example.com');
    });

    test('Многократный быстрый клик по кнопке Send', async () => {
      await app.topMenu.btnHttp.click();
      
      for (let i = 0; i < 5; i++) {
        await app.http.sendBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });

    test('Многократное переключение вкладок', async () => {
      for (let i = 0; i < 10; i++) {
        await app.topMenu.btnHttp.click();
        await app.topMenu.btnGrpc.click();
      }
      await expect(app.grpc.sendBtn).toBeVisible();
    });

    test('Многократный ввод и очистка', async () => {
      await app.topMenu.btnHttp.click();
      
      for (let i = 0; i < 5; i++) {
        await app.http.urlInput.fill('test');
        await app.http.urlInput.clear();
      }
      await expect(app.http.urlInput).toHaveValue('');
    });
  });

  test.describe('Состояния гонки и тайминги', () => {
    test('Быстрое переключение во время ввода', async () => {
      await app.topMenu.btnHttp.click();
      await app.http.urlInput.fill('https://api.example.com');
      
      // Быстро переключаемся на другую вкладку
      await app.topMenu.btnGrpc.click();
      await app.topMenu.btnHttp.click();
      
      // Проверяем, что значение сохранилось
      await expect(app.http.urlInput).toHaveValue('https://api.example.com');
    });

    test('Ввод во время переключения вкладок', async () => {
      await app.topMenu.btnHttp.click();
      
      // Начинаем ввод и быстро переключаемся
      await app.http.urlInput.fill('https://');
      await app.topMenu.btnEnv.click();
      await app.topMenu.btnHttp.click();
      
      // Проверяем, что ввод сохранился
      await expect(app.http.urlInput).toHaveValue('https://');
    });
  });

  test.describe('Некорректные URL и адреса', () => {
    test('Ввод некорректных URL в HTTP', async () => {
      await app.topMenu.btnHttp.click();
      
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'file:///etc/passwd',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'http://',
        'https://',
        '://no-protocol.com',
        'http://[invalid]',
        'https://example.com:99999'
      ];

      for (const url of invalidUrls) {
        await app.http.urlInput.fill(url);
        await expect(app.http.urlInput).toHaveValue(url);
      }
    });

    test('Ввод некорректных адресов в gRPC', async () => {
      await app.topMenu.btnGrpc.click();
      
      const invalidAddresses = [
        'not-an-address',
        'localhost',
        ':50051',
        'localhost:',
        'localhost:abc',
        'localhost:99999',
        'localhost:-1',
        'localhost:50051:extra'
      ];

      for (const addr of invalidAddresses) {
        await app.grpc.addressInput.fill(addr);
        await expect(app.grpc.addressInput).toHaveValue(addr);
      }
    });
  });

  test.describe('Unicode и emoji', () => {
    test('Ввод emoji в различные поля', async () => {
      const emojiFields = [
        { tab: app.topMenu.btnHttp, field: app.http.urlInput },
        { tab: app.topMenu.btnEnv, field: app.env.baseUrlInput },
        { tab: app.topMenu.btnHistory, field: app.history.searchInput }
      ];

      const emojis = ['🎉', '🚀', '💻', '🔥', '✅', '👍', '🎯', '💡'];

      for (const { tab, field } of emojiFields) {
        await tab.click();
        for (const emoji of emojis) {
          await field.fill(emoji);
          await expect(field).toHaveValue(emoji);
        }
      }
    });

    test('Ввод смешанного текста с emoji', async () => {
      await app.topMenu.btnHttp.click();
      
      const mixedTexts = [
        'API 🚀 Test',
        'Hello 世界 🌍',
        'Привет 👋 Мир',
        'Test 🧪 Case ✅'
      ];

      for (const text of mixedTexts) {
        await app.http.urlInput.fill(text);
        await expect(app.http.urlInput).toHaveValue(text);
      }
    });
  });

  test.describe('HTML и XSS попытки', () => {
    test('Попытки XSS через различные поля', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
        '<marquee onstart=alert(1)>'
      ];

      const fields = [
        { tab: app.topMenu.btnHttp, field: app.http.urlInput, name: 'HTTP URL' },
        { tab: app.topMenu.btnEnv, field: app.env.baseUrlInput, name: 'ENV BaseUrl' },
        { tab: app.topMenu.btnHistory, field: app.history.searchInput, name: 'History Search' }
      ];

      for (const { tab, field, name } of fields) {
        await tab.click();
        for (const payload of xssPayloads) {
          await field.fill(payload);
          await expect(field).toHaveValue(payload);
        }
      }
    });
  });

  test.describe('SQL Injection попытки', () => {
    test('Попытки SQL Injection через различные поля', async () => {
      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "1' OR '1'='1' --",
        "admin'--",
        "1; DROP TABLE users",
        "' OR 1=1 --",
        "1' AND '1'='1"
      ];

      const fields = [
        { tab: app.topMenu.btnHttp, field: app.http.urlInput },
        { tab: app.topMenu.btnEnv, field: app.env.baseUrlInput },
        { tab: app.topMenu.btnHistory, field: app.history.searchInput }
      ];

      for (const { tab, field } of fields) {
        await tab.click();
        for (const payload of sqlPayloads) {
          await field.fill(payload);
          await expect(field).toHaveValue(payload);
        }
      }
    });
  });
});