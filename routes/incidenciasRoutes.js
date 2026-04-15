const express = require("express");
const router = express.Router();

const controller = require("../controllers/incidenciasController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// GET - Listar incidencias con filtros
router.get("/", auth, controller.obtenerIncidencias);

// GET - Obtener incidencia por ID
router.get("/:id", auth, controller.obtenerIncidencia);

// POST - Crear incidencia
router.post("/", auth, controller.crearIncidencia);

// PUT - Actualizar incidencia (estado, técnico, notas)
router.put("/:id", auth, role(["admin", "tecnico"]), controller.actualizarIncidencia);

// PUT - Asignar técnico (solo admin)
router.put("/:id/asignar", auth, role(["admin"]), controller.asignarTecnico);

// DELETE - Eliminar incidencia (soft delete, solo admin)
router.delete("/:id", auth, role(["admin"]), controller.eliminarIncidencia);

module.exports = router;
