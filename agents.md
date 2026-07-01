# Инструкции для AI-агентов — Tales from the Дед

> **Прочитай этот файл перед тем, как делать что-либо в репозитории.**  
> Если чего-то не понимаешь — смотри `docs.md`.

---

## 🔐 Токены и доступы

```yaml
git:
  repo: "https://github.com/nikmsk35/tales357"
  owner: "nikmsk35"
  name: "tales357"
  branch: "main"
  # Deploy через GitHub API Contents
  # Токен запрашивается у владельца или хранится в переменной окружения
  token: "${GITHUB_TOKEN}"      # Или: os.environ.get("GITHUB_TOKEN")
  token_scope: "repo"           # read/write содержимого
  token_expires: "2026-07-07"
  # Или через git CLI если агент работает локально
  clone_url: "https://github.com/nikmsk35/tales357.git"
```

**Как деплоить (Python через GitHub API):**

```python
import base64, requests, time, json, os

TOKEN = os.environ.get("GITHUB_TOKEN", "YOUR_TOKEN_HERE")
OWNER = "nikmsk35"
REPO = "tales357"
API_BASE = f"https://api.github.com/repos/{OWNER}/{REPO}"
HEADERS = {"Authorization": f"token {TOKEN}", "Accept": "application/vnd.github.v3+json"}

def get_sha(path):
    r = requests.get(f"{API_BASE}/contents/{path}", headers=HEADERS)
    if r.status_code == 200:
        data = r.json()
        if isinstance(data, dict):
            return data.get("sha")
    return None

def upload_file(local_path, repo_path, message="update"):
    with open(local_path, "rb") as f:
        content = f.read()
    b64 = base64.b64encode(content).decode()
    sha = get_sha(repo_path)
    data = {"message": message, "content": b64}
    if sha:
        data["sha"] = sha
    r = requests.put(f"{API_BASE}/contents/{repo_path}", headers=HEADERS, json=data)
    return r.status_code in (200, 201), r.status_code, r.text[:200]

# Залить всю папку site-build/
BUILD_DIR = "E:/0ai/gomiks357/site-build"
files_to_upload = []
for root, dirs, files in os.walk(BUILD_DIR):
    for f in files:
        if f.startswith("."):
            continue
        local = os.path.join(root, f)
        repo = os.path.relpath(local, BUILD_DIR).replace("\\", "/")
        files_to_upload.append((local, repo))

for local, repo in files_to_upload:
    ok, status, txt = upload_file(local, repo, f"Deploy: {os.path.basename(repo)}")
    print(f"{'OK' if ok else 'FAIL'} {repo} (HTTP {status})")
    if not ok:
        print(f"  {txt}")
    time.sleep(0.5)  # Rate limit: 5000 req/hour
```

**GitHub Pages обновляется автоматически через 1-2 минуты после push.**

---

## 📁 Структура: что где лежит

```
site-build/
│
├── index.html              ← ГЛАВНАЯ. Единственная точка входа.
│   Содержит: все секции, CSS, JS, пасхалки, аудио, анимации.
│   Перед изменениями: прочитать ВСЮ секцию <style> и <script>.
│
├── reader.html             ← Демо-ридер комикса. 9 страниц, листание.
│   Можно править независимо от index.html.
│
├── cellar.html             ← Секретная страница «Погреб»
├── dossier.html            ← Секретная страница «Досье» (Konami Code)
├── 404.html                ← Хоррор-страница 404
│
├── dialog-styles.css       ← Стили для диалога с Дедом + траурная карточка
├── personal.js             ← Логика диалога, localStorage, memorial
├── mobile-fixes.js         ← iOS/Android/Honor фиксы (не трогай без нужды)
│
├── assets/
│   ├── banner/               ← banner.png (главный баннер)
│   ├── cover/                ← cover.png (обложка)
│   └── characters/           ← 6 портретов PNG
│       ├── ded.png, kolya.png, alenka.png, mila-vitek.png,
│       ├── kuroles.png, mikhaylovna.png
│
├── brand-book/
│   ├── kolya/                ← Референсы Коли (готовый бренд-бук)
│   └── alenka/               ← AI-генерации Алёнки (временный, будет заменён)
│
├── characters/               ← Заготовки страниц персонажей
│   ├── ded.html, kolya.html, alenka.html, ...
│
├── docs.md                   ← Документация (roadmap, стек, архитектура)
├── TESTING.md                ← Чеклист совместимости устройств
└── agents.md                 ← Этот файл
```

