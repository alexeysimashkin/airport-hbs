// =================================================================
// КОНФИГУРАЦИЯ
// =================================================================
const API_URL = '/api/flights';
const STORAGE_KEY = 'hbs_flights';

// СТАТУСЫ
const STATUSES = [
    'По расписанию',
    'Регистрация',
    'Регистрация закончена',
    'Посадка',
    'Посадка закончена',
    'Вылетел',
    'Задержан',
    'Отменён'
];

// ТОЛЬКО "Вылетел" считается вылетевшим
const DEPARTED_STATUSES = ['Вылетел'];

// =================================================================
// ДАННЫЕ ПО УМОЛЧАНИЮ
// =================================================================
function getDefaultDate(hours, minutes) {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
}

const DEFAULT_FLIGHTS = [{
    id: 1,
    number: 'U6-270',
    airline: 'Ural airlines',
    destination: 'Москва',
    airportCode: 'DME',
    scheduledTime: getDefaultDate(20, 30),
    expectedTime: getDefaultDate(23, 0),
    status: 'Посадка закончена',
    terminal: 'A',
    gate: '13',
    checkIn: '34,35,36',
    plane: 'A-320',
    registerStart: getDefaultDate(17, 30),
    registerEnd: getDefaultDate(19, 30),
    boardingStart: getDefaultDate(19, 45),
    boardingEnd: getDefaultDate(20, 15),
    note: '',
}, {
    id: 2,
    number: 'SU-1415',
    airline: 'Аэрофлот',
    destination: 'Москва',
    airportCode: 'SVO',
    scheduledTime: getDefaultDate(23, 10),
    expectedTime: getDefaultDate(23, 10),
    status: 'Посадка закончена',
    terminal: 'A',
    gate: '17',
    checkIn: '44,45,46',
    plane: 'A-320',
    registerStart: getDefaultDate(20, 10),
    registerEnd: getDefaultDate(22, 10),
    boardingStart: getDefaultDate(22, 25),
    boardingEnd: getDefaultDate(22, 55),
    note: '',
}, {
    id: 3,
    number: 'U6-571',
    airline: 'Ural airlines',
    destination: 'Владивосток',
    airportCode: 'VVO',
    scheduledTime: getDefaultDate(23, 25),
    expectedTime: getDefaultDate(23, 25),
    status: 'Регистрация закончена',
    terminal: 'A',
    gate: '14',
    checkIn: '34,35,36',
    plane: 'A-320NEO',
    registerStart: getDefaultDate(20, 25),
    registerEnd: getDefaultDate(22, 25),
    boardingStart: getDefaultDate(22, 40),
    boardingEnd: getDefaultDate(23, 10),
    note: '',
}, {
    id: 4,
    number: 'FV-6404',
    airline: 'Россия',
    destination: 'Санкт-Петербург',
    airportCode: 'LED',
    scheduledTime: getDefaultDate(23, 40),
    expectedTime: getDefaultDate(23, 40),
    status: 'Регистрация',
    terminal: 'A',
    gate: '18',
    checkIn: '46',
    plane: 'A-319',
    registerStart: getDefaultDate(20, 40),
    registerEnd: getDefaultDate(22, 40),
    boardingStart: getDefaultDate(22, 55),
    boardingEnd: getDefaultDate(23, 25),
    note: 'Совмещен с SU-6404',
}, {
    id: 5,
    number: 'SU-6404',
    airline: 'Аэрофлот',
    destination: 'Санкт-Петербург',
    airportCode: 'LED',
    scheduledTime: getDefaultDate(23, 40),
    expectedTime: getDefaultDate(23, 40),
    status: 'Регистрация',
    terminal: 'A',
    gate: '18',
    checkIn: '46',
    plane: 'A-319',
    registerStart: getDefaultDate(20, 40),
    registerEnd: getDefaultDate(22, 40),
    boardingStart: getDefaultDate(22, 55),
    boardingEnd: getDefaultDate(23, 25),
    note: '',
    isRelated: true,
    relatedTo: 4
}, {
    id: 6,
    number: 'SU-2924',
    airline: 'Аэрофлот',
    destination: 'Красноярск',
    airportCode: 'KJA',
    scheduledTime: getDefaultDate(23, 55),
    expectedTime: getDefaultDate(23, 55),
    status: 'Посадка',
    terminal: 'A',
    gate: '15',
    checkIn: '46',
    plane: 'A-320',
    registerStart: getDefaultDate(20, 55),
    registerEnd: getDefaultDate(22, 55),
    boardingStart: getDefaultDate(23, 10),
    boardingEnd: getDefaultDate(23, 40),
    note: '',
}, {
    id: 7,
    number: 'U6-173',
    airline: 'Ural airlines',
    destination: 'Хабаровск',
    airportCode: 'KHV',
    scheduledTime: getDefaultDate(23, 20),
    expectedTime: getDefaultDate(24, 0),
    status: 'Регистрация',
    terminal: 'A',
    gate: '16',
    checkIn: '34,35,36',
    plane: 'A-319',
    registerStart: getDefaultDate(20, 20),
    registerEnd: getDefaultDate(22, 20),
    boardingStart: getDefaultDate(22, 35),
    boardingEnd: getDefaultDate(23, 5),
    note: '',
}];

