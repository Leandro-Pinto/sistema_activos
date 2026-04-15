import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Función para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Función para obtener tiempo relativo
const tiempoRelativo = (fecha) => {
  if (!fecha) return "-";
  
  const ahora = new Date();
  const entonces = new Date(fecha);
  const segundos = Math.floor((ahora - entonces) / 1000);
  
  let intervalo = segundos / 31536000;
  if (intervalo > 1) return Math.floor(intervalo) + " años";
  
  intervalo = segundos / 2592000;
  if (intervalo > 1) return Math.floor(intervalo) + " meses";
  
  intervalo = segundos / 86400;
  if (intervalo > 1) return Math.floor(intervalo) + " días";
  
  intervalo = segundos / 3600;
  if (intervalo > 1) return Math.floor(intervalo) + " horas";
  
  intervalo = segundos / 60;
  if (intervalo > 1) return Math.floor(intervalo) + " min";
  
  return Math.floor(segundos) + " seg";
};

function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario"
  });

  // CARGAR USUARIOS CON FILTROS
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filtroRol !== "todos") params.append("rol", filtroRol);
      if (filtroFechaDesde) params.append("fecha_desde", filtroFechaDesde);
      if (filtroFechaHasta) params.append("fecha_hasta", filtroFechaHasta);

      const data = await api(`/usuarios?${params.toString()}`);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // CARGAR ESTADÍSTICAS
  const cargarEstadisticas = async () => {
    try {
      const data = await api("/usuarios/estadisticas");
      setEstadisticas(data);
    } catch (error) {
      // Error silencioso
    }
  };

  useEffect(() => {
    if (!usuarioActual) return;
    if (usuarioActual.rol === "admin") {
      cargarUsuarios();
      cargarEstadisticas();
    }
  }, [usuarioActual, filtroRol, filtroFechaDesde, filtroFechaHasta]);

  // CAMBIOS EN FORMULARIO
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // GUARDAR USUARIO
  const guardarUsuario = async (e) => {
    e.preventDefault();
    const { nombre, email, password } = form;

    if (!nombre || !email || !password) {
      toast.warning("Completa todos los campos");
      return;
    }

    try {
      await api("/usuarios", "POST", form);
      toast.success("Usuario creado correctamente");
      resetearFormulario();
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al crear usuario");
    }
  };

  // RESETEAR FORMULARIO
  const resetearFormulario = () => {
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "usuario"
    });
    setMostrarFormulario(false);
  };

  // CAMBIAR ROL
  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await api(`/usuarios/${userId}/rol`, "PUT", { rol: nuevoRol });
      toast.success("Rol actualizado");
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al cambiar rol");
    }
  };

  // ELIMINAR USUARIO
  const eliminarUsuario = async (userId) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await api(`/usuarios/${userId}`, "DELETE");
      toast.success("Usuario eliminado");
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al eliminar usuario");
    }
  };

  // FILTRAR USUARIOS
  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleBusqueda =
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleRol = filtroRol === "todos" || u.rol === filtroRol;

    return cumpleBusqueda && cumpleRol;
  });

  // Solo Admin puede acceder
  if (usuarioActual?.rol !== "admin") {
    return (
      <div style={styles.container}>
        <div style={styles.accessDenied}>
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.titulo}>Gestión de Usuarios y Roles</h1>
        <button onClick={() => setMostrarFormulario(true)} style={styles.btnNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      {estadisticas && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total</span>
            <span style={styles.statValue}>{estadisticas.total}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Esta Semana</span>
            <span style={styles.statValue}>{estadisticas.ultimaSemana}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Este Mes</span>
            <span style={styles.statValue}>{estadisticas.estesMes}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Activos Hoy</span>
            <span style={styles.statValue}>{estadisticas.activos}</span>
          </div>
          {estadisticas.porRol.map(stat => (
            <div key={stat.rol} style={styles.statCard}>
              <span style={styles.statLabel}>{stat.rol}</span>
              <span style={styles.statValue}>{stat.cantidad}</span>
            </div>
          ))}
        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div style={styles.filtrosContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.inputBusqueda}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={styles.selectFiltro}
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="tecnico">Técnico</option>
          <option value="usuario">Usuario</option>
        </select>
        <input
          type="date"
          value={filtroFechaDesde}
          onChange={(e) => setFiltroFechaDesde(e.target.value)}
          style={styles.selectFiltro}
          title="Desde"
        />
        <input
          type="date"
          value={filtroFechaHasta}
          onChange={(e) => setFiltroFechaHasta(e.target.value)}
          style={styles.selectFiltro}
          title="Hasta"
        />
        <span style={styles.contador}>
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </span>
      </div>

      {/* FORMULARIO MODAL */}
      {mostrarFormulario && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarFormulario(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Crear Nuevo Usuario</h2>
              <button onClick={() => setMostrarFormulario(false)} style={styles.btnCerrar}>✕</button>
            </div>

            <form onSubmit={guardarUsuario} style={styles.formulario}>
              <div style={styles.formGroup}>
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña segura"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Rol</label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="usuario">Usuario</option>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.btnGuardar}>
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  style={styles.btnCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {mostrarDetalles && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarDetalles(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Detalles del Usuario</h2>
              <button onClick={() => setMostrarDetalles(null)} style={styles.btnCerrar}>✕</button>
            </div>

            <div style={styles.detallesContainer}>
              <div style={styles.detalleRow}>
                <strong>Nombre:</strong>
                <span>{mostrarDetalles.nombre}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Email:</strong>
                <span>{mostrarDetalles.email}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Rol:</strong>
                <span>{mostrarDetalles.rol}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Fecha Creación:</strong>
                <span title={formatearFecha(mostrarDetalles.fecha_creacion)}>
                  hace {tiempoRelativo(mostrarDetalles.fecha_creacion)}
                </span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Última Actualización:</strong>
                <span title={formatearFecha(mostrarDetalles.ultima_actualizacion)}>
                  {mostrarDetalles.ultima_actualizacion ? `hace ${tiempoRelativo(mostrarDetalles.ultima_actualizacion)}` : "-"}
                </span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Último Login:</strong>
                <span title={formatearFecha(mostrarDetalles.ultimo_login)}>
                  {mostrarDetalles.ultimo_login 
                    ? `hace ${tiempoRelativo(mostrarDetalles.ultimo_login)}`
                    : "Nunca"}
                </span>
              </div>
            </div>

            <div style={styles.formActions}>
              <button onClick={() => setMostrarDetalles(null)} style={styles.btnCancelar}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE USUARIOS */}
      <div style={styles.tablaContainer}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            Cargando usuarios...
          </p>
        ) : usuariosFiltrados.length > 0 ? (
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Creado</th>
                <th style={styles.th}>Actualizado</th>
                <th style={styles.th}>Último Login</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.td}>{u.nombre}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      style={{
                        ...styles.selectRol,
                        backgroundColor: u.rol === "admin" ? "#ffcccc" : u.rol === "tecnico" ? "#cce5ff" : "#f0f0f0"
                      }}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={styles.td} title={formatearFecha(u.fecha_creacion)}>
                    {tiempoRelativo(u.fecha_creacion)}
                  </td>
                  <td style={styles.td} title={formatearFecha(u.ultima_actualizacion)}>
                    {u.ultima_actualizacion ? tiempoRelativo(u.ultima_actualizacion) : "-"}
                  </td>
                  <td style={styles.td} title={formatearFecha(u.ultimo_login)}>
                    {u.ultimo_login ? tiempoRelativo(u.ultimo_login) : "Nunca"}
                  </td>
                  <td style={styles.tdAcciones}>
                    <button 
                      onClick={() => setMostrarDetalles(u)}
                      style={styles.btnVer}
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => eliminarUsuario(u.id)}
                      style={styles.btnEliminar}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            No hay usuarios para mostrar
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titulo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  btnNuevo: {
    padding: "10px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  filtrosContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 120px 120px auto",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  inputBusqueda: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  selectFiltro: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  contador: {
    color: "#7f8c8d",
    fontSize: "13px",
  },
  tablaContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    backgroundColor: "#34495e",
    color: "white",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
  },
  tableRow: {
    borderBottom: "1px solid #ecf0f1",
  },
  td: {
    padding: "12px",
  },
  tdAcciones: {
    padding: "12px",
    display: "flex",
    gap: "5px",
  },
  selectRol: {
    padding: "6px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },
  btnVer: {
    padding: "5px 10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  btnEliminar: {
    padding: "5px 10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxWidth: "500px",
    width: "90%",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #ecf0f1",
  },
  btnCerrar: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  formulario: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #ecf0f1",
  },
  btnGuardar: {
    padding: "10px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnCancelar: {
    padding: "10px 20px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  detallesContainer: {
    padding: "20px",
  },
  detalleRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #ecf0f1",
  },
  accessDenied: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "8px",
    color: "#e74c3c",
  },
};

export default Usuarios;
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Función para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Función para obtener tiempo relativo
const tiempoRelativo = (fecha) => {
  if (!fecha) return "-";
  
  const ahora = new Date();
  const entonces = new Date(fecha);
  const segundos = Math.floor((ahora - entonces) / 1000);
  
  let intervalo = segundos / 31536000;
  if (intervalo > 1) return Math.floor(intervalo) + " años";
  
  intervalo = segundos / 2592000;
  if (intervalo > 1) return Math.floor(intervalo) + " meses";
  
  intervalo = segundos / 86400;
  if (intervalo > 1) return Math.floor(intervalo) + " días";
  
  intervalo = segundos / 3600;
  if (intervalo > 1) return Math.floor(intervalo) + " horas";
  
  intervalo = segundos / 60;
  if (intervalo > 1) return Math.floor(intervalo) + " min";
  
  return Math.floor(segundos) + " seg";
};

function Usuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editId, setEditId] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario"
  });

  // CARGAR USUARIOS CON FILTROS
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filtroRol !== "todos") params.append("rol", filtroRol);
      if (filtroFechaDesde) params.append("fecha_desde", filtroFechaDesde);
      if (filtroFechaHasta) params.append("fecha_hasta", filtroFechaHasta);

      const data = await api(`/usuarios?${params.toString()}`);
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // CARGAR ESTADÍSTICAS
  const cargarEstadisticas = async () => {
    try {
      const data = await api("/usuarios/estadisticas");
      setEstadisticas(data);
    } catch (error) {
      // Error silencioso para estadísticas
    }
  };

  useEffect(() => {
    if (!usuarioActual) return;
    if (usuarioActual.rol === "admin") {
      cargarUsuarios();
      cargarEstadisticas();
    }
  }, [usuarioActual, filtroRol, filtroFechaDesde, filtroFechaHasta]);

  // CAMBIOS EN FORMULARIO
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // GUARDAR USUARIO (CREAR)
  const guardarUsuario = async (e) => {
    e.preventDefault();
    const { nombre, email, password, rol } = form;

    if (!nombre || !email || !password) {
      toast.warning("Completa todos los campos");
      return;
    }

    try {
      await api("/usuarios", "POST", form);
      toast.success("Usuario creado correctamente");
      resetearFormulario();
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al crear usuario");
    }
  };

  // RESETEAR FORMULARIO
  const resetearFormulario = () => {
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "usuario"
    });
    setEditId(null);
    setMostrarFormulario(false);
  };

  // CAMBIAR ROL
  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await api(`/usuarios/${userId}/rol`, "PUT", { rol: nuevoRol });
      toast.success("Rol actualizado");
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al cambiar rol");
    }
  };

  // ELIMINAR USUARIO
  const eliminarUsuario = async (userId) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;

    try {
      await api(`/usuarios/${userId}`, "DELETE");
      toast.success("Usuario eliminado");
      cargarUsuarios();
      cargarEstadisticas();
    } catch (error) {
      toast.error(error.message || "Error al eliminar usuario");
    }
  };

  // FILTRAR USUARIOS
  const usuariosFiltrados = usuarios.filter(u => {
    const cumpleBusqueda =
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleRol = filtroRol === "todos" || u.rol === filtroRol;

    return cumpleBusqueda && cumpleRol;
  });

  // Solo Admin puede acceder
  if (usuarioActual?.rol !== "admin") {
    return (
      <div style={styles.container}>
        <div style={styles.accessDenied}>
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.titulo}>Gestión de Usuarios y Roles</h1>
        <button onClick={() => setMostrarFormulario(true)} style={styles.btnNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      {estadisticas && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total</span>
            <span style={styles.statValue}>{estadisticas.total}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Esta Semana</span>
            <span style={styles.statValue}>{estadisticas.ultimaSemana}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Este Mes</span>
            <span style={styles.statValue}>{estadisticas.estesMes}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Activos Hoy</span>
            <span style={styles.statValue}>{estadisticas.activos}</span>
          </div>
          {estadisticas.porRol.map(stat => (
            <div key={stat.rol} style={styles.statCard}>
              <span style={styles.statLabel}>{stat.rol}</span>
              <span style={styles.statValue}>{stat.cantidad}</span>
            </div>
          ))}
        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div style={styles.filtrosContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.inputBusqueda}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={styles.selectFiltro}
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="tecnico">Técnico</option>
          <option value="usuario">Usuario</option>
        </select>
        <input
          type="date"
          value={filtroFechaDesde}
          onChange={(e) => setFiltroFechaDesde(e.target.value)}
          style={styles.selectFiltro}
          title="Desde"
        />
        <input
          type="date"
          value={filtroFechaHasta}
          onChange={(e) => setFiltroFechaHasta(e.target.value)}
          style={styles.selectFiltro}
          title="Hasta"
        />
        <span style={styles.contador}>
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </span>
      </div>

      {/* FORMULARIO MODAL */}
      {mostrarFormulario && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarFormulario(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Crear Nuevo Usuario</h2>
              <button onClick={() => setMostrarFormulario(false)} style={styles.btnCerrar}>✕</button>
            </div>

            <form onSubmit={guardarUsuario} style={styles.formulario}>
              <div style={styles.formGroup}>
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña segura"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Rol</label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="usuario">Usuario (Lectura básica)</option>
                  <option value="tecnico">Técnico (CRUD Activos e Incidencias)</option>
                  <option value="admin">Admin (Acceso completo)</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.btnGuardar}>
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  style={styles.btnCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {mostrarDetalles && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarDetalles(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Detalles del Usuario</h2>
              <button onClick={() => setMostrarDetalles(null)} style={styles.btnCerrar}>✕</button>
            </div>

            <div style={styles.detallesContainer}>
              <div style={styles.detalleRow}>
                <strong>Nombre:</strong>
                <span>{mostrarDetalles.nombre}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Email:</strong>
                <span>{mostrarDetalles.email}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Rol:</strong>
                <span>{mostrarDetalles.rol}</span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Fecha Creación:</strong>
                <span title={formatearFecha(mostrarDetalles.fecha_creacion)}>
                  {formatearFecha(mostrarDetalles.fecha_creacion)} (hace {tiempoRelativo(mostrarDetalles.fecha_creacion)})
                </span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Última Actualización:</strong>
                <span title={formatearFecha(mostrarDetalles.ultima_actualizacion)}>
                  {formatearFecha(mostrarDetalles.ultima_actualizacion) || "-"}
                </span>
              </div>
              <div style={styles.detalleRow}>
                <strong>Último Login:</strong>
                <span title={formatearFecha(mostrarDetalles.ultimo_login)}>
                  {mostrarDetalles.ultimo_login 
                    ? `${formatearFecha(mostrarDetalles.ultimo_login)} (hace ${tiempoRelativo(mostrarDetalles.ultimo_login)})`
                    : "Nunca ha iniciado sesión"}
                </span>
              </div>
            </div>

            <div style={styles.formActions}>
              <button onClick={() => setMostrarDetalles(null)} style={styles.btnCancelar}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE USUARIOS */}
      <div style={styles.tablaContainer}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            Cargando usuarios...
          </p>
        ) : usuariosFiltrados.length > 0 ? (
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.tableHeader}>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Actualizado</th>
                <th>Último Login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.tableCellNombre}>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      style={{
                        ...styles.selectRol,
                        backgroundColor: u.rol === "admin" ? "#ffcccc" : u.rol === "tecnico" ? "#cce5ff" : "#f0f0f0"
                      }}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td title={formatearFecha(u.fecha_creacion)}>
                    {tiempoRelativo(u.fecha_creacion)}
                  </td>
                  <td title={formatearFecha(u.ultima_actualizacion)}>
                    {u.ultima_actualizacion ? tiempoRelativo(u.ultima_actualizacion) : "-"}
                  </td>
                  <td title={formatearFecha(u.ultimo_login)}>
                    {u.ultimo_login ? tiempoRelativo(u.ultimo_login) : "Nunca"}
                  </td>
                  <td style={styles.tableCellAcciones}>
                    <button 
                      onClick={() => setMostrarDetalles(u)}
                      style={styles.btnVer}
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => eliminarUsuario(u.id)}
                      style={styles.btnEliminar}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            No hay usuarios para mostrar
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titulo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  btnNuevo: {
    padding: "10px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#7f8c8d",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  filtrosContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 150px 150px auto",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  inputBusqueda: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  selectFiltro: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  contador: {
    color: "#7f8c8d",
    fontSize: "13px",
  },
  tablaContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    backgroundColor: "#34495e",
    color: "white",
  },
  tableRow: {
    borderBottom: "1px solid #ecf0f1",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  tableCellNombre: {
    padding: "12px",
    fontWeight: "bold",
  },
  tableCellAcciones: {
    padding: "12px",
    display: "flex",
    gap: "5px",
  },
  selectRol: {
    padding: "6px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },
  btnVer: {
    padding: "5px 10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  btnEliminar: {
    padding: "5px 10px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #ecf0f1",
  },
  btnCerrar: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  formulario: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #ecf0f1",
  },
  btnGuardar: {
    padding: "10px 20px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnCancelar: {
    padding: "10px 20px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  detallesContainer: {
    padding: "20px",
  },
  detalleRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #ecf0f1",
  },
  accessDenied: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "8px",
    color: "#e74c3c",
  },
};

