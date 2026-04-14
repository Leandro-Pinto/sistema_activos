const cors = require("cors");
const express = require("express");
require("dotenv").config();

const activosRoutes = require("./routes/activosRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const incidenciasRoutes = require("./routes/incidenciasRoutes");
const mantenimientosRoutes = require("./routes/mantenimientosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🔥 RUTAS
app.use("/auth", authRoutes);        // LOGIN PRINCIPAL
app.use("/activos", activosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/incidencias", incidenciasRoutes);
app.use("/mantenimientos", mantenimientosRoutes);
app.use("/dashboard", dashboardRoutes);

// 🔥 SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
