const StatsCard = ({ titulo, valor, icono, color }) => {
  return (
    <div style={styles.card(color)}>
      <div style={styles.icono}>{icono}</div>
      <div style={styles.contenido}>
        <p style={styles.titulo}>{titulo}</p>
        <h3 style={styles.valor}>{valor}</h3>
      </div>
    </div>
  );
};

const styles = {
  card: (color) => ({
    background: color || "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: `2px solid ${color === "#1e293b" ? "#475569" : color}`,
    minWidth: "200px"
  }),
  icono: {
    fontSize: "32px",
    minWidth: "40px"
  },
  contenido: {
    flex: 1
  },
  titulo: {
    color: "#94a3b8",
    margin: "0",
    fontSize: "14px",
    fontWeight: "500"
  },
  valor: {
    color: "#f1f5f9",
    margin: "5px 0 0 0",
    fontSize: "24px",
    fontWeight: "bold"
  }
};

export default StatsCard;
