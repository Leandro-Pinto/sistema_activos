const express = require("express");
const router = express.Router();

const mantenimientosController = require("../controllers/mantenimientosController");

router.post("/mantenimientos", mantenimientosController.crearMantenimiento);
router.get("/mantenimientos", mantenimientosController.obtenerMantenimientos);


module.exports = router;
