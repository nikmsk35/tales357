# Tales from the Дед — Документация разработки

> Репозиторий: `https://github.com/nikmsk35/tales357`  
> Сайт: `https://nikmsk35.github.io/tales357/`  
> Владелец: `nikmsk35` (GitHub)  
> Проект: хоррор-комикс-антология, статический PWA на GitHub Pages

---

## 📋 Стек технологий

| Компонент | Технология | Почему |
|---|---|---|
| **Хостинг** | GitHub Pages | Бесплатно, HTTPS, CDN, Jekyll-поддержка |
| **Статика** | HTML5 + CSS3 + vanilla JS | Нет сервера, нет backend, нет зависимостей |
| **Шрифты** | Google Fonts (Special Elite, Caveat, Crimson Text) | Хоррор-эстетика, быстрая загрузка |
| **Графика** | PNG (assets), AI-генерация для референсов | Статические изображения, оптимизация по мере роста |
| **Персистентность** | localStorage | Без backend, без cookies, без сервера |
| **Web Audio** | AudioContext API (генерация на лету) | Без .mp3 файлов, всё математически |
| **Аутентификация** | GitHub Personal Access Token | API-доступ для деплоя через AI-агентов |

**Нет:** React, Vue, Next.js, Node.js, Webpack, npm, Docker, CMS, базы данных.  
**Всё — чистые HTML/CSS/JS файлы, деплой через GitHub API.**

---

## 📁 Структура репозитория

```
tales357/
│
├── index.html              ← Главная страница (единая точка входа)
├── reader.html             ← Демо-ридер комикса (9 страниц)
├── cellar.html             ← Секретная страница «Погреб»
├── dossier.html            ← Секретная страница «Досье» (Konami Code)
├── 404.html                ← Хоррор-страница 404
│
├── assets/
│   ├── banner/
│   │   └── banner.png
│   ├── cover/
│   │   └── cover.png
│   └── characters/
│       ├── ded.png
│       ├── kolya.png
│       ├── alenka.png
│       ├── mila-vitek.png
│       ├── kuroles.png
│       └── mikhaylovna.png
│
├── brand-book/
│   ├── kolya/
│   │   ├── index.html
│   │   └── reference-imgs/   ← 8 PNG референсов
│   └── alenka/
│       ├── index.html
│       └── reference-imgs/   ← 8 PNG референсов
│
├── characters/               ← Заготовки страниц персонажей
│   ├── ded.html
│   ├── kolya.html
│   ├── alenka.html
│   ├── mila-vitek.html
│   ├── kuroles.html
│   └── mikhaylovna.html
│
├── dialog-styles.css         ← Стили для диалога с Дедом
├── personal.js               ← Персонализация (dialog, localStorage, memorial)
├── mobile-fixes.js           ← iOS/Android/Honor compatibility
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SUPPORTING.md
├── _config.yml
├── .gitignore
│
├── TESTING.md               ← Чеклист совместимости устройств
├── docs.md                  ← Этот файл
└── agents.md                ← Инструкции для AI-агентов
```

---

## 🗺️ Roadmap

### ✅ Реализовано (v1.0)

- [x] Главная страница с кастом, эпизодами, лором, канонами
- [x] CSS-хоррор-эффекты: CRT, scanlines, vignette, flicker, glitch
- [x] Web Audio: dron, щелчки, капли, шёпот (генерация на лету)
- [x] Персонализация: диалог с Дедом, localStorage, траурная карточка
- [x] Пасхалки: Konami Code, Погреб, Досье, HTML-комментарии
- [x] Демо-ридер комикса (9 страниц, листание, свайпы)
- [x] Страницы всех 6 персонажей (заготовки)
- [x] Бренд-бук Коли (8 reference sheets)
- [x] Бренд-бук Алёнки (8 AI-генераций)
- [x] Мобильная совместимость: iOS, Android, Honor
- [x] 404-хоррор, idle jump scare, custom context menu

### 🔄 В разработке (v1.1)

- [ ] Бренд-буки оставшихся персонажей (Дед, Мила+Витек, Куролес, Михайловна)
- [ ] Финальные reference sheets вместо AI-генераций
- [ ] Эпизод #0 «Пилот: Первый гость» — полноценная страница в reader
- [ ] Система комментариев/гостевых (GitHub Discussions / static form)
- [ ] RSS-лента для новых выпусков
- [ ] Печатная версия (CSS print styles)

### 📅 Планируется (v1.2+)

- [ ] Эпизоды #1–#4 — полноценные страницы
- [ ] PWA manifest + service worker (offline mode)
- [ ] Тёмная/светлая тема (переключатель)
- [ ] Мультиязычность (RU/EN)
- [ ] Мерч: генератор траурных карточек пользователя (downloadable PNG)
- [ ] Интеграция с Instagram/Telegram для обновлений

