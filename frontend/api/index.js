const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const ingresosRoutes = require('./routes/ingresos');
const gastosRoutes = require('./routes/gastos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de login. Espera 15 minutos.' }
});

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/categorias-gasto', async (req, res) => {
  const pool = require('./config/db');
  try {
    const [rows] = await pool.query('SELECT * FROM categorias_gasto');
    res.json(rows);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ message: 'Error del servidor.' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test-db', async (req, res) => {
  const pool = require('./config/db');
  try {
    const [users] = await pool.query('SELECT id, nombre FROM usuarios LIMIT 5');
    const [ing] = await pool.query('SELECT COUNT(*) as total FROM ingresos');
    res.json({ users, totalIngresos: ing[0].total });
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = app;
