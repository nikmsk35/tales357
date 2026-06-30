/**
 * ДИАЛОГ С ДЕДОМ + ПЕРСОНАЛИЗАЦИЯ
 * Tales from the Дед — personal.js
 */

(function() {
    'use strict';

    const STORAGE_KEYS = {
        name: 'ded_name',
        city: 'ded_city',
        purpose: 'ded_purpose',
        visits: 'ded_visits',
        firstVisit: 'ded_first_visit',
        lastVisit: 'ded_last_visit',
        dialogCompleted: 'ded_dialog_done',
        memorialShown: 'ded_memorial_shown',
        fearLevel: 'ded_fear_level' // 0-5, растёт с визитами
    };

    function getData(key) {
        try { return localStorage.getItem(key); } catch(e) { return null; }
    }
    function setData(key, val) {
        try { localStorage.setItem(key, val); } catch(e) {}
    }
    function getInt(key, def) {
        const v = getData(key);
        return v ? parseInt(v, 10) : def;
    }

    // ===== УПРАВЛЕНИЕ ВИЗИТАМИ =====
    const now = new Date().toISOString();
    let visits = getInt(STORAGE_KEYS.visits, 0) + 1;
    setData(STORAGE_KEYS.visits, visits);
    if (!getData(STORAGE_KEYS.firstVisit)) {
        setData(STORAGE_KEYS.firstVisit, now);
    }
    setData(STORAGE_KEYS.lastVisit, now);

    // Уровень страха растёт с визитами
    let fearLevel = Math.min(5, Math.floor(visits / 2));
    setData(STORAGE_KEYS.fearLevel, fearLevel);

    // ===== ПЕРСОНАЛЬНОЕ ПРИВЕТСТВИЕ =====
    function injectPersonalWelcome() {
        const name = getData(STORAGE_KEYS.name);
        const header = document.querySelector('header');
        if (!header || !name) return;

        const hour = new Date().getHours();
        let timeGreeting = '';
        if (hour < 6) timeGreeting = 'Ты пришёл ночью. Ночью в Покровке опасно.';
        else if (hour < 12) timeGreeting = 'Доброе утро. Дед уже варит брагу.';
        else if (hour < 18) timeGreeting = 'День — время для гостей.';
        else timeGreeting = 'Вечер. Время ужина. Дед ждёт.';

        const welcome = document.createElement('div');
        welcome.className = 'personal-welcome';
        welcome.innerHTML = `
            <div class="name">${name}</div>
            <div style="margin-top:6px;opacity:0.8;">${timeGreeting}</div>
            <div style="margin-top:4px;font-size:0.85rem;opacity:0.6;">
                Визит № ${visits} · Дед помнит всё
            </div>
        `;
        header.insertBefore(welcome, header.querySelector('.tagline'));
    }

    // ===== ТРАУРНАЯ КАРТОЧКА =====
    function injectMemorial() {
        const name = getData(STORAGE_KEYS.name);
        const main = document.querySelector('main');
        if (!main || !name || getData(STORAGE_KEYS.memorialShown) !== 'true') return;

        const memorial = document.createElement('div');
        memorial.className = 'user-memorial show';
        const firstVisit = new Date(getData(STORAGE_KEYS.firstVisit) || Date.now());
        const dateStr = firstVisit.toLocaleDateString('ru-RU');
        const statuses = [
            'ПРОПАЛ БЕЗ ВЕСТИ',
            'ГОСТЬ ДЕДА',
            'ИНГРЕДИЕНТ БРАГИ',
            'ПОКОЙНИК № ' + visits,
            'ВЕЧНАЯ ПАМЯТЬ',
            'ДЕД ПОМНИТ'
        ];
        const status = statuses[Math.min(fearLevel, statuses.length - 1)];

        memorial.innerHTML = `
            <h3>Траурная карточка</h3>
            <div class="memorial-name">${name}</div>
            <div class="memorial-date">Первый визит: ${dateStr} · Покровка</div>
            <div class="memorial-status">${status}</div>
        `;
        main.insertBefore(memorial, main.firstChild);
    }

    // ===== ДИАЛОГ С ДЕДОМ =====
    function createDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.id = 'ded-dialog';
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-close" id="dialog-close">×</div>
                <div class="dialog-avatar">
                    <img src="assets/characters/ded.png" alt="Дед">
                </div>
                <div class="dialog-speaker">ДЕД</div>
                <div class="dialog-text" id="dialog-text"></div>
                <div id="dialog-input-area"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    let currentStep = 0;
    const dialogSteps = [
        {
            text: 'Привет, заходи в Добрый Дом. Тебя как зовут?',
            input: true,
            placeholder: 'Введи своё имя...',
            key: STORAGE_KEYS.name
        },
        {
            text: (name) => `Хорошо, ${name}. А откуда ты?`,
            input: true,
            placeholder: 'Город или деревня...',
            key: STORAGE_KEYS.city
        },
        {
            text: (name, city) => `Понятно, из ${city}. А что ты ищешь здесь, ${name}?`,
            options: [
                'Комикс почитать',
                'Персонажей посмотреть',
                'Просто зашёл',
                'Дед позвал'
            ],
            key: STORAGE_KEYS.purpose
        },
        {
            text: (name) => `Запомни, ${name}. Дед всё помнит. Всё.`,
            final: true
        }
    ];

    function typeText(text, el, speed = 40) {
        return new Promise(resolve => {
            el.innerHTML = '';
            let i = 0;
            function type() {
                if (i < text.length) {
                    el.innerHTML = text.substring(0, i + 1) + '<span class="cursor-blink"></span>';
                    i++;
                    setTimeout(type, speed + Math.random() * 40);
                } else {
                    el.innerHTML = text;
                    resolve();
                }
            }
            type();
        });
    }

    async function runDialog() {
        const overlay = document.getElementById('ded-dialog') || createDialog();
        const textEl = document.getElementById('dialog-text');
        const inputArea = document.getElementById('dialog-input-area');
        const closeBtn = document.getElementById('dialog-close');

        // Close button only works on final step
        closeBtn.style.display = 'none';

        overlay.classList.add('show');

        const name = getData(STORAGE_KEYS.name) || 'гость';
        const city = getData(STORAGE_KEYS.city) || 'ниоткуда';

        const step = dialogSteps[currentStep];
        const text = typeof step.text === 'function' ? step.text(name, city) : step.text;
        await typeText(text, textEl);

        inputArea.innerHTML = '';

        if (step.input) {
            const input = document.createElement('input');
            input.className = 'dialog-input';
            input.placeholder = step.placeholder;
            input.type = 'text';
            input.autocomplete = 'off';
            inputArea.appendChild(input);
            input.focus();

            const btn = document.createElement('button');
            btn.className = 'dialog-btn';
            btn.textContent = '→ Ответить';
            inputArea.appendChild(btn);

            function submit() {
                const val = input.value.trim();
                if (!val) return;
                setData(step.key, val);
                currentStep++;
                if (currentStep < dialogSteps.length) {
                    runDialog();
                } else {
                    finishDialog();
                }
            }
            btn.addEventListener('click', submit);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        }
        else if (step.options) {
            const opts = document.createElement('div');
            opts.className = 'dialog-options';
            step.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'dialog-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => {
                    setData(step.key, opt);
                    currentStep++;
                    if (currentStep < dialogSteps.length) {
                        runDialog();
                    } else {
                        finishDialog();
                    }
                });
                opts.appendChild(btn);
            });
            inputArea.appendChild(opts);
        }
        else if (step.final) {
            const btn = document.createElement('button');
            btn.className = 'dialog-btn';
            btn.textContent = 'Запомню, Дед';
            btn.addEventListener('click', finishDialog);
            inputArea.appendChild(btn);
            closeBtn.style.display = 'block';
        }
    }

    function finishDialog() {
        setData(STORAGE_KEYS.dialogCompleted, 'true');
        const overlay = document.getElementById('ded-dialog');
        if (overlay) overlay.classList.remove('show');
        // Показать траурную карточку после диалога
        setData(STORAGE_KEYS.memorialShown, 'true');
        injectMemorial();
    }

    // ===== ПЕРСОНАЛИЗАЦИЯ ЛОРА =====
    function personalizeLore() {
        const name = getData(STORAGE_KEYS.name);
        const purpose = getData(STORAGE_KEYS.purpose);
        if (!name) return;

        const loreSection = document.getElementById('lore');
        if (!loreSection) return;

        const personalCodex = document.createElement('div');
        personalCodex.className = 'codex';
        personalCodex.style.borderLeft = '3px solid var(--blood)';
        personalCodex.style.marginTop = '20px';

        const messages = [
            `<strong>Персональное предупреждение.</strong> ${name}, Дед знает, что ты здесь.`,
            `<strong>Брага готовится.</strong> ${name}, твой визит № ${visits} записан.`,
            `<strong>Цель визита.</strong> Ты пришёл ${purpose ? 'за «' + purpose + '»' : 'неизвестно зачем'}. Дед запомнил.`,
            `<strong>Статус.</strong> ${name} — ${visits > 3 ? 'постоянный гость' : 'новый гость'}.`,
        ];
        const msg = messages[Math.min(visits - 1, messages.length - 1)] || messages[0];
        personalCodex.innerHTML = msg;
        loreSection.appendChild(personalCodex);
    }

    // ===== ИЗМЕНЕНИЕ ФУТЕРА =====
    function personalizeFooter() {
        const name = getData(STORAGE_KEYS.name);
        if (!name) return;
        const footer = document.querySelector('footer .quote');
        if (!footer) return;

        const quotes = [
            `«Гостю дорогому — первый стакан. ${name} — дорогой гость.»`,
            `«Хозяину терпеливому — последний. ${name}, Дед терпелив.»`,
            `«${name}, ты приходишь слишком часто. Дед заметил.»`,
            `«Брага варится, ${name}. Скоро твоя очередь.»`,
            `«${name}, Покровка запоминает каждый шаг.»`
        ];
        const quote = quotes[Math.min(visits - 1, quotes.length - 1)] || quotes[0];
        footer.innerHTML = quote.replace(/\n/g, '<br>');
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    document.addEventListener('DOMContentLoaded', () => {
        const dialogDone = getData(STORAGE_KEYS.dialogCompleted);
        const name = getData(STORAGE_KEYS.name);

        if (!dialogDone) {
            // Первый визит или диалог не завершён — показать диалог
            setTimeout(() => runDialog(), 1500);
        } else {
            // Возвращение
            injectPersonalWelcome();
            injectMemorial();
            personalizeLore();
            personalizeFooter();
        }
    });

    // Экспорт для глобального доступа
    window.DedPersonal = {
        reset: function() {
            Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
            location.reload();
        },
        getVisits: () => visits,
        getName: () => getData(STORAGE_KEYS.name),
        getFearLevel: () => fearLevel
    };
})();
