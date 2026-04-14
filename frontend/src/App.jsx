import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Activos from "./pages/Activos";
import Usuarios from "./pages/Usuarios";
import Incidencias from "./pages/Incidencias";
import Navigation from "./components/Navigation";

// Contexto
import { useAuth } from "./context/AuthContext";

// RUTA PROTEGIDA (PRO)
function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();

  // ⏳ Espera mientras valida sesión
  if (loading) {
    return <p>Cargando sesión...</p>;
  }

  // Si no hay usuario → login
  return usuario ? children : <Navigate to="/" replace />;
}

// APP PRINCIPAL
function App() {
  const { usuario, loading } = useAuth();

  // Evita renderizar antes de validar auth
  if (loading) {
    return <p>Inicializando aplicación...</p>;
  }

  return (
    <Router>
      {usuario && <Navigation />}
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            usuario ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* GESTIÓN DE ACTIVOS */}
        <Route
          path="/activos"
          element={
            <PrivateRoute>
              <Activos />
            </PrivateRoute>
          }
        />

        {/* GESTIÓN DE USUARIOS */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />

        {/* INCIDENCIAS */}
        <Route
          path="/incidencias"
          element={
            <PrivateRoute>
              <Incidencias />
            </PrivateRoute>
          }
        />

        {/* 404 → REDIRECT */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* TOAST GLOBAL */}
      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
