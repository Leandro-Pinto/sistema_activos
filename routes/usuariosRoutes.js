const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuariosController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// REGISTRAR USUARIO (SOLO ADMIN)
router.post("/", auth, role(["admin"]), usuariosController.registrarUsuario);

// LISTAR TODOS LOS USUARIOS (SOLO ADMIN)
router.get("/", auth, role(["admin"]), usuariosController.listarUsuarios);

// OBTENER ESTADÍSTICAS (SOLO ADMIN)
router.get("/estadisticas", auth, role(["admin"]), usuariosController.estadisticasUsuarios);

// OBTENER UN USUARIO (ADMIN O EL MISMO USUARIO)
router.get("/:id", auth, usuariosController.obtenerUsuario);

// EDITAR USUARIO (ADMIN O EL MISMO USUARIO)
router.put("/:id", auth, usuariosController.editarUsuario);

// CAMBIAR ROL (SOLO ADMIN)
router.put("/:id/rol", auth, role(["admin"]), usuariosController.cambiarRol);

// CAMBIAR CONTRASEÑA
router.put("/:id/password", auth, usuariosController.cambiarContrasena);

// ELIMINAR USUARIO (SOLO ADMIN)
router.delete("/:id", auth, role(["admin"]), usuariosController.eliminarUsuario);

module.exports = router;
