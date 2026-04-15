const pool = require("../config/db");

// Dashboard Avanzado - Todas las estadísticas
exports.estadisticas = async (req, res) => {
  try {
    // Total de activos
    const totalActivos = await pool.query("SELECT COUNT(*) FROM activos");

    // Activos por estado
    const activosPorEstado = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM activos 
      GROUP BY estado
      ORDER BY cantidad DESC
    `);

    // Activos por tipo
    const activosPorTipo = await pool.query(`
      SELECT tipo, COUNT(*) as cantidad
      FROM activos 
      GROUP BY tipo
      ORDER BY cantidad DESC
    `);

    // Incidencias por estado
    const incidenciasPorEstado = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM incidencias 
      GROUP BY estado
      ORDER BY cantidad DESC
    `);

    // Incidencias por prioridad
    const incidenciasPorPrioridad = await pool.query(`
      SELECT prioridad, COUNT(*) as cantidad
      FROM incidencias 
      GROUP BY prioridad
      ORDER BY cantidad DESC
    `);

    // Total de incidencias
    const totalIncidencias = await pool.query("SELECT COUNT(*) FROM incidencias");

    // Total de mantenimientos
    const totalMantenimientos = await pool.query("SELECT COUNT(*) FROM mantenimientos");

    // Mantenimientos esta semana
    const mantenimientosEstaSemana = await pool.query(`
      SELECT COUNT(*) 
      FROM mantenimientos 
      WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    `);

    // Activos por marca (top 5)
    const activosPorMarca = await pool.query(`
      SELECT marca, COUNT(*) as cantidad
      FROM activos 
      WHERE marca IS NOT NULL
      GROUP BY marca
      ORDER BY cantidad DESC
      LIMIT 5
    `);

    // Últimas 5 incidencias
    const ultimasIncidencias = await pool.query(`
      SELECT i.id, i.descripcion, i.estado, i.prioridad, a.codigo
      FROM incidencias i
      JOIN activos a ON i.activo_id = a.id
      ORDER BY i.id DESC
      LIMIT 5
    `);

    res.json({
      resumen: {
        totalActivos: parseInt(totalActivos.rows[0].count),
        totalIncidencias: parseInt(totalIncidencias.rows[0].count),
        totalMantenimientos: parseInt(totalMantenimientos.rows[0].count),
        mantenimientosEstaSemana: parseInt(mantenimientosEstaSemana.rows[0].count)
      },
      graficas: {
        activosPorEstado: activosPorEstado.rows,
        activosPorTipo: activosPorTipo.rows,
        incidenciasPorEstado: incidenciasPorEstado.rows,
        incidenciasPorPrioridad: incidenciasPorPrioridad.rows,
        activosPorMarca: activosPorMarca.rows
      },
      recientes: {
        ultimasIncidencias: ultimasIncidencias.rows
      }
    });

  } catch (error) {
    console.error("❌ Error en estadísticas:", error.message);
    res.status(500).json({ error: "Error en estadísticas: " + error.message });
  }
};
