module.exports = (rolesPermitidos) => {
  return (req, res, next) => {

    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!rolesPermitidos.includes(user.rol)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    next();
  };
};
