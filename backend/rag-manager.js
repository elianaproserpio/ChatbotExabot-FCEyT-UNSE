/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  RAG Manager - Retrieval Augmented Generation             ║
 * ║  Gestiona: Web Scraping + Google Drive + Búsqueda RAG    ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════
//  CONFIGURACIÓN
// ═══════════════════════════════════════════════════════

const SITIOS_A_SCRAPEAR = [
  {
    nombre: 'Facultad de Ciencias Exactas y Tecnología - UNSE',
    url: 'https://www.fce.unse.edu.ar',
    selectors: {
      horarios: '.schedule, .timetable, [class*="horario"]',
      noticias: '.news, .post, [class*="noticia"]',
      documentos: 'a[href*=".pdf"]'
    }
  },
  {
    nombre: 'Contactos',
    url: 'https://fce.unse.edu.ar/?q=contacto',
    selectors: {
      normativas: 'a[href*="norma"], a[href*="resolucion"]',
      calendarios: 'a[href*="calendario"]'
    }
  },
  {
  nombre: 'Oferta Académica FCEyT',
  url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
  selectors: {
    // Busca los nombres de las carreras (suelen estar en negrita o enlaces)
    carreras: 'strong, b, a[href*="carrera"]', 
    // Captura los planes de estudio y resoluciones
    documentos: 'a[href*=".pdf"], a[href*="plan"]',
    // Captura las descripciones de los niveles (Grado, Pregrado)
   // secciones: 'h2, h3, .content' 
  }
},
];

const DB_PATH = path.join(__dirname, '../data/exabot.db');

// ═══════════════════════════════════════════════════════
//  1. WEB SCRAPING - Obtener contenido de la web
// ═══════════════════════════════════════════════════════

/**
 * Scrape de sitio web específico
 * @param {string} url - URL a scrapear
 * @param {object} selectors - Selectores CSS para extraer contenido
 * @returns {Promise<object>} Contenido extraído
 */
async function scrapearSitio(url, selectors) {
  try {
    console.log(`[RAG] Scrapeando: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const contenidoExtraido = {};
    
    // Extraer según selectors
    for (const [tipo, selector] of Object.entries(selectors)) {
      const elementos = [];
      $(selector).each((i, elem) => {
        const texto = $(elem).text().trim();
        const href = $(elem).attr('href');
        if (texto) {
          elementos.push({
            texto: texto.substring(0, 500), // Limitar a 500 chars
            url: href ? new URL(href, url).href : null
          });
        }
      });
      if (elementos.length > 0) {
        contenidoExtraido[tipo] = elementos;
      }
    }
    
    return {
      sitio: url,
      fecha: new Date().toISOString(),
      contenido: contenidoExtraido,
      exito: true
    };
    
  } catch (error) {
    console.error(`[RAG] Error scrapeando ${url}:`, error.message);
    return {
      sitio: url,
      error: error.message,
      exito: false
    };
  }
}

/**
 * Ejecutar scraping de todos los sitios configurados
 * @returns {Promise<array>} Array con resultados de cada sitio
 */
async function iniciarScrapingGlobal() {
  console.log('[RAG] Iniciando scraping global de sitios...');
  
  const resultados = [];
  for (const sitio of SITIOS_A_SCRAPEAR) {
    const resultado = await scrapearSitio(sitio.url, sitio.selectors);
    resultados.push(resultado);
    
    if (resultado.exito) {
      await guardarDocumentoWeb(sitio.nombre, resultado);
    }
    
    // Esperar 2 segundos entre requests para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return resultados;
}

/**
 * Guardar contenido scrapeado en la BD
 * @param {string} nombreSitio - Nombre del sitio
 * @param {object} datosScraped - Datos obtenidos del scraping
 */
async function guardarDocumentoWeb(nombreSitio, datosScraped) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    const contenidoCompleto = JSON.stringify(datosScraped.contenido, null, 2);
    const fechaActual = new Date().toISOString();
    
    const sql = `
      INSERT INTO documentos (nombre, contenido, tipo, fuente_url, fecha_carga)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      `${nombreSitio} - ${fechaActual}`,
      contenidoCompleto,
      'web_scraping',
      datosScraped.sitio,
      fechaActual
    ], function(err) {
      if (err) {
        console.error('[RAG] Error guardando documento:', err);
        reject(err);
      } else {
        console.log(`[RAG] Documento guardado: ${nombreSitio}`);
        resolve({ id: this.lastID });
      }
      db.close();
    });
  });
}

// ═══════════════════════════════════════════════════════
//  2. RAG SEARCH - Búsqueda con contexto
// ═══════════════════════════════════════════════════════

/**
 * Buscar en la BD usando RAG (Retrieval Augmented Generation)
 * Encuentra documentos relevantes basados en similitud de texto
 * @param {string} query - Pregunta del usuario
 * @param {number} limite - Máximo de resultados (default: 3)
 * @returns {Promise<array>} Documentos relevantes
 */
