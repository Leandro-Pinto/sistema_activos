import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const colors = ["#38bdf8", "#06b6d4", "#0891b2", "#0e7490", "#155e75"];

const ChartActivosPorEstado = ({ data }) => {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8" }}>Sin datos</p>;

  return (
    <div style={styles.container}>
      <h4 style={styles.titulo}>Activos por Estado</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="estado" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Bar dataKey="cantidad" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChartActivosPorTipo = ({ data }) => {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8" }}>Sin datos</p>;

  return (
    <div style={styles.container}>
      <h4 style={styles.titulo}>Activos por Tipo</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, cantidad }) => `${name}: ${cantidad}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cantidad"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChartIncidenciasPorPrioridad = ({ data }) => {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8" }}>Sin datos</p>;

  return (
    <div style={styles.container}>
      <h4 style={styles.titulo}>Incidencias por Prioridad</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="prioridad" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Bar dataKey="cantidad" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ChartMarcasPorActivos = ({ data }) => {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8" }}>Sin datos</p>;

  return (
    <div style={styles.container}>
      <h4 style={styles.titulo}>Top Marcas por Cantidad</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="marca" type="category" stroke="#94a3b8" width={195} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Bar dataKey="cantidad" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles = {
  container: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #334155",
    marginBottom: "20px"
  },
  titulo: {
    color: "#e2e8f0",
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "600"
  }
};

export { ChartActivosPorEstado, ChartActivosPorTipo, ChartIncidenciasPorPrioridad, ChartMarcasPorActivos };
