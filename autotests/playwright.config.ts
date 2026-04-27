import { defineConfig } from '@playwright/test';

/**
 * Конфигурация Playwright для автотестов Pe4King.
 * 
 * Настройки для запуска тестов через Playwright Test Runner.
 */
export default defineConfig({
  // Директория с тестами
  testDir: './tests',
  
  // Таймаут для каждого теста (увеличен для медленного UI)
  timeout: 60000,
  
  // Таймаут ожидания действия (клик, ввод текста)
  expect: {
    timeout: 10000
  },
  
  // Количество параллельных воркеров
  workers: 6,
  
  // Отчет о результата тестов
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
  
  // Общие настройки для всех тестов
  use: {
    // Базовый URL (если нужен)
    baseURL: '',
    
    // Скриншоты при падении тестов
    screenshot: 'only-on-failure',
    
    // Видео при падении тестов
    video: 'retain-on-failure',
    
    // Трассировка для отладки
    trace: 'retain-on-failure',
  },
  
  // Директория для результатов тестов
  outputDir: './test-results',
});