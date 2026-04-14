const express = require("express");
const router = express.Router();

const activosController = require("../controllers/activosController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

//SOLO ADMIN crea activos
router.post(
  "/activos",
  auth,
  role(["admin"]),
  activosController.crearActivo
);
// ELIMINAR ACTIVO (SOLO ADMIN)
router.delete(
  "/activos/:id",
  auth,
  role(["admin"]),
  activosController.eliminarActivo
);
// EDITAR ACTIVO (ADMIN)
router.put(
  "/activos/:id",
  auth,
  role(["admin"]),
  activosController.actualizarActivo
);
//ADMIN y TECNICO pueden ver activos
router.get(
  "/activos",
  auth,
  role(["admin", "tecnico"]),
  activosController.listarActivos
);

//TODOS pueden buscar
router.get(
  "/activos/buscar/:codigo",
  auth,
  role(["admin", "tecnico", "usuario"]),
  activosController.buscarActivo
);

module.exports = router;