export default Usuarios;
        <button onClick={() => setMostrarFormulario(true)} style={styles.btnNuevo}>
          ➕ Nuevo Usuario
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      {estadisticas && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Usuarios</span>
            <span style={styles.statValue}>{estadisticas.total}</span>
          </div>
          {estadisticas.porRol.map(stat => (
            <div key={stat.rol} style={styles.statCard}>
              <span style={styles.statLabel}>{stat.rol.charAt(0).toUpperCase() + stat.rol.slice(1)}</span>
              <span style={styles.statValue}>{stat.cantidad}</span>
            </div>
          ))}
        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div style={styles.filtrosContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.inputBusqueda}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={styles.selectFiltro}
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="tecnico">Técnico</option>
          <option value="usuario">Usuario</option>
        </select>
        <span style={styles.contador}>
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </span>
      </div>

      {/* FORMULARIO MODAL */}
      {mostrarFormulario && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarFormulario(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>➕ Crear Nuevo Usuario</h2>
              <button onClick={() => setMostrarFormulario(false)} style={styles.btnCerrar}>✕</button>
            </div>

            <form onSubmit={guardarUsuario} style={styles.formulario}>
              <div style={styles.formGroup}>
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña segura"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Rol</label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="usuario">Usuario (Lectura básica)</option>
                  <option value="tecnico">Técnico (CRUD Activos e Incidencias)</option>
                  <option value="admin">Admin (Acceso completo)</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.btnGuardar}>
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  style={styles.btnCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLA DE USUARIOS */}
      <div style={styles.tablaContainer}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            ⏳ Cargando usuarios...
          </p>
        ) : usuariosFiltrados.length > 0 ? (
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.tableHeader}>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} style={styles.tableRow}>
                  <td style={styles.tableCellNombre}>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.rol}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      style={{
                        ...styles.selectRol,
                        ...getRolColor(u.rol)
                      }}
                      disabled={u.id === usuarioActual?.id}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.acciones}>
                    {u.id !== usuarioActual?.id && (
                      <button
                        onClick={() => eliminarUsuario(u.id)}
                        style={styles.btnAccionDanger}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                    {u.id === usuarioActual?.id && (
                      <span style={styles.badge}>Tu usuario</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            {busqueda || filtroRol !== "todos"
              ? "❌ No hay usuarios que coincidan"
              : "📭 No hay usuarios registrados"}
          </p>
        )}
      </div>

      {/* INFORMACIÓN DE ROLES */}
      <div style={styles.rolesInfo}>
        <h3 style={styles.rolesTitle}>📋 Descripción de Roles</h3>
        <div style={styles.rolesList}>
          <div style={styles.roleItem}>
            <h4 style={styles.roleName}>👑 Admin</h4>
            <p style={styles.rolePerms}>
              • Acceso completo al sistema<br />
              • Crear, editar y eliminar usuarios<br />
              • Cambiar roles y permisos<br />
              • Gestionar activos, incidencias y mantenimientos<br />
              • Ver reportes y estadísticas
            </p>
          </div>
          <div style={styles.roleItem}>
            <h4 style={styles.roleName}>🔧 Técnico</h4>
            <p style={styles.rolePerms}>
              • Crear y editar activos<br />
              • Registrar incidencias y mantenimientos<br />
              • Ver activos y reportes<br />
              • No puede gestionar usuarios
            </p>
          </div>
          <div style={styles.roleItem}>
            <h4 style={styles.roleName}>👤 Usuario</h4>
            <p style={styles.rolePerms}>
              • Ver activos (lectura)<br />
              • Reportar incidencias<br />
              • Ver su propio perfil<br />
              • Acceso limitado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const getRolColor = (rol) => {
  const colors = {
    admin: { background: "#7c2d12", color: "#fed7aa" },
    tecnico: { background: "#1e40af", color: "#bfdbfe" },
    usuario: { background: "#065f46", color: "#a7f3d0" }
  };
  return colors[rol] || { background: "#475569", color: "#cbd5e1" };
};

const styles = {
  container: {
    padding: "30px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif"
  },
  accessDenied: {
    background: "#7f1d1d",
    border: "2px solid #dc2626",
    color: "#fca5a5",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #334155"
  },
  titulo: {
    fontSize: "28px",
    margin: "0",
    color: "#f1f5f9"
  },
  btnNuevo: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "30px"
  },
  statCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center"
  },
  statLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px"
  },
  statValue: {
    display: "block",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#38bdf8"
  },
  filtrosContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  inputBusqueda: {
    flex: 1,
    minWidth: "300px",
    padding: "10px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "14px"
  },
  selectFiltro: {
    padding: "10px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#e2e8f0",
    cursor: "pointer"
  },
  contador: {
    color: "#94a3b8",
    fontSize: "13px"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    maxWidth: "500px",
    width: "90%"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #334155"
  },
  btnCerrar: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer"
  },
  formulario: {
    padding: "20px"
  },
  formGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column"
  },
  input: {
    padding: "10px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    color: "#e2e8f0",
    fontSize: "14px",
    marginTop: "5px"
  },
  formActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    justifyContent: "flex-end"
  },
  btnGuardar: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  btnCancelar: {
    background: "#475569",
    color: "#e2e8f0",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  tablaContainer: {
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "auto",
    marginBottom: "30px"
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  },
  tableHeader: {
    background: "#334155",
    color: "#e2e8f0"
  },
  tableRow: {
    borderBottom: "1px solid #334155"
  },
  tableCellNombre: {
    fontWeight: "600",
    color: "#38bdf8"
  },
  selectRol: {
    padding: "6px 10px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  acciones: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  btnAccionDanger: {
    background: "#dc2626",
    border: "none",
    color: "white",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600"
  },
  badge: {
    background: "#38bdf8",
    color: "#0f172a",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600"
  },
  rolesInfo: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "25px"
  },
  rolesTitle: {
    color: "#e2e8f0",
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600"
  },
  rolesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px"
  },
  roleItem: {
    background: "#0f172a",
    border: "1px solid #334155",
    padding: "15px",
    borderRadius: "8px"
  },
  roleName: {
    color: "#38bdf8",
    margin: "0 0 10px 0",
    fontSize: "16px"
  },
  rolePerms: {
    color: "#cbd5e1",
    margin: 0,
    lineHeight: "1.6",
    fontSize: "13px"
  }
};

export default Usuarios;
