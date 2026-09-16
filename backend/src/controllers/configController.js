const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const perfil = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const [users] = await pool.query(
      'SELECT id, nombre, email, placa_vehiculo, telefono FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const actualizarNombre = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { nombre } = req.body;

    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres.' });
    }

    await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre.trim(), usuario_id]);

    res.json({ message: 'Nombre actualizado.', nombre: nombre.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const actualizarTelefono = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { telefono } = req.body;

    if (!telefono || telefono.trim().length < 7) {
      return res.status(400).json({ message: 'El teléfono debe tener al menos 7 dígitos.' });
    }

    await pool.query('UPDATE usuarios SET telefono = ? WHERE id = ?', [telefono.trim(), usuario_id]);

    res.json({ message: 'Teléfono actualizado.', telefono: telefono.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ message: 'La contraseña actual y la nueva son requeridas.' });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const [users] = await pool.query('SELECT password FROM usuarios WHERE id = ?', [usuario_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(passwordActual, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
    }

    const hashedPassword = await bcrypt.hash(passwordNueva, 10);
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, usuario_id]);

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = { perfil, actualizarNombre, actualizarTelefono, cambiarPassword };