let flights = [];
let nextId = 8;
let isAdmin = false;
let editingId = null;
let currentDate = getTodayStr();
let showDeparted = false;
let searchQuery = '';
let currentView = 'board';
let selectedFlightId = null;
let statusUpdateInterval = null;

// =================================================================
// UTILITY
// =================================================================
function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function getCurrentTime() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
}

function formatDateDisplay(dtStr) {
    if (!dtStr) return '—';
    const d = new Date(dtStr);
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
}

function formatTimeDisplay(dtStr) {
    if (!dtStr) return '—';
    const d = new Date(dtStr);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function getStatusClass(status) {
    if (status === 'Посадка' || status === 'Прибыл') return 'green';
    if (status === 'Задержан') return 'red';
    if (status === 'Регистрация' || status === 'По расписанию') return 'blue';
    if (status === 'Регистрация закончена' || status === 'Посадка закончена') return 'orange';
    if (status === 'Вылетел') return 'gray';
    return '';
}

function getAirlineLogo(airline) {
    const logos = { 'Ural airlines': 'U6', 'Аэрофлот': 'SU', 'Россия': 'FV' };
    return logos[airline] || airline.substring(0, 2).toUpperCase();
}

function getFlight(id) {
    return flights.find(f => f.id === id);
}

function returnToBoard() {
    currentView = 'board';
    renderBoard();
}

function isDeparted(status) {
    return DEPARTED_STATUSES.includes(status);
}

// =================================================================
// API
// =================================================================
async function loadFlights() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        if (data && data.length > 0) {
            let maxId = 0;
            data.forEach(f => { if (f.id > maxId) maxId = f.id; });
            nextId = maxId + 1;
            flights = data;
            return true;
        }
        return false;
    } catch (error) {
        console.warn('Ошибка загрузки с API:', error);
        return false;
    }
}

async function saveFlights(data) {
    flights = data;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Save error');
        return true;
    } catch (error) {
        console.warn('Ошибка сохранения в API:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return false;
    }
}

function loadFlightsFromLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data && data.length > 0) {
                let maxId = 0;
                data.forEach(f => { if (f.id > maxId) maxId = f.id; });
                nextId = maxId + 1;
                flights = data;
                return true;
            }
        } catch (e) { console.warn('Ошибка загрузки из localStorage'); }
    }
    return false;
}

async function initFlights() {
    const loaded = await loadFlights();
    if (!loaded) {
        const localLoaded = loadFlightsFromLocal();
        if (!localLoaded) {
            flights = JSON.parse(JSON.stringify(DEFAULT_FLIGHTS));
            await saveFlights(flights);
        }
    }
    return flights;
}

// =================================================================
// АВТООБНОВЛЕНИЕ СТАТУСОВ
// =================================================================
function updateFlightStatuses() {
    const now = getCurrentTime();
    let updated = false;

    flights.forEach(f => {
        if (f.status === 'Вылетел' || f.status === 'Задержан' || f.status === 'Отменён') return;

        let newStatus = f.status;

        if (f.registerStart && now >= f.registerStart && f.registerEnd && now < f.registerEnd) {
            newStatus = 'Регистрация';
        } else if (f.registerEnd && now >= f.registerEnd && f.boardingStart && now < f.boardingStart) {
            newStatus = 'Регистрация закончена';
        } else if (f.boardingStart && now >= f.boardingStart && f.boardingEnd && now < f.boardingEnd) {
            newStatus = 'Посадка';
        } else if (f.boardingEnd && now >= f.boardingEnd) {
            newStatus = 'Посадка закончена';
        }

        if (newStatus !== f.status) {
            f.status = newStatus;
            updated = true;
        }
    });

    if (updated) {
        saveFlights(flights);
        renderCurrentView();
    }
}

