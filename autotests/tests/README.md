# 🧪 Руководство по автотестам Pe4King

Этот документ описывает структуру, настройку и запуск автотестов проекта Pe4King.

---

## 📋 Содержание

1. [Быстрый старт](#-быстрый-старт)
2. [Настройка конфигурации](#%EF%B8%8F-настройка-конфигурации)
3. [Запуск тестов](#-запуск-тестов)
4. [Структура тестов](#-структура-тестов)
5. [Написание новых тестов](#-написание-новых-тестов)
6. [Page Object Model](#-page-object-model)
7. [Советы и лучшие практики](#-советы-и-лучшие-практики)
8. [Устранение проблем](#-устранение-проблем)

---

## 🚀 Быстрый старт

### Минимальная настройка для запуска тестов

```bash
# 1. Перейдите в папку с тестами
cd autotests

# 2. Установите зависимости
npm install

# 3. Скопируйте конфиг
cp config.local.example.ts config.local.ts

# 4. Отредактируйте config.local.ts - укажите путь к приложению

# 5. Запустите тесты
npm test
```

---

## ⚙️ Настройка конфигурации

### Шаг 1: Копирование конфигурации

```bash
cd autotests
cp config.local.example.ts config.local.ts
```

### Шаг 2: Редактирование config.local.ts

Откройте файл `config.local.ts` и укажите путь к вашему приложению:

```typescript
export const localConfig = {
  // Путь к исполняемому файлу Pe4King
  appPath: 'C:\\Users\\YOUR_NAME\\AppData\\Local\\Pe4King\\pe4king-desktop.exe',
  
  // Порт для отладки (не менять, если не требуется)
  debugPort: 9222,
  
  // Таймаут запуска приложения (мс)
  appLaunchTimeout: 5000,
};
```

> ⚠️ **Важно:** Файл `config.local.ts` добавлен в `.gitignore` и не будет закоммичен в репозиторий!

---

## 🚀 Запуск тестов

### Запуск всех тестов

```bash
cd autotests

# Все тесты (headless режим - без открытия браузера)
npm test

# Все тесты (headed режим - с открытием браузера)
npx playwright test --headed

# Все тесты с подробным выводом
npx playwright test --reporter=list
```

### Запуск конкретных тестов

```bash
# Smoke тесты (быстрая проверка)
npx playwright test tests/smoke/smoke.spec.ts --headed

# Навигационные тесты
npx playwright test tests/navigation/navigation.spec.ts --headed

# HTTP тесты
npx playwright test tests/http/http.spec.ts --headed

# gRPC тесты
npx playwright test tests/grpc/grpc.spec.ts --headed
npx playwright test tests/grpc/grpc-advanced.spec.ts --headed

# ENV тесты
npx playwright test tests/env/env.spec.ts --headed
npx playwright test tests/environment/env-variables.spec.ts --headed

# Generator тесты
npx playwright test tests/generator/generator.spec.ts --headed

# Runner тесты
npx playwright test tests/runner/runner.spec.ts --headed

# History тесты
npx playwright test tests/history/history.spec.ts --headed
npx playwright test tests/history/history-advanced.spec.ts --headed

# EVA тесты
npx playwright test tests/eva/eva.spec.ts --headed

# UI тесты
npx playwright test tests/ui/ui-elements.spec.ts --headed

# Интеграционные тесты
npx playwright test tests/integration/integration.spec.ts --headed

# Тесты кнопок
npx playwright test tests/buttons/buttons.spec.ts --headed

# Тесты коллекций
npx playwright test tests/collections/collections.spec.ts --headed

# Тесты вкладок
npx playwright test tests/tabs/tabs.spec.ts --headed

# Краевые случаи
npx playwright test tests/edge-cases/edge-cases.spec.ts --headed
```

### Запуск через фильтр по названию

```bash
# Запуск тестов containing "SMOKE" в названии
npx playwright test --grep "SMOKE"

# Запуск тестов containing "HTTP" в названии
npx playwright test --grep "HTTP"
```

### Запуск через VS Code

1. Установите расширение **Playwright Test for VSCode**
2. Откройте панель Testing в VS Code
3. Найдите нужный тест в списке
4. Нажмите ▶️ для запуска одного теста или всей группы

---

## 📁 Структура тестов

```
autotests/
├── tests/                      # Папка с тестами
│   ├── smoke/                  # 🔥 Дымовые тесты (запускать первыми!)
│   │   └── smoke.spec.ts
│   ├── navigation/             # 🧭 Навигация по приложению
│   │   └── navigation.spec.ts
│   ├── http/                   # 🌐 HTTP функциональность
│   │   └── http.spec.ts
│   ├── grpc/                   # 🔌 gRPC функциональность
│   │   ├── grpc.spec.ts
│   │   └── grpc-advanced.spec.ts
│   ├── env/                    # 🔧 Переменные окружения
│   │   └── env.spec.ts
│   ├── environment/            # 📦 Переменные окружения (доп. тесты)
│   │   └── env-variables.spec.ts
│   ├── generator/              # ⚙️ Генератор тестов
│   │   └── generator.spec.ts
│   ├── runner/                 # ▶️ Запуск коллекций
│   │   └── runner.spec.ts
│   ├── history/                # 📜 История запросов
│   │   ├── history.spec.ts
│   │   └── history-advanced.spec.ts
│   ├── eva/                    # 📥 EVA (загрузка тестов)
│   │   └── eva.spec.ts
│   ├── ui/                     # 🎨 UI элементы
│   │   └── ui-elements.spec.ts
│   ├── buttons/                # 🔘 Кнопки
│   │   └── buttons.spec.ts
│   ├── tabs/                   # 📑 Вкладки
│   │   └── tabs.spec.ts
│   ├── collections/            # 📚 Коллекции
│   │   └── collections.spec.ts
│   ├── integration/            # 🔗 Интеграционные тесты
│   │   └── integration.spec.ts
│   └── edge-cases/             # 🎯 Краевые случаи
│       └── edge-cases.spec.ts
│
├── src/
│   ├── pages/                  # Page Objects для страниц
│   │   ├── HttpPage.ts
│   │   ├── GrpcPage.ts
│   │   ├── EnvPage.ts
│   │   ├── EvaPage.ts
│   │   ├── GenPage.ts
│   │   ├── RunnerPage.ts
│   │   └── HistoryPage.ts
│   ├── components/             # Общие компоненты
│   │   ├── TopMenu.ts
│   │   └── BaseTest.ts
│   └── App.ts                  # Основной класс приложения
│
├── config.ts                   # Основная конфигурация
├── config.local.example.ts     # Шаблон локальной конфигурации
├── config.local.ts             # Локальная конфигурация (не в git!)
└── playwright.config.ts        # Конфигурация Playwright
```

---

## 📋 Описание тестовых наборов

### 🔥 Smoke тесты (`smoke.spec.ts`)
Быстрая проверка базовой функциональности:
- Запуск приложения
- Видимость верхнего меню
- Переход по всем вкладкам
- Базовые проверки кнопок (Send, Generate, Run)

**Время выполнения:** ~1 минута

### 🧭 Navigation тесты (`navigation.spec.ts`)
Проверка навигации между вкладками:
- Переход на каждую вкладку
- Полный цикл переключения
- Возврат на предыдущую вкладку

### 🌐 HTTP тесты (`http.spec.ts`)
Тестирование HTTP функциональности:
- Создание коллекции
- Методы запросов (GET, POST, etc.)
- Ввод и отправка URL
- Проверка ответа

### 🔌 gRPC тесты (`grpc.spec.ts`, `grpc-advanced.spec.ts`)
Тестирование gRPC функциональности:
- Загрузка .proto файлов
- Настройка адреса сервера
- TLS настройки
- Ввод JSON в редактор
- Отправка запросов

### 🔧 ENV тесты (`env.spec.ts`, `env-variables.spec.ts`)
Управление переменными окружения:
- Вкладка Global
- Ввод и очистка baseUrl
- Extract from response
- Сохранение при переключении вкладок

### ⚙️ Generator тесты (`generator.spec.ts`)
Генератор тестов:
- Dropzone для файлов
- API URL настройки
- Выбор фреймворка
- Негативные тесты
- Генерация и сохранение

### ▶️ Runner тесты (`runner.spec.ts`)
Запуск коллекций:
- Выбор коллекции
- Настройка итераций
- Запуск тестов

### 📜 History тесты (`history.spec.ts`, `history-advanced.spec.ts`)
История запросов:
- Поиск по истории
- Фильтры (All, 2xx, Err)
- Очистка истории

### 📥 EVA тесты (`eva.spec.ts`)
EVA функциональность:
- Папка с тестами
- ZIP-архив
- Загрузка архивов

### 🎨 UI тесты (`ui-elements.spec.ts`)
Проверка UI элементов на всех вкладках

### 🔘 Кнопки тесты (`buttons.spec.ts`)
Тестирование всех кнопок приложения:
- Кнопки меню
- Send кнопки
- Generate, Run, Extract
- Clear, Load Proto, Save, Open File

### 📑 Вкладки тесты (`tabs.spec.ts`)
Детальные тесты вкладок:
- Переключение между вкладками
- Проверка доступности
- Hover эффекты

### 📚 Коллекции тесты (`collections.spec.ts`)
Работа с коллекциями:
- Создание коллекций
- Именование
- Добавление запросов

### 🔗 Интеграционные тесты (`integration.spec.ts`)
Комплексные сценарии:
- HTTP сценарии
- ENV сценарии
- gRPC сценарии
- Кросс-функциональные тесты

### 🎯 Краевые случаи (`edge-cases.spec.ts`)
Тестирование граничных условий:
- Пустые значения
- Специальные символы
- Длинные строки
- Unicode и emoji
- XSS и SQL Injection попытки

---

## ✍️ Написание новых тестов

### Базовый шаблон теста

```typescript
import { test, expect } from '@playwright/test';
import { App } from '../../src/App';
import { HttpPage } from '../../pages/HttpPage';

test.describe('Название набора тестов', () => {
  let app: App;
  let httpPage: HttpPage;

  test.beforeEach(async ({ page }) => {
    // Инициализация приложения
    app = new App(page);
    httpPage = new HttpPage(page);
    
    // Запуск приложения
    await app.launch();
  });

  test.afterEach(async () => {
    // Очистка - закрытие приложения
    await app.close();
  });

  test('Описание конкретного теста', async () => {
    // Тело теста
    await httpPage.urlInput.fill('https://api.example.com');
    await httpPage.sendBtn.click();
    
    // Проверка результата
    await expect(httpPage.responseEmptyPlaceholder).toBeVisible();
  });
});
```

### Рекомендации по написанию

1. **Имя теста должно быть понятным**
   ```typescript
   test('Ввод URL и отправка запроса', async () => { ... });
   ```

2. **Используйте Arrange-Act-Assert паттерн**
   ```typescript
   // Arrange (Подготовка)
   await page.fill('#url', 'https://api.example.com');
   
   // Act (Действие)
   await page.click('#send-btn');
   
   // Assert (Проверка)
   await expect(page.locator('#response')).toBeVisible();
   ```

3. **Добавляйте явные ожидания**
   ```typescript
   // ❌ Плохо
   await page.waitForTimeout(2000);
   
   // ✅ Хорошо
   await expect(page.locator('#element')).toBeVisible();
   ```

---

## 🧱 Page Object Model

### Что такое Page Object?

Page Object - это паттерн проектирования, который инкапсулирует взаимодействие с элементами страницы в отдельные классы.

### Структура Page Object

```typescript
// autotests/src/pages/HttpPage.ts
import { Page, Locator } from '@playwright/test';

export class HttpPage {
  readonly urlInput: Locator;
  readonly sendBtn: Locator;
  readonly methodDropdown: Locator;

  constructor(page: Page) {
    this.urlInput = page.locator('#url-input');
    this.sendBtn = page.getByRole('button', { name: 'Send' });
    this.methodDropdown = page.getByText('GET');
  }

  // Методы для взаимодействия
  async navigateToUrl(url: string) {
    await this.urlInput.fill(url);
  }

  async sendRequest() {
    await this.sendBtn.click();
  }
}
```

### Использование Page Object в тестах

```typescript
import { test, expect } from '@playwright/test';
import { HttpPage } from '../../pages/HttpPage';

test.describe('HTTP тесты', () => {
  let httpPage: HttpPage;

  test.beforeEach(async ({ page }) => {
    httpPage = new HttpPage(page);
  });

  test('Отправка запроса', async () => {
    await httpPage.navigateToUrl('https://api.example.com');
    await httpPage.sendRequest();
    
    await expect(httpPage.sendBtn).toBeVisible();
  });
});
```

### Существующие Page Objects

| Класс | Описание | Основные элементы |
|-------|----------|-------------------|
| `HttpPage` | HTTP вкладка | urlInput, sendBtn, methodDropdown |
| `GrpcPage` | gRPC вкладка | loadProtoBtn, addressInput, sendBtn |
| `EnvPage` | ENV вкладка | baseUrlInput, extractBtn, globalTab |
| `GenPage` | Generator вкладка | dropzone, apiUrlInput, generateBtn |
| `RunnerPage` | Runner вкладка | collectionDropdown, iterationsInput, runBtn |
| `HistoryPage` | History вкладка | searchInput, filters, clearBtn |
| `EvaPage` | EVA вкладка | testFolderTab, zipArchiveTab, uploadBtn |

---

## 💡 Советы и лучшие практики

### ✅ DO (Делай)

1. **Используй Page Object Model**
   ```typescript
   // ✅ Хорошо
   await httpPage.sendBtn.click();
   
   // ❌ Плохо
   await page.locator('#send-btn').click();
   ```

2. **Давай понятные имена тестам**
   ```typescript
   // ✅ Хорошо
   test('Ввод пустого URL должен показать ошибку', async () => { ... });
   
   // ❌ Плохо
   test('test1', async () => { ... });
   ```

3. **Используй явные ожидания**
   ```typescript
   // ✅ Хорошо
   await expect(page.locator('#element')).toBeVisible();
   
   // ❌ Плохо
   await page.waitForTimeout(5000);
   ```

4. **Группируй тесты логически**
   ```typescript
   test.describe('Создание коллекции', () => {
     test('Создание с уникальным именем', async () => { ... });
     test('Создание с пустым именем', async () => { ... });
   });
   ```

5. **Очищай данные после тестов**
   ```typescript
   test.afterEach(async () => {
     await app.close();
   });
   ```

### ❌ DON'T (Не делай)

1. **Не используй жесткие таймауты**
   ```typescript
   // ❌ Плохо
   await page.waitForTimeout(3000);
   
   // ✅ Хорошо
   await expect(page.locator('#element')).toBeVisible();
   ```

2. **Не дублируй код**
   ```typescript
   // ❌ Плохо - дублирование
   await page.click('#btn1');
   await page.click('#btn1');
   
   // ✅ Хорошо - вынести в метод
   async function clickSendTwice() { ... }
   ```

3. **Не создай слишком большие тесты**
   ```typescript
   // ❌ Плохо - тест на 100 строк
   test('Огромный тест', async () => { ... });
   
   // ✅ Хорошо - разбить на несколько
   test('Создание коллекции', async () => { ... });
   test('Добавление запроса', async () => { ... });
   ```

---

## 🔧 Устранение проблем

### Ошибка `ECONNREFUSED 127.0.0.1:9222`

**Причина:** Приложение не запустилось или порт занят

**Решение:**
```bash
# 1. Закройте все процессы pe4king-desktop.exe
taskkill /F /IM pe4king-desktop.exe

# 2. Проверьте, что порт свободен
netstat -ano | findstr :9222

# 3. Перезапустите тесты
npm test
```

### Playwright не находит элементы

**Причина:** Элемент ещё не загрузился

**Решение:**
```typescript
// Добавьте явное ожидание
await expect(page.locator('#element')).toBeVisible({ timeout: 5000 });

// Или используйте waitFor
await page.waitForSelector('#element', { state: 'visible' });
```

### Тесты падают случайным образом

**Причина:** Race conditions, нестабильные локаторы

**Решение:**
1. Проверьте локаторы в Page Objects
2. Добавьте более стабильные селекторы (data-testid)
3. Используйте явные ожидания

### Ошибка запуска приложения

**Причина:** Неверный путь к приложению

**Решение:**
1. Проверьте путь в `config.local.ts`
2. Убедитесь, что приложение установлено
3. Проверьте права доступа к файлу

---

## 📊 Отчётность

### Генерация HTML отчёта

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Генерация JSON отчёта

```bash
npx playwright test --reporter=json
```

---

## 📚 Дополнительные ресурсы

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## ❓ FAQ

### Как запустить только один конкретный тест?

```bash
# Используйте --grep с точным названием
npx playwright test --grep "Точное название теста"
```

### Как запустить тесты в режиме отладки?

```bash
# Режим отладки с открытием браузера
npx playwright test --headed --debug

# Или используйте VS Code extension
```

### Как добавить новый тест?

1. Создайте файл в соответствующей папке `tests/`
2. Используйте базовый шаблон из раздела [Написание новых тестов](#-написание-новых-тестов)
3. Добавьте необходимые Page Objects если нужно
4. Запустите тест для проверки

### Как обновить локаторы в Page Objects?

1. Откройте файл в `src/pages/`
2. Обновите локаторы используя DevTools приложения
3. Проверьте что старые тесты работают с новыми локаторами

---

**Последнее обновление:** 2026