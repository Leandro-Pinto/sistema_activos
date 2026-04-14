const express = require("express");
const router = express.Router();

const controller = require("../controllers/incidenciasController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.obtenerIncidencias);
router.post("/", auth, controller.crearIncidencia);
router.put("/:id", auth, controller.actualizarIncidencia);

module.exports = router;
