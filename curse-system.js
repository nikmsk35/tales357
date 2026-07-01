/**
 * Tales from the Дед — Система проклятий
 * Пользователь случайно получает "проклятия" при действиях на сайте.
 * Каждое проклятие — CSS-класс + JS-логика. Все стили создаются динамически.
 */
(function() {
    'use strict';

    const CURSE_STYLES = `
        .curse-overlay {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 99990;
        }
        .curse-eyes-container {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 99991;
        }
        .curse-eye {
            position: fixed;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle at 30% 30%, #fff 0%, #ddd 30%, #888 100%);
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            border: 2px solid #3a2a1a;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(122,40,40,0.3);
            opacity: 0.7;
        }
        .curse-eye::after {
            content: "";
            position: absolute;
            width: 16px; height: 16px;
            background: #1a1a1a;
            border-radius: 50%;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.1s;
        }
        .curse-eye.bloodshot {
            background: radial-gradient(circle at 30% 30%, #fff 0%, #ddd 20%, #faa 40%, #a44 100%);
        }
        .curse-blood-trail {
            position: fixed;
            width: 8px; height: 8px;
            background: radial-gradient(circle, #7a2828 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99992;
            animation: bloodFade 5s forwards;
        }
        @keyframes bloodFade {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.3); }
        }
        .curse-mirror {
            transform: scaleX(-1) !important;
            transition: transform 0.5s ease;
        }
        .curse-darkness-overlay {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle 150px at var(--x, 50%) var(--y, 50%), transparent 0%, rgba(0,0,0,0.97) 100%);
            pointer-events: none;
            z-index: 99993;
        }
        .curse-holy-water {
            position: fixed;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 99999;
            opacity: 0.6;
            transition: opacity 0.2s;
            animation: holyFloat 3s ease-in-out infinite;
        }
        .curse-holy-water:hover { opacity: 1; }
        @keyframes holyFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .curse-notification {
            position: fixed;
            top: 20px; right: 20px;
            background: linear-gradient(180deg, #1a1410, #0a0a0a);
            border: 2px solid #7a2828;
            padding: 16px 20px;
            font-family: "Special Elite", monospace;
            color: #d4c4a8;
            z-index: 99999;
            max-width: 300px;
            animation: curseSlideIn 0.5s ease, curseFadeOut 0.5s ease 4.5s forwards;
            box-shadow: 0 0 30px rgba(122,40,40,0.3);
        }
        .curse-notification .title {
            color: #7a2828;
            font-size: 0.85rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .curse-notification .text {
            font-size: 0.9rem;
            color: #c2a55a;
        }
        @keyframes curseSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes curseFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .curse-shake {
            animation: shakeText 0.1s infinite;
        }
        @keyframes shakeText {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
        }
    `;

    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = CURSE_STYLES;
    document.head.appendChild(styleEl);

    const CURSES = {
        eyes: {
            name: 'Глаза Деда',
            desc: 'Они видят. Всегда.',
            duration: 30000,
            apply() {
                const container = document.createElement('div');
                container.className = 'curse-eyes-container';
                container.id = 'curse-eyes';
                const positions = [
                    { top: '10px', left: '10px' },
                    { top: '10px', right: '10px' },
                    { bottom: '10px', left: '10px' },
                    { bottom: '10px', right: '10px' }
                ];
                positions.forEach((pos, i) => {
                    const eye = document.createElement('div');
                    eye.className = 'curse-eye' + (Math.random() > 0.5 ? ' bloodshot' : '');
                    Object.assign(eye.style, pos);
                    eye.dataset.index = i;
                    container.appendChild(eye);
                });
                document.body.appendChild(container);

                this.moveHandler = (e) => {
                    const x = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
                    const y = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
                    container.querySelectorAll('.curse-eye').forEach(eye => {
                        const rect = eye.getBoundingClientRect();
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        const angle = Math.atan2(y - cy, x - cx);
                        const dist = Math.min(6, Math.hypot(x - cx, y - cy) / 50);
                        const pupil = eye.querySelector('::after') || eye;
                        eye.style.setProperty('--pupil-x', Math.cos(angle) * dist + 'px');
                        eye.style.setProperty('--pupil-y', Math.sin(angle) * dist + 'px');
                        const after = eye;
                        after.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                        after.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
                    });
                };
                // Custom pupil movement via CSS var
                const pupilStyle = document.createElement('style');
                pupilStyle.textContent = `
                    .curse-eye::after {
                        transform: translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, 0px))) !important;
                    }
                `;
                document.head.appendChild(pupilStyle);
                this.pupilStyle = pupilStyle;

                document.addEventListener('mousemove', this.moveHandler);
                document.addEventListener('touchmove', this.moveHandler);
            },
            remove() {
                const el = document.getElementById('curse-eyes');
                if (el) el.remove();
                if (this.moveHandler) {
                    document.removeEventListener('mousemove', this.moveHandler);
                    document.removeEventListener('touchmove', this.moveHandler);
                }
                if (this.pupilStyle) this.pupilStyle.remove();
            }
        },

        scramble: {
            name: 'Скрипучие буквы',
            desc: 'Текст шепчет. Или кричит.',
            duration: 10000,
            apply() {
                const texts = document.querySelectorAll('p, h1, h2, h3, span, div');
                this.interval = setInterval(() => {
                    const el = texts[Math.floor(Math.random() * texts.length)];
                    if (!el || !el.textContent || el.textContent.length < 3) return;
                    const txt = el.textContent;
                    const idx = Math.floor(Math.random() * txt.length);
                    const chars = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
                    const orig = txt[idx];
                    const repl = chars[Math.floor(Math.random() * chars.length)];
                    el.textContent = txt.substring(0, idx) + repl + txt.substring(idx + 1);
                    el.classList.add('curse-shake');
                    setTimeout(() => {
                        const cur = el.textContent;
                        el.textContent = cur.substring(0, idx) + orig + cur.substring(idx + 1);
                        el.classList.remove('curse-shake');
                    }, 500);
                }, 2000);
            },
            remove() {
                if (this.interval) clearInterval(this.interval);
                document.querySelectorAll('.curse-shake').forEach(el => el.classList.remove('curse-shake'));
            }
        },

        blood: {
            name: 'Кровавый след',
            desc: 'Ты оставляешь следы. Дед найдёт.',
            duration: 60000,
            apply() {
                this.lastX = 0; this.lastY = 0;
                this.moveHandler = (e) => {
                    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
                    if (Math.hypot(x - this.lastX, y - this.lastY) < 40) return;
                    this.lastX = x; this.lastY = y;
                    const drop = document.createElement('div');
                    drop.className = 'curse-blood-trail';
                    drop.style.left = (x - 4) + 'px';
                    drop.style.top = (y - 4) + 'px';
                    document.body.appendChild(drop);
                    setTimeout(() => drop.remove(), 5000);
                };
                document.addEventListener('mousemove', this.moveHandler);
                document.addEventListener('touchmove', this.moveHandler);
            },
            remove() {
                if (this.moveHandler) {
                    document.removeEventListener('mousemove', this.moveHandler);
                    document.removeEventListener('touchmove', this.moveHandler);
                }
                document.querySelectorAll('.curse-blood-trail').forEach(el => el.remove());
            }
        },

        mirror: {
            name: 'Зеркальный мир',
            desc: 'Всё наоборот. Как и твоя жизнь.',
            duration: 5000,
            apply() {
                document.body.classList.add('curse-mirror');
            },
            remove() {
                document.body.classList.remove('curse-mirror');
            }
        },

        speaks: {
            name: 'Дед говорит',
            desc: 'Он говорит через текст. Ты читаешь — он смеётся.',
            duration: 20000,
            apply() {
                const phrases = [
                    'Я вижу, что ты читаешь.',
                    'Не бойся. Или бойся. Мне всё равно.',
                    'Ты думал, это просто текст? Нет. Это я.',
                    'Дед знает. Дед всегда знает.',
                    'Ты заметил? Я тоже.',
                    'Текст не врёт. Но я — да.',
                    'Каждая буква — глаз. Мой глаз.',
                    'Прочитай ещё раз. Медленнее.',
                    'Я между строк. Буквально.'
                ];
                const texts = document.querySelectorAll('p, h1, h2, h3, span, li');
                this.interval = setInterval(() => {
                    const el = texts[Math.floor(Math.random() * texts.length)];
                    if (!el || el.children.length > 0) return;
                    const orig = el.textContent;
                    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                    el.textContent = phrase;
                    el.style.color = '#7a2828';
                    el.style.transition = 'color 0.5s';
                    setTimeout(() => {
                        el.textContent = orig;
                        el.style.color = '';
                    }, 2000);
                }, 3000);
            },
            remove() {
                if (this.interval) clearInterval(this.interval);
            }
        },

        darkness: {
            name: 'Тьма',
            desc: 'Свет только там, где ты. Остальное — Дед.',
            duration: 30000,
            apply() {
                const overlay = document.createElement('div');
                overlay.className = 'curse-darkness-overlay';
                overlay.id = 'curse-darkness';
                document.body.appendChild(overlay);
                this.moveHandler = (e) => {
                    const x = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
                    const y = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
                    overlay.style.setProperty('--x', x + 'px');
                    overlay.style.setProperty('--y', y + 'px');
                };
                document.addEventListener('mousemove', this.moveHandler);
                document.addEventListener('touchmove', this.moveHandler);
            },
            remove() {
                const el = document.getElementById('curse-darkness');
                if (el) el.remove();
                if (this.moveHandler) {
                    document.removeEventListener('mousemove', this.moveHandler);
                    document.removeEventListener('touchmove', this.moveHandler);
                }
            }
        }
    };

    const ACTIVE_CURSES = new Set();
    let totalCurses = parseInt(localStorage.getItem('ded_curses_total') || '0');
    let curseHistory = JSON.parse(localStorage.getItem('ded_curses_history') || '[]');

    function showNotification(curse) {
        const note = document.createElement('div');
        note.className = 'curse-notification';
        note.innerHTML = `
            <div class="title">☠ Проклятие</div>
            <div class="text"><strong>${curse.name}</strong><br>${curse.desc}</div>
        `;
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 5000);
    }

    function addHolyWater() {
        const hw = document.createElement('div');
        hw.className = 'curse-holy-water';
        hw.textContent = '✝';
        hw.style.top = (20 + Math.random() * 60) + '%';
        hw.style.left = (20 + Math.random() * 60) + '%';
        hw.title = 'Святая вода — кликни, чтобы снять проклятие';
        hw.addEventListener('click', () => {
            DedCurse.removeAll();
            hw.remove();
        });
        document.body.appendChild(hw);
        return hw;
    }

    function saveState() {
        localStorage.setItem('ded_curses_total', totalCurses.toString());
        localStorage.setItem('ded_curses_history', JSON.stringify(curseHistory));
        localStorage.setItem('ded_curses_active', JSON.stringify([...ACTIVE_CURSES]));
    }

    const DedCurse = {
        trigger(name) {
            if (!CURSES[name]) {
                console.warn('[Дед] Неизвестное проклятие:', name);
                return false;
            }
            if (ACTIVE_CURSES.has(name)) return false;

            ACTIVE_CURSES.add(name);
            CURSES[name].apply();
            totalCurses++;
            curseHistory.push({ name, time: Date.now() });
            saveState();
            showNotification(CURSES[name]);

            // Increase fear level
            if (typeof DedPersonal !== 'undefined' && DedPersonal.setFearLevel) {
                const current = DedPersonal.getFearLevel ? DedPersonal.getFearLevel() : 0;
                DedPersonal.setFearLevel(Math.min(5, current + 1));
            }

            // Add holy water
            const hw = addHolyWater();

            // Auto-remove after duration
            setTimeout(() => {
                if (ACTIVE_CURSES.has(name)) {
                    this.remove(name);
                }
                if (hw && hw.parentNode) hw.remove();
            }, CURSES[name].duration);

            console.log('[Дед] Проклятие наложено:', name);
            return true;
        },

        triggerRandom() {
            const available = Object.keys(CURSES).filter(c => !ACTIVE_CURSES.has(c));
            if (available.length === 0) return false;
            const name = available[Math.floor(Math.random() * available.length)];
            return this.trigger(name);
        },

        remove(name) {
            if (!ACTIVE_CURSES.has(name)) return false;
            ACTIVE_CURSES.delete(name);
            if (CURSES[name].remove) CURSES[name].remove();
            saveState();
            console.log('[Дед] Проклятие снято:', name);
            return true;
        },

        removeAll() {
            [...ACTIVE_CURSES].forEach(name => this.remove(name));
            document.querySelectorAll('.curse-holy-water').forEach(el => el.remove());
            return true;
        },

        getActive() {
            return [...ACTIVE_CURSES];
        },

        getTotal() {
            return totalCurses;
        },

        isActive(name) {
            return ACTIVE_CURSES.has(name);
        }
    };

    // Expose globally
    window.DedCurse = DedCurse;

    // Bind to clicks on char cards (5% chance)
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.char-card').forEach(card => {
            card.addEventListener('click', () => {
                if (Math.random() < 0.05) {
                    DedCurse.triggerRandom();
                }
            });
        });

        // Check if returning after midnight
        const lastVisit = localStorage.getItem('ded_last_visit');
        if (lastVisit) {
            const last = new Date(lastVisit);
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 0 && hour < 6 && last.getDate() !== now.getDate()) {
                // Night visit and different day
                if (Math.random() < 0.3) {
                    setTimeout(() => DedCurse.triggerRandom(), 2000);
                }
            }
        }
    });

    // beforeunload with 10% chance
    window.addEventListener('beforeunload', (e) => {
        if (Math.random() < 0.1 && ACTIVE_CURSES.size > 0) {
            e.preventDefault();
            e.returnValue = 'Дед не отпускает так просто.';
        }
    });

    // ESC 3x to remove all
    let escCount = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            escCount++;
            if (escCount >= 3) {
                DedCurse.removeAll();
                escCount = 0;
                console.log('[Дед] Проклятия сняты по ESC');
            }
            setTimeout(() => { escCount = 0; }, 1000);
        }
    });

})();
