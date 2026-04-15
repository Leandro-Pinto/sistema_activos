import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatsCard from "../components/StatsCard";
import { ChartActivosPorEstado, ChartActivosPorTipo, ChartIncidenciasPorPrioridad, ChartMarcasPorActivos } from "../components/Charts";

function Dashboard() {
  const { usuario } = useAuth();

  const [estadisticas, setEstadisticas] = useState(null);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // CARGAR ESTADÍSTICAS
  useEffect(() => {
    if (!usuario) return; // Esperar a que usuario esté cargado

    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api("/dashboard");
        
        // Validar estructura de datos
        if (data && data.resumen && data.graficas) {
          setEstadisticas(data);
        } else {
          setError("Datos incompletos del servidor");
        }
      } catch (error) {
        setError(error.message || "Error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [usuario]);

  // CARGAR ACTIVOS
  useEffect(() => {
    if (!usuario) return; // Esperar a que usuario esté cargado

    const cargarActivos = async () => {
      try {
        const data = await api("/activos");
        setActivos(Array.isArray(data) ? data : []);
      } catch (error) {
        setActivos([]);
      }
    };

    cargarActivos();
  }, [usuario]);

  if (!usuario) {
    return <p style={{ color: "#e2e8f0" }}>Cargando usuario...</p>;
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>📊 Dashboard Avanzado</h1>
          <p style={styles.subtitulo}>Bienvenido, {usuario?.nombre || usuario?.email}</p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {loading && (
        <p style={{ color: "#94a3b8" }}>⏳ Cargando estadísticas...</p>
      )}

      {error && (
        <div style={styles.errorBox}>
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && estadisticas && (
        <>
          {/* TARJETAS DE RESUMEN */}
          <div style={styles.cardsGrid}>
            <StatsCard
              titulo="Total de Activos"
              valor={estadisticas?.resumen?.totalActivos || 0}
              icono="💻"
              color="#0891b2"
            />
            <StatsCard
              titulo="Incidencias"
              valor={estadisticas?.resumen?.totalIncidencias || 0}
              icono="⚠️"
              color="#f97316"
            />
            <StatsCard
              titulo="Mantenimientos"
              valor={estadisticas?.resumen?.totalMantenimientos || 0}
              icono="🔧"
              color="#10b981"
            />
            <StatsCard
              titulo="Esta Semana"
              valor={estadisticas?.resumen?.mantenimientosEstaSemana || 0}
              icono="📅"
              color="#8b5cf6"
            />
          </div>

          {/* GRÁFICAS */}
          <div style={styles.chartsContainer}>
            <div style={styles.chartRow}>
              <div style={styles.chartCol}>
                <ChartActivosPorEstado data={estadisticas?.graficas?.activosPorEstado || []} />
              </div>
              <div style={styles.chartCol}>
                <ChartActivosPorTipo data={estadisticas?.graficas?.activosPorTipo || []} />
              </div>
            </div>

            <div style={styles.chartRow}>
              <div style={styles.chartCol}>
                <ChartIncidenciasPorPrioridad data={estadisticas?.graficas?.incidenciasPorPrioridad || []} />
              </div>
              <div style={styles.chartCol}>
                <ChartMarcasPorActivos data={estadisticas?.graficas?.activosPorMarca || []} />
              </div>
            </div>
          </div>

          {/* ÚLTIMAS INCIDENCIAS */}
          <div style={styles.cardList}>
            <h3 style={styles.cardTitle}>🚨 Últimas Incidencias</h3>
            {estadisticas?.recientes?.ultimasIncidencias && estadisticas.recientes.ultimasIncidencias.length > 0 ? (
              <table style={styles.tablaIncidencias}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>Código Activo</th>
                    <th>Descripción</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.recientes.ultimasIncidencias.map(inc => (
                    <tr key={inc.id} style={styles.tableRow}>
                      <td style={styles.tableCellCode}>{inc.codigo}</td>
                      <td style={styles.tableCellDesc}>{inc.descripcion?.substring(0, 50) || "N/A"}...</td>
                      <td style={getPrioridadStyle(inc.prioridad)}>{inc.prioridad}</td>
                      <td style={getEstadoStyle(inc.estado)}>{inc.estado}</td>
                      <td>{inc.created_at ? new Date(inc.created_at).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#94a3b8" }}>No hay incidencias</p>
            )}
          </div>

          {/* BOTÓN PARA VER TABLA DE ACTIVOS */}
          <button onClick={() => setMostrarTabla(!mostrarTabla)} style={styles.btnTabla}>
            {mostrarTabla ? "Ocultar" : "Ver"} Lista Completa de Activos
          </button>

          {mostrarTabla && (
            <div style={styles.cardList}>
              <h3 style={styles.cardTitle}>📋 Todos los Activos ({activos.length})</h3>
              {activos.length > 0 ? (
                <table style={styles.tablaActivos}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Código</th>
                      <th>Tipo</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Estado</th>
                      <th>Ubicación</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map(a => (
                      <tr key={a.id} style={styles.tableRow}>
                        <td style={styles.tableCellCode}>{a.codigo}</td>
                        <td>{a.tipo}</td>
                        <td>{a.marca}</td>
                        <td>{a.modelo}</td>
                        <td style={getEstadoStyle(a.estado)}>{a.estado}</td>
                        <td>{a.ubicacion}</td>
                        <td>{a.responsable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#94a3b8" }}>No hay activos</p>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !error && !estadisticas && (
        <div style={styles.errorBox}>
          <p>⚠️ No se pudieron cargar las estadísticas. Intenta recargar la página.</p>
        </div>
      )}
    </div>
  );
}

// Funciones utilitarias para estilos
const getPrioridadStyle = (prioridad) => {
  const colors = {
    alta: { color: "#f87171", fontWeight: "bold" },
    media: { color: "#fbbf24", fontWeight: "bold" },
    baja: { color: "#86efac", fontWeight: "bold" }
  };
  return colors[prioridad] || { color: "#94a3b8" };
};

const getEstadoStyle = (estado) => {
  const colors = {
    activo: { color: "#86efac" },
    inactivo: { color: "#f87171" },
    mantenimiento: { color: "#fbbf24" },
    pendiente: { color: "#f97316" },
    resuelto: { color: "#10b981" }
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
  subtitulo: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "5px 0 0 0"
  },
  errorBox: {
    background: "#7f1d1d",
    border: "2px solid #dc2626",
    color: "#fca5a5",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px"
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px"
  },
  chartsContainer: {
    marginBottom: "30px"
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  },
  chartCol: {
    minWidth: "400px"
  },
  cardList: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
    marginBottom: "20px",
    marginTop: "20px"
  },
  cardTitle: {
    color: "#e2e8f0",
    margin: "0 0 15px 0",
    fontSize: "18px",
    fontWeight: "600"
  },
  tablaIncidencias: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  },
  tablaActivos: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },
  tableHeader: {
    background: "#334155",
    color: "#e2e8f0"
  },
  tableRow: {
    borderBottom: "1px solid #334155",
    ":hover": { background: "#0f172a" }
  },
  tableCellCode: {
    fontWeight: "600",
    color: "#38bdf8"
  },
  tableCellDesc: {
    maxWidth: "300px",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  btnTabla: {
    background: "#38bdf8",
    color: "#0f172a",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "20px"
  }
};

export default Dashboard;
