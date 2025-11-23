const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Инициализация базы данных
const db = new sqlite3.Database('./tickets.db');

// Создание таблиц
db.serialize(() => {
  // Таблица концертов
  db.run(`CREATE TABLE IF NOT EXISTS concerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    time TEXT NOT NULL,
    price INTEGER NOT NULL,
    available_tickets INTEGER NOT NULL,
    max_tickets INTEGER NOT NULL
  )`);

  // Таблица заказов
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    concert_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (concert_id) REFERENCES concerts (id)
  )`);

  // Добавляем тестовые концерты
  db.get("SELECT COUNT(*) as count FROM concerts", (err, row) => {
    if (row.count === 0) {
      const concerts = [
        ['15 МАР 2026', 'Москва', 'Клуб "Космос"', '20:00', 1500, 45, 200],
        ['22 МАР 2026', 'Санкт-Петербург', 'Клуб "Орбита"', '19:30', 1800, 12, 150],
        ['05 АПР 2026', 'Екатеринбург', 'Дворец молодежи', '20:00', 1200, 89, 300]
      ];
      
      const stmt = db.prepare("INSERT INTO concerts (date, city, venue, time, price, available_tickets, max_tickets) VALUES (?, ?, ?, ?, ?, ?, ?)");
      concerts.forEach(concert => stmt.run(concert));
      stmt.finalize();
      console.log('Тестовые концерты добавлены');
    }
  });
});

// API Routes

// Получить список концертов
app.get('/api/concerts', (req, res) => {
  db.all("SELECT * FROM concerts ORDER BY date", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Заказать билет
app.post('/api/tickets', (req, res) => {
  const { concert_id, full_name, email, phone } = req.body;
  
  // Валидация
  if (!concert_id || !full_name || !email || !phone) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  // Проверяем наличие билетов
  db.get("SELECT available_tickets FROM concerts WHERE id = ?", [concert_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Концерт не найден' });
    }
    
    if (row.available_tickets <= 0) {
      return res.status(400).json({ error: 'Билеты закончились' });
    }

    // Создаем заказ
    db.run(
      "INSERT INTO orders (concert_id, full_name, email, phone) VALUES (?, ?, ?, ?)",
      [concert_id, full_name, email, phone],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Уменьшаем количество доступных билетов
        db.run(
          "UPDATE concerts SET available_tickets = available_tickets - 1 WHERE id = ?",
          [concert_id],
          (err) => {
            if (err) {
              console.error('Ошибка обновления билетов:', err);
            }
          }
        );

        res.json({
          success: true,
          order_id: this.lastID,
          message: 'Заказ принят! Для оплаты отсканируйте QR-код'
        });
      }
    );
  });
});

// Получить статус заказа
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  db.get(
    `SELECT o.*, c.city, c.venue, c.date, c.price 
     FROM orders o 
     JOIN concerts c ON o.concert_id = c.id 
     WHERE o.id = ?`,
    [orderId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }
      
      res.json(row);
    }
  );
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🎸 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API доступно на http://localhost:${PORT}/api/concerts`);
});