const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    //ACCESS TOKEN (corto)
    const accessToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    //REFRESH TOKEN (largo)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    //GUARDAR refreshToken en BD
    await pool.query(
      "UPDATE usuarios SET refresh_token = $1 WHERE id = $2",
      [refreshToken, user.id]
    );

    res.json({
      token: accessToken,
      refreshToken,
      usuario: {
        id: user.id,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // verificar token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // buscar en BD
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1 AND refresh_token = $2",
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Refresh token inválido" });
    }

    const user = result.rows[0];

    // generar nuevo access token
    const newAccessToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });

  } catch (error) {
    console.error("ERROR REFRESH:", error.message);
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      "UPDATE usuarios SET refresh_token = NULL WHERE id = $1",
      [userId]
    );

    res.json({ message: "Logout exitoso" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
};
