/**
 * Пример локальной конфигурации для автотестов Pe4King.
 * 
 * ИНСТРУКЦИЯ:
 * 1. Скопируйте этот файл в config.local.ts
 * 2. Измените значения под вашу систему
 * 3. НЕ коммитьте config.local.ts в git (он в .gitignore)
 */

export const localConfig = {
  // Путь к исполняемому файлу приложения НА ВАШЕЙ МАШИНЕ
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