const express = require("express");
const router = express.Router();

const mantenimientosController = require("../controllers/mantenimientosController");

router.post("/", mantenimientosController.crearMantenimiento);
router.get("/", mantenimientosController.obtenerMantenimientos);


module.exports = router;
