const pool = require('../config/db');

const crear = async (req, res) => {
  try {
    const { categoria_id, monto, fecha, descripcion } = req.body;
    const usuario_id = req.usuario.id;

    if (!categoria_id || !monto || !fecha) {
      return res.status(400).json({ message: 'Categoría, monto y fecha son requeridos.' });
    }

    const [result] = await pool.query(
      'INSERT INTO gastos (usuario_id, categoria_id, monto, fecha, descripcion) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, categoria_id, monto, fecha, descripcion || null]
    );

    res.status(201).json({
      message: 'Gasto registrado exitosamente.',
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

    let query = `
      SELECT g.*, cg.nombre as categoria_nombre
      FROM gastos g
      JOIN categorias_gasto cg ON g.categoria_id = cg.id
      WHERE g.usuario_id = ?
    `;
    const params = [usuario_id];

    if (fecha_inicio && fecha_fin) {
      query += ' AND g.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' ORDER BY g.fecha DESC';

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
      'DELETE FROM gastos WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gasto no encontrado.' });
    }

    res.json({ message: 'Gasto eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = { crear, listar, eliminar };
