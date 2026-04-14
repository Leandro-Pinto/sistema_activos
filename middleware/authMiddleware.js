const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);
    console.log("SECRET:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = decoded;

    next();

  } catch (error) {
    console.log("ERROR JWT:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};
