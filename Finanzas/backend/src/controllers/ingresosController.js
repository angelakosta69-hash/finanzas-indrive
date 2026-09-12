const pool = require('../config/db');

const crear = async (req, res) => {
  try {
    const { monto, fecha, observaciones } = req.body;
    const usuario_id = req.usuario.id;

    if (!monto || !fecha) {
      return res.status(400).json({ message: 'Monto y fecha son requeridos.' });
    }

    const [result] = await pool.query(
      'INSERT INTO ingresos (usuario_id, monto, fecha, observaciones) VALUES (?, ?, ?, ?)',
      [usuario_id, monto, fecha, observaciones || null]
    );

    res.status(201).json({
      message: 'Ingreso registrado exitosamente.',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const listar = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { fecha_inicio, fecha_fin } = req.query;

    let query = 'SELECT * FROM ingresos WHERE usuario_id = ?';
    const params = [usuario_id];

    if (fecha_inicio && fecha_fin) {
      query += ' AND fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY fecha DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [result] = await pool.query(
      'DELETE FROM ingresos WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingreso no encontrado.' });
    }

    res.json({ message: 'Ingreso eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = { crear, listar, eliminar };
