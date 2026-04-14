-- Crear tabla USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla ACTIVOS
CREATE TABLE IF NOT EXISTS activos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'activo',
  ubicacion VARCHAR(200),
  responsable VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla INCIDENCIAS
CREATE TABLE IF NOT EXISTS incidencias (
  id SERIAL PRIMARY KEY,
  activo_id INTEGER NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  prioridad VARCHAR(50) DEFAULT 'media',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla MANTENIMIENTOS
CREATE TABLE IF NOT EXISTS mantenimientos (
  id SERIAL PRIMARY KEY,
  activo_id INTEGER NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
  tecnico_id INTEGER NOT NULL REFERENCES usuarios(id),
  tipo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario de prueba (admin)
-- La contraseña será "password123" encriptada con bcrypt (hash: $2b$10$HOlkpXt6LWm0MZVH7m6Kue4/Aqh.AGCXHJ.qwCqDJ08Gz.8u9bFEq)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Admin Usuario', 'admin@admin.com', '$2b$10$HOlkpXt6LWm0MZVH7m6Kue4/Aqh.AGCXHJ.qwCqDJ08Gz.8u9bFEq', 'admin')
ON CONFLICT DO NOTHING;

-- Insertar usuario de prueba (técnico)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Técnico Usuario', 'tecnico@tecnico.com', '$2b$10$HOlkpXt6LWm0MZVH7m6Kue4/Aqh.AGCXHJ.qwCqDJ08Gz.8u9bFEq', 'tecnico')
ON CONFLICT DO NOTHING;

-- Insertar algunos activos de prueba
INSERT INTO activos (codigo, tipo, marca, modelo, estado, ubicacion, responsable) 
VALUES ('ACT-001', 'Computadora', 'Dell', 'OptiPlex', 'activo', 'Oficina 1', 'Juan López')
ON CONFLICT DO NOTHING;

INSERT INTO activos (codigo, tipo, marca, modelo, estado, ubicacion, responsable) 
VALUES ('ACT-002', 'Impresora', 'HP', 'LaserJet', 'activo', 'Oficina 1', 'María García')
ON CONFLICT DO NOTHING;

INSERT INTO activos (codigo, tipo, marca, modelo, estado, ubicacion, responsable) 
VALUES ('ACT-003', 'Monitor', 'LG', '24 inch', 'mantenimiento', 'Almacén', 'Técnico')
ON CONFLICT DO NOTHING;
