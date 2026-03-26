const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();
const { buscarContextoRAG, iniciarSchedulerRAG, obtenerEstadisticasRAG, iniciarScrapingGlobal } = require('./rag-manager');
const { sincronizarHorarios } = require('./scripts/sync_horarios');

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_KEY = process.env.GROQ_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Bloqueo de consultas fuera de dominio (ej: aritmética básica)
function esConsultaMatematica(texto) {
  const t = (texto || '').toLowerCase().trim();

  // Ej: "cuanto es 2+1", "cuanto es 3 mas1"
  if (/\bcuanto\s+es\b/.test(t) && /\d/.test(t)) return true;
  if (/\b(suma|sumar|resta|restar|multiplic|multiplica|divide|dividir)\b/.test(t) && /\d/.test(t)) return true;
  if (/(?:\d+\s*(?:mas|más|menos)\s*\d+)|(?:\d+\s*\+\s*\d+)|(?:\d+\s*-\s*\d+)|(?:\d+\s*\*\s*\d+)|(?:\d+\s*\/\s*\d+)/.test(t)) return true;

  return false;
}

// ═══════════════════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════════════════
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configurar almacenamiento de PDFs
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos PDF'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ═══════════════════════════════════════════════════════
//  BASE DE DATOS - SQLite
// ═══════════════════════════════════════════════════════
const dbPath = path.join(__dirname, '../data/exabot.db');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir BD:', err);
  } else {
    console.log('✓ BD SQLite conectada');
    initDB();
  }
});

function initDB() {
  // Tabla de documentos (base de conocimiento)
  db.run(`
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      contenido TEXT NOT NULL,
      tipo TEXT,
      fecha_carga DATETIME DEFAULT CURRENT_TIMESTAMP,
      fuente_url TEXT
    )
  `);

  // Tabla de conversaciones
  db.run(`
    CREATE TABLE IF NOT EXISTS conversaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT,
      fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_fin DATETIME,
      total_mensajes INTEGER DEFAULT 0
    )
  `);

  // Tabla de mensajes
  db.run(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversacion_id INTEGER,
      rol TEXT,
      contenido TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      feedback TEXT,
      fuente_url TEXT,
      FOREIGN KEY(conversacion_id) REFERENCES conversaciones(id)
    )
  `);

  // Tabla de preferencias del usuario
  db.run(`
    CREATE TABLE IF NOT EXISTS preferencias_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT UNIQUE,
      nombre TEXT,
      carrera TEXT,
      tema_interes TEXT,
      modo_oscuro INTEGER DEFAULT 0,
      idioma TEXT DEFAULT 'es',
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de fuentes (para criterio 6 - Fuentes de información)
  db.run(`
    CREATE TABLE IF NOT EXISTS fuentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      url TEXT UNIQUE,
      categoria TEXT,
      fecha_agregada DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Si la base de datos está vacía, sembramos un documento inicial básico
  // para que el bot pueda responder sobre oferta académica sin necesidad
  // de cargar manualmente documentos.
  db.get('SELECT COUNT(*) AS count FROM documentos', [], (err, row) => {
    if (err) {
      console.error('Error contando documentos:', err);
      return;
    }
    if (row.count === 0) {
      const textoInicial = `Oferta académica FCEyT - UNSE\n\n` +
        `Ingenierías:\n` +
        `- Ingeniería Civil\n` +
        `- Ingeniería Electromecánica\n` +
        `- Ingeniería Electrónica\n` +
        `- Ingeniería Eléctrica\n` +
        `- Ingeniería en Agrimensura\n` +
        `- Ingeniería Hidráulica\n` +
        `- Ingeniería Industrial\n` +
        `- Ingeniería Vial\n\n` +
        `Licenciaturas:\n` +
        `- Lic. en Sistemas de Información\n` +
        `- Lic. en Matemática\n` +
        `- Lic. en Hidrología Subterránea\n\n` +
        `Profesorados:\n` +
        `- Profesorado en Física\n\n` +
        `Esta información es un resumen y puede variar; verificá los detalles en el sitio oficial de la Facultad.\n`;

      db.run(
        `INSERT INTO documentos (nombre, contenido, tipo, fuente_url) VALUES (?, ?, ?, ?)`,
        [
          'Oferta Académica - resumen inicial',
          textoInicial,
          'inicial',
          'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT'
        ],
        function(err) {
          if (err) {
            console.error('Error insertando documento inicial:', err);
          } else {
            console.log('Documento inicial de oferta académica creado (ID:', this.lastID, ')');
          }
        }
      );
    }
  });
}

// Función para detectar el tema actual basado en el historial de conversación
function detectarTemaConversacion(historialMensajes) {
  // Buscar en los últimos 3 mensajes del usuario palabras clave
  const ultimosMensajes = historialMensajes
    .filter(m => m.rol === 'user')
    .slice(-3)
    .map(m => m.contenido.toLowerCase());
  
  const textoCompleto = ultimosMensajes.join(' ');
  
  // Mapeo de palabras clave a temas
  const temas = {
    carreras: ['ingeniería', 'civil', 'electromecánica', 'electrónica', 'eléctrica', 'agrimensura', 'hidráulica', 'industrial', 'vial', 'licenciatura', 'sistemas', 'matemática', 'hidrología', 'profesorado', 'física', 'carrera', 'estudio'],
    horarios: ['horario', 'clase', 'cursada', 'turno', 'materia', 'comisión'],
    tramites: ['trámite', 'inscripción', 'inscribirme', 'documentación', 'papeles', 'certificado', 'final', 'mesa', 'examen'],
    vida: ['beca', 'comedor', 'biblioteca', 'deporte', 'actividad', 'estudiante']
  };
  
  for (const [tema, palabras] of Object.entries(temas)) {
    if (palabras.some(palabra => textoCompleto.includes(palabra))) {
      return tema;
    }
  }
  
  return 'general';
}

// ═══════════════════════════════════════════════════════
//  RUTAS - BASE DE DATOS
// ═══════════════════════════════════════════════════════

// Obtener base de conocimiento completa
app.get('/api/documentos', (req, res) => {
  db.all('SELECT * FROM documentos ORDER BY fecha_carga DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Agregar documento
app.post('/api/documentos', (req, res) => {
  const { nombre, contenido, tipo, fuente_url } = req.body;
  
  db.run(
    `INSERT INTO documentos (nombre, contenido, tipo, fuente_url) 
     VALUES (?, ?, ?, ?)`,
    [nombre, contenido, tipo, fuente_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'Documento guardado' });
    }
  );
});

// Actualizar documento
app.put('/api/documentos/:id', (req, res) => {
  const { contenido, fuente_url } = req.body;
  
  db.run(
    `UPDATE documentos SET contenido = ?, fuente_url = ? WHERE id = ?`,
    [contenido, fuente_url, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Documento actualizado' });
    }
  );
});

// Eliminar documento
app.delete('/api/documentos/:id', (req, res) => {
  db.run(`DELETE FROM documentos WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Documento eliminado' });
  });
});

