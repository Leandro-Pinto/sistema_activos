const express = require("express");
const router = express.Router();

const activosController = require("../controllers/activosController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

//SOLO ADMIN crea activos
router.post(
  "/",
  auth,
  role(["admin"]),
  activosController.crearActivo
);
// ELIMINAR ACTIVO (SOLO ADMIN)
router.delete(
  "/:id",
  auth,
  role(["admin"]),
  activosController.eliminarActivo
);
// EDITAR ACTIVO (ADMIN)
router.put(
  "/:id",
  auth,
  role(["admin"]),
  activosController.actualizarActivo
);
//ADMIN y TECNICO pueden ver activos
router.get(
  "/",
  auth,
  role(["admin", "tecnico"]),
  activosController.listarActivos
);

//TODOS pueden buscar
router.get(
  "/buscar/:codigo",
  auth,
  role(["admin", "tecnico", "usuario"]),
  activosController.buscarActivo
);

module.exports = router;
