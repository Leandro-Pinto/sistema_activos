import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { logout, usuario } = useAuth();

  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    tipo: "",
    marca: "",
    modelo: "",
    estado: "activo",
    ubicacion: "",
    responsable: ""
  });

  const [editId, setEditId] = useState(null);

  // 🔐 CARGAR ACTIVOS (PROTEGIDO)
  const cargarActivos = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No hay token, no se llama API");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api("/activos");
      setActivos(data);
    } catch (error) {
      toast.error("Error al cargar activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  // INPUTS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // CREAR / EDITAR
  const guardarActivo = async () => {
    const { codigo, tipo, marca, modelo } = form;

    if (!codigo || !tipo || !marca || !modelo) {
      toast.warning("Completa los campos obligatorios");
      return;
    }

    try {
      if (editId) {
        await api(`/activos/${editId}`, "PUT", form);
        toast.success("Activo actualizado ✏️");
      } else {
        await api("/activos", "POST", form);
        toast.success("Activo creado ✅");
      }

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
      cargarActivos();

    } catch (error) {
      toast.error(error.message);
    }
  };

  // ELIMINAR
  const eliminarActivo = async (id) => {
    if (!window.confirm("¿Eliminar activo?")) return;

    try {
      await api(`/activos/${id}`, "DELETE");
      toast.success("Activo eliminado 🗑️");
      cargarActivos();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // EDITAR
  const editarActivo = (a) => {
    setForm({
      codigo: a.codigo || "",
      tipo: a.tipo || "",
      marca: a.marca || "",
      modelo: a.modelo || "",
      estado: a.estado || "activo",
      ubicacion: a.ubicacion || "",
      responsable: a.responsable || ""
    });

    setEditId(a.id);
  };

  // BUSCADOR SEGURO
  const filtrados = activos.filter(a =>
    a.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.tipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.modelo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 🔐 VALIDAR USUARIO
  if (!usuario) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>💻 Sistema de Activos</h2>

        <div>
          <span>{usuario?.rol}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </div>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar activo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: "10px", padding: "8px", width: "300px" }}
      />

      {/* FORMULARIO */}
      <div style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <h3>{editId ? "✏️ Editar Activo" : "➕ Registrar Activo"}</h3>

        <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} />
        <input name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} />
        <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} />
        <input name="modelo" placeholder="Modelo" value={form.modelo} onChange={handleChange} />
        <input name="estado" placeholder="Estado" value={form.estado} onChange={handleChange} />
        <input name="ubicacion" placeholder="Ubicación" value={form.ubicacion} onChange={handleChange} />
        <input name="responsable" placeholder="Responsable" value={form.responsable} onChange={handleChange} />

        <button onClick={guardarActivo}>
          {editId ? "Actualizar" : "Crear"}
        </button>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
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
            {filtrados.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.codigo}</td>
                <td>{a.tipo}</td>
                <td>{a.marca}</td>
                <td>{a.modelo}</td>
                <td>{a.estado}</td>
                <td>{a.ubicacion}</td>
                <td>{a.responsable}</td>
                <td>
                  <button onClick={() => editarActivo(a)}>✏️</button>
                  <button onClick={() => eliminarActivo(a.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
