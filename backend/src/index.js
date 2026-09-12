const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ingresosRoutes = require('./routes/ingresos');
const gastosRoutes = require('./routes/gastos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

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
    res.status(500).json({ message: 'Error del servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
