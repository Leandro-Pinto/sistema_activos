const pool = require("../config/db");

// CREAR
exports.crearActivo = async (req, res) => {
  try {
    const { codigo, tipo, marca, modelo, estado, ubicacion, responsable } = req.body;

    const resultado = await pool.query(
      `INSERT INTO activos 
      (codigo, tipo, marca, modelo, estado, ubicacion, responsable)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [codigo, tipo, marca, modelo, estado, ubicacion, responsable]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear activo" });
  }
};
// ELIMINAR
exports.eliminarActivo = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM activos WHERE id=$1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    res.json({ mensaje: "Activo eliminado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar activo" });
  }
};
// ACTUALIZAR
exports.actualizarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, tipo, marca, modelo, estado, ubicacion, responsable } = req.body;

    const resultado = await pool.query(
      `UPDATE activos
       SET codigo=$1, tipo=$2, marca=$3, modelo=$4, estado=$5, ubicacion=$6, responsable=$7
       WHERE id=$8
       RETURNING *`,
      [codigo, tipo, marca, modelo, estado, ubicacion, responsable, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar activo" });
  }
};
// LISTAR
exports.listarActivos = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM activos");
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar activos" });
  }
};

// BUSCAR
exports.buscarActivo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM activos WHERE codigo=$1",
      [codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: "Activo no encontrado" });
    }

    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar activo" });
  }
};
