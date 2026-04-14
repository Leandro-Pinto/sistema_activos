const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuariosController");

router.post("/register", usuariosController.registrarUsuario);

module.exports = router;
