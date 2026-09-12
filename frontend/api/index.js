const express = require('express');
const cors = require('cors');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const authRoutes = require('./routes/auth');
const ingresosRoutes = require('./routes/ingresos');
const gastosRoutes = require('./routes/gastos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
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

app.get('/api', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
