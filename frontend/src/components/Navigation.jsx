import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const { logout, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "📊 Dashboard", roles: ["admin", "tecnico", "usuario"] },
    { path: "/activos", label: "💻 Activos", roles: ["admin", "tecnico"] },
    { path: "/incidencias", label: "⚠️ Incidencias", roles: ["admin", "tecnico", "usuario"] }
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContent}>
        {/* LOGO */}
        <div style={styles.logo} onClick={() => navigate("/dashboard")}>
          🏢 Sistema de Activos
        </div>

        {/* MENU */}
        <ul style={styles.menu}>
          {menuItems
            .filter(item => item.roles.includes(usuario?.rol))
            .map(item => (
              <li key={item.path} style={styles.menuItem}>
                <button
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.menuButton,
                    ...(isActive(item.path) ? styles.menuButtonActive : {})
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
        </ul>

        {/* USUARIO Y LOGOUT */}
        <div style={styles.userSection}>
          <span style={styles.userRole}>👤 {usuario?.rol}</span>
          <button onClick={logout} style={styles.logoutBtn}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderBottom: "2px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
  },
  navContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
    height: "70px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  logo: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#38bdf8",
    cursor: "pointer",
    transition: "color 0.3s",
    ":hover": { color: "#0891b2" }
  },
  menu: {
    display: "flex",
    listStyle: "none",
    margin: 0,
    padding: 0,
    gap: "5px"
  },
  menuItem: {
    display: "inline"
  },
  menuButton: {
    background: "transparent",
    border: "none",
    color: "#cbd5e1",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "6px",
    transition: "all 0.3s",
    ":hover": {
      color: "#38bdf8",
      background: "rgba(56, 189, 248, 0.1)"
    }
  },
  menuButtonActive: {
    background: "#38bdf8",
    color: "#0f172a",
    fontWeight: "600"
  },
  userSection: {
    display: "flex",
    gap: "15px",
    alignItems: "center"
  },
  userRole: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500"
  },
  logoutBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "background 0.3s",
    ":hover": { background: "#991b1b" }
  }
};

export default Navigation;