---

## 🎨 Дизайн-философия

> **EC Comics × Junji Ito × славянская деревенская безнадёга**

### Палитра

| Цвет | Hex | Использование |
|---|---|---|
| Оливково-зелёный | `#3d4a2e` | Фоны, одежда крестьян, избы |
| Сепия | `#5c4a3a` | Дерево, кожа, обувь, границы |
| Кровяной красный | `#7a2828` | Акценты, кровь, детали Деда |
| Желтушный | `#c2a55a` | Бумага, свет, бухло |
| Графит | `#1a1a1a` | Контуры, тени, фон |
| Кремовая | `#d4c4a8` | Текст, фон страниц |

### Типографика

- **Заголовки:** Special Elite (monospace, пишущая машинка)
- **Цитаты:** Caveat (рукописный)
- **Текст:** Crimson Text (serif, газетный)

### Контурная школа

- Толщина линии: 4–6px главные, 2–3px второстепенные
- Соединения резкие, без сглаживания
- Перекрёстная штриховка везде, где тень
- Бен-дэй точки в небе и больших пятнах

---

## 🧠 Архитектура кода

### Персонализация (personal.js)

```
Первый визит → Диалог с Дедом (имя, город, цель) → Траурная карточка
Возвращение → Персональное приветствие → Прогрессия ужаса (fearLevel 0→5)
```

**Ключи localStorage:**

| Ключ | Значение |
|---|---|
| `ded_name` | Имя пользователя |
| `ded_city` | Город |
| `ded_purpose` | Цель визита |
| `ded_visits` | Количество визитов |
| `ded_first_visit` | ISO-дата первого визита |
| `ded_last_visit` | ISO-дата последнего визита |
| `ded_dialog_done` | Диалог завершён? |
| `ded_memorial_shown` | Траурная карточка показана? |
| `ded_fear_level` | Уровень угрозы 0-5 |

### Web Audio (генерация звуков)

- **Dron:** Sawtooth oscillator 55Hz + LFO 0.1Hz → gain 0.015
- **Clicks:** Square oscillator, random freq 200-1000Hz, decay 0.1s
- **Drips:** Sine oscillator, freq 800→400Hz, decay 0.3s
- **Whispers:** White noise → Bandpass filter, decay 0.5s

### Mobile-фиксы (mobile-fixes.js)

- iOS: `audioCtx.resume()` на touch, `font-size: 16px` для inputs, safe area inset
- Android: Touch events, long press context menu, swipe gestures
- Honor/Huawei: Web Audio unlock, aggressive battery saver workaround

---

## 🚀 Как деплоить (для разработчиков)

### Способ 1: GitHub API (через AI-агента)

```bash
# Токен: ghp_... (fine-grained, repo scope, expires 07.07.2026)
# API endpoint: https://api.github.com/repos/nikmsk35/tales357/contents/{path}
# Method: PUT with base64 content
```

См. `agents.md` для подробных инструкций AI-агенту.

### Способ 2: Git CLI (ручной)

```bash
git clone https://github.com/nikmsk35/tales357.git
cd tales357
# Редактируй файлы
git add .
git commit -m "update: ..."
git push origin main
```

### Способ 3: GitHub Web UI (браузер)

1. Открыть https://github.com/nikmsk35/tales357
2. Найти файл → Edit → Commit
3. GitHub Pages обновляется автоматически (1-2 минуты)

---

## 📝 Лицензия и каноны

- **Лицензия:** CC BY-NC-SA 4.0 — некоммерческое использование, с указанием авторства
- **Контент:** Возрастная категория 18+ (хоррор, чёрный юмор, намёки на насилие)
- **Канон:** См. `SUPPORTING.md` — палитра, шрифты, контурная школа, промпт-шаблоны

---

## 🔗 Внешние зависимости

- `https://fonts.googleapis.com/css2?family=Special+Elite...` — Google Fonts
- `https://api.ipify.org?format=json` — IP-определение (для Dossier)
- `https://github.com/nikmsk35/tales357` — GitHub API для деплоя

**Всё остальное — самодостаточно, работает offline.**

---

## 🐛 Известные ограничения

| Проблема | Причина | Обход |
|---|---|---|
| iOS Private Safari не сохраняет имя | localStorage blocked | Сайт работает, диалог повторяется |
| Honor WebView блокирует Audio | Aggressive permissions | Открыть в Chrome |
| Konami Code на мобильных | Нет клавиатуры | 5 тапов на banner → Dossier |
| GitHub Pages не позволяет server-side | Static only | localStorage вместо backend |

---

*Последнее обновление: 2025-07-01*
