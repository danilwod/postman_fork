


Вот максимально подробный `README.md` файл. Он написан так, чтобы любой новый тестировщик или разработчик, который придет на проект, смог прочитать его и сразу понять, как всё работает, где лежат кнопки и как написать свой первый тест.

Создай в папке `autotests` файл `README.md` и скопируй туда этот текст:

***

```markdown
# 📘 Руководство по автоматизации тестирования Pe4King

Добро пожаловать в проект автотестов для десктопного приложения **Pe4King** (Tauri / WebView2).  
Проект построен на базе **Playwright** с использованием языка **TypeScript** и паттерна **Page Object Model (POM)** в связке с Фасадом.

---

## 🗂 Структура проекта

Все файлы автотестов лежат в директории `autotests`. Архитектура спроектирована так, чтобы локаторы не дублировались, а тесты читались как простой английский текст.

```text
autotests/
├── package.json              # Зависимости и скрипты запуска
├── playwright.config.ts      # Глобальные настройки Playwright
├── README.md                 # Эта документация
├── src/                      # 🧱 БАЗА ЛОКАТОРОВ (Page Objects)
│   ├── components/           # Переиспользуемые блоки интерфейса
│   │   └── TopMenu.ts        # (Например: Верхнее меню навигации)
│   ├── pages/                # Уникальные страницы/вкладки
│   │   ├── EnvPage.ts        # Экран ENV
│   │   ├── HttpPage.ts       # Экран HTTP
│   │   └── ...               # Остальные экраны
│   └── App.ts                # ⭐️ ГЛАВНЫЙ ФАЙЛ (Фасад). Объединяет все страницы!
└── tests/                    # 🧪 ПАПКА С ТЕСТАМИ
    └── main.spec.ts          # Сами сценарии тестирования
```

---

## 🔎 Принцип работы: Где и как лежат локаторы?

Вместо того чтобы писать локаторы (пути к кнопкам) прямо в тестах, мы описываем интерфейс приложения в папке `src/`.

### 1. Компоненты (`src/components/`)
Это "кубики" интерфейса, которые повторяются на разных экранах. Например, верхнее меню, всплывающие окна, модалки сохранения.
**Пример компонента:**
```typescript
import { Page, Locator } from '@playwright/test';

export class TopMenu {
  readonly btnHttp: Locator;

  constructor(page: Page) {
    // Ищем кнопку по точному совпадению текста
    this.btnHttp = page.getByText('HTTP', { exact: true });
  }
}
```

### 2. Страницы (`src/pages/`)
Описывают уникальные элементы конкретной вкладки (например, вкладки gRPC). Если на странице есть сайдбар, он описывается здесь же.

### 3. Фасад (`src/App.ts`)
Это единая точка входа. В тестах мы вызываем **только этот класс**, и через него получаем доступ ко всем страницам и меню через точку (например, `app.topMenu.btnHttp.click()`).

---

## 🛠 Как найти локатор для новой кнопки?

Не пиши локаторы "вслепую". Используй встроенный **Playwright Inspector**.

1. В начале любого теста добавь команду-паузу:
   ```typescript
   await page.pause();
   ```
2. Запусти тест в консоли с флагом `--headed`:
   ```bash
   npx playwright test --headed
   ```
3. Откроется приложение и окно **Playwright Inspector**.
4. Нажми кнопку **"Explore" (Прицел)** в Инспекторе.
5. Наведи мышку на нужную кнопку в приложении и кликни по ней.
6. Инспектор покажет идеальный локатор. Скопируй его в свой Page Object.

> **💡 Золотое правило локаторов Playwright:**
> 1. В приоритете поиск по роли/тексту: `page.getByRole('button', { name: 'Send' })`
> 2. Поиск по плейсхолдеру: `page.getByPlaceholder('localhost:50051')`
> 3. Поиск по тексту: `page.getByText('Load .proto')`
> 4. XPath и CSS (`page.locator('.class > div')`) — используем только в крайнем случае!

---

## 📝 Как добавить новый экран или блок в базу?

Допустим, в приложении появилось новое окно настроек.

**Шаг 1:** Создай файл `src/pages/SettingsPage.ts`:
```typescript
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.saveBtn = page.getByRole('button', { name: 'Save Settings' });
  }
}
```

**Шаг 2:** Зарегистрируй его в `src/App.ts`:
```typescript
import { SettingsPage } from './pages/SettingsPage';

export class App {
  readonly settings: SettingsPage; // Добавили поле

  constructor(page: Page) {
    this.settings = new SettingsPage(page); // Инициализировали
  }
}
```
Всё! Теперь во всех тестах можно писать: `await app.settings.saveBtn.click()`.

---

## 🚀 Как писать автотесты?

Тесты пишутся в папке `tests/`. Поскольку наше приложение работает на **Tauri (WebView2)**, мы используем специальный `beforeEach` хук для подключения к нему через CDP-порт (Chrome DevTools Protocol).

### Шаблон базового теста (`tests/example.spec.ts`):

```typescript
import { test, expect, chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { App } from '../src/App'; // Подключаем базу локаторов

test.describe('Мой первый тестовый набор', () => {
  let appProcess;
  let browser;
  let app: App;

  // 1. ЗАПУСК ПРИЛОЖЕНИЯ И ПОДКЛЮЧЕНИЕ (Выполняется перед каждым тестом)
  test.beforeEach(async () => {
    const port = 9222;
    // Запускаем .exe и заставляем его открыть отладочный порт
    appProcess = spawn('C:\\Users\\w0dem\\AppData\\Local\\Pe4King\\pe4king-desktop.exe',[], {
      env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port}` }
    });
    
    // Ждем старта WebView2
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Подключаемся к запущенному окну
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    
    // Передаем страницу в нашу Базу Локаторов
    app = new App(page); 
  });

  // 2. ОЧИСТКА (Выполняется после каждого теста)
  test.afterEach(async () => {
    if (browser) await browser.close();
    if (appProcess) appProcess.kill();
  });

  // 3. САМ ТЕСТ
  test('Проверка открытия вкладки HTTP', async () => {
    // Действие: кликаем на вкладку HTTP в верхнем меню
    await app.topMenu.btnHttp.click();
    
    // Проверка (Assertion): ожидаем, что кнопка Send появилась на экране
    await expect(app.http.sendBtn).toBeVisible();
  });
});
```

---

## ▶️ Запуск тестов

Есть два способа запускать автотесты:

### Способ 1: Идеальный (Через VS Code)
1. Установи расширение **Playwright Test for VSCode**.
2. Открой файл с тестами (`main.spec.ts`).
3. Слева от слова `test` появится зеленый треугольник 🟢. Нажми на него!

### Способ 2: Через терминал
Убедись, что ты находишься в папке `autotests`.
* Запуск всех тестов с показом интерфейса:  
  `npx playwright test --headed`
* Запуск конкретного файла:  
  `npx playwright test tests/main.spec.ts --headed`

---

## 💡 Возможные проблемы

* **Ошибка `ECONNREFUSED 127.0.0.1:9222`**
  **Причина:** Приложение уже запущено в фоне ИЛИ это релизная сборка без поддержки DevTools.
  **Решение:** Убей все процессы `pe4king-desktop.exe` через Диспетчер задач и запусти тест заново.
* **Playwright Inspector не находит элементы**
  **Причина:** Приложение загрузилось не до конца.
  **Решение:** Добавь `await page.waitForTimeout(2000);` перед кликом или используй явные ожидания Playwright.
```