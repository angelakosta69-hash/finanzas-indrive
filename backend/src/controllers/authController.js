const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res) => {
  try {
    const { nombre, email, password, placa_vehiculo } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y password son requeridos.' });
    }

    if (nombre.trim().length < 2 || nombre.trim().length > 100) {
      return res.status(400).json({ message: 'El nombre debe tener entre 2 y 100 caracteres.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'El email no es válido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, placa_vehiculo) VALUES (?, ?, ?, ?)',
      [nombre.trim(), email.toLowerCase().trim(), hashedPassword, placa_vehiculo?.trim() || null]
    );

    const token = jwt.sign(
      { id: result.insertId, email: email.toLowerCase().trim() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      usuario: { id: result.insertId, nombre: nombre.trim(), email: email.toLowerCase().trim(), placa_vehiculo: placa_vehiculo?.trim() || null }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'El email no es válido.' });
    }

    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso.',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        placa_vehiculo: user.placa_vehiculo
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = { register, login };