// Mapa de tema -> tipos de documentos en la BD
const TIPOS_POR_TEMA = {
  carreras:   ['oferta_academica', 'plan_estudios', 'faq', 'ingreso'],
  horarios:   ['horarios', 'calendario', 'faq'],
  tramites:   ['tramites', 'ingreso', 'faq'],
  vida:       ['vida_estudiantil', 'becas', 'faq'],
  general:    ['oferta_academica', 'plan_estudios', 'horarios', 'tramites', 'vida_estudiantil', 'ingreso', 'faq', 'inicial']
};

async function buscarRAG(query, limite = 3, tema = 'general') {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    // Palabras clave: ignorar stopwords
    const STOPWORDS = ['para', 'como', 'cual', 'cuál', 'qué', 'que', 'son', 'una', 'uno', 'los', 'las', 'del', 'con', 'por', 'hay', 'tiene', 'tengo', 'quiero', 'saber', 'sobre', 'más', 'este', 'esta', 'desde'];
    const palabras = query.toLowerCase()
      .split(/\s+/)
      .filter(p => p.length > 3 && !STOPWORDS.includes(p));

    if (palabras.length === 0) {
      db.close();
      return resolve([]);
    }

    // Tipos de documentos permitidos según el tema
    const tiposPermitidos = TIPOS_POR_TEMA[tema] || TIPOS_POR_TEMA.general;
    const tiposPlaceholders = tiposPermitidos.map(() => '?').join(', ');

    // Buscar con OR y ordenar por relevancia
    const conditions = palabras.map(() => `(contenido LIKE ? OR nombre LIKE ?)`).join(' OR ');
    const params = [];
    palabras.forEach(p => params.push(`%${p}%`, `%${p}%`));

    // Score: nombre vale 3 puntos, contenido vale 1
    const scoreCase = palabras.map(() => 
      `(CASE WHEN nombre LIKE ? THEN 3 ELSE 0 END + CASE WHEN contenido LIKE ? THEN 1 ELSE 0 END)`
    ).join(' + ');
    const scoreParams = [];
    palabras.forEach(p => scoreParams.push(`%${p}%`, `%${p}%`));

    const sql = `
      SELECT id, nombre, contenido, tipo, fuente_url, fecha_carga,
             (${scoreCase}) as score
      FROM documentos 
      WHERE tipo IN (${tiposPlaceholders})
        AND (${conditions})
      ORDER BY score DESC
      LIMIT ${limite}
    `;

    db.all(sql, [...tiposPermitidos, ...scoreParams, ...params], (err, rows) => {
      if (err) {
        console.error('[RAG] Error en búsqueda:', err);
        reject(err);
      } else {
        resolve((rows || []).filter(r => r.score > 0));
      }
      db.close();
    });
  });
}

/**
 * Buscar en Google Drive (simulado - requiere autenticación)
 * @param {string} query - Término a buscar
 * @returns {Promise<array>} Resultados de Drive
 */
async function buscarGoogleDrive(query) {
  try {
    // NOTA: Requiere GOOGLE_DRIVE_API_KEY y carpeta compartida
    // Por ahora retorna datos simulados
    
    console.log(`[RAG] Búsqueda en Drive: "${query}"`);
    
    // En producción aquí iría:
    // const service = google.drive({ version: 'v3', auth: authClient });
    // const res = await service.files.list({
    //   q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and fullText contains '${query}'`,
    //   spaces: 'drive',
    //   fields: 'files(id, name, webViewLink, mimeType)'
    // });
    
    return {
      fuente: 'Google Drive',
      resultados: [],
      status: 'Requiere configuración de Google API',
      instrucciones: 'Ver docs/GOOGLE_SETUP.md'
    };
    
  } catch (error) {
    console.error('[RAG] Error en Drive:', error);
    return { fuente: 'Google Drive', error: error.message, resultados: [] };
  }
}

/**
 * Búsqueda RAG completa: BD local + Web + Drive
 * Combina resultados de las tres fuentes
 * @param {string} query - Pregunta del usuario
 * @returns {Promise<object>} Contexto RAG con resultados combinados
 */
async function buscarContextoRAG(query, tema = 'general') {
  console.log(`[RAG] Búsqueda para: "${query}" | tema: ${tema}`);
  
  const inicio = Date.now();
  const contexto = {
    query: query,
    tema: tema,
    fuentes: {},
    total_resultados: 0,
    tiempo_ms: 0
  };
  
  try {
    // Búsqueda paralela filtrando por tema
    const [documentosBD, driveResultados] = await Promise.all([
      buscarRAG(query, 3, tema),
      buscarGoogleDrive(query)
    ]);
    
    // Procesar resultados de BD
    if (documentosBD && documentosBD.length > 0) {
      contexto.fuentes.base_datos = documentosBD.map(doc => ({
        nombre: doc.nombre,
        tipo: doc.tipo,
        fuente_url: doc.fuente_url,
        contenido_preview: doc.contenido.substring(0, 300) + '...',
        // Calendario, FAQ e ingreso: contenido completo para que el bot vea todas las fechas
        contenido_completo: ['calendario', 'faq', 'ingreso'].includes(doc.tipo)
          ? doc.contenido
          : doc.contenido.substring(0, 800),
        fecha: doc.fecha_carga
      }));
      contexto.total_resultados += documentosBD.length;
    }
    
    // Procesar resultados de Drive
    if (driveResultados.resultados && driveResultados.resultados.length > 0) {
      contexto.fuentes.google_drive = driveResultados.resultados;
      contexto.total_resultados += driveResultados.resultados.length;
    }
    
    // Web scraping se hace bajo demanda, no en búsqueda
    
    contexto.tiempo_ms = Date.now() - inicio;
    
    return contexto;
    
  } catch (error) {
    console.error('[RAG] Error en búsqueda contexto:', error);
    return {
      query: query,
      error: error.message,
      fuentes: {},
      total_resultados: 0
    };
  }
}

