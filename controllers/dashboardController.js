const pool = require("../config/db");

exports.estadisticas = async (req, res) => {
  try {

    const total = await pool.query("SELECT COUNT(*) FROM activos");

    const porTipo = await pool.query(`
      SELECT tipo, COUNT(*) 
      FROM activos 
      GROUP BY tipo
    `);

    const porMarca = await pool.query(`
      SELECT marca, COUNT(*) 
      FROM activos 
      GROUP BY marca
    `);

    res.json({
      total: total.rows[0].count,
      tipos: porTipo.rows,
      marcas: porMarca.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en estadísticas" });
  }
};
