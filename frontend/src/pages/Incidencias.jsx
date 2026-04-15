import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Incidencias() {
  const { usuario } = useAuth();
  const [incidencias, setIncidencias] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    activo_id: "",
    descripcion: "",
    prioridad: "media"
  });

  // CARGAR DATA
  const cargar = async () => {
    try {
      setLoading(true);

      const dataInc = await api("/incidencias");
      const dataAct = await api("/activos");

      setIncidencias(dataInc);
      setActivos(dataAct);

    } catch (error) {
      toast.error("Error al cargar incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario) return; // Esperar a que usuario esté cargado
    cargar();
  }, [usuario]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  //CREAR INCIDENCIA
  const crear = async () => {
    const { activo_id, descripcion, prioridad } = form;

    if (!activo_id || !descripcion) {
      toast.warning("Completa los campos");
      return;
    }

    try {
      await api("/incidencias", "POST", form);
      toast.success("Incidencia registrada 🚨");

      setForm({
        activo_id: "",
        descripcion: "",
        prioridad: "media"
      });

      cargar();

    } catch (error) {
      toast.error("Error al registrar");
    }
  };

  //CAMBIAR ESTADO
  const cambiarEstado = async (id, estado) => {
    try {
      await api(`/incidencias/${id}`, "PUT", {
        estado,
        tecnico: "Técnico 1"
      });

      toast.success("Estado actualizado");
      cargar();

    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚨 Incidencias</h2>

      {/* FORM */}
      <div style={{ marginBottom: "20px" }}>
        <select name="activo_id" value={form.activo_id} onChange={handleChange}>
          <option value="">Seleccionar activo</option>
          {activos.map(a => (
            <option key={a.id} value={a.id}>
              {a.codigo}
            </option>
          ))}
        </select>

        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />

        <select name="prioridad" value={form.prioridad} onChange={handleChange}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>

        <button onClick={crear}>Registrar</button>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Activo</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Técnico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map(i => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.codigo}</td>
                <td>{i.descripcion}</td>
                <td>{i.estado}</td>
                <td>{i.prioridad}</td>
                <td>{i.tecnico || "-"}</td>
                <td>
                  <button onClick={() => cambiarEstado(i.id, "proceso")}>▶️</button>
                  <button onClick={() => cambiarEstado(i.id, "resuelto")}>✅</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Incidencias;
