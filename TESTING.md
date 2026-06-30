# Тестирование Tales from the Дед

## Чеклист совместимости устройств

### Десктоп (Windows / macOS / Linux)

| Браузер | Версия | Статус | Примечания |
|---|---|---|---|
| Chrome | 120+ | ✅ | Референсный браузер |
| Firefox | 120+ | ✅ | Web Audio — проверить dron |
| Safari | 17+ | ⚠️ | iOS-специфичные баги |
| Edge | 120+ | ✅ | Chromium-based |
| Opera | 105+ | ✅ | Chromium-based |

**Проверить на десктопе:**
- [ ] Открывается главная страница без ошибок в консоли
- [ ] CRT scanlines и vignette видны
- [ ] Glitch-эффект на заголовке работает
- [ ] Наведение на карточку — shake + glitch image
- [ ] Text scramble на имени при наведении
- [ ] Клик по карточке — shake-card
- [ ] Правый клик — custom context menu (Дед наблюдает)
- [ ] Konami Code (↑↑↓↓←→←→BA) → открывает dossier.html
- [ ] Blood drops падают сверху
- [ ] Title меняется («Он видит тебя» и т.д.)
- [ ] Web Audio: dron, щелчки, капли активируются после клика
- [ ] 90 сек idle → jump scare (лицо Деда)
- [ ] «ОН СМОТРИТ» overlay появляется случайно
- [ ] Scanline flash проходит по экрану
- [ ] Invert flash случайно срабатывает
- [ ] Скрытые whispers («он смотрит», «не спи») видны при наведении
- [ ] Ссылка на Погреб (cellar.html) в правом нижнем углу работает
- [ ] 404.html показывает «Дед тебя ждал»
- [ ] Reader: листание стрелками/пробелом/кликом
- [ ] Console horror: F12 → сообщения от Деда
- [ ] Диалог с Дедом (первый вход) — typewriter, input, options
- [ ] Персональное приветствие после возвращения
- [ ] Траурная карточка появляется после диалога
- [ ] Лор дополняется персональным текстом
- [ ] Футер меняет цитату с именем пользователя
- [ ] Dossier: собирает данные браузера, показывает IP
- [ ] localStorage сохраняет имя, город, цель, визиты
- [ ] `DedPersonal.reset()` в консоли сбрасывает всё

### iOS (iPhone / iPad)

| Браузер | Версия | Статус | Примечания |
|---|---|---|---|
| Safari | 17+ | ⚠️ | Web Audio требует interaction |
| Chrome iOS | 120+ | ⚠️ | WebKit-based, те же ограничения |
| Firefox iOS | 120+ | ⚠️ | WebKit-based |

**Проверить на iOS:**
- [ ] Страница открывается без горизонтального скролла
- [ ] Нет zoom при tap на input (viewport meta OK)
- [ ] Touch — карточки трясутся при tap
- [ ] Long press (800ms) → custom context menu
- [ ] Touchmove — eye tracker следует за пальцем
- [ ] Text scramble на tap (не hover)
- [ ] Web Audio активируется после первого touch
- [ ] Dron звучит (может потребовать unlock)
- [ ] Dialog input — iOS keyboard не ломает layout
- [ ] Dialog scrollable внутри на маленьком экране
- [ ] Safe area inset — контент не уезжает под notch
- [ ] Reader — свайп влево/вправо листает страницы
- [ ] Banner не обрезает изображение
- [ ] Char grid — 2 колонки на iPhone, 3+ на iPad
- [ ] Footer не налезает на контент
- [ ] localStorage работает (Private mode = нет)
- [ ] Konami Code — не работает без клавиатуры (tap banner 5x → dossier)
- [ ] Jump scare — тап на экран сбрасывает idle timer

### Android

| Браузер | Версия | Статус | Примечания |
|---|---|---|---|
| Chrome | 120+ | ✅ | Референсный Android браузер |
| Samsung Internet | 23+ | ⚠️ | One UI специфика |
| Firefox | 120+ | ✅ | |
| Opera | 80+ | ✅ | |

**Проверить на Android:**
- [ ] Всё то же, что на iOS, плюс:
- [ ] Honor / Huawei — не блокирует ли Web Audio?
- [ ] Samsung One UI — не скрывает ли bottom navigation content?
- [ ] Back button — не ломает ли state?
- [ ] Chrome Custom Tabs — работает ли localStorage?
- [ ] Android 10+ gesture navigation — не конфликтует с свайпом в reader
- [ ] Dark mode / force dark — не инвертирует ли цвета сайта?

### Honor / Huawei (Magic UI / EMUI)

**Известные проблемы:**
- Web Audio может быть ограничен на некоторых моделях
- Браузер по умолчанию может быть WebKit-based
- Aggressive battery saver приостанавливает JS background

**Проверить:**
- [ ] Сайт открывается в браузере по умолчанию
- [ ] Нет блокировки автовоспроизведения (если ожидается)
- [ ] Нет force dark mode инверсии
- [ ] Background audio не нужен, но dron после tap должен работать

---

## Фичи, требующие interaction на мобильных

| Фича | Десктоп | Мобильный |
|---|---|---|
| Web Audio | Клик/scroll/keydown | touchstart/touchend |
| Custom context menu | Правый клик | Long press 800ms |
| Eye tracker | mousemove | touchmove |
| Konami Code | Клавиатура ↑↑↓↓←→←→BA | 5 tap на banner |
| Card shake | Клик | Tap |
| Text scramble | Hover | Tap |
| Idle jump scare | 90s бездействие | 90s бездействие (visibility API) |

---

## Команды для тестирования в консоли

```javascript
// Сбросить все данные и начать сначала
DedPersonal.reset()

// Проверить статус
DedPersonal.getVisits()      // количество визитов
DedPersonal.getName()        // имя из диалога
DedPersonal.getFearLevel() // уровень угрозы 0-5

// Проверить localStorage
Object.keys(localStorage).filter(k => k.startsWith('ded_'))
```

---

## Инструменты для тестирования

1. **Chrome DevTools** → Device Toolbar (iPhone SE, iPhone 14, iPad, Pixel 5)
2. **BrowserStack** или **LambdaTest** — реальные устройства в облаке
3. **Safari Remote Inspector** — для iOS через USB
4. **Chrome Remote Debugging** — для Android через USB
5. **Lighthouse** — Performance + Accessibility + Best Practices

---

## Известные ограничения (не баги)

- **iOS Safari Private mode** — localStorage не работает, диалог будет каждый раз
- **Android WebView** — может блокировать Web Audio, site должен открываться в браузере
- **Honor/Huawei aggressive battery** — background JS может приостанавливаться, но foreground OK
- **Konami Code на мобильных** — не работает без физической клавиатуры, есть tap-альтернатива
