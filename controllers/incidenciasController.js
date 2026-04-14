const pool = require("../config/db");

//LISTAR
exports.obtenerIncidencias = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT i.*, a.codigo 
      FROM incidencias i
      JOIN activos a ON i.activo_id = a.id
      ORDER BY i.id DESC
    `);

    res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener incidencias" });
  }
};

//CREAR
exports.crearIncidencia = async (req, res) => {
  try {
    const { activo_id, descripcion, prioridad } = req.body;

    const resultado = await pool.query(
      `INSERT INTO incidencias (activo_id, descripcion, estado, prioridad)
       VALUES ($1, $2, 'pendiente', $3)
       RETURNING *`,
      [activo_id, descripcion, prioridad]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear incidencia" });
  }
};

//ACTUALIZAR ESTADO + TÉCNICO
exports.actualizarIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, tecnico } = req.body;

    const resultado = await pool.query(
      `UPDATE incidencias
       SET estado=$1, tecnico=$2
       WHERE id=$3
       RETURNING *`,
      [estado, tecnico, id]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar incidencia" });
  }
};
