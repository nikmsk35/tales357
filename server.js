const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/home/user1/tales-api/data';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// DB helpers
function dbRead(name) {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function dbWrite(name, data) {
    const file = path.join(DATA_DIR, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Middleware
app.use(cors({
    origin: ['https://nikmsk35.github.io', 'http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ===== SECRETS =====
const CHARACTER_SECRETS = {
    kolya: [
        'Дед хранит в погребе старый кинжал. Коля видел, как он им резал колбасу.',
        'Коля однажды прослушал, как Дед разговаривал сам с собой. Он упоминал твоё имя.',
        'В доме Деда есть потайная комната за шкафом. Коля никогда не рисковал заглянуть.',
        'Коля знает, что Дед не спит по ночам. Он сидит у окна и ждёт.',
        'Коля нашёл письмо, адресованное тебе. Дед его сжёг, но Коля запомнил первую фразу: "Я вижу тебя".'
    ],
    alenka: [
        'Алёнка знает, что Дед варит брагу не из картошки. Но она молчит.',
        'Алёнка видела, как Дед хоронил что-то в лесу. Или кого-то.',
        'Алёнка слышит голоса из колодца. Они звучат как... как твой голос.',
        'Алёнка украла у Деда ключ. Он думает, что потерял.',
        'Алёнка знает, что Дед записывает имена всех гостей в чёрную книгу. Твоё имя уже там.'
    ],
    mila: [
        'Мила знает, что Дед ведёт дневник. В нём — имена всех, кто не ушёл.',
        'Мила однажды нашла фотографию Деда молодым. На ней он улыбается. Это хуже всего.',
        'Мила знает, где Дед прячет деньги. Но она не знает, зачем они ему.',
        'Мила слышала, как Дед плакал. Один раз. Ночью.',
        'Мила знает, что Дед не убивает. Он... оставляет. Это хуже.'
    ],
    vitek: [
        'Витек знает, что Дед играет в шахматы один. И всегда выигрывает.',
        'Витек видел, как Дед говорит с тенями. Тени отвечают.',
        'Витек знает, что Дед хранит в погребе старые часы. Они идут вспять.',
        'Витек слышал, как Дед произносит твоё имя во сне. Или не во сне.',
        'Витек знает, что Дед не ест. Но он готовит. Для кого?'
    ],
    kuroles: [
        'Куролес знает, что Дед был не всегда таким. Что-то изменилось. Кто-то.',
        'Куролес видел, как Дед рисует. Рисует лица. Твои лица.',
        'Куролес знает, что Дед пишет письма. Но не отправляет.',
        'Куролес слышал, как Дед смеётся. Это был смех человека, который забыл, как плакать.',
        'Куролес знает, что Дед ждёт. Но он не знает, кого. Или знает.'
    ],
    mikhaylovna: [
        'Михайловна знает, что Дед уважает только тех, кто не боится. Или тех, кто уже мёртв.',
        'Михайловна видела, как Дед молился. Но не Богу.',
        'Михайловна знает, что Дед хранит вещи гостей. Как трофеи.',
        'Михайловна слышала, как Дед говорит: "Он вернётся". И он говорил о тебе.',
        'Михайловна знает, что Дед не умеет прощать. Но он умеет ждать. Очень долго.'
    ],
    ded: [
        'Дед знает всё. Он не нуждается в секретах. Но он любит, когда ты спрашиваешь.',
        'Дед знает, что ты боишься. И он рад.',
        'Дед знает, что ты вернёшься. Ты всегда возвращаешься.',
        'Дед знает твои сны. Он был в них.',
        'Дед знает, что конец близок. Но чей?'
    ]
};

const ACTIONS = {
    samogon: { name: 'Дать самогона', effects: { morality: 10, drunkenness: 30 }, responses: [
        'Ты даёшь самогона. Персонаж расслабляется и начинает говорить.',
        'Персонаж пьёт. Глаза стеклеют. Язык развязывается.',
        'Самогон хороший. Персонаж кивает. И шепчет.',
        'Персонаж выпивает залпом. И рассказывает то, что не должен.'
    ]},
    spoon: { name: 'Показать ложку', effects: { morality: -20, drunkenness: 0 }, responses: [
        'Персонаж пугается. Но молчит. Глаза широкие.',
        'Ложка — это не просто ложка. Персонаж знает это.',
        'Персонаж дрожит. Но не говорит. Ещё.',
        'Ты показываешь ложку. Персонаж отводит взгляд. И шепчет тихо.'
    ]},
    talk: { name: 'Поговорить', effects: { morality: 5, drunkenness: -5 }, responses: [
        'Персонаж молчит. Потом говорит. Потом молчит снова.',
        'Разговор ни о чём. Но взгляд — о многом.',
        'Персонаж говорит о погоде. Но глаза — о тебе.',
        'Персонаж спрашивает, зачем ты пришёл. И сам отвечает: "Дед ждал."'
    ]},
    release: { name: 'Отпустить', effects: { morality: 0, drunkenness: 0 }, responses: [
        'Персонаж уходит. Но запоминает тебя. И Дед тоже.',
        'Персонаж благодарит. Или проклинает. В деревне это одно и то же.',
        'Персонаж уходит, но оглядывается. Или это не он оглядывается?',
        'Персонаж свободен. Но ты — нет. Дед не отпускает так просто.'
    ]}
};

// ===== API =====

app.get('/api/health', (req, res) => {
    res.json({ status: 'alive', service: 'Tales from the Дед API', version: '1.0.0' });
});

// Register user
app.post('/api/user/register', (req, res) => {
    const { uuid, name, city, purpose } = req.body;
    if (!uuid) return res.status(400).json({ error: 'UUID required' });
    const users = dbRead('users');
    const existing = users.find(u => u.uuid === uuid);
    const now = new Date().toISOString();
    if (existing) {
        existing.visits = (existing.visits || 0) + 1;
        existing.last_visit = now;
        dbWrite('users', users);
        return res.json({ registered: false, visits: existing.visits, message: 'Дед тебя помнит. Снова.' });
    }
    users.push({ uuid, name: name || null, city: city || null, purpose: purpose || null, visits: 1, total_time: 0, fear_level: 0, first_visit: now, last_visit: now, created_at: now });
    dbWrite('users', users);
    res.json({ registered: true, message: 'Дед зарегистрировал тебя. Навсегда.' });
});

// Dashboard
app.get('/api/user/:uuid/dashboard', (req, res) => {
    const users = dbRead('users');
    const user = users.find(u => u.uuid === req.params.uuid);
    if (!user) return res.status(404).json({ error: 'Не найден. Дед не знает таких.' });
    const prisoners = dbRead('prisoners').filter(p => p.user_uuid === req.params.uuid);
    const interactions = dbRead('interactions').filter(i => i.user_uuid === req.params.uuid).slice(-20);
    res.json({ user, prisoners, interactions });
});

// Stats
app.get('/api/user/:uuid/stats', (req, res) => {
    const users = dbRead('users');
    const user = users.find(u => u.uuid === req.params.uuid);
    if (!user) return res.status(404).json({ error: 'Не найден.' });
    res.json(user);
});

app.post('/api/user/:uuid/stats', (req, res) => {
    const users = dbRead('users');
    const user = users.find(u => u.uuid === req.params.uuid);
    if (!user) return res.status(404).json({ error: 'Не найден.' });
    if (req.body.fear_level !== undefined) user.fear_level = Math.min(5, req.body.fear_level);
    if (req.body.total_time !== undefined) user.total_time = (user.total_time || 0) + req.body.total_time;
    dbWrite('users', users);
    res.json({ updated: true });
});

// Cellar
app.get('/api/cellar/:uuid', (req, res) => {
    const prisoners = dbRead('prisoners').filter(p => p.user_uuid === req.params.uuid);
    res.json({ prisoners });
});

app.post('/api/cellar/:uuid/imprison', (req, res) => {
    const { character } = req.body;
    if (!character) return res.status(400).json({ error: 'Character name required' });
    const prisoners = dbRead('prisoners');
    const existing = prisoners.find(p => p.user_uuid === req.params.uuid && p.character_name === character && p.status === 'imprisoned');
    if (existing) return res.json({ imprisoned: false, message: 'Персонаж уже в погребе. Дед не дублирует.' });
    const id = prisoners.length > 0 ? Math.max(...prisoners.map(p => p.id)) + 1 : 1;
    prisoners.push({ id, user_uuid: req.params.uuid, character_name: character, morality: 100, drunkenness: 0, secrets_revealed: 0, status: 'imprisoned', created_at: new Date().toISOString() });
    dbWrite('prisoners', prisoners);
    res.json({ imprisoned: true, prisoner_id: id, message: `${character} теперь в погребе. Дед доволен.` });
});

app.post('/api/cellar/:uuid/action', (req, res) => {
    const { prisoner_id, action } = req.body;
    if (!prisoner_id || !action || !ACTIONS[action]) return res.status(400).json({ error: 'Invalid action' });
    const prisoners = dbRead('prisoners');
    const prisoner = prisoners.find(p => p.id === prisoner_id && p.user_uuid === req.params.uuid);
    if (!prisoner) return res.status(404).json({ error: 'Prisoner not found' });
    if (prisoner.status !== 'imprisoned') return res.json({ action: false, message: 'Персонаж уже ушёл. Дед отпустил.' });

    const actionData = ACTIONS[action];
    const effects = actionData.effects;
    prisoner.morality = Math.max(0, Math.min(100, prisoner.morality + effects.morality));
    prisoner.drunkenness = Math.max(0, Math.min(100, prisoner.drunkenness + effects.drunkenness));
    let secret = null;

    if (action === 'samogon' && Math.random() < 0.4) {
        const secrets = CHARACTER_SECRETS[prisoner.character_name] || CHARACTER_SECRETS.ded;
        if (prisoner.secrets_revealed < secrets.length) {
            secret = secrets[prisoner.secrets_revealed];
            prisoner.secrets_revealed++;
        }
    }
    if (prisoner.morality <= 0) {
        const secrets = CHARACTER_SECRETS[prisoner.character_name] || CHARACTER_SECRETS.ded;
        secret = secrets[0];
        prisoner.secrets_revealed = Math.max(prisoner.secrets_revealed, 1);
    }
    if (action === 'release') {
        prisoner.status = 'released';
        prisoner.morality = 100;
        prisoner.drunkenness = 0;
    }
    dbWrite('prisoners', prisoners);

    const interactions = dbRead('interactions');
    interactions.push({ id: interactions.length + 1, user_uuid: req.params.uuid, prisoner_id, action, result: secret || actionData.responses[Math.floor(Math.random() * actionData.responses.length)], created_at: new Date().toISOString() });
    dbWrite('interactions', interactions);

    res.json({ action: true, prisoner: { ...prisoner }, secret, message: actionData.responses[Math.floor(Math.random() * actionData.responses.length)] });
});

// Votes
app.post('/api/vote', (req, res) => {
    const { uuid, poll_id, choice } = req.body;
    if (!uuid || !poll_id || !choice) return res.status(400).json({ error: 'Missing fields' });
    const votes = dbRead('votes');
    const existing = votes.find(v => v.user_uuid === uuid && v.poll_id === poll_id);
    if (existing) return res.json({ voted: false, message: 'Ты уже голосовал. Дед не любит повторы.' });
    votes.push({ id: votes.length + 1, user_uuid: uuid, poll_id, choice, created_at: new Date().toISOString() });
    dbWrite('votes', votes);
    res.json({ voted: true });
});

app.get('/api/vote/:poll_id/results', (req, res) => {
    const votes = dbRead('votes').filter(v => v.poll_id === req.params.poll_id);
    const results = {};
    votes.forEach(v => { results[v.choice] = (results[v.choice] || 0) + 1; });
    res.json({ poll_id: req.params.poll_id, total: votes.length, results: Object.entries(results).map(([choice, count]) => ({ choice, count })) });
});

// Leaderboard
app.get('/api/stats/leaderboard', (req, res) => {
    const users = dbRead('users');
    const prisoners = dbRead('prisoners');
    const topVisitors = [...users].sort((a, b) => b.visits - a.visits).slice(0, 10).map(u => ({ uuid: u.uuid, name: u.name, visits: u.visits }));
    const topFear = [...users].sort((a, b) => b.fear_level - a.fear_level).slice(0, 10).map(u => ({ uuid: u.uuid, name: u.name, fear_level: u.fear_level }));
    res.json({ totalUsers: users.length, totalPrisoners: prisoners.length, topVisitors, topFear });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Не найдено. Дед не признаёт этот путь.' });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Tales API running on http://127.0.0.1:${PORT}`);
    console.log(`Data dir: ${DATA_DIR}`);
});