// ═══════════════════════════════════════════════════════
//  RUTAS - SUBIDA DE PDFS
// ═══════════════════════════════════════════════════════

app.post('/api/pdf/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió archivo' });
  }

  try {
    // Para procesar PDFs necesitarías instalar pdfparse
    // Por ahora, guardamos la referencia del archivo
    const nombreDoc = req.body.nombre || req.file.originalname;
    const rutaArchivo = path.join(uploadDir, req.file.filename);
    
    // Guardar en BD
    db.run(
      `INSERT INTO documentos (nombre, contenido, tipo, fuente_url) 
       VALUES (?, ?, ?, ?)`,
      [nombreDoc, `[Archivo PDF: ${req.file.originalname}]`, 'pdf', rutaArchivo],
      function(err) {
        if (err) {
          fs.unlinkSync(rutaArchivo);
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          id: this.lastID, 
          mensaje: 'PDF subido correctamente',
          nombre: nombreDoc,
          tamano: req.file.size
        });
      }
    );
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════
//  RUTAS - CONVERSACIONES
// ═══════════════════════════════════════════════════════

app.post('/api/conversaciones/nueva', (req, res) => {
  const { usuario_id } = req.body;
  
  db.run(
    `INSERT INTO conversaciones (usuario_id) VALUES (?)`,
    [usuario_id || 'anonimo_' + Date.now()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ conversacion_id: this.lastID });
    }
  );
});

