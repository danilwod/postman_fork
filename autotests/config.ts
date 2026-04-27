/**
 * Конфигурационный файл для автотестов Pe4King.
 * 
 * Все чувствительные данные и локальные пути вынесены в этот файл.
 * Для использования в команде:
 * 1. Скопируйте этот файл как config.local.ts
 * 2. Измените значения в config.local.ts под вашу систему
 * 3. Добавьте config.local.ts в .gitignore (уже добавлен)
 * 
 * ВАЖНО: Никогда не коммитьте config.local.ts с личными данными!
 */

// Значения по умолчанию (ДЛЯ ПРИМЕРА - замените в config.local.ts)
export const defaultConfig = {
  // Путь к исполняемому файлу приложения
  // ВНИМАНИЕ: Замените на свой путь в config.local.ts!
  appPath: 'C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Pe4King\\pe4king-desktop.exe',
  
  // Порт для отладки WebView2
  debugPort: 9222,
  
  // Таймаут ожидания запуска приложения (мс)
  appLaunchTimeout: 5000,
  
  // Таймауты для тестов (мс)
  testTimeout: 30000,
  expectTimeout: 5000,
  
  // Базовый URL для тестовых запросов
  testBaseUrl: 'https://api.example.com',
  
  // Тестовые данные
  testData: {
    httpUrl: 'https://jsonplaceholder.typicode.com/posts/1',
    grpcAddress: 'localhost:50051',
    collectionName: 'Test Collection',
  },
};

// Попытка загрузить локальную конфигурацию (если существует)
let localConfig = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  localConfig = require('./config.local').localConfig || {};
} catch (e) {
  // Файл config.local.ts не найден, используем значения по умолчанию
}

// Экспортируем объединенную конфигурацию
// Локальные настройки переопределяют значения по умолчанию
export const config = {
  ...defaultConfig,
  ...localConfig,
  testData: {
    ...defaultConfig.testData,
    ...(localConfig as any).testData,
  },
};

// Тип для конфигурации
export type Config = typeof config;