function startStatusAutoUpdate() {
    if (statusUpdateInterval) clearInterval(statusUpdateInterval);
    statusUpdateInterval = setInterval(updateFlightStatuses, 30000);
    setTimeout(updateFlightStatuses, 1000);
}

// =================================================================
// RENDER BOARD
// =================================================================
function renderBoard() {
    let filtered = flights.filter(f => {
        const flightDate = f.scheduledTime.substring(0, 10);
        return flightDate === currentDate;
    });

    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(f =>
            f.number.toLowerCase().includes(q) ||
            f.destination.toLowerCase().includes(q) ||
            f.airline.toLowerCase().includes(q) ||
            f.airportCode.toLowerCase().includes(q)
        );
    }

    if (!showDeparted) {
        filtered = filtered.filter(f => !isDeparted(f.status));
    }

    filtered.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    const isAdminView = isAdmin;

    let rows = '';
    if (filtered.length === 0) {
        rows = `<div style="text-align:center;padding:40px 0;color:#6a7a8a;font-size:16px;">Нет рейсов на выбранную дату</div>`;
    } else {
        filtered.forEach(f => {
            const statusClass = getStatusClass(f.status);
            const timeStr = formatTimeDisplay(f.scheduledTime);
            const dateStr = formatDateDisplay(f.scheduledTime);
            const factStr = f.expectedTime ? formatTimeDisplay(f.expectedTime) + ' ' + formatDateDisplay(f
                .expectedTime) : '—';

            rows += `<div class="table-flex__row table-flex__row--link" onclick="openDetail(${f.id})">`;
            rows += `<div class="table-flex__td table-flex__td--type1">
                        <span class="board__text">${timeStr}</span>
                        <span class="board__text-extra">${dateStr}</span>
                    </div>`;
            rows += `<div class="table-flex__td table-flex__td--type2"><span>${f.number}</span></div>`;
            rows += `<div class="table-flex__td table-flex__td--type3">
                        <div class="table-aircompany-logo" style="background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 90 30%22%3E%3Crect width=%2290%22 height=%2230%22 fill=%22%23e8ecf2%22/%3E%3Ctext x=%2245%22 y=%2220%22 text-anchor=%22middle%22 font-size=%2213%22 fill=%22%235a6a7a%22 font-family=%22Arial%22 font-weight=%22bold%22%3E${getAirlineLogo(f.airline)}%3C/text%3E%3C/svg%3E');"></div>
                        <div class="table-aircompany-logo-alt">${f.airline}</div>
                    </div>`;
            rows += `<div class="table-flex__td table-flex__td--type4">
                        <span class="table-flex__no-wrap">
                            <span class="board__text">${f.destination}</span>
                            <span class="board__text-extra">${f.airportCode}</span>
                        </span>
                    </div>`;
            rows += `<div class="table-flex__td table-flex__td--type5">
                        <span class="status-badge ${statusClass}">${f.status}</span>
                    </div>`;
            rows += `<div class="table-flex__td table-flex__td--type6">
                        <span class="board__text">${factStr}</span>
                    </div>`;
            rows += `<div class="table-flex__td table-flex__td--type7">
                        ${f.note ? `<span class="board__text" style="font-size:13px;color:#5a6a7a;">${f.note}</span>` : ''}
                    </div>`;
            if (isAdminView) {
                rows += `<div class="table-flex__td table-flex__td--type8 col-actions visible">
                            <button class="edit-btn" onclick="event.stopPropagation();startEdit(${f.id})">✎</button>
                            <button class="del-btn" onclick="event.stopPropagation();deleteFlight(${f.id})">✕</button>
                        </div>`;
            } else {
                rows += `<div class="table-flex__td table-flex__td--type8"></div>`;
            }
            rows += `</div>`;

            if (f.isRelated && f.relatedTo) {
                const parent = getFlight(f.relatedTo);
                if (parent) {
                    rows += `<div class="table-flex__row" style="background:#f5f5f5;border-radius:0 0 4px 4px;padding-left:20px;border-bottom:1px solid #e8ecf2;">`;
                    rows += `<div class="table-flex__td table-flex__td--type1">
                                <span class="board__text">${formatTimeDisplay(parent.scheduledTime)}</span>
                                <span class="board__text-extra">${formatDateDisplay(parent.scheduledTime)}</span>
                            </div>`;
                    rows +=
                        `<div class="table-flex__td table-flex__td--type2"><span>${parent.number}</span></div>`;
                    rows += `<div class="table-flex__td table-flex__td--type3">
                                <div class="table-aircompany-logo-alt">${parent.airline}</div>
                            </div>`;
                    rows += `<div class="table-flex__td table-flex__td--type4">
                                <span class="table-flex__no-wrap">
                                    <span class="board__text">${parent.destination}</span>
                                    <span class="board__text-extra">${parent.airportCode}</span>
                                </span>
                            </div>`;
                    rows += `<div class="table-flex__td table-flex__td--type5">
                                <span class="status-badge ${getStatusClass(parent.status)}">${parent.status}</span>
                            </div>`;
                    rows += `<div class="table-flex__td table-flex__td--type6">
                                <span class="board__text">${parent.expectedTime ? formatTimeDisplay(parent.expectedTime) + ' ' + formatDateDisplay(parent.expectedTime) : '—'}</span>
                            </div>`;
                    rows += `<div class="table-flex__td table-flex__td--type7"></div>`;
                    if (isAdminView) {
                        rows += `<div class="table-flex__td table-flex__td--type8 col-actions visible">
                                    <button class="edit-btn" onclick="event.stopPropagation();startEdit(${parent.id})">✎</button>
                                    <button class="del-btn" onclick="event.stopPropagation();deleteFlight(${parent.id})">✕</button>
                                </div>`;
                    } else {
                        rows += `<div class="table-flex__td table-flex__td--type8"></div>`;
                    }
                    rows += `</div>`;
                }
            }
        });
    }

    const dateLinks = getDateLinks();

    const html = `
                <section class="section-intro bg-blue">
                    <div class="container">
                        <div class="intro-page pb-3">
                            <div class="intro-page__svx">HBS</div>
                            <div class="intro-page-row mb-2">
                                <h1 class="h1-like">Онлайн-табло</h1>
                            </div>
                            <div class="intro-page-row d-flex mb-3 mb-sm-5">
                                <div class="intro-page-col">
                                    <div class="btn-group">
                                        <button class="btn is-active" onclick="switchTab('departure')">Вылет</button>
                                        <button class="btn" onclick="switchTab('arrival')">Прилет</button>
                                    </div>
                                </div>
                                <div class="intro-page-col">
                                    <a href="/schedule/" class="link-svg" onclick="return false;">
                                        <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M9 3v6l3 2" stroke="#fff" stroke-width="1.5" fill="none"/></svg>
                                        Расписание
                                    </a>
                                </div>
                            </div>
                            <div class="intro-page-row d-flex align-top">
                                <div class="intro-page-col order-sm-1 mb-3 mb-sm-0">
                                    <form class="form" onsubmit="return false;">
                                        <div class="scoreboard-search">
                                            <div class="scoreboard-search__btn">
                                                <button class="search-btn" type="submit">
                                                    <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M13.5 13.5l5 5" stroke="#fff" stroke-width="1.5" fill="none"/></svg>
                                                </button>
                                            </div>
                                            <div class="scoreboard-search__input">
                                                <input type="text" class="form__input" placeholder="№ рейса, город, авиакомпания..." id="searchInput" oninput="searchQuery=this.value;renderBoard();">
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="intro-page-col">
                                    <div class="intro-page-row d-flex align-top" style="gap:16px;">
                                        ${dateLinks}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="page-content">
                    <div class="container container--lg px-0">
                        <section class="pt-9 pb-2 pt-md-0 pb-md-0">
                            ${isAdminView ? renderAdminPanel() : ''}
                            <div class="table-flex-wrap">
                                <div class="table-flex">
                                    <div class="table-flex__head">
                                        <div class="table-flex__row">
                                            <div class="table-flex__th table-flex__td--type1">Время по расписанию</div>
                                            <div class="table-flex__th table-flex__td--type2">№ рейса</div>
                                            <div class="table-flex__th table-flex__td--type3">Авиакомпания</div>
                                            <div class="table-flex__th table-flex__td--type4">Направление</div>
                                            <div class="table-flex__th table-flex__td--type5">Статус</div>
                                            <div class="table-flex__th table-flex__td--type6">Ожидаемое / факт.</div>
                                            <div class="table-flex__th table-flex__td--type7">Примечание</div>
                                            <div class="table-flex__th table-flex__td--type8" style="${isAdminView ? '' : 'display:none;'}">Действия</div>
                                        </div>
                                    </div>
                                    <div class="table-flex__row">
                                        <div class="table-flex__th px-0 py-0" style="flex:1;">
                                            <div class="table-flex__link-btn" onclick="showDeparted=!showDeparted;renderBoard();">
                                                ${showDeparted ? '▼ Скрыть вылетевшие рейсы' : '▶ Показать вылетевшие рейсы'}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="table-flex__body">
                                        ${rows}
                                    </div>
                                </div>
                            </div>
                            <div class="section-back">
                                <a class="section-back-btn" href="#" onclick="return false;">
                                    <span>Рейсы завтра</span>
                                    <span class="section-back-btn__arrow">
                                        <svg viewBox="0 0 24 14"><path d="M16 12l6-6-6-6m6 6H0" stroke="currentColor" stroke-width="2" fill="none"/></svg>
                                    </span>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            `;

    document.getElementById('mainContent').innerHTML = html;
    document.getElementById('adminBadge').className = isAdmin ? 'admin-badge visible' : 'admin-badge';
    document.getElementById('loginBtn').style.display = isAdmin ? 'none' : 'inline-block';
    document.getElementById('logoutBtn').style.display = isAdmin ? 'inline-block' : 'none';
}