---

## 🛠️ Правила работы с файлами

### 1. index.html — основная страница (~1000 строк)

**СТРУКТУРА index.html:**

```html
<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <!-- Google Fonts -->
  <!-- CSS переменные + анимации + keyframes -->
  <style> ... </style>
</head>
<body>
  <div class="vignette"></div>
  <div class="flicker-layer"></div>
  <div class="scan-flash"></div>
  <div class="eye-tracker" id="eye"></div>
  <div class="he-is-watching" id="watchOverlay">...</div>
  <div class="idle-jumpscare" id="jumpscare">...</div>
  <div class="blood-splatter" id="blood-splatter"></div>

  <header>
    <h1 id="main-title">Tales from the Дед</h1>
    <nav class="tabs">...</nav>
  </header>

  <main>
    <section class="hero">...</section>
    <section class="about">...</section>
    <section class="characters">...</section>
    <section class="episodes">...</section>
    <section class="lore">...</section>
    <section class="canon">...</section>
  </main>

  <footer>...</footer>

  <div class="custom-context" id="custom-menu">...</div>
  <a href="cellar.html" class="secret-link" id="secret-link"></a>

  <script>
    // 1. Idle timer (90s → jump scare)
    // 2. "ОН СМОТРИТ" overlay
    // 3. Scanline flash
    // 4. Invert flash
    // 5. Blood drops
    // 6. Title cycling ("Он видит тебя", "Он не спит", ...)
    // 7. Text scramble (hover/tap)
    // 8. Card shake (click/tap)
    // 9. Custom context menu
    // 10. Eye tracker (mousemove/touchmove)
    // 11. Konami Code (keyboard) / 5 tap fallback (mobile)
    // 12. Web Audio (initAudio, dron, clicks, drips, whispers)
    // 13. Console horror messages
  </script>
  <script src="personal.js"></script>
  <script src="mobile-fixes.js"></script>
</body>
```

**Правила правки index.html:**

1. **CSS анимации** — добавляй в `<style>` ВЫШЕ закрывающего `</style>`
2. **JS** — добавляй ВЫШЕ строки `<script src="personal.js">` (или внутри главного `<script>`)
3. **HTML-секции** — вставляй внутри `<main>` или `<body>` в логическом порядке
4. **Существующие эффекты НЕ ЛОМАЙ** — если меняешь анимацию, проверь что старая не конфликтует
5. **Пасхалки** — прятать в HTML-комментариях (например: `<!-- Василий ... -->`)

### 2. CSS — правила

**CSS переменные (менять ТОЛЬКО тут):**

```css
:root {
  --olive: #3d4a2e;      /* Фон, одежда, избы */
  --sepia: #5c4a3a;       /* Дерево, кожа, границы */
  --blood: #7a2828;       /* Кровь, акценты, Дед */
  --jaundice: #c2a55a;    /* Бумага, свет, бухло */
  --graphite: #1a1a1a;    /* Контуры, тени, фон */
  --cream: #d4c4a8;       /* Текст, фон страниц */
}
```

**НЕ меняй цвета вручную** — используй `var(--color)`.

**Мобильные медиа-запросы уже есть** — `@media (max-width: 700px)` и `@media (pointer: coarse)`. Если добавляешь новый элемент — добавь и мобильные стили.

### 3. personal.js — диалог с Дедом

**Ключи localStorage (НЕ трогать имена):**

```javascript
const STORAGE_KEYS = {
    name: 'ded_name',              // Имя пользователя
    city: 'ded_city',              // Город
    purpose: 'ded_purpose',        // Цель визита
    visits: 'ded_visits',          // Количество визитов
    firstVisit: 'ded_first_visit', // ISO-дата первого визита
    lastVisit: 'ded_last_visit',   // ISO-дата последнего визита
    dialogCompleted: 'ded_dialog_done', // Boolean
    memorialShown: 'ded_memorial_shown', // Boolean
    fearLevel: 'ded_fear_level'    // 0-5
};
```

**API для консоли пользователя:**

```javascript
DedPersonal.reset()              // Сбросить всё
DedPersonal.getVisits()          // Количество визитов
DedPersonal.getName()            // Имя
DedPersonal.getFearLevel()       // Уровень угрозы 0-5
```

