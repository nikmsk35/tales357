/**
 * Tales from the Дед — Система достижений
 */
(function() {
    'use strict';

    const ACHIEVEMENTS = [
        { id: 'first_visit', name: 'Первый госток', desc: 'Ты зашёл. Дед заметил.', icon: '🪦', check: () => true },
        { id: 'remembered', name: 'Дед тебя запомнил', desc: 'Прошёл диалог с Дедом.', icon: '🧠', check: () => localStorage.getItem('ded_dialog_done') === 'true' },
        { id: 'digger', name: 'Копатель', desc: '10 визитов на сайт.', icon: '⛏️', check: () => parseInt(localStorage.getItem('ded_visits') || '0') >= 10 },
        { id: 'night_owl', name: 'Полуночник', desc: 'Зашёл после полуночи.', icon: '🌙', check: () => { const h = new Date().getHours(); return h >= 0 && h < 6; } },
        { id: 'secret_agent', name: 'Секретный агент', desc: 'Нашёл все пасхалки.', icon: '🕵️', check: () => {
            const secrets = JSON.parse(localStorage.getItem('ded_achievements_secrets_found') || '[]');
            return secrets.length >= 4; // konami, cellar, dossier, html comments
        }},
        { id: 'cursed', name: 'Проклятый', desc: 'Получил 3 проклятия.', icon: '🧿', check: () => parseInt(localStorage.getItem('ded_curses_total') || '0') >= 3 },
        { id: 'survivor', name: 'Выживший', desc: 'Провёл на сайте 10 минут.', icon: '⏳', check: () => parseInt(localStorage.getItem('ded_achievements_total_time') || '0') >= 600 },
        { id: 'watcher', name: 'Смотрящий', desc: 'Поймал "ОН СМОТРИТ" 5 раз.', icon: '👁️', check: () => parseInt(localStorage.getItem('ded_achievements_watch_count') || '0') >= 5 },
        { id: 'screamer', name: 'Крик', desc: 'Поймал idle jump scare.', icon: '😱', check: () => localStorage.getItem('ded_achievements_jumpscare') === 'true' },
        { id: 'archaeologist', name: 'Археолог', desc: 'Раскопал 5 могил на кладбище.', icon: '🏺', check: () => parseInt(localStorage.getItem('ded_visits') || '0') >= 5 },
        { id: 'well_wisher', name: 'Колодец желаний', desc: 'Бросил 10 монеток в колодец.', icon: '🪙', check: () => {
            const preds = JSON.parse(localStorage.getItem('ded_well_predictions') || '[]');
            return preds.length >= 10;
        }},
        { id: 'map_explorer', name: 'Исследователь', desc: 'Кликнул все объекты на карте.', icon: '🗺️', check: () => {
            const clicks = JSON.parse(localStorage.getItem('ded_map_clicks') || '[]');
            return ['ded', 'kolya', 'alenka', 'milavitek', 'well', 'bath', 'cellar'].every(n => clicks.includes(n));
        }},
        { id: 'hopeless', name: 'Безнадёжный', desc: 'Зашёл 30 дней подряд.', icon: '🔥', check: () => parseInt(localStorage.getItem('ded_achievements_consecutive_days') || '0') >= 30 },
    ];

    const STYLES = `
        .achievements-trophy {
            position: fixed;
            bottom: 20px; right: 20px;
            width: 48px; height: 48px;
            background: #1a1a1a;
            border: 2px solid #7a2828;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 99999;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 0 15px rgba(122,40,40,0.3);
        }
        .achievements-trophy:hover { transform: scale(1.1); box-shadow: 0 0 25px rgba(122,40,40,0.5); }
        .achievements-trophy .count {
            position: absolute;
            top: -4px; right: -4px;
            width: 18px; height: 18px;
            background: #7a2828;
            border-radius: 50%;
            font-size: 0.65rem;
            color: #d4c4a8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Special Elite", monospace;
        }
        .achievements-panel {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) scale(0.95);
            width: 90%; max-width: 600px;
            max-height: 80vh; overflow-y: auto;
            background: linear-gradient(180deg, #1a1410, #0a0a0a);
            border: 2px solid #7a2828;
            padding: 24px;
            z-index: 100000;
            font-family: "Special Elite", monospace;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s, transform 0.3s;
            box-shadow: 0 0 60px rgba(0,0,0,0.9);
        }
        .achievements-panel.show {
            opacity: 1; pointer-events: all;
            transform: translate(-50%, -50%) scale(1);
        }
        .achievements-panel h2 {
            color: #7a2828;
            font-size: 1.3rem;
            letter-spacing: 3px;
            text-align: center;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .achievements-panel .close {
            position: absolute;
            top: 12px; right: 16px;
            color: #5a4a3a;
            font-size: 1.5rem;
            cursor: pointer;
            line-height: 1;
        }
        .achievements-panel .close:hover { color: #7a2828; }
        .achievements-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
        .achievement-card {
            border: 1px solid #3a2a1a;
            background: rgba(40,30,20,0.3);
            padding: 12px 8px;
            text-align: center;
            transition: 0.2s;
        }
        .achievement-card.unlocked {
            border-color: #7a2828;
            background: rgba(122,40,40,0.1);
        }
        .achievement-card.locked {
            opacity: 0.35;
            filter: grayscale(0.8);
        }
        .achievement-card .icon {
            font-size: 2rem;
            margin-bottom: 6px;
        }
        .achievement-card .name {
            color: #d4c4a8;
            font-size: 0.75rem;
            line-height: 1.3;
            margin-bottom: 4px;
        }
        .achievement-card .desc {
            color: #c2a55a;
            font-size: 0.65rem;
            line-height: 1.3;
            font-family: "Crimson Text", serif;
        }
        .achievement-toast {
            position: fixed;
            top: 20px; right: 20px;
            background: linear-gradient(180deg, #1a1410, #0a0a0a);
            border: 2px solid #7a2828;
            padding: 16px 20px;
            z-index: 100001;
            max-width: 300px;
            animation: toastSlide 0.5s ease, toastFade 0.5s ease 4.5s forwards;
            box-shadow: 0 0 30px rgba(122,40,40,0.3);
        }
        .achievement-toast .title {
            color: #7a2828;
            font-family: "Special Elite", monospace;
            font-size: 0.8rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .achievement-toast .content {
            color: #c2a55a;
            font-family: "Crimson Text", serif;
            font-size: 0.95rem;
        }
        .achievement-toast .icon {
            font-size: 1.5rem;
            margin-right: 8px;
        }
        @keyframes toastSlide {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastFade {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @media (max-width: 700px) {
            .achievements-grid { grid-template-columns: repeat(2, 1fr); }
            .achievements-panel { padding: 16px; }
            .achievements-trophy { width: 44px; height: 44px; font-size: 1.3rem; }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    let unlocked = JSON.parse(localStorage.getItem('ded_achievements') || '[]');

    function save() {
        localStorage.setItem('ded_achievements', JSON.stringify(unlocked));
    }

    function showToast(ach) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="title">🏆 Достижение разблокировано</div>
            <div class="content"><span class="icon">${ach.icon}</span> <strong>${ach.name}</strong><br><small>${ach.desc}</small></div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);

        // Sound: short gong
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 200;
            gain.gain.value = 0.05;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) {}
    }

    function unlock(id) {
        if (unlocked.includes(id)) return false;
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (!ach) return false;
        unlocked.push(id);
        save();
        showToast(ach);
        updateTrophy();
        return true;
    }

    function checkAll() {
        ACHIEVEMENTS.forEach(ach => {
            if (!unlocked.includes(ach.id) && ach.check()) {
                unlock(ach.id);
            }
        });
    }

    function updateTrophy() {
        const trophy = document.getElementById('achievements-trophy');
        if (trophy) {
            const count = trophy.querySelector('.count');
            if (count) count.textContent = unlocked.length;
        }
    }

    function renderPanel() {
        const panel = document.getElementById('achievements-panel');
        if (!panel) return;
        const grid = panel.querySelector('.achievements-grid');
        grid.innerHTML = '';
        ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            const card = document.createElement('div');
            card.className = 'achievement-card ' + (isUnlocked ? 'unlocked' : 'locked');
            card.innerHTML = `
                <div class="icon">${isUnlocked ? ach.icon : '🔒'}</div>
                <div class="name">${isUnlocked ? ach.name : '???'}</div>
                <div class="desc">${isUnlocked ? ach.desc : 'Заблокировано'}</div>
            `;
            grid.appendChild(card);
        });
    }

    function showPanel() {
        const panel = document.getElementById('achievements-panel');
        if (!panel) createPanel();
        renderPanel();
        document.getElementById('achievements-panel').classList.add('show');
    }

    function hidePanel() {
        const panel = document.getElementById('achievements-panel');
        if (panel) panel.classList.remove('show');
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'achievements-panel';
        panel.className = 'achievements-panel';
        panel.innerHTML = `
            <div class="close" onclick="DedAchievements.hidePanel()">✕</div>
            <h2>Достижения</h2>
            <div class="achievements-grid"></div>
        `;
        document.body.appendChild(panel);
    }

    function createTrophy() {
        if (document.getElementById('achievements-trophy')) return;
        const trophy = document.createElement('div');
        trophy.id = 'achievements-trophy';
        trophy.className = 'achievements-trophy';
        trophy.innerHTML = `🏆<div class="count">${unlocked.length}</div>`;
        trophy.addEventListener('click', showPanel);
        document.body.appendChild(trophy);
    }

    // Track time
    let timeInterval;
    function startTimeTracking() {
        if (timeInterval) return;
        timeInterval = setInterval(() => {
            let total = parseInt(localStorage.getItem('ded_achievements_total_time') || '0');
            total += 10;
            localStorage.setItem('ded_achievements_total_time', total.toString());
            checkAll();
        }, 10000);
    }

    // Track consecutive days
    function trackConsecutiveDays() {
        const today = new Date().toISOString().split('T')[0];
        const last = localStorage.getItem('ded_achievements_last_visit_date');
        let consecutive = parseInt(localStorage.getItem('ded_achievements_consecutive_days') || '0');
        if (last) {
            const lastDate = new Date(last);
            const todayDate = new Date(today);
            const diff = (todayDate - lastDate) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                consecutive++;
            } else if (diff > 1) {
                consecutive = 1;
            }
        } else {
            consecutive = 1;
        }
        localStorage.setItem('ded_achievements_consecutive_days', consecutive.toString());
        localStorage.setItem('ded_achievements_last_visit_date', today);
    }

    // Track "ОН СМОТРИТ"
    function trackWatch() {
        let count = parseInt(localStorage.getItem('ded_achievements_watch_count') || '0');
        count++;
        localStorage.setItem('ded_achievements_watch_count', count.toString());
        checkAll();
    }

    // Track jump scare
    function trackJumpscare() {
        localStorage.setItem('ded_achievements_jumpscare', 'true');
        checkAll();
    }

    // Track map click
    function trackMapClick(obj) {
        const clicks = JSON.parse(localStorage.getItem('ded_map_clicks') || '[]');
        if (!clicks.includes(obj)) {
            clicks.push(obj);
            localStorage.setItem('ded_map_clicks', JSON.stringify(clicks));
        }
        checkAll();
    }

    // Track secret found
    function trackSecret(id) {
        const secrets = JSON.parse(localStorage.getItem('ded_achievements_secrets_found') || '[]');
        if (!secrets.includes(id)) {
            secrets.push(id);
            localStorage.setItem('ded_achievements_secrets_found', JSON.stringify(secrets));
        }
        checkAll();
    }

    // Global API
    window.DedAchievements = {
        unlock,
        checkAll,
        isUnlocked: (id) => unlocked.includes(id),
        getAll: () => ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) })),
        showPanel,
        hidePanel,
        trackTime: startTimeTracking,
        trackWatch,
        trackJumpscare,
        trackMapClick,
        trackSecret
    };

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        createTrophy();
        createPanel();
        trackConsecutiveDays();
        startTimeTracking();
        checkAll();

        // Hook into existing elements
        const watchOverlay = document.getElementById('watchOverlay');
        if (watchOverlay) {
            const observer = new MutationObserver(() => {
                if (watchOverlay.style.display !== 'none') {
                    trackWatch();
                }
            });
            observer.observe(watchOverlay, { attributes: true, attributeFilter: ['style'] });
        }

        const jumpscare = document.getElementById('jumpscare');
        if (jumpscare) {
            const observer = new MutationObserver(() => {
                if (jumpscare.style.display === 'flex') {
                    trackJumpscare();
                }
            });
            observer.observe(jumpscare, { attributes: true, attributeFilter: ['style'] });
        }
    });

})();