// =================================================================
// ДАТЫ
// =================================================================
function getDateLinks() {
    const today = new Date();
    const dates = [];
    for (let i = -1; i <= 1; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const str = d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');
        const label = d.getDate() + ' ' +
            ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][d.getMonth()];
        const active = str === currentDate ? 'is-active' : '';
        dates.push(
            `<span class="link-tag ${active}" onclick="currentDate='${str}';renderBoard();">${label}</span>`);
    }
    return dates.join('');
}

// =================================================================
// ADMIN PANEL
// =================================================================
function renderAdminPanel() {
    let statusOptions = STATUSES.map(s =>
        `<option value="${s}" ${editingId !== null && getFlight(editingId)?.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    let editData = {};
    if (editingId !== null) {
        const f = getFlight(editingId);
        if (f) editData = f;
    }

    return `
                <div class="admin-panel visible" id="adminPanel">
                    <h3>
                        <span>🛠️ Управление рейсами</span>
                        <span class="edit-badge ${editingId !== null ? 'visible' : ''}" id="editBadge">Редактирование</span>
                        <small>${editingId !== null ? 'Рейс ' + (editData.number || '') : ''}</small>
                    </h3>
                    <form id="flightForm" onsubmit="saveFlight(event)">
                        <div class="admin-grid">
                            <div class="form-group">
                                <label>№ рейса *</label>
                                <input type="text" id="fNumber" placeholder="U6-270" value="${editData.number || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Авиакомпания *</label>
                                <input type="text" id="fAirline" placeholder="Ural airlines" value="${editData.airline || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Направление (город) *</label>
                                <input type="text" id="fDestination" placeholder="Москва" value="${editData.destination || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Код ИАТА *</label>
                                <input type="text" id="fAirportCode" placeholder="DME" value="${editData.airportCode || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Вылет по расписанию *</label>
                                <input type="datetime-local" id="fScheduledTime" value="${editData.scheduledTime || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Ожидаемое время вылета</label>
                                <input type="datetime-local" id="fExpectedTime" value="${editData.expectedTime || ''}">
                            </div>
                            <div class="form-group">
                                <label>Начало регистрации</label>
                                <input type="datetime-local" id="fRegisterStart" value="${editData.registerStart || ''}">
                            </div>
                            <div class="form-group">
                                <label>Окончание регистрации</label>
                                <input type="datetime-local" id="fRegisterEnd" value="${editData.registerEnd
