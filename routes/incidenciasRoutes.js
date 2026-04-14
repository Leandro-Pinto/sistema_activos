const express = require("express");
const router = express.Router();

const controller = require("../controllers/incidenciasController");
const auth = require("../middleware/authMiddleware");

router.get("/incidencias", auth, controller.obtenerIncidencias);
router.post("/incidencias", auth, controller.crearIncidencia);
router.put("/incidencias/:id", auth, controller.actualizarIncidencia);

module.exports = router;
