import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Activos() {
  const { usuario } = useAuth();
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editId, setEditId] = useState(null);
  const [detalles, setDetalles] = useState(null);

  const [form, setForm] = useState({
    codigo: "",
    tipo: "",
    marca: "",
    modelo: "",
    estado: "activo",
    ubicacion: "",
    responsable: ""
  });

  // CARGAR ACTIVOS
  const cargarActivos = async () => {
    try {
      setLoading(true);
      const data = await api("/activos");
      setActivos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario) return; // Esperar a que usuario esté cargado
    cargarActivos();
  }, [usuario]);

  // CAMBIOS EN FORMULARIO
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // GUARDAR ACTIVO (CREAR O EDITAR)
  const guardarActivo = async (e) => {
    e.preventDefault();
    const { codigo, tipo, marca, modelo } = form;

    if (!codigo || !tipo || !marca || !modelo) {
      toast.warning("Completa los campos obligatorios");
      return;
    }

    try {
      if (editId) {
        await api(`/activos/${editId}`, "PUT", form);
        toast.success("✏️ Activo actualizado");
      } else {
        await api("/activos", "POST", form);
        toast.success("✅ Activo registrado");
      }

      resetearFormulario();
      cargarActivos();
    } catch (error) {
      toast.error(error.message || "Error al guardar");
    }
  };

  // RESETEAR FORMULARIO
  const resetearFormulario = () => {
    setForm({
      codigo: "",
      tipo: "",
      marca: "",
      modelo: "",
      estado: "activo",
      ubicacion: "",
      responsable: ""
    });
    setEditId(null);
    setMostrarFormulario(false);
  };

  // EDITAR ACTIVO
  const editarActivo = (activo) => {
    setForm({
      codigo: activo.codigo || "",
      tipo: activo.tipo || "",
      marca: activo.marca || "",
      modelo: activo.modelo || "",
      estado: activo.estado || "activo",
      ubicacion: activo.ubicacion || "",
      responsable: activo.responsable || ""
    });
    setEditId(activo.id);
    setMostrarFormulario(true);
    setDetalles(null);
  };

  // ELIMINAR ACTIVO
  const eliminarActivo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este activo?")) return;

    try {
      await api(`/activos/${id}`, "DELETE");
      toast.success("🗑️ Activo eliminado");
      cargarActivos();
      setDetalles(null);
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // VER DETALLES
  const verDetalles = (activo) => {
    setDetalles(activo);
    setMostrarFormulario(false);
  };

  // FILTRAR ACTIVOS
  const activosFiltrados = activos.filter(activo => {
    const cumpleBusqueda =
      activo.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      activo.responsable?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleEstado =
      filtroEstado === "todos" || activo.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  if (!usuario) {
    return <p style={styles.loading}>Cargando...</p>;
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.titulo}>💻 Gestión de Activos</h1>
        <button
          onClick={() => {
            resetearFormulario();
            setMostrarFormulario(true);
          }}
          style={styles.btnNuevo}
        >
          ➕ Nuevo Activo
        </button>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div style={styles.filtrosContainer}>
        <input
          type="text"
          placeholder="Buscar por código, tipo, marca, modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.inputBusqueda}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={styles.selectFiltro}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
        <span style={styles.contador}>
          {activosFiltrados.length} de {activos.length} activos
        </span>
      </div>

      {/* FORMULARIO MODAL */}
      {mostrarFormulario && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarFormulario(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>{editId ? "✏️ Editar Activo" : "➕ Registrar Nuevo Activo"}</h2>
              <button onClick={() => setMostrarFormulario(false)} style={styles.btnCerrar}>✕</button>
            </div>

            <form onSubmit={guardarActivo} style={styles.formulario}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Código *</label>
                  <input
                    type="text"
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    placeholder="ACT-001"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Tipo *</label>
                  <input
                    type="text"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    placeholder="Computadora, Monitor, etc."
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Marca *</label>
                  <input
                    type="text"
                    name="marca"
                    value={form.marca}
                    onChange={handleChange}
                    placeholder="Dell, HP, etc."
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Modelo *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={form.modelo}
                    onChange={handleChange}
                    placeholder="OptiPlex, ProBook, etc."
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label>Ubicación</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    placeholder="Oficina 1, Almacén, etc."
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label>Responsable</label>
                <input
                  type="text"
                  name="responsable"
                  value={form.responsable}
                  onChange={handleChange}
                  placeholder="Nombre del responsable"
                  style={styles.input}
                />
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.btnGuardar}>
                  {editId ? "Actualizar" : "Registrar"}
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

      {/* MODAL DE DETALLES */}
      {detalles && (
        <div style={styles.modalBackdrop} onClick={() => setDetalles(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>📋 Detalles del Activo</h2>
              <button onClick={() => setDetalles(null)} style={styles.btnCerrar}>✕</button>
            </div>

            <div style={styles.detallesContenido}>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Código:</span>
                <span style={styles.detalleValor}>{detalles.codigo}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Tipo:</span>
                <span style={styles.detalleValor}>{detalles.tipo}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Marca:</span>
                <span style={styles.detalleValor}>{detalles.marca}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Modelo:</span>
                <span style={styles.detalleValor}>{detalles.modelo}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Estado:</span>
                <span style={getEstadoStyle(detalles.estado)}>
                  {detalles.estado}
                </span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Ubicación:</span>
                <span style={styles.detalleValor}>{detalles.ubicacion || "N/A"}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Responsable:</span>
                <span style={styles.detalleValor}>{detalles.responsable || "N/A"}</span>
              </div>
              <div style={styles.detalleRow}>
                <span style={styles.detalleLabel}>Fecha Registro:</span>
                <span style={styles.detalleValor}>
                  {new Date(detalles.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={styles.detallesAcciones}>
              <button onClick={() => editarActivo(detalles)} style={styles.btnEditar}>
                ✏️ Editar
              </button>
              <button onClick={() => {
                eliminarActivo(detalles.id);
              }} style={styles.btnEliminar}>
                🗑️ Eliminar
              </button>
              <button onClick={() => setDetalles(null)} style={styles.btnCerrarDetalles}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLA DE ACTIVOS */}
      <div style={styles.tablaContainer}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            ⏳ Cargando activos...
          </p>
        ) : activosFiltrados.length > 0 ? (
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.tableHeader}>
                <th>Código</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activosFiltrados.map((activo) => (
                <tr key={activo.id} style={styles.tableRow}>
                  <td style={styles.tableCellCode}>{activo.codigo}</td>
                  <td>{activo.tipo}</td>
                  <td>{activo.marca}</td>
                  <td>{activo.modelo}</td>
                  <td style={getEstadoStyle(activo.estado)}>{activo.estado}</td>
                  <td>{activo.ubicacion || "-"}</td>
                  <td>{activo.responsable || "-"}</td>
                  <td style={styles.acciones}>
                    <button
                      onClick={() => verDetalles(activo)}
                      style={styles.btnVer}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => editarActivo(activo)}
                      style={styles.btnAccion}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarActivo(activo.id)}
                      style={styles.btnAccionDanger}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
            {busqueda || filtroEstado !== "todos"
              ? "❌ No hay activos que coincidan con tu búsqueda"
              : "📭 No hay activos registrados"}
          </p>
        )}
      </div>
    </div>
  );
}

const getEstadoStyle = (estado) => {
  const colors = {
    activo: { color: "#86efac", fontWeight: "bold" },
    inactivo: { color: "#f87171", fontWeight: "bold" },
    mantenimiento: { color: "#fbbf24", fontWeight: "bold" }
  };
  return colors[estado] || { color: "#94a3b8" };
};

const styles = {
  container: {
    padding: "30px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif"
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
    fontWeight: "600",
    fontSize: "14px"
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
    fontSize: "14px",
    cursor: "pointer"
  },
  contador: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500"
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
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
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
    cursor: "pointer",
    padding: "0"
  },
  formulario: {
    padding: "20px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "15px"
  },
  formGroup: {
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
    background: "#38bdf8",
    color: "#0f172a",
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
  detallesContenido: {
    padding: "20px"
  },
  detalleRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "12px",
    borderBottom: "1px solid #334155",
    marginBottom: "12px"
  },
  detalleLabel: {
    fontWeight: "600",
    color: "#cbd5e1"
  },
  detalleValor: {
    color: "#e2e8f0"
  },
  detallesAcciones: {
    display: "flex",
    gap: "10px",
    padding: "20px",
    borderTop: "1px solid #334155",
    justifyContent: "flex-end"
  },
  btnEditar: {
    background: "#38bdf8",
    color: "#0f172a",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  btnEliminar: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  btnCerrarDetalles: {
    background: "#475569",
    color: "#e2e8f0",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  tablaContainer: {
    background: "#1e293b",
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "auto"
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  },
  tableHeader: {
    background: "#334155",
    color: "#e2e8f0",
    textAlign: "left"
  },
  tableRow: {
    borderBottom: "1px solid #334155",
    ":hover": { background: "#0f172a" }
  },
  tableCellCode: {
    fontWeight: "600",
    color: "#38bdf8"
  },
  acciones: {
    display: "flex",
    gap: "8px"
  },
  btnVer: {
    background: "#475569",
    border: "none",
    color: "#e2e8f0",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px"
  },
  btnAccion: {
    background: "#38bdf8",
    border: "none",
    color: "#0f172a",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600"
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
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "30px"
  }
};

export default Activos;
