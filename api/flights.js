const { Pool } = require('pg');

// Подключение к Neon (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Создание таблицы при первом запуске
async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS flights (
                id INTEGER PRIMARY KEY,
                number VARCHAR(20) NOT NULL,
                airline VARCHAR(100) NOT NULL,
                destination VARCHAR(100) NOT NULL,
                airport_code VARCHAR(10) NOT NULL,
                scheduled_time VARCHAR(30) NOT NULL,
                expected_time VARCHAR(30),
                status VARCHAR(50) NOT NULL,
                terminal VARCHAR(10),
                gate VARCHAR(10),
                check_in VARCHAR(50),
                plane VARCHAR(50),
                register_start VARCHAR(30),
                register_end VARCHAR(30),
                boarding_start VARCHAR(30),
                boarding_end VARCHAR(30),
                note TEXT,
                is_related BOOLEAN DEFAULT FALSE,
                related_to INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Таблица flights создана/проверена');
    } catch (err) {
        console.error('❌ Ошибка создания таблицы:', err);
    } finally {
        client.release();
    }
}

// Вызов при старте
initDb();

// =================================================================
// API HANDLER
// =================================================================
module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET /api/flights — получить все рейсы
    if (req.method === 'GET') {
        try {
            const result = await pool.query(`
                SELECT 
                    id, number, airline, destination, 
                    airport_code as "airportCode",
                    scheduled_time as "scheduledTime",
                    expected_time as "expectedTime",
                    status, terminal, gate, 
                    check_in as "checkIn",
                    plane,
                    register_start as "registerStart",
                    register_end as "registerEnd",
                    boarding_start as "boardingStart",
                    boarding_end as "boardingEnd",
                    note,
                    is_related as "isRelated",
                    related_to as "relatedTo"
                FROM flights 
                ORDER BY id
            `);
            return res.json(result.rows);
        } catch (err) {
            console.error('Ошибка GET /flights:', err);
            return res.status(500).json({ error: err.message });
        }
    }

    // POST /api/flights — сохранить все рейсы
    if (req.method === 'POST') {
        const flights = req.body;
        if (!Array.isArray(flights)) {
            return res.status(400).json({ error: 'Ожидается массив рейсов' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Очищаем таблицу
            await client.query('TRUNCATE flights RESTART IDENTITY CASCADE');

            // Вставляем рейсы
            for (const f of flights) {
                await client.query(`
                    INSERT INTO flights (
                        id, number, airline, destination, airport_code,
                        scheduled_time, expected_time, status, terminal, gate,
                        check_in, plane, register_start, register_end,
                        boarding_start, boarding_end, note, is_related, related_to
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `, [
                    f.id, f.number, f.airline, f.destination, f.airportCode,
                    f.scheduledTime, f.expectedTime || null, f.status, f.terminal || 'A', f.gate || null,
                    f.checkIn || null, f.plane || null, f.registerStart || null, f.registerEnd || null,
                    f.boardingStart || null, f.boardingEnd || null, f.note || null,
                    f.isRelated || false, f.relatedTo || null
                ]);
            }

            await client.query('COMMIT');
            return res.json({ success: true, count: flights.length });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Ошибка POST /flights:', err);
            return res.status(500).json({ error: err.message });
        } finally {
            client.release();
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