// ═══════════════════════════════════════════════════════
//  3. GOOGLE DRIVE SYNC
// ═══════════════════════════════════════════════════════

/**
 * Sincronizar Google Drive con BD local
 * Descarga archivos y actualiza base de datos
 * @param {string} folderId - ID de carpeta en Drive
 * @returns {Promise<object>} Resultado de sincronización
 */
async function sincronizarGoogleDrive(folderId) {
  console.log(`[RAG] Sincronizando Google Drive: ${folderId}`);
  
  // NOTA: Requiere credenciales de Google Cloud
  // Pasos para configurar:
  // 1. Crear proyecto en console.cloud.google.com
  // 2. Habilitar Google Drive API
  // 3. Crear "Service Account"
  // 4. Descargar JSON de credenciales
  // 5. Compartir carpeta con email de service account
  // 6. Setear GOOGLE_DRIVE_FOLDER_ID en .env
  
  return {
    estado: 'pendiente_configuracion',
    instrucciones: [
      'Ve a docs/GOOGLE_SETUP.md',
      'Crea una carpeta en Google Drive',
      'Comparte con tu cuenta de servicio',
      'Setea GOOGLE_DRIVE_FOLDER_ID en .env',
      'Vuelve a ejecutar esta función'
    ],
    documentosSync: 0
  };
}

// ═══════════════════════════════════════════════════════
//  4. SCHEDULER - Ejecutar scraping automático
// ═══════════════════════════════════════════════════════

let schedulerActivo = false;
let timerScraping = null;

/**
 * Inicializar scheduler para scraping periódico
 * Ejecuta scraping cada X horas
 * @param {number} intervalHoras - Intervalo en horas (default: 24)
 */
function iniciarSchedulerRAG(intervalHoras = 24) {
  if (schedulerActivo) {
    console.log('[RAG] Scheduler ya está activo');
    return;
  }
  
  schedulerActivo = true;
  const intervalMs = intervalHoras * 60 * 60 * 1000;
  
  console.log(`[RAG] Scheduler iniciado: Scraping cada ${intervalHoras} horas`);
  
  // Ejecutar inmediatamente
  iniciarScrapingGlobal();
  
  // Luego repetir cada intervalo
  timerScraping = setInterval(() => {
    console.log(`[RAG] Ejecutando scraping automático (${new Date().toISOString()})`);
    iniciarScrapingGlobal();
  }, intervalMs);
}

/**
 * Detener scheduler
 */
function detenerSchedulerRAG() {
  if (timerScraping) {
    clearInterval(timerScraping);
    timerScraping = null;
    schedulerActivo = false;
    console.log('[RAG] Scheduler detenido');
  }
}

// ═══════════════════════════════════════════════════════
//  5. UTILIDADES
// ═══════════════════════════════════════════════════════

/**
 * Obtener estadísticas del sistema RAG
 */
async function obtenerEstadisticasRAG() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(`
      SELECT 
        tipo,
        COUNT(*) as cantidad,
        MAX(fecha_carga) as ultima_actualizacion
      FROM documentos
      GROUP BY tipo
    `, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          documentos_por_tipo: rows,
          scheduler_activo: schedulerActivo,
          total: (rows || []).reduce((sum, r) => sum + r.cantidad, 0)
        });
      }
      db.close();
    });
  });
}

/**
 * Limpiar documentos antiguos (más de X días)
 * @param {number} diasAntiguos - Documentos más antiguos que esto serán eliminados
 */
async function limpiarDocumentosAntiguos(diasAntiguos = 30) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguos);
    
    db.run(`
      DELETE FROM documentos 
      WHERE fecha_carga < ? AND tipo IN ('web_scraping', 'google_drive')
    `, [fechaLimite.toISOString()], function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`[RAG] ${this.changes} documentos antiguos eliminados`);
        resolve({ eliminados: this.changes });
      }
      db.close();
    });
  });
}

// ═══════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════

module.exports = {
  // Web Scraping
  scrapearSitio,
  iniciarScrapingGlobal,
  guardarDocumentoWeb,
  
  // RAG Search
  buscarRAG,
  buscarGoogleDrive,
  buscarContextoRAG,
  
  // Google Drive
  sincronizarGoogleDrive,
  
  // Scheduler
  iniciarSchedulerRAG,
  detenerSchedulerRAG,
  
  // Utilities
  obtenerEstadisticasRAG,
  limpiarDocumentosAntiguos
};
