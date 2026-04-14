import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useContext(AuthContext);

  // Mientras valida token
  if (loading) return <Loader />;

  // No logueado
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return usuario ? children : <Navigate to="/" />;
};

export default PrivateRoute;
