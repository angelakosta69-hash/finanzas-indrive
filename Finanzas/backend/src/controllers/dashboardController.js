const pool = require('../config/db');

const resumen = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const hoy = new Date().toISOString().split('T')[0];

    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];

    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];

    const [ingresosHoy] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE usuario_id = ? AND fecha = ?',
      [usuario_id, hoy]
    );

    const [ingresosSemana] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?',
      [usuario_id, inicioSemanaStr, hoy]
    );

    const [ingresosMes] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?',
      [usuario_id, inicioMesStr, hoy]
    );

    const [gastosHoy] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE usuario_id = ? AND fecha = ?',
      [usuario_id, hoy]
    );

    const [gastosSemana] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?',
      [usuario_id, inicioSemanaStr, hoy]
    );

    const [gastosMes] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?',
      [usuario_id, inicioMesStr, hoy]
    );

    const [gastosPorCategoria] = await pool.query(
      `SELECT cg.nombre, COALESCE(SUM(g.monto), 0) as total
       FROM categorias_gasto cg
       LEFT JOIN gastos g ON cg.id = g.categoria_id AND g.usuario_id = ? AND g.fecha BETWEEN ? AND ?
       GROUP BY cg.id, cg.nombre`,
      [usuario_id, inicioMesStr, hoy]
    );

    const [ultimosIngresos] = await pool.query(
      'SELECT * FROM ingresos WHERE usuario_id = ? ORDER BY fecha DESC, created_at DESC LIMIT 5',
      [usuario_id]
    );

    const [ultimosGastos] = await pool.query(
      `SELECT g.*, cg.nombre as categoria_nombre
       FROM gastos g
       JOIN categorias_gasto cg ON g.categoria_id = cg.id
       WHERE g.usuario_id = ?
       ORDER BY g.fecha DESC, g.created_at DESC LIMIT 5`,
      [usuario_id]
    );

    res.json({
      hoy: {
        ingresos: parseFloat(ingresosHoy[0].total),
        gastos: parseFloat(gastosHoy[0].total),
        balance: parseFloat(ingresosHoy[0].total) - parseFloat(gastosHoy[0].total)
      },
      semana: {
        ingresos: parseFloat(ingresosSemana[0].total),
        gastos: parseFloat(gastosSemana[0].total),
        balance: parseFloat(ingresosSemana[0].total) - parseFloat(gastosSemana[0].total)
      },
      mes: {
        ingresos: parseFloat(ingresosMes[0].total),
        gastos: parseFloat(gastosMes[0].total),
        balance: parseFloat(ingresosMes[0].total) - parseFloat(gastosMes[0].total)
      },
      gastosPorCategoria: gastosPorCategoria.map(g => ({
        nombre: g.nombre,
        total: parseFloat(g.total)
      })),
      ultimosIngresos,
      ultimosGastos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const dia = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: 'Fecha es requerida.' });
    }

    const [ingresos] = await pool.query(
      'SELECT * FROM ingresos WHERE usuario_id = ? AND fecha = ? ORDER BY created_at DESC',
      [usuario_id, fecha]
    );

    const [gastos] = await pool.query(
      `SELECT g.*, cg.nombre as categoria_nombre
       FROM gastos g
       JOIN categorias_gasto cg ON g.categoria_id = cg.id
       WHERE g.usuario_id = ? AND g.fecha = ? ORDER BY g.created_at DESC`,
      [usuario_id, fecha]
    );

    const totalIngresos = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);

    res.json({
      fecha,
      ingresos: { total: totalIngresos, detalle: ingresos },
      gastos: { total: totalGastos, detalle: gastos },
      balance: totalIngresos - totalGastos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

module.exports = { resumen, dia };