**Правила правки:**
- Не меняй `STORAGE_KEYS` — иначе сломается персистентность
- Не удаляй `DOMContentLoaded` — иначе диалог не покажется
- Можешь добавлять новые `steps[]` в диалог
- Можешь менять `defaultTexts` (фразы Деда)

### 4. mobile-fixes.js — НЕ ТРОГАЙ без причины

Этот файл — **critical infrastructure** для мобильных. Если нужно добавить фикс:

1. Прочитай ВЕСЬ файл сначала
2. Добавь новое поведение, НЕ удаляй старое
3. Проверь что `DedMobile` не конфликтует с `DedPersonal`
4. Проверь на iOS и Android (или через Chrome DevTools)

### 5. Новые страницы (characters/*.html, cellar.html, dossier.html)

**Шаблон новой страницы:**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Имя Персонажа — Tales from the Дед</title>
  <link rel="stylesheet" href="dialog-styles.css">  <!-- если нужен диалог -->
  <style>
    /* Переменные и базовые стили из index.html */
    :root { /* ... copy from index.html ... */ }
    /* Собственные стили */
  </style>
</head>
<body>
  <!-- Навигация назад -->
  <a href="index.html" style="...">← Назад</a>

  <!-- Контент -->

  <script src="personal.js"></script>  <!-- если нужна персонализация -->
  <script src="mobile-fixes.js"></script>  <!-- если нужны мобильные фиксы -->
</body>
</html>
```

---

## 🧪 Как тестировать перед деплоем

### Проверка в консоли (открой DevTools → Console)

```javascript
// Проверить, что все скрипты загрузились
console.log("DedMobile:", typeof DedMobile !== 'undefined');
console.log("DedPersonal:", typeof DedPersonal !== 'undefined');

// Проверить localStorage
Object.keys(localStorage).filter(k => k.startsWith('ded_'))

// Проверить Web Audio
console.log("AudioCtx:", window.audioCtx ? window.audioCtx.state : 'none');

// Сбросить данные (симуляция первого визита)
DedPersonal.reset();
```

### Проверка мобильных (Chrome DevTools)

1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Выбери: iPhone SE, iPhone 14, Pixel 5
3. Проверь:
   - Tap на карточки → shake
   - Tap на имя → scramble
   - Long press → context menu
   - Swipe → reader листает страницы
   - Landscape/portrait → layout не ломается

### Проверка пасхалок

1. Konami Code: ↑↑↓↓←→←→BA → должен открыть dossier.html
2. 5 tap на banner → dossier.html (на мобильных)
3. Right click → кастомное меню «Дед наблюдает»
4. 90 сек бездействия → jump scare (лицо Деда)
5. Скрытая ссылка в правом нижнем углу → cellar.html
6. F12 → console messages от Деда

---

## 🚀 Рабочий процесс (workflow)

### Сценарий 1: Добавить нового персонажа

1. Создать `characters/новый.html` по шаблону выше
2. Добавить в `index.html` → секция `<section class="characters">`
3. Добавить `assets/characters/новый.png` (или placeholder)
4. Проверить мобильные стили (`@media (max-width: 700px)`)
5. Залить на GitHub

### Сценарий 2: Добавить новый эпизод

1. Добавить в `index.html` → секция `<section class="episodes">`
2. Формат эпизода:

```html
<div class="episode" data-episode="номер">
    <div class="num">0</div>
    <div class="content">
        <h3>Пилот: Первый госток</h3>
        <p class="synopsis">Коля приезжает в сторку, но там уже ждёт Дед...</p>
        <p class="status coming-soon">В разработке</p>
    </div>
</div>
```

3. Статусы: `coming-soon`, `available`, `completed`
4. Добавить мобильные стили если нужно
5. Залить на GitHub

### Сценарий 3: Добавить пасхалку

1. Пасхалки лучше прятать в HTML-комментариях или JS
2. Пример: `<!-- Секрет: если ты это читаешь, Дед уже знает -->`
3. Добавить в `mobile-fixes.js` если нужен touch-trigger
4. Документировать в `TESTING.md` если проверяется вручную

### Сценарий 4: Изменить CSS

1. Прочитать ВЕСЬ `<style>` блок в `index.html`
2. Найти нужную секцию
3. Если правка касается мобильных — добавить и `@media` правила
4. Проверить в Chrome DevTools (Device Toolbar)
5. Залить на GitHub

### Сценарий 5: Изменить Web Audio

**ВНИМАНИЕ:** Web Audio на iOS Safari требует `user interaction` + `resume()`.

Правильный паттерн:

```javascript
function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // iOS fix: resume suspended context
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    
    // Остальная инициализация...
}

