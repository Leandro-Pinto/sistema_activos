const pool = require("../config/db");
const bcrypt = require("bcrypt");

// REGISTRAR USUARIO
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar que el email no exista
    const existe = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // guardar en BD
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol || "usuario"]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// LISTAR TODOS LOS USUARIOS
exports.listarUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nombre, email, rol FROM usuarios ORDER BY id DESC"
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error("❌ Error al listar usuarios:", error.message);
    res.status(500).json({ error: "Error al listar usuarios: " + error.message });
  }
};

// OBTENER UN USUARIO POR ID
exports.obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// EDITAR USUARIO
exports.editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email } = req.body;

    // Validar que el email no esté en uso por otro usuario
    const existe = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3
       RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al editar usuario" });
  }
};

// CAMBIAR ROL DE USUARIO (SOLO ADMIN)
exports.cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!["admin", "tecnico", "usuario"].includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios SET rol = $1 WHERE id = $2
       RETURNING id, nombre, email, rol, created_at`,
      [rol, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar rol" });
  }
};

// CAMBIAR CONTRASEÑA
exports.cambiarContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNueva } = req.body;

    // Obtener usuario actual
    const usuario = await pool.query(
      "SELECT password FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(
      passwordActual,
      usuario.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña actual incorrecta" });
    }

    // Encriptar nueva contraseña
    const hash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar
    const resultado = await pool.query(
      "UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id, nombre, email, rol",
      [hash, id]
    );

    res.json({ mensaje: "Contraseña actualizada correctamente", usuario: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};

// ELIMINAR USUARIO (SOLO ADMIN)
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar si es el último admin
    const usuarioActual = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1",
      [id]
    );

    if (usuarioActual.rows[0].rol === "admin") {
      const admins = await pool.query(
        "SELECT COUNT(*) FROM usuarios WHERE rol = 'admin'"
      );

      if (parseInt(admins.rows[0].count) <= 1) {
        return res.status(400).json({ error: "No puedes eliminar el último admin" });
      }
    }

    const resultado = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING id",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// OBTENER ESTADÍSTICAS DE USUARIOS
exports.estadisticasUsuarios = async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM usuarios");

    const porRol = await pool.query(
      "SELECT rol, COUNT(*) as cantidad FROM usuarios GROUP BY rol"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      porRol: porRol.rows
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error.message);
    res.status(500).json({ error: "Error al obtener estadísticas: " + error.message });
  }
};
