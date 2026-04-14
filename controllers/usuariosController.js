const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // guardar en BD
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};
