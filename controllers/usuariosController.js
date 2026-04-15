const pool = require("../config/db");
const bcrypt = require("bcrypt");

// REGISTRAR USUARIO
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Validar que el email no exista
    const existe = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND fecha_eliminacion IS NULL",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // guardar en BD
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, fecha_creacion, ultima_actualizacion)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, nombre, email, rol, fecha_creacion, ultima_actualizacion`,
      [nombre, email, hash, rol || "usuario"]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// LISTAR TODOS LOS USUARIOS CON FILTROS POR FECHA
exports.listarUsuarios = async (req, res) => {
  try {
    const { rol, fecha_desde, fecha_hasta, activo } = req.query;
    let query = `
      SELECT id, nombre, email, rol, fecha_creacion, ultima_actualizacion, ultimo_login, 
             estado, fecha_eliminacion
      FROM usuarios
      WHERE fecha_eliminacion IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    // Filtro por rol
    if (rol && ['admin', 'tecnico', 'usuario'].includes(rol)) {
      query += ` AND rol = $${paramIndex}`;
      params.push(rol);
      paramIndex++;
    }

    // Filtro por fecha de creación desde
    if (fecha_desde) {
      query += ` AND DATE(fecha_creacion) >= $${paramIndex}`;
      params.push(fecha_desde);
      paramIndex++;
    }

    // Filtro por fecha de creación hasta
    if (fecha_hasta) {
      query += ` AND DATE(fecha_creacion) <= $${paramIndex}`;
      params.push(fecha_hasta);
      paramIndex++;
    }

    query += ` ORDER BY fecha_creacion DESC`;

    const resultado = await pool.query(query, params);
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
      `SELECT id, nombre, email, rol, fecha_creacion, ultima_actualizacion, ultimo_login, estado
       FROM usuarios
       WHERE id = $1 AND fecha_eliminacion IS NULL`,
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

    // Validar campos
    if (!nombre || !email) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Validar que el email no esté en uso por otro usuario
    const existe = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1 AND id != $2 AND fecha_eliminacion IS NULL",
      [email, id]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, email = $2, ultima_actualizacion = NOW()
       WHERE id = $3 AND fecha_eliminacion IS NULL
       RETURNING id, nombre, email, rol, fecha_creacion, ultima_actualizacion, ultimo_login`,
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
      `UPDATE usuarios
       SET rol = $1, ultima_actualizacion = NOW()
       WHERE id = $2 AND fecha_eliminacion IS NULL
       RETURNING id, nombre, email, rol, fecha_creacion, ultima_actualizacion, ultimo_login`,
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

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener usuario actual
    const usuario = await pool.query(
      "SELECT password FROM usuarios WHERE id = $1 AND fecha_eliminacion IS NULL",
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
      `UPDATE usuarios
       SET password = $1, ultima_actualizacion = NOW()
       WHERE id = $2 AND fecha_eliminacion IS NULL
       RETURNING id, nombre, email, rol, fecha_creacion, ultima_actualizacion`,
      [hash, id]
    );

    res.json({ 
      mensaje: "Contraseña actualizada correctamente", 
      usuario: resultado.rows[0] 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};

// ELIMINAR USUARIO - SOFT DELETE (SOLO ADMIN)
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar si es el último admin
    const usuarioActual = await pool.query(
      "SELECT rol FROM usuarios WHERE id = $1 AND fecha_eliminacion IS NULL",
      [id]
    );

    if (usuarioActual.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuarioActual.rows[0].rol === "admin") {
      const admins = await pool.query(
        "SELECT COUNT(*) FROM usuarios WHERE rol = 'admin' AND fecha_eliminacion IS NULL"
      );

      if (parseInt(admins.rows[0].count) <= 1) {
        return res.status(400).json({ error: "No puedes eliminar el último admin" });
      }
    }

    // Soft delete - marcar como eliminado
    const resultado = await pool.query(
      `UPDATE usuarios
       SET fecha_eliminacion = NOW(), estado = 'inactivo'
       WHERE id = $1
       RETURNING id, nombre, email, fecha_eliminacion`,
      [id]
    );

    res.json({ 
      mensaje: "Usuario eliminado correctamente", 
      usuario: resultado.rows[0] 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// OBTENER ESTADÍSTICAS DE USUARIOS
exports.estadisticasUsuarios = async (req, res) => {
  try {
    // Total de usuarios activos
    const total = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE fecha_eliminacion IS NULL"
    );

    // Usuarios por rol
    const porRol = await pool.query(
      "SELECT rol, COUNT(*) as cantidad FROM usuarios WHERE fecha_eliminacion IS NULL GROUP BY rol"
    );

    // Usuarios creados en los últimos 7 días
    const ultimaSemana = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE fecha_eliminacion IS NULL AND fecha_creacion >= NOW() - INTERVAL '7 days'"
    );

    // Usuarios creados en el mes actual
    const estaeMes = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE fecha_eliminacion IS NULL AND DATE_TRUNC('month', fecha_creacion) = DATE_TRUNC('month', NOW())"
    );

    // Usuarios activos hoy (último login hoy)
    const activeHoy = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE fecha_eliminacion IS NULL AND DATE(ultimo_login) = DATE(NOW())"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      porRol: porRol.rows,
      ultimaSemana: parseInt(ultimaSemana.rows[0].count),
      estesMes: parseInt(estaeMes.rows[0].count),
      activos: parseInt(activeHoy.rows[0].count)
    });

  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error.message);
    res.status(500).json({ error: "Error al obtener estadísticas: " + error.message });
  }
};