// В index.html: вызывать из 4 обработчиков:
document.addEventListener("click", initAudio, { once: true });
document.addEventListener("scroll", initAudio, { once: true });
document.addEventListener("keydown", initAudio, { once: true });
document.addEventListener("touchstart", initAudio, { once: true });
```

---

## 📝 Контекст, который нужен для работы

**Перед правкой любого файла, прочитай:**

1. `docs.md` — общая архитектура, стек, roadmap
2. `TESTING.md` — что уже тестировалось, какие баги известны
3. Этот файл (`agents.md`) — правила работы с файлами
4. Сам файл, который будешь править

**Если правишь index.html, обязательно прочитай:**
- Весь `<style>` блок (переменные, анимации, медиа-запросы)
- Весь `<script>` блок (эффекты, аудио, пасхалки)
- Подключенные файлы: `personal.js`, `mobile-fixes.js`

**Если добавляешь новый персонаж, обязательно прочитай:**
- Секция `<section class="characters">` в index.html
- CSS `.char-card`, `.char-grid` в `<style>`
- Существующие `brand-book/*/` для понимания формата

---

## ⚠️ Запрещено (не ломай)

1. **Не удаляй `mobile-fixes.js`** — ломает iOS/Android
2. **Не меняй имена `STORAGE_KEYS`** — ломает персистентность пользователей
3. **Не удаляй `viewport-fit=cover`** — iOS safe area сломается
4. **Не меняй `user-scalable=no`** — iOS zoom на input сломается
5. **Не удаляй `touchstart` из `initAudio`** — мобильный аудио не заведётся
6. **Не удаляй CSS анимации без замены** — пользователи заметят пропажу эффектов
7. **Не коммить `.zip` и `.rar`** — в `brand-book/*/reference-imgs/` только `.png`/`.jpg`
8. **Не коммит API токен в код** — токен хранится только в этом файле и в консоли агента

---

## 🎯 Качество кода

- **Нет inline JavaScript** в HTML-атрибутах (`onclick="..."`, `onmouseover="..."`)
- **Все event listeners** — через `addEventListener`
- **Все анимации** — CSS keyframes, не `setInterval` для графики
- **Все цвета** — через CSS переменные, не хардкод
- **Все шрифты** — через Google Fonts, не `@font-face` с локальными файлами
- **Все изображения** — в `assets/`, не inline base64 (кроме critical icons)
- **Все медиа-запросы** — уже есть `@media (max-width: 700px)` и `@media (pointer: coarse)`
- **Все JS-файлы** — внизу `<body>`, не в `<head>`

---

## 📚 Памятка: что сделано и что НЕ делать снова

**Уже реализовано (не делать снова):**

- CRT scanlines, vignette, flicker, glitch, scan-flash
- Web Audio (dron, clicks, drips, whispers) — генерация на лету
- Персонализация (диалог, localStorage, memorial, fearLevel)
- Пасхалки: Konami Code, Погреб, Досье, HTML-комментарии
- Reader (9 страниц, листание, свайпы, клавиатура)
- 6 страниц персонажей (заготовки)
- 2 бренд-бука (Коля, Алёнка)
- Мобильные фиксы: iOS, Android, Honor
- Custom context menu (right-click / long-press)
- Idle jump scare (90s, лицо Деда)
- Eye tracker (mouse + touch)
- Text scramble (hover + tap)
- Card shake (click + tap)
- Title cycling ("Он видит тебя", "Он не спит", ...)
- Blood drops (сверху, случайные)
- 404-хоррор

**В разработке (приоритет):**

- Бренд-буки: Дед, Мила+Витек, Куролес, Михайловна
- Эпизод #0 «Пилот» — полноценная страница в reader
- Бренд-бук Алёнки — заменить AI-генерации на финальные reference sheets

---

*Если этот файл устарел — обнови его и залей на GitHub вместе с изменениями.*
