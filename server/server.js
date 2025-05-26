const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');

const app = express();
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware для парсинга JSON
app.use(express.json());

// Секретный ключ для JWT
const JWT_SECRET = 'your-secret-key';

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Обработка корневого маршрута
app.get('/', (req, res) => {
  res.json({
    message: 'College LMS API Server',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      journal: {
        list: 'GET /api/journal',
        create: 'POST /api/journal'
      }
    }
  });
});

// API маршруты
const apiRouter = express.Router();

// Роут для авторизации
apiRouter.post('/auth/login', (req, res) => {
  try {
    console.log('Получен запрос на авторизацию:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const users = router.db.get('users').value();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
  }
});

// Роут для выхода
apiRouter.post('/auth/logout', (req, res) => {
  res.json({ message: 'Успешный выход' });
});

// Роут для получения данных текущего пользователя
apiRouter.get('/auth/me', authenticateToken, (req, res) => {
  try {
    const users = router.db.get('users').value();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
  }
});

// Подключаем API роутер
app.use('/api', apiRouter);

// Используем JSON Server для остальных роутов
app.use('/api', middlewares, router);

// Обработка 404 ошибок
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Маршрут не найден',
    path: req.path
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
  console.log('Доступные эндпоинты:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/logout');
  console.log('- GET /api/auth/me');
  console.log('- GET /api/journal');
  console.log('- POST /api/journal');
});