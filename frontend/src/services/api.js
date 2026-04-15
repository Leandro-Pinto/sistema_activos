const API_URL = "http://localhost:3000";

const api = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : ""
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();

  // Manejar errores de autenticación
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    // Redirigir al login sin mostrar advertencia en consola
    window.location.href = "/";
    return;
  }

  if (!res.ok) {
    // No mostrar advertencia en consola para errores normales
    throw new Error(data.error || "Error");
  }

  return data;
};

export default api;
