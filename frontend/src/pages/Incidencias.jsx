import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Incidencias() {
  const { usuario } = useAuth();
  const [incidencias, setIncidencias] = useState([]);
  const [activos, setActivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);

  // Formulario crear
  const [form, setForm] = useState({
    activo_id: "",
    descripcion: "",
    prioridad: "media"
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    estado: "",
    prioridad: "",
    tecnico: "",
    buscar: ""
  });

  // CARGAR DATA
  const cargar = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filtros.estado) params.append("estado", filtros.estado);
      if (filtros.prioridad) params.append("prioridad", filtros.prioridad);
      if (filtros.tecnico) params.append("tecnico", filtros.tecnico);
      if (filtros.buscar) params.append("buscar", filtros.buscar);

      const dataInc = await api(`/incidencias?${params.toString()}`);
      const dataAct = await api("/activos");
      const dataUsr = await api("/usuarios");

      setIncidencias(dataInc);
      setActivos(dataAct);
      setUsuarios(dataUsr);

    } catch (error) {
      toast.error("Error al cargar incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;
    cargar();
  }, [usuario, filtros]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // HANDLE FILTROS
  const handleFiltro = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  // CREAR INCIDENCIA
  const crear = async () => {
    const { activo_id, descripcion, prioridad } = form;

    if (!activo_id || !descripcion.trim()) {
      toast.warning("Completa los campos requeridos");
      return;
    }

    try {
      await api("/incidencias", "POST", form);
      toast.success("Incidencia registrada correctamente");

      setForm({
        activo_id: "",
        descripcion: "",
        prioridad: "media"
      });

      cargar();

    } catch (error) {
      toast.error("Error al registrar incidencia");
    }
  };

  // ACTUALIZAR
  const actualizar = async () => {
    try {
      await api(`/incidencias/${editando.id}`, "PUT", {
        estado: editando.estado,
        tecnico: editando.tecnico,
        notas: editando.notas
      });

      toast.success("Incidencia actualizada");
      setEditando(null);
      cargar();

    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  // CAMBIAR ESTADO RÁPIDO
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api(`/incidencias/${id}`, "PUT", {
        estado: nuevoEstado
      });

      toast.success(`Estado cambiado a ${nuevoEstado}`);
      cargar();

    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  // ASIGNAR TÉCNICO
  const asignarTecnico = async (id, tecnicoId) => {
    if (!tecnicoId) {
      toast.warning("Selecciona un técnico");
      return;
    }

    try {
      await api(`/incidencias/${id}/asignar`, "PUT", {
        tecnico_id: tecnicoId
      });

      toast.success("Técnico asignado");
      cargar();

    } catch (error) {
      toast.error("Error al asignar técnico");
    }
  };

  // ELIMINAR
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta incidencia?")) return;

    try {
      await api(`/incidencias/${id}`, "DELETE");
      toast.success("Incidencia eliminada");
      cargar();

    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // OBTENER NOMBRE ACTIVO
  const getNombreActivo = (id) => {
    const activo = activos.find(a => a.id === id);
    return activo ? `${activo.codigo} - ${activo.nombre}` : "N/A";
  };

  // OBTENER NOMBRE USUARIO
  const getNombreUsuario = (id) => {
    const usr = usuarios.find(u => u.id === id);
    return usr ? usr.nombre : "N/A";
  };

  const estadoVerde = { pendiente: "#ffb366", en_proceso: "#66b3ff", resuelto: "#90ee90", rechazado: "#ff6666" };
  const prioridadColor = { baja: "#90ee90", media: "#ffeb3b", alta: "#ff6666" };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Incidencias</h2>

      {/* FORM CREAR */}
      <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Registrar Incidencia</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <select name="activo_id" value={form.activo_id} onChange={handleChange} required>
            <option value="">Seleccionar activo</option>
            {activos.map(a => (
              <option key={a.id} value={a.id}>
                {a.codigo} - {a.nombre}
              </option>
            ))}
          </select>

          <textarea
            name="descripcion"
            placeholder="Describir el problema..."
            value={form.descripcion}
            onChange={handleChange}
            rows="2"
            style={{ padding: "8px", fontFamily: "Arial" }}
          />

          <select name="prioridad" value={form.prioridad} onChange={handleChange}>
            <option value="baja">Prioridad Baja</option>
            <option value="media">Prioridad Media</option>
            <option value="alta">Prioridad Alta</option>
          </select>

          <button onClick={crear} style={{ padding: "8px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Registrar
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div style={{ backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
        <input
          type="text"
          name="buscar"
          placeholder="Buscar por descripción o código..."
          value={filtros.buscar}
          onChange={handleFiltro}
          style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
        />
        <select name="estado" value={filtros.estado} onChange={handleFiltro} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="resuelto">Resuelto</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <select name="prioridad" value={filtros.prioridad} onChange={handleFiltro} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        <select name="tecnico" value={filtros.tecnico} onChange={handleFiltro} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}>
          <option value="">Todos los técnicos</option>
          <option value="">Sin asignar</option>
          {usuarios.filter(u => u.rol === "tecnico").map(u => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : incidencias.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>No hay incidencias</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>ID</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Activo</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Descripción</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Estado</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Prioridad</th>
              <th style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Técnico</th>
              <th style={{ padding: "10px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map(i => (
              <tr key={i.id} style={{ borderBottom: "1px solid #eee", backgroundColor: i.prioridad === "alta" ? "#ffe6e6" : "white" }}>
                <td style={{ padding: "10px" }}>{i.id}</td>
                <td style={{ padding: "10px" }}>{i.codigo}</td>
                <td style={{ padding: "10px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{i.descripcion}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ backgroundColor: estadoVerde[i.estado], padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                    {i.estado}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  <span style={{ backgroundColor: prioridadColor[i.prioridad], padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                    {i.prioridad}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>{i.tecnico || "Sin asignar"}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <button onClick={() => setEditando(i)} style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                    Editar
                  </button>
                  {usuario?.rol === "admin" && (
                    <button onClick={() => eliminar(i.id)} style={{ padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL EDITAR */}
      {editando && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", maxWidth: "500px", width: "90%" }}>
            <h3>Editar Incidencia #{editando.id}</h3>
            <p><strong>Activo:</strong> {getNombreActivo(editando.activo_id)}</p>
            <p><strong>Descripción:</strong> {editando.descripcion}</p>

            <div style={{ marginBottom: "15px" }}>
              <label>Estado:</label>
              <select value={editando.estado} onChange={(e) => setEditando({ ...editando, estado: e.target.value })} style={{ width: "100%", padding: "8px", marginTop: "5px" }}>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Asignar Técnico:</label>
              <select value={editando.tecnico || ""} onChange={(e) => setEditando({ ...editando, tecnico: e.target.value })} style={{ width: "100%", padding: "8px", marginTop: "5px" }}>
                <option value="">Sin asignar</option>
                {usuarios.filter(u => u.rol === "tecnico").map(u => (
                  <option key={u.id} value={u.nombre}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Notas:</label>
              <textarea value={editando.notas || ""} onChange={(e) => setEditando({ ...editando, notas: e.target.value })} style={{ width: "100%", padding: "8px", marginTop: "5px", fontFamily: "Arial", minHeight: "80px" }} placeholder="Agregar notas..." />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditando(null)} style={{ padding: "8px 15px", backgroundColor: "#999", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={actualizar} style={{ padding: "8px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Incidencias;
