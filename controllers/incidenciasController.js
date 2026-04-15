const pool = require("../config/db");

// LISTAR CON FILTROS
exports.obtenerIncidencias = async (req, res) => {
  try {
    const { estado, prioridad, tecnico, buscar } = req.query;
    let query = `
      SELECT i.*, a.codigo, a.nombre as activo_nombre
      FROM incidencias i
      JOIN activos a ON i.activo_id = a.id
      WHERE i.fecha_eliminacion IS NULL
    `;
    const params = [];
    let paramIndex = 1;

    if (estado) {
      query += ` AND i.estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    if (prioridad) {
      query += ` AND i.prioridad = $${paramIndex}`;
      params.push(prioridad);
      paramIndex++;
    }

    if (tecnico) {
      query += ` AND i.tecnico = $${paramIndex}`;
      params.push(tecnico);
      paramIndex++;
    }

    if (buscar) {
      query += ` AND (i.descripcion ILIKE $${paramIndex} OR a.codigo ILIKE $${paramIndex})`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    query += ` ORDER BY i.prioridad DESC, i.fecha_creacion DESC`;

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener incidencias" });
  }
};

// OBTENER POR ID
exports.obtenerIncidencia = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT i.*, a.codigo, a.nombre as activo_nombre
       FROM incidencias i
       JOIN activos a ON i.activo_id = a.id
       WHERE i.id = $1 AND i.fecha_eliminacion IS NULL`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener incidencia" });
  }
};

// CREAR
exports.crearIncidencia = async (req, res) => {
  try {
    const { activo_id, descripcion, prioridad } = req.body;
    const usuario_id = req.usuario.id;

    // Validaciones
    if (!activo_id || !descripcion || !prioridad) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    if (!['baja', 'media', 'alta'].includes(prioridad)) {
      return res.status(400).json({ error: "Prioridad inválida" });
    }

    // Validar que el activo existe
    const activoExiste = await pool.query(
      "SELECT id FROM activos WHERE id = $1 AND fecha_eliminacion IS NULL",
      [activo_id]
    );

    if (activoExiste.rows.length === 0) {
      return res.status(404).json({ error: "Activo no encontrado" });
    }

    const resultado = await pool.query(
      `INSERT INTO incidencias (activo_id, descripcion, estado, prioridad, usuario_id, fecha_creacion)
       VALUES ($1, $2, 'pendiente', $3, $4, NOW())
       RETURNING *`,
      [activo_id, descripcion, prioridad, usuario_id]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear incidencia" });
  }
};

// ACTUALIZAR ESTADO Y TÉCNICO
exports.actualizarIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, tecnico, notas } = req.body;
    const usuarioRol = req.usuario.rol;

    // Solo admin y técnicos pueden actualizar
    if (!['admin', 'tecnico'].includes(usuarioRol)) {
      return res.status(403).json({ error: "No tienes permisos para actualizar incidencias" });
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'en_proceso', 'resuelto', 'rechazado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    // Verificar que la incidencia existe
    const incidencia = await pool.query(
      "SELECT * FROM incidencias WHERE id = $1 AND fecha_eliminacion IS NULL",
      [id]
    );

    if (incidencia.rows.length === 0) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    const resultado = await pool.query(
      `UPDATE incidencias
       SET estado = COALESCE($1, estado),
           tecnico = COALESCE($2, tecnico),
           notas = COALESCE($3, notas),
           fecha_actualizacion = NOW()
       WHERE id = $4 AND fecha_eliminacion IS NULL
       RETURNING *`,
      [estado || null, tecnico || null, notas || null, id]
    );

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar incidencia" });
  }
};

// ASIGNAR TÉCNICO
exports.asignarTecnico = async (req, res) => {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;
    const usuarioRol = req.usuario.rol;

    if (usuarioRol !== 'admin') {
      return res.status(403).json({ error: "Solo admin puede asignar técnicos" });
    }

    if (!tecnico_id) {
      return res.status(400).json({ error: "tecnico_id es requerido" });
    }

    const resultado = await pool.query(
      `UPDATE incidencias
       SET tecnico = $1, estado = 'en_proceso', fecha_actualizacion = NOW()
       WHERE id = $2 AND fecha_eliminacion IS NULL
       RETURNING *`,
      [tecnico_id, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar técnico" });
  }
};

// ELIMINAR (soft delete)
exports.eliminarIncidencia = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRol = req.usuario.rol;

    if (usuarioRol !== 'admin') {
      return res.status(403).json({ error: "Solo admin puede eliminar incidencias" });
    }

    const resultado = await pool.query(
      `UPDATE incidencias
       SET fecha_eliminacion = NOW()
       WHERE id = $1 AND fecha_eliminacion IS NULL
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    res.json({ mensaje: "Incidencia eliminada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar incidencia" });
  }
};
