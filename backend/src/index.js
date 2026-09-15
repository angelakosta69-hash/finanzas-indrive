const express = require('express');
const cors = require('cors');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Rechazo no manejado:', reason);
});

const authRoutes = require('./routes/auth');
const ingresosRoutes = require('./routes/ingresos');
const gastosRoutes = require('./routes/gastos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_SSL:', process.env.DB_SSL);

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
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
    console.error('Error en categorias:', error.message);
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