app.post('/api/mensajes', (req, res) => {
  const { conversacion_id, rol, contenido, fuente_url } = req.body;
  
  db.run(
    `INSERT INTO mensajes (conversacion_id, rol, contenido, fuente_url) 
     VALUES (?, ?, ?, ?)`,
    [conversacion_id, rol, contenido, fuente_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/conversaciones/:id', (req, res) => {
  db.all(
    `SELECT * FROM mensajes WHERE conversacion_id = ? ORDER BY timestamp ASC`,
    [req.params.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ═══════════════════════════════════════════════════════
//  RUTAS - PREFERENCIAS USUARIO (Criterio 1)
// ═══════════════════════════════════════════════════════

app.post('/api/usuario/preferencias', (req, res) => {
  const { usuario_id, nombre, carrera, tema_interes, modo_oscuro, idioma } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO preferencias_usuario 
     (usuario_id, nombre, carrera, tema_interes, modo_oscuro, idioma) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, nombre, carrera, tema_interes, modo_oscuro || 0, idioma || 'es'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Preferencias guardadas' });
    }
  );
});

app.get('/api/usuario/preferencias/:usuario_id', (req, res) => {
  db.get(
    `SELECT * FROM preferencias_usuario WHERE usuario_id = ?`,
    [req.params.usuario_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || {});
    }
  );
});

// ═══════════════════════════════════════════════════════
//  RUTAS - CHAT (integración con Groq)
// ═══════════════════════════════════════════════════════

app.post('/api/chat', async (req, res) => {
  const { mensajes, sistema } = req.body;

  try {
    // Verificación extra antes de llamar al LLM
    const ultimoUser = Array.isArray(mensajes)
      ? mensajes.filter(m => m.role === 'user').slice(-1)[0]?.content
      : '';

    if (esConsultaMatematica(ultimoUser)) {
      const respuesta = [
        'No tengo esa información en este chat.',
        '',
        'Solo puedo responder preguntas sobre ingreso, carreras, trámites y fechas de la FCEyT (UNSE). ¿Qué querés resolver: ingreso, materias o calendario?',
        '',
        'SUGERENCIAS:',
        '• ¿Cómo me inscribo?',
        '• ¿Qué materias tiene 1er año?',
        '• ¿Cuándo empieza el ingreso?'
      ].join('\n');

      res.json({ respuesta });
      return;
    }

    const response = await axios.post(GROQ_URL, {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: sistema },
        ...mensajes
      ],
      temperature: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_KEY.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    const contenido = response.data.choices[0].message.content;
    res.json({ respuesta: contenido });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {};
    console.error('Error Groq:', data || error.message);

    if (status === 429) {
      return res.status(429).json({
        error: 'El servicio de IA esta recibiendo demasiadas solicitudes en este momento. Espera unos segundos y proba de nuevo.'
      });
    }

    if (status === 401) {
      return res.status(401).json({
        error: 'La clave del servicio de IA no es valida o ya no esta disponible.'
      });
    }

    res.status(status).json({ error: data?.error?.message || error.message });
  }
});

// ═══════════════════════════════════════════════════════
//  RUTAS - FUENTES (Criterio 6)
// ═══════════════════════════════════════════════════════

app.get('/api/fuentes', (req, res) => {
  db.all('SELECT * FROM fuentes ORDER BY fecha_agregada DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/fuentes', (req, res) => {
  const { titulo, url, categoria } = req.body;
  
  db.run(
    `INSERT INTO fuentes (titulo, url, categoria) VALUES (?, ?, ?)`,
    [titulo, url, categoria],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// ═══════════════════════════════════════════════════════
//  RAG - RETRIEVAL AUGMENTED GENERATION
// ═══════════════════════════════════════════════════════

/**
 * Búsqueda RAG: Obtener contexto de BD + Web + Drive
 * POST /api/rag/search
 * Body: { query: string }
 */
app.post('/api/rag/search', async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'query requerido' });
  }
  
  try {
    const contexto = await buscarContextoRAG(query);
    res.json(contexto);
  } catch (error) {
    console.error('[RAG] Error en búsqueda:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Iniciar scraping manual de sitios web
 * POST /api/rag/scrape
 */
app.post('/api/rag/scrape', async (req, res) => {
  try {
    res.json({ 
      mensaje: 'Scraping iniciado',
      nota: 'Verifica la consola del backend para el progreso'
    });
    
    // Ejecutar en background
    iniciarScrapingGlobal().catch(err => 
      console.error('[RAG] Error en scraping background:', err)
    );
    
  } catch (error) {
    console.error('[RAG] Error iniciando scraping:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener estadísticas del sistema RAG
 * GET /api/rag/estadisticas
 */
app.get('/api/rag/estadisticas', async (req, res) => {
  try {
    const stats = await obtenerEstadisticasRAG();
    res.json(stats);
  } catch (error) {
    console.error('[RAG] Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ═══════════════════════════════════════════════════════
//  INICIO DEL SERVIDOR
// ═══════════════════════════════════════════════════════

// Scheduler RAG periódico
const RAG_INTERVAL_HRS = Number(process.env.RAG_SCRAPER_INTERVAL_HRS || 24);
if (!isNaN(RAG_INTERVAL_HRS) && RAG_INTERVAL_HRS > 0) {
  iniciarSchedulerRAG(RAG_INTERVAL_HRS);
}

// Sync de horarios automático desde Google Sheets
const HORARIOS_INTERVAL_HRS = Number(process.env.HORARIOS_SYNC_HRS || 12);
console.log(`[HORARIOS] Scheduler: sync cada ${HORARIOS_INTERVAL_HRS}h`);
sincronizarHorarios(); // correr al iniciar
setInterval(() => {
  console.log('[HORARIOS] Sync automático...');
  sincronizarHorarios();
}, HORARIOS_INTERVAL_HRS * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  🤖 Exabot Backend en puerto ${PORT}     ║`);
  console.log(`║  📊 BD: ${dbPath}        ║`);
  console.log(`║  🕒 Scheduler RAG: cada ${RAG_INTERVAL_HRS}h     ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = app;
