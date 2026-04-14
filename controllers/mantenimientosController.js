const pool = require("../config/db");

// obtener mantenimientos
exports.obtenerMantenimientos = async (req, res) => {

try {

const resultado = await pool.query(`
SELECT mantenimientos.*, activos.codigo, usuarios.nombre AS tecnico
FROM mantenimientos
JOIN activos ON mantenimientos.activo_id = activos.id
JOIN usuarios ON mantenimientos.tecnico_id = usuarios.id
ORDER BY mantenimientos.id DESC
`);

res.json(resultado.rows);

} catch (error) {

console.error(error);
res.status(500).json({ error: "Error al obtener mantenimientos" });

}

};

// registrar mantenimiento
exports.crearMantenimiento = async (req, res) => {

try {

const { activo_id, tecnico_id, tipo, descripcion } = req.body;

const resultado = await pool.query(
`INSERT INTO mantenimientos
(activo_id,tecnico_id,tipo,descripcion)
VALUES ($1,$2,$3,$4)
RETURNING *`,
[activo_id, tecnico_id, tipo, descripcion]
);

res.json(resultado.rows[0]);

} catch (error) {

console.error(error);
res.status(500).json({ error: "Error al registrar mantenimiento" });

}

};
