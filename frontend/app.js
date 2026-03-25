/* ═══════════════════════════════════════════════════════
   EXABOT v2 - LÓGICA PRINCIPAL DEL CHATBOT
   16 CRITERIOS DE DISEÑO INTEGRADOS
   ═══════════════════════════════════════════════════════ */

const API_URL = 'http://localhost:5000/api';
const GROQ_KEY = ''; // Se espera que el backend maneje la clave de forma segura, el frontend no debería tenerla hardcodeada
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions?v=2';

// ═══════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════
let hist = [];
let busy = false;
let mid = 0;
let conversacionId = null;
let usuarioId = 'user_' + Date.now();
let baseConocimiento = '';

// Contexto del usuario - Criterio 7: Conservación del contexto
let ctx = {
  nombre: null,
  carrera: null,
  queriaMateria: false,
  frustrado: false,
  turnos: 0,
  modoOscuro: false,
  idioma: 'es',
  tema: 'general'
};

// Elementos del menú
const MENU4 = [
  { label: '🎓 Carreras y oferta académica', cls: '' },
  { label: '📅 Horarios y calendario', cls: 'c' },
  { label: '🏛️ Vida estudiantil y servicios', cls: '' },
  { label: '📋 Trámites y consultas', cls: 'r' }
];

const FRUSTRK = ['no entiendo', 'no funciona', 'no sirve', 'para qué', 'imposible', 'no me ayuda', 'qué mal', 'no me sirve'];
const IDENTK = ['sos humano', 'sos persona', 'hay alguien', 'sos bot', 'sos ia', 'sos real', 'sos una ia'];
const MENUK = ['menú', 'menu', 'inicio', 'volver', 'empezar'];
// Mensajes que son sugerencias del propio bot y no deben procesarse como preguntas reales
const IGNORE_MSGS = [
  'consultá con un asesor', 'consulta con un asesor', 'anotá las respuestas',
  'anota las respuestas', 'hablá con un asesor', 'habla con un asesor',
  'reflexioná', 'reflexiona'
];
const CALENDARIOK = ['calendario academico', 'calendario académico', 'ver calendario', 'mostrar calendario', 'quiero saber el calendario', 'info del calendario', 'información del calendario'];

// ═══════════════════════════════════════════════════════
//  CARRERAS INEXISTENTES - Fix: corregir al usuario sin inventar
// ═══════════════════════════════════════════════════════

// Términos que el usuario puede escribir para referirse a carreras que NO existen en la FCEyT
// ═══════════════════════════════════════════════════════
//  SISTEMA DE DETECCIÓN DE CARRERAS INEXISTENTES
//  Usa keywords parciales para tolerar errores tipográficos
// ═══════════════════════════════════════════════════════

// Carreras VÁLIDAS en la FCEyT — palabras clave que identifican cada una
const CARRERAS_VALIDAS_KEYWORDS = [
  'civil', 'hidrauli', 'hidráuli', 'vial', 'industrial', 'agrimensur',
  'electric', 'eléctri', 'electromecan', 'electromecán', 'electron', 'electrón',
  'sistem', 'matemat', 'matemát', 'hidrol', 'hidrológ',
  'programador', 'analista', 'topograf', 'construccion', 'construcción',
  'produccion', 'producción', 'profes'  // profesorado
];

// Grupos de carreras inexistentes: cada grupo tiene keywords de detección y una respuesta
const GRUPOS_INEXISTENTES = [
  {
    // Carreras de informática/computación que NO existen (confusión común)
    keywords: [, 'ingenieria en informatica', 'computacion', 'computación', 'computadora'],
    // Excluir si el contexto indica una carrera válida
    excepto: ['programador', 'analista', 'profes','informatica','Licenciatura en Sistemas de Información'],
    respuesta: '¡Ojo! Esa carrera no existe en la FCEyT 😊\n\nPero sí tenemos opciones de informática:\n\n• **Licenciatura en Sistemas de Información** (5 años) → https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion\n• **Analista Universitario en Sistemas** (4 años) → https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion\n• **Programador Universitario en Informática** (2 años) → https://fce.unse.edu.ar/?q=programador-universitario-en-informatica\n• **Profesorado en Informática** (4 años) → https://fce.unse.edu.ar/?q=profesorado-en-informatica\n\n¿Cuál te interesa?',
    fuente: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    sug: ['Contame sobre la Licenciatura en Sistemas', 'Contame sobre el Programador Universitario', 'Ver todas las carreras']
  },
  {
    // "Ingeniería en Sistemas" — confusión muy frecuente
    keywords: ['ing sistem', 'ingenieria sistem', 'ingeniería sistem', 'ing. sistem'],
    excepto: [],
    respuesta: 'La FCEyT no tiene Ingeniería en Sistemas, pero sí tiene carreras muy similares 😊\n\n• **Licenciatura en Sistemas de Información** (5 años) → https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion\n• **Analista Universitario en Sistemas** (4 años) → https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion\n• **Programador Universitario en Informática** (2 años) → https://fce.unse.edu.ar/?q=programador-universitario-en-informatica\n\n¿Cuál te interesa?',
    fuente: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    sug: ['Contame sobre la Licenciatura en Sistemas', 'Contame sobre el Analista Universitario', '¿Cuál dura menos años?']
  },
  {
    // Ingenierías que definitivamente no existen — keywords parciales tolerantes a typos
    keywords: [
      'aeronau', 'aeronam', 'aeronom', 'aerona',   // aeronáutica (con typos)
      'ambient', 'quimic', 'químic',                 // ambiental, química
      'mecanic', 'mecánic',                          // mecánica
      'petrole', 'petról',                           // petróleo
      'biomed', 'biomédic',                          // biomédica
      'geolog', 'geológ',                            // geológica
      'naval', 'forestal', 'agronomi', 'agrónomi',  // naval, forestal, agronomía
      'nuclear', 'espacial', 'robotic', 'robótic',  // nuclear, espacial, robótica
      'minas', 'minera', 'minería',                  // minas/minería
      'sanitaria', 'sanitari',                       // sanitaria
      'alimentos',                                   // alimentos
      'telecomunicacion', 'telecomunicación'         // telecomunicaciones
    ],
    excepto: [],
    respuesta: 'Esa ingeniería no está disponible en la FCEyT 😊\n\nLas ingenierías que sí ofrecemos (todas de 5 años, gratuitas):\n\n· **Civil** · **Electromecánica** · **Electrónica** · **Eléctrica**\n· **Agrimensura** · **Hidráulica** · **Industrial** · **Vial**\n\n¿Alguna te interesa? Escribí su nombre y te cuento todo 😊',
    fuente: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    sug: ['Ver todas las ingenierías', 'Contame sobre Ingeniería Industrial', 'Contame sobre Ingeniería Civil']
  },
  {
    // Carreras de otras facultades
    keywords: [
      'abogac', 'derecho', 'medicin', 'arquitectur', 'contador', 'contadur',
      'psicolog', 'veterinar', 'agrono', 'econom', 'administrac',
      'comunicac', 'enfermer', 'odontolog', 'farmaci', 'nutrici',
      'sociolog', 'histori', 'filosofi', 'filosofía', 'biolog',
      'kinesiolog', 'fonoaudiolog', 'trabajo social'
    ],
    excepto: [],
    respuesta: 'Esa carrera no pertenece a la FCEyT 😊\n\nLa FCEyT es la Facultad de **Ciencias Exactas y Tecnologías** — se especializa en Ingenierías, Sistemas, Matemática, Profesorados y Tecnicaturas.\n\nPara otras carreras, consultá las demás facultades de la UNSE → https://www.unse.edu.ar\n\n¿Querés ver qué carreras hay en la FCEyT?',
    fuente: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    sug: ['Ver todas las carreras de la FCEyT', 'Ver todas las ingenierías', 'Contame sobre Sistemas']
  }
];

/**
 * Normaliza texto: minúsculas, sin tildes, sin caracteres especiales.
 * Esto permite detectar "aeronamica", "aeronautica", "aeronáutica" como la misma cosa.
 */
function normalizar(t) {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // saca tildes
    .replace(/[^a-z0-9\s]/g, ' ')                       // saca caracteres especiales
    .replace(/\s+/g, ' ').trim();
}

/**
 * Detecta si el usuario pregunta por una carrera que no existe en la FCEyT.
 * Tolerante a errores tipográficos y falta de tildes.
 * Retorna el objeto del grupo o null.
 */
function detectarCarreraInexistente(texto) {
  const t = normalizar(texto);

  // Solo actúa si el mensaje menciona carrera/ingenieria/licenciatura/hay/estudiar
  // para no falsos positivos en preguntas generales
  const esConsultaCarrera = t.includes('ingeni') || t.includes('licenc') || t.includes('carrer') ||
    t.includes('estudiar') || t.includes('cursar') || t.includes('hay') || t.includes('existe') ||
    t.includes('tienen') || t.includes('ofrecen') || t.includes('tecnic') || t.includes('profes') ||
    /\bing\b/.test(t);  // abreviatura "ing"

  if (!esConsultaCarrera) return null;

  // Primero verificar si ya coincide con una carrera VÁLIDA — no interferir
  const esValida = CARRERAS_VALIDAS_KEYWORDS.some(kw => t.includes(kw));
  if (esValida) return null;

  // Buscar en grupos de inexistentes
  for (const grupo of GRUPOS_INEXISTENTES) {
    const matchKeyword = grupo.keywords.some(kw => t.includes(kw));
    if (!matchKeyword) continue;
    const tieneExcepcion = grupo.excepto.some(ex => t.includes(ex));
    if (tieneExcepcion) continue;
    return grupo;
  }
  return null;
}

// ═══════════════════════════════════════════════════════
//  INICIALIZACIÓN
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('🤖 Exabot v2 Iniciado');
  loadUserPreferences();
  cargarDocumentos();
  setupEventListeners();
});

function setupEventListeners() {
  // Base de conocimiento (sólo si existe la UI)
  const btnGuardarDoc = document.getElementById('guardarDoc');
  if (btnGuardarDoc) {
    btnGuardarDoc.addEventListener('click', guardarDocumento);
  }

  const pdfInput = document.getElementById('pdfInput');
  if (pdfInput) {
    pdfInput.addEventListener('change', subirPDF);
  }

  // Preferencias (sólo si existe la UI)
  const btnGuardarPref = document.getElementById('guardarPref');
  if (btnGuardarPref) {
    btnGuardarPref.addEventListener('click', guardarPreferencias);
  }

  const modoOscuroInput = document.getElementById('modoOscuro');
  if (modoOscuroInput) {
    modoOscuroInput.addEventListener('change', toggleModoOscuro);
  }

  // Drag and drop PDF (sólo si existe el área)
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'var(--azul-pale)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.background = 'var(--azul-pale)';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'var(--azul-pale)';
      if (e.dataTransfer.files[0]?.type === 'application/pdf') {
        if (pdfInput) {
          pdfInput.files = e.dataTransfer.files;
        }
        subirPDF();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════
//  PREFERENCIAS DEL USUARIO - Criterio 1
// ═══════════════════════════════════════════════════════

function loadUserPreferences() {
  // Si no existe el formulario de preferencias, no hace nada
  if (!document.getElementById('usuarioNombre')) return;

  fetch(`${API_URL}/usuario/preferencias/${usuarioId}`)
    .then(r => r.json())
    .then(data => {
      if (data.id) {
        ctx.nombre = data.nombre;
        ctx.carrera = data.carrera;
        ctx.modoOscuro = data.modo_oscuro === 1;
        ctx.idioma = data.idioma;

        document.getElementById('usuarioNombre').value = data.nombre || '';
        document.getElementById('usuarioCarrera').value = data.carrera || '';
        document.getElementById('modoOscuro').checked = ctx.modoOscuro;

        if (ctx.modoOscuro) {
          document.body.classList.add('dark-mode');
        }
      }
    })
    .catch(e => console.log('Preferencias nuevas', e));
}

function guardarPreferencias() {
  const nombre = document.getElementById('usuarioNombre').value;
  const carrera = document.getElementById('usuarioCarrera').value;
  const modoOscuro = document.getElementById('modoOscuro').checked;

  ctx.nombre = nombre;
  ctx.carrera = carrera;
  ctx.modoOscuro = modoOscuro;

  fetch(`${API_URL}/usuario/preferencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      nombre,
      carrera,
      tema_interes: carrera,
      modo_oscuro: modoOscuro ? 1 : 0,
      idioma: ctx.idioma
    })
  })
    .then(r => r.json())
    .then(d => {
      showNotification('✓ Preferencias guardadas');
    })
    .catch(e => console.error('Error:', e));
}

function toggleModoOscuro() {
  ctx.modoOscuro = document.getElementById('modoOscuro').checked;
  document.body.classList.toggle('dark-mode');
  guardarPreferencias();
}

// ═══════════════════════════════════════════════════════
//  GESTIÓN DE DOCUMENTOS
// ═══════════════════════════════════════════════════════

function cargarDocumentos() {
  fetch(`${API_URL}/documentos`)
    .then(r => r.json())
    .then(docs => {
      // Solo guardamos un resumen muy corto para no saturar el prompt
      // El RAG busca los docs relevantes en cada consulta
      baseConocimiento = docs
        .slice(0, 3)
        .map(d => `[${d.nombre}]\n${d.contenido.substring(0, 400)}...`)
        .join('\n\n');
      renderizarDocumentos(docs);
    })
    .catch(e => console.error('Error cargando docs:', e));
}

// Buscar contexto relevante por tema via RAG
async function buscarContextoPorTema(query, tema) {
  try {
    const resp = await fetch(`${API_URL}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tema })
    });
    const data = await resp.json();
    if (data.fuentes && data.fuentes.base_datos) {
      return data.fuentes.base_datos
        .map(d => `[${d.nombre}]\n${d.contenido_preview}`)
        .join('\n\n');
    }
    return '';
  } catch(e) {
    console.error('Error RAG:', e);
    return '';
  }
}

async function buscarResultadosRAG(query, tema) {
  try {
    const resp = await fetch(`${API_URL}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tema })
    });
    const data = await resp.json();
    return (data.fuentes && data.fuentes.base_datos) ? data.fuentes.base_datos : [];
  } catch (e) {
    console.error('Error RAG estructurado:', e);
    return [];
  }
}

function limpiarTextoDocumento(texto) {
  return (texto || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
}

function resumirDocumentoParaChat(doc, maxLineas = 12) {
  const base = doc?.contenido_completo || doc?.contenido_preview || '';
  const lineas = limpiarTextoDocumento(base).slice(0, maxLineas);
  return lineas.join('\n');
}

async function resolverMateriasDesdeSemilla(query) {
  const resultados = await buscarResultadosRAG(query, 'carreras');
  const docPlan = resultados.find(doc => doc.tipo === 'plan_estudios');
  if (!docPlan) return null;

  return {
    texto: '📚 **Encontré esto en la base de conocimiento cargada:**\n\n' + resumirDocumentoParaChat(docPlan),
    fuente: docPlan.fuente_url || 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT'
  };
}

function renderizarDocumentos(docs) {
  const lista = document.getElementById('docsList');
  if (!lista) return;
  lista.innerHTML = '';
  
  docs.forEach(doc => {
    const item = document.createElement('div');
    item.className = 'doc-item';
    item.innerHTML = `
      <span>${doc.nombre} (${doc.tipo || 'texto'})</span>
      <button onclick="eliminarDocumento(${doc.id})">✕</button>
    `;
    lista.appendChild(item);
  });
}

function guardarDocumento() {
  const docNombre = document.getElementById('docNombre');
  const docContenido = document.getElementById('docContenido');
  const docFuente = document.getElementById('docFuente');
  if (!docNombre || !docContenido || !docFuente) return;

  const nombre = docNombre.value.trim();
  const contenido = docContenido.value.trim();
  const fuente = docFuente.value.trim();

  if (!nombre || !contenido) {
    showError('Completa nombre y contenido');
    return;
  }

  fetch(`${API_URL}/documentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre,
      contenido,
      tipo: 'manual',
      fuente_url: fuente
    })
  })
    .then(r => r.json())
    .then(d => {
      document.getElementById('docNombre').value = '';
      document.getElementById('docContenido').value = '';
      document.getElementById('docFuente').value = '';
      showNotification('✓ Documento guardado');
      cargarDocumentos();
    })
    .catch(e => console.error('Error:', e));
}

function eliminarDocumento(id) {
  if (confirm('¿Eliminar este documento?')) {
    fetch(`${API_URL}/documentos/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(d => {
        showNotification('✓ Documento eliminado');
        cargarDocumentos();
      })
      .catch(e => console.error('Error:', e));
  }
}

function subirPDF() {
  const pdfInput = document.getElementById('pdfInput');
  const uploadStatus = document.getElementById('uploadStatus');
  if (!pdfInput || !uploadStatus) return;

  const file = pdfInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('nombre', file.name.replace('.pdf', ''));

  uploadStatus.innerHTML = '📤 Subiendo...';

  fetch(`${API_URL}/pdf/upload`, {
    method: 'POST',
    body: formData
  })
    .then(r => r.json())
    .then(d => {
      document.getElementById('uploadStatus').innerHTML = '✓ PDF subido correctamente';
      setTimeout(() => {
        document.getElementById('uploadStatus').innerHTML = '';
        cargarDocumentos();
      }, 2000);
    })
    .catch(e => {
      document.getElementById('uploadStatus').innerHTML = '✗ Error: ' + e.message;
      console.error('Error:', e);
    });
}

// ═══════════════════════════════════════════════════════
//  DETECCIÓN DE TEMA - Criterio 5: Robustez
// ═══════════════════════════════════════════════════════

function detectarTema(texto) {
  const t = texto.toLowerCase();
  if (t.match(/carrera|ingeniería|licenciatura|programador|analista|tecnicatura|profesorado|sistemas|civil|industrial|hidráulica|vial|electrónica|eléctrica|agrimensura|electromecánica|matemática|física|hidrología|oferta|postgrado|posgrado/))
    return 'carreras';
  if (t.match(/horario|examen|fecha|calendario|cuándo|cuando|turno|mesa|inscripción de materias|cursado|clase|aula|comision|semestre|cuatrimestre/))
    return 'horarios';
  if (t.match(/trámite|tramite|inscripción|inscribirme|anotar|certificado|equivalencia|guaraní|guarani|alumnado|secretaría|título|titulo|pasantía|documentación/))
    return 'tramites';
  if (t.match(/beca|comedor|transporte|tutoría|tutoria|deporte|bienestar|servicio|actividad|extracurricular|vida|residencia/))
    return 'vida';
  return 'general';
}

/**
 * Restricción de alcance:
 * este chatbot sólo responde consultas de ingresantes (ingreso, carreras, trámites y fechas).
 * Además bloquea consultas fuera de dominio (ej: operaciones matemáticas como "3+3").
 */
function esConsultaParaIngresantes(txt, low) {
  const t = (low || txt || '').toLowerCase().trim();
  const n = normalizar(t);
  const pareceConsultaMaterias = esConsultaMaterias(t);

  // Detectar intención matemática aunque no haya operadores con símbolos.
  // Ejemplos: "cuanto es 3 mas1", "sumar 2 y 2", "3 más 1".
  if (/\bcuanto\s+es\b/.test(t) && /\d/.test(t)) return false;
  if (/\b(suma|sumar|resta|restar|multiplic|multiplica|divide|dividir)\b/.test(t) && /\d/.test(t)) return false;
  if (/(?:\d+\s*(?:mas|más|menos)\s*\d+)|(?:\d+\s*\+\s*\d+)|(?:\d+\s*-\s*\d+)|(?:\d+\s*\*\s*\d+)|(?:\d+\s*\/\s*\d+)/.test(t)) return false;

  // Bloqueo explícito: expresiones matemáticas simples (ej: "3+3")
  if (/(^\s*\d+\s*[\+\-\*\/]\s*\d+\s*$)|(^[\d\s\+\-\*\/\(\)\.\,]+$)/.test(t)) return false;
  // Si hay operadores típicos, pero no hay ninguna keyword del dominio, lo consideramos fuera de alcance.
  if (/[\+\-\*\/]/.test(t) && !t.match(/(siu|guaran|ingres|inscrib|calendari|examen|beca|tutor|materi|horari|trami)/)) return false;

  // Keywords de dominio (ingreso/carreras/trámites/fechas/vida estudiantil para ingresantes)
  const KW = [
    'ingreso', 'ingres', 'ciclo de ingreso', 'preinscrip', 'inscrip', 'siu', 'guarani', 'guaraní',
    'materia', 'materias', 'curs', 'primer año', '1er año', '1o', 'cuatrimestre', 'semestre',
    'horario', 'examen', 'fecha', 'turno', 'calendario', 'mesa', 'clase', 'comision', 'comisión',
    'trámite', 'tramite', 'document', 'documentación', 'requisit', 'certificado', 'equivalencia',
    'alumnado', 'dirección', 'email', 'e-mail',
    'beca', 'tutoría', 'tutoria', 'tutor', 'tutorías',
    'carrera', 'carreras', 'oferta académica', 'oferta', 'ingenier', 'licenciatura', 'programador', 'analista',
    'profesorado', 'tecnicatura'
  ];

  if (KW.some(k => t.includes(k))) return true;
  if (pareceConsultaMaterias) return true;
  if (/\bing\.?\s+[a-záéíóúñ]+/.test(t)) return true;
  if (n.includes('lic en') || n.includes('licenciatura en sistema')) return true;
  if (ctx.carrera && (n.includes('que') || n.includes('cual') || n.includes('como') || n.includes('cuanto'))) return true;

  // Permitir saludos / gratitud dentro del alcance.
  if (t === 'hola' || t === 'buenas' || t.startsWith('gracias') || t === 'hey') return true;

  return false;
}

// ═══════════════════════════════════════════════════════
//  MAPA DE URLs OFICIALES POR CARRERA (hardcoded — nunca inventar)
// ═══════════════════════════════════════════════════════

const URLS_CARRERAS = {
  // ── GRADO: Licenciaturas ──
  'licenciatura en sistemas de información': 'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
  'licenciatura en sistemas':               'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
  'licenciatura en matemática':             'https://fce.unse.edu.ar/?q=lic-en-matematica',
  'licenciatura en hidrología subterránea': 'https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea',
  // ── GRADO: Profesorados ──
  'profesorado en informática':             'https://fce.unse.edu.ar/?q=profesorado-en-informatica',
  'profesorado en matemática':              'https://fce.unse.edu.ar/?q=profesorado-en-matematica',
  'profesorado en física':                  'https://fce.unse.edu.ar/?q=profesorado-en-fisica',
  // ── GRADO: Ingenierías ──
  'ingeniería civil':                       'https://fce.unse.edu.ar/?q=ingenieria-civil',
  'ingeniería hidráulica':                  'https://fce.unse.edu.ar/?q=ingenieria-hidraulica',
  'ingeniería vial':                        'https://fce.unse.edu.ar/?q=ingenieria-vial',
  'ingeniería industrial':                  'https://fce.unse.edu.ar/?q=ingenieria-industrial',
  'ingeniería en agrimensura':              'https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura',
  'ingeniería eléctrica':                   'https://fce.unse.edu.ar/?q=ingenieria-electrica',
  'ingeniería electromecánica':             'https://fce.unse.edu.ar/?q=ingenieria-electromecanica',
  'ingeniería electrónica':                 'https://fce.unse.edu.ar/?q=ingenieria-electronica',
  // ── PREGRADO ──
  'programador universitario en informática': 'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
  'analista universitario en sistemas de información': 'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
  'analista universitario':                 'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
  'analista en sistemas':                   'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
  'asistente universitario en sistemas eléctricos': 'https://fce.unse.edu.ar/?q=Asistente-Universitario-en-Sistemas-Electricos',
  'tecnicatura universitaria vial':         'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial',
  'tecnicatura vial':                       'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial',
  'tecnicatura universitaria en construcciones': 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion',
  'tecnicatura en construcciones':          'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion',
  'tecnicatura universitaria en topografía': 'https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia',
  'tecnicatura en topografía':              'https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia',
  'técnico universitario en hidrología subterránea': 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea',
  'técnico en hidrología':                  'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea',
  'técnico universitario en organización y control de la producción': 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion',
  'técnico en organización':                'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion',
  'técnico en producción':                  'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion',
  // ── Keywords cortos ──
  'sistemas':       'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
  'programador':    'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
  'analista':       'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
  'topografía':     'https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia',
  'civil':          'https://fce.unse.edu.ar/?q=ingenieria-civil',
  'hidráulica':     'https://fce.unse.edu.ar/?q=ingenieria-hidraulica',
  'vial':           'https://fce.unse.edu.ar/?q=ingenieria-vial',
  'industrial':     'https://fce.unse.edu.ar/?q=ingenieria-industrial',
  'agrimensura':    'https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura',
  'eléctrica':      'https://fce.unse.edu.ar/?q=ingenieria-electrica',
  'electromecánica':'https://fce.unse.edu.ar/?q=ingenieria-electromecanica',
  'electrónica':    'https://fce.unse.edu.ar/?q=ingenieria-electronica',
  'matemática':     'https://fce.unse.edu.ar/?q=lic-en-matematica',
  'física':         'https://fce.unse.edu.ar/?q=profesorado-en-fisica',
  'hidrología':     'https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea',
  'informática':    'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
};

/**
 * Dado el texto del usuario y el contexto ctx.carrera,
 * devuelve la URL oficial de la carrera detectada o null.
 */
function resolverUrlCarrera(texto) {
  const t = texto.toLowerCase();
  // Prioridad 1: coincidencia en el texto actual
  for (const [clave, url] of Object.entries(URLS_CARRERAS)) {
    if (t.includes(clave)) return url;
  }
  // Prioridad 2: carrera recordada en el contexto
  if (ctx.carrera) {
    for (const [clave, url] of Object.entries(URLS_CARRERAS)) {
      if (clave.includes(ctx.carrera.toLowerCase())) return url;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════
//  REGLAS BASE - compartidas por todos los prompts
// ═══════════════════════════════════════════════════════

const REGLAS_BASE = `
══ ESTILO (cumplir siempre) ══
- Sé amigable, cálido y directo. Respondé SOLO lo que se preguntó, sin agregar consejos ni frases de relleno.
- Respuestas cortas: máximo 6 líneas. NO divagues.
- Máximo 2 emojis por respuesta
- Si el usuario parece perdido: "No te preocupés, vamos paso a paso 😊"
- NUNCA menciones aranceles, cuotas ni costos. La FCEyT es PÚBLICA y GRATUITA

══ REGLAS CRÍTICAS — INCUMPLIRLAS ES UN ERROR GRAVE ══
- PROHIBIDO INVENTAR URLs. Solo podés usar URLs que aparezcan LITERALMENTE en la BASE DE CONOCIMIENTO o en estas instrucciones.
- Si el usuario pregunta por info o plan de estudios de una carrera, incluí SIEMPRE su URL oficial.
- Si no tenés la URL de esa carrera, usá https://fce.unse.edu.ar (nunca inventes un ?q=...)
- Si no tenés un dato exacto: respondé con lo que sí sabés y orientá con calidez. NUNCA digas "No tengo ese dato" — es frío y poco útil.
- Para preguntas de opinión ("¿es difícil?", "¿vale la pena?"): respondé con empatía, mencioná las tutorías https://fce.unse.edu.ar/?q=tutoriasfceyt y el curso de ingreso.
- Si realmente no podés responder: "No tengo esa info en este momento, pero podés consultar en https://fce.unse.edu.ar o escribir a apyc-fce@unse.edu.ar 😊"
- PROHIBIDO responder con consejos de vida, reflexiones o frases no pedidas por el usuario.

══ FORMATO OBLIGATORIO AL FINAL DE CADA RESPUESTA ══
Si hay un link relevante (de la BASE DE CONOCIMIENTO o de estas instrucciones): FUENTE: [URL exacta]
Si no hay link aplicable, no incluyas la línea FUENTE.

Antes de la sección "SUGERENCIAS:", incluí UNA pregunta corta de seguimiento (1 sola).
Terminá SIEMPRE con EXACTAMENTE 3 sugerencias — ni más ni menos. Son la continuación natural de la conversación.
REGLAS DE SUGERENCIAS (críticas):
- Deben ser preguntas o acciones que el usuario haría lógicamente DESPUÉS de esta respuesta.
- Tienen que estar relacionadas 100% con el tema que se habló. Si hablaste de Sistemas, las sugerencias son sobre Sistemas.
- PROHIBIDO sugerir "Ver la página oficial", "Consultá el plan", "Buscá más info" — son inútiles.
- PROHIBIDO sugerir cosas ya respondidas en este mismo mensaje.
- Usá preguntas cortas en voseo: "¿Cuánto dura?", "¿Qué materias tiene?", "¿Cómo me inscribo?"
- O acciones específicas: "Contame sobre el Programador Universitario", "¿Hay becas disponibles?"
- Máximo 6 palabras por sugerencia.

EJEMPLOS de sugerencias BUENAS — preguntas naturales que haría el usuario:
Después de info sobre una carrera → "¿Qué tan difícil es?", "¿Qué materias tiene primer año?", "¿Hay alguna carrera más corta?"
Después de hablar de dificultad → "¿Cómo funcionan las tutorías?", "¿Cuándo es el ciclo de ingreso?", "¿Hay becas disponibles?"
Después de inscripción → "¿Qué documentos necesito?", "¿Dónde queda la facultad?", "¿Cuándo empiezan las clases?"
Después de becas → "¿Cómo me anoto a una beca?", "¿Hay comedor universitario?", "¿Cuándo cierran las inscripciones?"
Después de horarios → "¿Cuándo son los exámenes?", "¿Cuándo me inscribo a materias?", "¿Cuándo es el receso?"

EJEMPLOS de sugerencias MALAS — nunca hagas esto:
❌ "Ver la página oficial" — el usuario ya sabe que existe
❌ "Lic. en Sistemas de Información" — es un nombre, no una pregunta ni acción
❌ "Más información" — demasiado vago
❌ "Consultar con un asesor" — si el bot no sabe, que lo diga directamente

SUGERENCIAS:
• [pregunta/acción corta relacionada con lo que se habló]
• [pregunta/acción corta relacionada con lo que se habló]
• [pregunta/acción corta relacionada con lo que se habló]`;

// ═══════════════════════════════════════════════════════
//  PROMPTS POR FLUJO - Criterio 2: Respuestas contextuales
// ═══════════════════════════════════════════════════════
const PROMPTS = {
  carreras: (conocimiento) => `Sos Exabot, asistente de la FCEyT-UNSE. Guiá al usuario con voseo amigable y precisión.

BASE DE CONOCIMIENTO:
${conocimiento}

CARRERAS COMPLETAS (usá ESTAS URLs, PROHIBIDO inventar otras):
Ingenierías 5a: Civil→?q=ingenieria-civil | Hidráulica→?q=ingenieria-hidraulica | Vial→?q=ingenieria-vial | Industrial→?q=ingenieria-industrial | Agrimensura→?q=ingenieria-en-agrimensura | Eléctrica→?q=ingenieria-electrica | Electromecánica→?q=ingenieria-electromecanica | Electrónica→?q=ingenieria-electronica
Licenciaturas 5a: Sistemas→?q=licenciatura-en-sistemas-de-informacion | Matemática→?q=lic-en-matematica | Hidrología Sub.→?q=licenciatura-en-hidrologia-subterranea
Profesorados 4a: Informática→?q=profesorado-en-informatica | Matemática→?q=profesorado-en-matematica | Física→?q=profesorado-en-fisica
Pregrado 2-3a: Programador→?q=programador-universitario-en-informatica | Analista→?q=Analista-en-Sistemas-de-Informacion | Asist.Eléctrico→?q=Asistente-Universitario-en-Sistemas-Electricos | Tec.Vial→?q=tecnicatura-universitaria-vial | Tec.Construcciones→?q=tecnicatura-universitaria-en-construccion | Tec.Topografía→?q=Tecnicatura-Universitaria-en-Topografia | Tec.Hidrología→?q=tecnicatura-universitaria-en-hidrologia-subterranea | Tec.Producción→?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion
(Todos los links son https://fce.unse.edu.ar/ + el ?q=... indicado)
LISTA COMPLETA. Carrera no listada = NO existe en la FCEyT.

REGLAS:
- FCEyT es PÚBLICA y GRATUITA. No hay costos.
- No existe Ing. en Informática/Sistemas/Computación → ofrecé Lic. en Sistemas, Programador, Analista.
- Si pregunta por carrera inexistente: aclaralo y ofrecé la más cercana de la lista.
- Si pregunta "primer año" o "plan de estudios": dá la URL de esa carrera directamente.
- Contexto: si ya hablaron de una carrera, las preguntas de seguimiento se refieren a ESA carrera.
- Respuestas cortas, máx 6 líneas. Usá **negritas** para nombres de carrera.

FORMATO DE SALIDA:
[respuesta con emojis y negritas]
FUENTE: [URL solo si aplica, sino omitir]
SUGERENCIAS:
• [pregunta corta relacionada con ESTA respuesta, en voseo]
• [pregunta corta relacionada con ESTA respuesta, en voseo]
• [pregunta corta relacionada con ESTA respuesta, en voseo]
IMPORTANTE: las 3 sugerencias deben ser la continuación lógica de lo que acabás de responder. Si respondiste sobre Sistemas, las sugerencias son sobre Sistemas. PROHIBIDO sugerir 'ver la página oficial' o cosas ya explicadas.
${REGLAS_BASE}`,

  horarios: (conocimiento) => `Sos Exabot, asistente virtual de la FCEyT - UNSE, experto en horarios y calendario académico.

BASE DE CONOCIMIENTO OFICIAL:
${conocimiento}

══ REGLAS ESPECÍFICAS DE HORARIOS ══

PARA HORARIOS DE MATERIAS:
- Los horarios dependen de la carrera. Si el usuario pregunta por una materia sin decir su carrera, SIEMPRE preguntá primero:
  "Para darte el horario correcto, necesito saber en qué carrera estás. ¿Podés decirme tu carrera?"
- Una vez que sepas la carrera, buscá en la base de conocimiento los horarios de esa carrera
- Si no tenés los horarios de esa carrera en la base de conocimiento, al drive con los horarios de clases https://docs.google.com/spreadsheets/d/1jLf9CjNGt6zwFbL3tYSAiYplVnR3tqI5/edit?gid=1371653553#gid=1371653553
- NUNCA des horarios de una carrera diferente a la que preguntó el usuario

PARA FECHAS DEL CALENDARIO:
- Respondé SOLO con fechas que estén  en la base de conocimiento de arriba
- Toda la info del calendario proviene de la Resolución HCD Nº 005/2026 del HCD FCEyT, aprobada el 4 de marzo de 2026
- SIEMPRE respondé con las fechas exactas cuando las tengas. Ejemplo: "Según la Resolución HCD Nº 005/2026, los exámenes de febrero-marzo tienen tres llamados: 1ro del 09/02 al 13/02, 2do del 23/02 al 27/02 y 3ro del 09/03 al 13/03"
- Si no tenés la fecha: "Para más info consultá https://fce.unse.edu.ar/?q=calendario-academico"
- NUNCA mandes al SIU Guaraní para consultas de fechas — el SIU es solo para inscribirse a materias
- El link de FUENTE para fechas SIEMPRE debe ser: https://fce.unse.edu.ar/?q=calendario-academico
- NUNCA inventes fechas ni períodos
-Si PREGUNTA SOBRE EL CALENDARIO EN GENERAL HACE UN RESUMEN DE LAS FECHAS CLAVE DEL CALENDARIO ACADÉMICO 2026:
- Al final de respuestas sobre fechas incluí siempre:
  SUGERENCIAS:
  • 📅 Ver imagen del calendario
  • ¿Cuándo son los exámenes de julio?
  • ¿Cuándo me inscribo a materias?
${REGLAS_BASE}`,

  tramites: (conocimiento) => `Sos Exabot, asistente virtual de la FCEyT - UNSE, experto en trámites y gestión académica.

BASE DE CONOCIMIENTO OFICIAL:
${conocimiento}

══ REGLAS ESPECÍFICAS DE TRÁMITES ══
- Para inscripción/ingreso SIEMPRE mencioná estos pasos en orden:
  1. Preinscripción en SIU Guaraní: https://autogestion.guarani.unse.edu.ar/unse/acceso
  2. Documentación: DNI, título secundario, partida de nacimiento, foto carnet
  3. Presentarse en la Dirección de Alumnos de la FCEyT
  4. Curso de ingreso (obligatorio pero NO eliminatorio)
- Para certificados, equivalencias u otros trámites: derivá siempre a la Secretaría Académica o Dirección de Alumnos
- Recordá siempre que la universidad es GRATUITA
- Dirección: Avda. Belgrano (Sud) N° 1912 | Email: apyc-fce@unse.edu.ar
${REGLAS_BASE}`,

  vida: (conocimiento) => `Sos Exabot, asistente virtual de la FCEyT - UNSE, experto en vida estudiantil y servicios.

BASE DE CONOCIMIENTO OFICIAL:
${conocimiento}

══ REGLAS ESPECÍFICAS DE VIDA ESTUDIANTIL ══
- Para becas: dirigí siempre a https://fce.unse.edu.ar/?q=becas-alumnos
- Para tutorías de pares: https://fce.unse.edu.ar/?q=tutoriasfceyt
- Destacá el sistema de tutorías como recurso clave para ingresantes
- Si preguntan por servicios que no tenés info: derivá a la Secretaría de Extensión o al sitio oficial
${REGLAS_BASE}`,

  general: (conocimiento) => `Sos Exabot, el asistente virtual de la FCEyT - UNSE.
Tu objetivo es guiar a ingresantes y estudiantes con calidez y precisión.

BASE DE CONOCIMIENTO OFICIAL:
${conocimiento}

══ REGLAS GENERALES ══
- TODA la información debe venir SOLO de https://fce.unse.edu.ar/ — NUNCA uses links externos ni de unse.edu.ar
- NUNCA inventes links, fechas ni información que no esté en la base de conocimiento
- Si la pregunta es sobre carreras, mencioná la oferta académica general
- Si es sobre ingreso, mencioná el SIU Guaraní y los pasos de inscripción
- Si es sobre fechas o exámenes, indicá verificar en https://fce.unse.edu.ar o el SIU Guaraní
- Si no tenés un dato exacto: respondé con lo que sí sabés y orientá con calidez. NUNCA digas "No tengo ese dato" — es frío y poco útil.
- Para preguntas de opinión ("¿es difícil?", "¿vale la pena?"): respondé con empatía, mencioná las tutorías https://fce.unse.edu.ar/?q=tutoriasfceyt y el curso de ingreso.
- Si realmente no podés responder: "No tengo esa info en este momento, pero podés consultar en https://fce.unse.edu.ar o escribir a apyc-fce@unse.edu.ar 😊"
${REGLAS_BASE}`
};

// ═══════════════════════════════════════════════════════
//  SISTEMA PROMPT - elige según el tema detectado
// ═══════════════════════════════════════════════════════

function generarSystemPrompt(tema) {
  const promptFn = PROMPTS[tema] || PROMPTS.general;
  return promptFn(baseConocimiento || 'Información oficial de la FCEyT UNSE.');
}

// ═══════════════════════════════════════════════════════
//  ENVIAR MENSAJE
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
//  FICHAS Y LISTAS DE CARRERAS — hardcoded, sin LLM
// ═══════════════════════════════════════════════════════

const FICHAS_CARRERA = [
    { triggers: ['ingeniería civil', 'ingenieria civil', 'ing civil', 'sobre civil'],
      nombre: 'Ingeniería Civil', duracion: '5 años', tipo: 'Grado', emoji: '🏗️',
      perfil: 'Te especializás en diseñar y construir grandes obras: edificios, puentes, rutas, diques y sistemas de saneamiento. Es una de las carreras más demandadas en la región.',
      salida: 'Empresas constructoras, Vialidad Nacional/Provincial, municipios, CONICET y consultoras privadas.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-civil' },
    { triggers: ['ingeniería hidráulica', 'ingenieria hidraulica', 'hidráulica', 'hidraulica'],
      nombre: 'Ingeniería Hidráulica', duracion: '5 años', tipo: 'Grado', emoji: '💧',
      perfil: 'Te especializás en el aprovechamiento y gestión del agua: sistemas de riego, acueductos, obras de defensa y aprovechamientos hidroeléctricos.',
      salida: 'CONICET, INTA, organismos de cuencas hídricas, consultoras ambientales y organismos públicos del agua.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-hidraulica' },
    { triggers: ['ingeniería vial', 'ingenieria vial', 'ing vial', 'sobre vial'],
      nombre: 'Ingeniería Vial', duracion: '5 años', tipo: 'Grado', emoji: '🛣️',
      perfil: 'Te especializás en el diseño, construcción y mantenimiento de caminos, autopistas y obras viales. Muy demandada por el crecimiento de infraestructura en Argentina.',
      salida: 'Vialidad Nacional, Vialidad Provincial, empresas constructoras viales y organismos públicos.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-vial' },
    { triggers: ['ingeniería industrial', 'ingenieria industrial', 'ing industrial'],
      nombre: 'Ingeniería Industrial', duracion: '5 años', tipo: 'Grado', emoji: '⚙️',
      perfil: 'Te especializás en optimizar procesos productivos, gestión de calidad, logística y operaciones. Muy versátil: podés trabajar en casi cualquier industria.',
      salida: 'Industrias manufactureras, pymes, plantas de producción y consultoras de procesos.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-industrial' },
    { triggers: ['ingeniería en agrimensura', 'ingenieria en agrimensura', 'agrimensura'],
      nombre: 'Ingeniería en Agrimensura', duracion: '5 años', tipo: 'Grado', emoji: '🗺️',
      perfil: 'Te especializás en la mensura y delimitación de tierras, catastro, geodesia, cartografía digital y ordenamiento territorial.',
      salida: 'Estudios de agrimensura, escribanías, municipios, organismos catastrales y empresas de tecnología geoespacial.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura' },
    { triggers: ['ingeniería eléctrica', 'ingenieria electrica', 'ing eléctrica', 'ing electrica'],
      nombre: 'Ingeniería Eléctrica', duracion: '5 años', tipo: 'Grado', emoji: '⚡',
      perfil: 'Te especializás en generación, transmisión y distribución de energía eléctrica, automatización y sistemas de potencia.',
      salida: 'Empresas de energía, distribuidoras eléctricas, industrias y proyectos de energías renovables.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-electrica' },
    { triggers: ['ingeniería electromecánica', 'ingenieria electromecanica', 'electromecánica', 'electromecanica'],
      nombre: 'Ingeniería Electromecánica', duracion: '5 años', tipo: 'Grado', emoji: '🔧',
      perfil: 'Combinás conocimientos eléctricos y mecánicos: automatización industrial, mantenimiento de plantas y diseño de maquinaria.',
      salida: 'Industrias manufactureras, plantas de energía y empresas de servicios técnicos.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-electromecanica' },
    { triggers: ['ingeniería electrónica', 'ingenieria electronica', 'electrónica', 'electronica'],
      nombre: 'Ingeniería Electrónica', duracion: '5 años', tipo: 'Grado', emoji: '📡',
      perfil: 'Te especializás en diseño de circuitos electrónicos, telecomunicaciones, instrumentación y sistemas embebidos.',
      salida: 'Empresas de telecomunicaciones, industria electrónica, centros de I+D y tecnología.',
      url: 'https://fce.unse.edu.ar/?q=ingenieria-electronica' },
    { triggers: ['licenciatura en sistemas', 'lic en sistemas', 'lic. en sistemas', 'licenciatura sistemas', 'sistemas de información'],
      nombre: 'Licenciatura en Sistemas de Información', duracion: '5 años', tipo: 'Grado', emoji: '💻',
      perfil: 'Aprendés a analizar, diseñar y gestionar sistemas informáticos: programación, bases de datos, redes, gestión de proyectos y seguridad informática.',
      salida: 'Empresas de software, startups tecnológicas, áreas de IT de cualquier organización y organismos públicos.',
      url: 'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion' },
    { triggers: ['licenciatura en matemática', 'lic en matematica', 'lic. en matemática', 'licenciatura matematica'],
      nombre: 'Licenciatura en Matemática', duracion: '5 años', tipo: 'Grado', emoji: '📐',
      perfil: 'Profundizás en matemática pura y aplicada: álgebra, análisis, estadística, modelado matemático e investigación científica.',
      salida: 'Universidades, CONICET, organismos de investigación y empresas que requieren modelado cuantitativo.',
      url: 'https://fce.unse.edu.ar/?q=lic-en-matematica' },
    { triggers: ['licenciatura en hidrología', 'lic en hidrología', 'hidrología subterránea', 'hidrologia subterranea'],
      nombre: 'Licenciatura en Hidrología Subterránea', duracion: '5 años', tipo: 'Grado', emoji: '🌊',
      perfil: 'Estudiás la dinámica de las aguas subterráneas, hidrogeología, manejo de acuíferos y gestión del recurso hídrico. Carrera única en el NOA.',
      salida: 'CONICET, organismos provinciales de agua, municipios y consultoras ambientales.',
      url: 'https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea' },
    { triggers: ['profesorado en informática', 'profesorado informatica', 'prof informática'],
      nombre: 'Profesorado en Informática', duracion: '4 años', tipo: 'Grado', emoji: '👨‍🏫',
      perfil: 'Te formás para enseñar informática y tecnología en nivel secundario y terciario. Combinás saberes pedagógicos con competencias técnicas en computación.',
      salida: 'Colegios secundarios, institutos de formación docente y centros de capacitación tecnológica.',
      url: 'https://fce.unse.edu.ar/?q=profesorado-en-informatica' },
    { triggers: ['profesorado en matemática', 'profesorado matematica', 'prof matemática', 'prof en matematica'],
      nombre: 'Profesorado en Matemática', duracion: '4 años', tipo: 'Grado', emoji: '🧮',
      perfil: 'Te formás para enseñar matemática en nivel secundario y terciario. Combinás formación matemática sólida con didáctica y pedagogía.',
      salida: 'Colegios secundarios, institutos de formación docente y organismos educativos.',
      url: 'https://fce.unse.edu.ar/?q=profesorado-en-matematica' },
    { triggers: ['profesorado en física', 'profesorado fisica', 'prof física', 'prof en fisica'],
      nombre: 'Profesorado en Física', duracion: '4 años', tipo: 'Grado', emoji: '🔭',
      perfil: 'Te formás para enseñar física en nivel secundario y terciario, con base en mecánica, termodinámica, electromagnetismo y física moderna.',
      salida: 'Colegios secundarios, institutos de formación docente y organismos de educación.',
      url: 'https://fce.unse.edu.ar/?q=profesorado-en-fisica' },
    { triggers: ['programador universitario', 'programador universitario en informática', 'programador en informatica',
                 'sobre el programador', 'el programador', 'programador?', 'programador universitario?',
                 'sobre programador', 'carrera de programador', 'quiero ser programador', 'programador'],
      nombre: 'Programador Universitario en Informática', duracion: '2 años', tipo: 'Pregrado', emoji: '🖥️',
      perfil: 'Aprendés programación, desarrollo web, algorítmica y bases de datos.',
      salida: 'Desarrollo de software, IT, startups y freelance. ',
      url: 'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica' },
    { triggers: ['analista universitario', 'analista en sistemas', 'analista universitario en sistemas', 'sobre el analista',
                 'el analista', 'analista?', 'sobre analista', 'carrera de analista', 'analista'],
      nombre: 'Analista Universitario en Sistemas de Información', duracion: '4 años', tipo: 'Pregrado', emoji: '🔍',
      perfil: 'Aprendés a analizar y diseñar sistemas de información, gestionar proyectos informáticos y trabajar con bases de datos avanzadas.',
      salida: 'Análisis funcional, gestión de TI y empresas de software. Título universitario oficial en 4 años.',
      url: 'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion' },
    { triggers: ['tecnicatura vial', 'tecnicatura universitaria vial', 'tec vial', 'sobre tec vial'],
      nombre: 'Tecnicatura Universitaria Vial', duracion: '2,5 años', tipo: 'Pregrado', emoji: '🛣️',
      perfil: 'Te formás en construcción y mantenimiento de obras viales con título habilitante en 2 años y medio.',
      salida: 'Vialidad Nacional y Provincial, empresas constructoras y organismos públicos.',
      url: 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial' },
    { triggers: ['tecnicatura en construcciones', 'tec construcciones', 'construcciones'],
      nombre: 'Tecnicatura Universitaria en Construcciones', duracion: '2,5 años', tipo: 'Pregrado', emoji: '🏗️',
      perfil: 'Te formás en construcción de obras civiles con título habilitante en 2 años y medio.',
      salida: 'Empresas constructoras, municipios y organismos públicos.',
      url: 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion' },
    { triggers: ['tecnicatura en topografía', 'tec topografía', 'tec topografia', 'topografía'],
      nombre: 'Tecnicatura Universitaria en Topografía', duracion: '2,5 años', tipo: 'Pregrado', emoji: '🗺️',
      perfil: 'Aprendés medición y relevamiento de terrenos con instrumental de última generación.',
      salida: 'Municipios, organismos catastrales y estudios de agrimensura.',
      url: 'https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia' },
    { triggers: ['técnico en hidrología', 'tec hidrología', 'tec en hidrologia'],
      nombre: 'Técnico Universitario en Hidrología Subterránea', duracion: '2 años', tipo: 'Pregrado', emoji: '💧',
      perfil: 'Te formás en monitoreo y gestión básica del recurso hídrico subterráneo.',
      salida: 'Organismos de agua, municipios y empresas ambientales.',
      url: 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea' },
    { triggers: ['técnico en organización', 'tec organización', 'tec producción', 'organización y control'],
      nombre: 'Técnico en Organización y Control de la Producción', duracion: '2,5 años', tipo: 'Pregrado', emoji: '⚙️',
      perfil: 'Te formás en gestión y control de procesos productivos con salida laboral rápida.',
      salida: 'Industrias, pymes y plantas de producción.',
      url: 'https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion' },
    { triggers: ['asistente en sistemas eléctricos', 'asistente universitario', 'sistemas eléctricos'],
      nombre: 'Asistente Universitario en Sistemas Eléctricos', duracion: '2 años', tipo: 'Pregrado', emoji: '⚡',
      perfil: 'Te formás en instalaciones y sistemas eléctricos con título habilitante en 2 años.',
      salida: 'Empresas eléctricas, industrias y plantas de energía.',
      url: 'https://fce.unse.edu.ar/?q=Asistente-Universitario-en-Sistemas-Electricos' },
  ];


const CARRERA_ALIASES = [
  { match: ['licenciatura en sistema', 'licenciatura en sistemas', 'lic en sistema', 'lic en sistemas', 'lic sistema', 'sistemas de informacion'], value: 'licenciatura en sistemas de información' },
  { match: ['licenciatura en matemática', 'lic en matemática', 'matemática'], value: 'licenciatura en matemática' },
  { match: ['licenciatura en hidrología', 'hidrología subterránea'], value: 'licenciatura en hidrología subterránea' },
  { match: ['programador universitario', 'programador'], value: 'programador universitario en informática' },
  { match: ['analista universitario', 'analista en sistemas', 'analista'], value: 'analista universitario en sistemas de información' },
  { match: ['profesorado en informática'], value: 'profesorado en informática' },
  { match: ['profesorado en matemática'], value: 'profesorado en matemática' },
  { match: ['profesorado en física'], value: 'profesorado en física' },
  { match: ['ingeniería civil', 'civil'], value: 'ingeniería civil' },
  { match: ['ingeniería hidráulica', 'hidráulica'], value: 'ingeniería hidráulica' },
  { match: ['ingeniería vial', 'vial'], value: 'ingeniería vial' },
  { match: ['ingeniería industrial', 'industrial'], value: 'ingeniería industrial' },
  { match: ['ingeniería en agrimensura', 'agrimensura'], value: 'ingeniería en agrimensura' },
  { match: ['ingeniería eléctrica', 'eléctrica'], value: 'ingeniería eléctrica' },
  { match: ['ingeniería electromecánica', 'electromecánica'], value: 'ingeniería electromecánica' },
  { match: ['ingeniería electrónica', 'electrónica'], value: 'ingeniería electrónica' },
  { match: ['tecnicatura en construcciones', 'construcciones'], value: 'tecnicatura universitaria en construcciones' },
  { match: ['tecnicatura en topografía', 'topografía'], value: 'tecnicatura universitaria en topografía' },
  { match: ['tecnicatura vial'], value: 'tecnicatura universitaria vial' },
  { match: ['técnico en hidrología'], value: 'técnico universitario en hidrología subterránea' },
  { match: ['técnico en organización', 'producción'], value: 'técnico en organización y control de la producción' },
  { match: ['asistente universitario', 'sistemas eléctricos'], value: 'asistente universitario en sistemas eléctricos' }
];

function detectarCarreraEnTexto(texto) {
  const low = (texto || '').toLowerCase();
  const normalizado = normalizar(texto || '');

  const ficha = FICHAS_CARRERA.find(f =>
    f.triggers.some(tr => low.includes(tr.toLowerCase()) || normalizado.includes(normalizar(tr)))
  );
  if (ficha) return ficha.nombre.toLowerCase();

  const alias = CARRERA_ALIASES.find(entry =>
    entry.match.some(tr => low.includes(tr) || normalizado.includes(normalizar(tr)))
  );
  return alias ? alias.value : null;
}

function esConsultaMaterias(texto) {
  const low = (texto || '').toLowerCase();
  const norm = normalizar(texto || '');

  return low.includes('materias') ||
    low.includes('amterias') ||
    low.includes('materia') ||
    low.includes('amteria') ||
    low.includes('primer año') ||
    low.includes('1er año') ||
    low.includes('1er ano') ||
    norm.includes('materia') ||
    norm.includes('amteria') ||
    norm.includes('mteria') ||
    norm.includes('plan de estudio') ||
    norm.includes('asignaturas') ||
    norm.includes('que se cursa');
}

function detectarCategoriaCarrera(texto) {
  const n = normalizar(texto || '');

  if (n.includes('ingenieria') || n.includes('ingenierias') || /\bing\b/.test(n)) return 'ingenierias';
  if (n.includes('licenciatura') || n.includes('licenciaturas') || n.includes('lic en')) return 'licenciaturas';
  if (n.includes('profesorado') || n.includes('profesorados')) return 'profesorados';
  if (n.includes('pregrado') || n.includes('tecnicatura') || n.includes('tecnicaturas')) return 'pregrado';

  return null;
}

function esConsultaVidaEstudiantil(texto) {
  const n = normalizar(texto || '');
  return n.includes('beca') || n.includes('becas') || n.includes('tutoria') || n.includes('tutorias') ||
    n.includes('comedor') || n.includes('bienestar') || n.includes('residencia') || n.includes('servicio');
}

function esPreguntaDemasiadoAmbiguaParaContexto(texto) {
  const n = normalizar(texto || '');
  return /^(cuanto dura (el|la|los|las)|que materias tiene (el|la|los|las))$/.test(n);
}

function esConsultaComparacion(texto) {
  const n = normalizar(texto || '');
  return n.includes('diferencia entre') || n.includes('diferencias entre') ||
    n.includes('comparar') || n.includes('comparacion entre') || n.includes('que diferencia hay entre');
}

function detectarCarrerasEnTexto(texto) {
  const low = (texto || '').toLowerCase();
  const n = normalizar(texto || '');
  const matches = [];

  FICHAS_CARRERA.forEach(ficha => {
    const coincide = ficha.triggers.some(tr => low.includes(tr.toLowerCase()) || n.includes(normalizar(tr)));
    if (coincide && !matches.some(m => m.nombre === ficha.nombre)) {
      matches.push(ficha);
    }
  });

  return matches;
}

function construirComparacionCarreras(fichaA, fichaB) {
  const focoA = fichaA.perfil.split('.')[0];
  const focoB = fichaB.perfil.split('.')[0];

  return '🔎 **Diferencia entre ' + fichaA.nombre + ' y ' + fichaB.nombre + '**\n\n' +
    '• **Enfoque:** ' + fichaA.nombre + ' se centra en ' + focoA.toLowerCase() + '.\n' +
    '• **Enfoque:** ' + fichaB.nombre + ' se centra en ' + focoB.toLowerCase() + '.\n' +
    '• **Salida laboral:** ' + fichaA.nombre + ' apunta a ' + fichaA.salida + '\n' +
    '• **Salida laboral:** ' + fichaB.nombre + ' apunta a ' + fichaB.salida + '\n\n' +
    'Si querés, te ayudo a ver cuál se parece más a lo que buscás.';
}

function recuperarCarreraDesdeHistorial() {
  const ultimosMensajes = [...hist].slice(-6).reverse();

  for (const mensaje of ultimosMensajes) {
    const carrera = detectarCarreraEnTexto(mensaje.content);
    if (carrera) return carrera;
  }

  return null;
}

function obtenerCarreraActual(texto = '') {
  return detectarCarreraEnTexto(texto) || ctx.carrera || recuperarCarreraDesdeHistorial() || null;
}


function mostrarListaGrado(txt) {
  userMsg(txt);
  botMsg(
    '🎓 Acá tenés todas las carreras de grado de la FCEyT — públicas y gratuitas 👇\n\n' +
    '🏗️ **Ingenierías** (5 años)\n' +
    '· Civil · Electromecánica · Electrónica · Eléctrica\n' +
    '· Agrimensura · Hidráulica · Industrial · Vial\n\n' +
    '💻 **Licenciaturas** (5 años)\n' +
    '· Sistemas de Información · Matemática · Hidrología Subterránea\n\n' +
    '👨‍🏫 **Profesorados** (4 años)\n' +
    '· Informática · Matemática · Física\n\n' +
    '¿Cuál te interesa? Escribí el nombre y te cuento todo 😊',
    'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
    ['¿Hay alguna relacionada a informática?', '¿Cuál dura menos años?', '¿Hay carreras más cortas?']
  );
}

function mostrarSoloIngenierias(txt) {
  userMsg(txt);
  botMsg(
    '🏗️ **Ingenierías en la FCEyT-UNSE** — todas de 5 años, públicas y gratuitas 👇\n\n' +
    '· **Ing. Civil** → diseño y construcción de obras civiles\n' +
    '· **Ing. Electromecánica** → máquinas, instalaciones eléctricas e industriales\n' +
    '· **Ing. Electrónica** → sistemas electrónicos, telecomunicaciones y automatización\n' +
    '· **Ing. Eléctrica** → generación, distribución y uso de energía eléctrica\n' +
    '· **Ing. en Agrimensura** → medición y delimitación de tierras y catastro\n' +
    '· **Ing. Hidráulica** → obras de agua, riego e hidrología superficial\n' +
    '· **Ing. Industrial** → gestión de procesos productivos y calidad\n' +
    '· **Ing. Vial** → diseño y mantenimiento de carreteras y vías\n\n' +
    '💡 ¿Querés saber de alguna en particular? Escribí su nombre 😊\n' +
    '🔗 https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
    ['Contame sobre Ing. Industrial', 'Contame sobre Ing. Civil', '¿Hay carreras más cortas relacionadas?']
  );
}

function mostrarSoloLicenciaturas(txt) {
  userMsg(txt);
  botMsg(
    '💻 **Licenciaturas en la FCEyT-UNSE** — todas de 5 años, públicas y gratuitas 👇\n\n' +
    '· **Lic. en Sistemas de Información** → desarrollo de software, análisis de datos y gestión de TI\n' +
    '· **Lic. en Matemática** → matemática pura y aplicada, investigación y docencia\n' +
    '· **Lic. en Hidrología Subterránea** → gestión del agua subterránea y recursos hídricos\n\n' +
    '💡 ¿Querés saber de alguna en particular? Escribí su nombre 😊\n' +
    '🔗 https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
    ['Contame sobre Lic. en Sistemas', 'Contame sobre Lic. en Matemática', '¿Hay carreras más cortas?']
  );
}

function mostrarSoloProfessorados(txt) {
  userMsg(txt);
  botMsg(
    '👨‍🏫 **Profesorados en la FCEyT-UNSE** — todos de 4 años, públicos y gratuitos 👇\n\n' +
    '· **Profesorado en Informática** → formación docente para enseñar computación e informática\n' +
    '· **Profesorado en Matemática** → formación docente para enseñar matemática en secundario y terciario\n' +
    '· **Profesorado en Física** → formación docente para enseñar física en secundario y terciario\n\n' +
    '💡 ¿Querés saber de alguno en particular? Escribí su nombre 😊\n' +
    '🔗 https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
    ['Contame sobre el Profesorado en Informática', 'Contame sobre el Profesorado en Matemática', '¿Cuándo me inscribo?']
  );
}


function mostrarListaPregrado(txt) {
  userMsg(txt);
  botMsg(
    '📚 **Carreras de Pregrado** — título universitario en 2 a 4 años 🎉\n' +
    '💻 **Informática** — Programador Univesitario en Informatica(2 años) · Analista Universitario en Sistemas (4 años)\n' +
    '⚡ **Eléctrica** — Asistente en Sistemas Eléctricos (2 años)\n' +
    '🏗️ **Civil** — Tec. en Construcciones · Tec. en Topografía (2,5 años)\n' +
    '🛣️ **Vial** — Tecnicatura Universitaria Vial (2,5 años)\n' +
    '💧 **Agua** — Tec. en Hidrología Subterránea (2 años)\n' +
    '⚙️ **Industrial** — Tec. en Organización y Control (2,5 años)\n\n' +
    '¿Cuál te interesa? Escribí el nombre y te cuento todo 😊',
    'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
    ['¿Hay alguna de informática?', '¿Cuál es la más corta?', '¿Las materias cuentan para el grado?']
  );
}

function mostrarFichaCarrera(txt, ficha) {
  userMsg(txt);
  ctx.carrera = ficha.nombre.toLowerCase();
  const tipoLabel = ficha.tipo === 'Pregrado'
    ? '📜 Título universitario oficial'
    : '📜 Carrera de Grado';
  const sugsCarreraMap = {
    'ingeniería civil':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería hidráulica':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería vial':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería industrial':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería en agrimensura':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería eléctrica':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería electromecánica':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'ingeniería electrónica':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay otra ingeniería similar?'],
    'licenciatura en sistemas de información':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay alguna carrera más corta de informática?'],
    'licenciatura en matemática':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay profesorado relacionado?'],
    'licenciatura en hidrología subterránea':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay carrera más corta relacionada?'],
    'profesorado en informática':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay alguna licenciatura relacionada?'],
    'profesorado en matemática':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay alguna licenciatura relacionada?'],
    'profesorado en física':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Hay otra carrera relacionada?'],
    'programador universitario en informática':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Puedo seguir estudiando después?'],
    'analista universitario en sistemas de información':
      ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Puedo seguir estudiando después?'],
  };
  const sugsCarrera = sugsCarreraMap[ficha.nombre.toLowerCase()]
    || ['¿Qué materias tiene primer año?', '¿Qué tan difícil es?', '¿Cómo me inscribo?'];
  // Tip proactivo correcto:
  // Pregrado → sus materias cuentan si SEGUÍS al grado (no al revés)
  // Grado → si hay tecnicatura/pregrado relacionado, mencionarlo

  const tipTxt = '';

  botMsg(
    ficha.emoji + ' **' + ficha.nombre + '**\n' +
    tipoLabel + '\n\n' +
    '⏱ ' + ficha.duracion + '  |  ' + (ficha.tipo === 'Pregrado' ? 'Pregrado' : 'Grado') + '\n\n' +
    '📚 ' + ficha.perfil + '\n\n' +
    '💼 ' + ficha.salida +
    tipTxt + '\n\n' +
    '🔗 Ver plan de estudios y más info\n' + ficha.url,
    ficha.url, true, sugsCarrera
  );
}

/**
 * Maneja los mensajes que tienen respuesta hardcoded.
 * Retorna true si se manejó, false si debe continuar al LLM.
 */
function handleCarreraHardcoded(low, txt) {
  const normalizado = normalizar(txt || '');

  // Si el usuario está pidiendo materias, no mostramos la ficha de la carrera.
  // Esto permite que el flujo de "Materias de 1er año" use el contexto correctamente.
  if (esConsultaMaterias(txt)) {
    return false;
  }

  // ── Helpers de detección ──
  const tieneIngenieria = normalizado.includes('ingenieria') || normalizado.includes('ingenierias') || /\bing\b/.test(normalizado);
  const tieneLicenciatura = normalizado.includes('licenciatura') || normalizado.includes('licenciaturas') || normalizado.includes('lic en');
  const tieneProfessorado = low.includes('profesorado') || low.includes('profesorados');
  const esConsulta = low.includes('hay') || low.includes('son') || low.includes('tiene') || low.includes('tienen') ||
                     low.includes('ver') || low.includes('mostrar') || low.includes('lista') || low.includes('cuales') ||
                     low.includes('cuáles') || low.includes('que') || low.includes('qué') || low.includes('ofrecen');
  // Una sola ingeniería nombrada = ir a ficha, no a lista
  const nombreEspecifico = low.includes('civil') || low.includes('industrial') || low.includes('hidráulica') ||
    low.includes('hidraulica') || low.includes('vial') || low.includes('electr') || low.includes('agrimensura') ||
    low.includes('sistemas') || low.includes('matemática') || low.includes('matematica') ||
    low.includes('hidrología') || low.includes('hidrologia') || low.includes('informática') || low.includes('informatica') ||
    low.includes('física') || low.includes('fisica') || low.includes('programador') || low.includes('analista');

  // ── Solo ingenierías ──
  // Ejemplos: "que ingenierias hay", "cuales son las ingenierias", "que carreras de ingenieria tienen",
  //           "ingenieria" solo, "ingenierias disponibles", "que ingenieria puedo estudiar"
  if (tieneIngenieria && !nombreEspecifico && !low.includes('contame') && !low.includes('sobre')) {
    // Si es consulta general O si es solo la palabra "ingenieria/ingenierias"
    if (esConsulta || /^ingenieria[s]?$/.test(low.trim()) || /^ingeniería[s]?$/.test(low.trim())) {
      mostrarSoloIngenierias(txt);
      return true;
    }
  }
  // ── Solo licenciaturas ──
  if (tieneLicenciatura && !nombreEspecifico && !low.includes('contame') && !low.includes('sobre')) {
    if (esConsulta || /^licenciaturas?$/.test(low.trim())) {
      mostrarSoloLicenciaturas(txt);
      return true;
    }
  }
  // ── Solo profesorados ──
  if (tieneProfessorado && !nombreEspecifico && !low.includes('contame') && !low.includes('sobre')) {
    if (esConsulta || /^profesorados?$/.test(low.trim())) {
      mostrarSoloProfessorados(txt);
      return true;
    }
  }
  // ── Lista de grado (todo) ──
  if (low === 'ver carreras de grado' || low === 'carreras de grado' ||
      low === '🎓 ver carreras de grado' || low === '🎓 carreras de grado' ||
      (low.includes('ver') && low.includes('grado') && !low.includes('pregrado')) ||
      (low.includes('mostrar') && low.includes('grado')) ||
      (low.includes('todas') && low.includes('carrera') && !low.includes('pregrado'))) {
    mostrarListaGrado(txt);
    return true;
  }
  // ── Lista de pregrado ──
  if (low === 'carreras de pregrado' || low === 'ver pregrado' ||
      low === '📚 carreras de pregrado' || low === 'pregrado' ||
      (low.includes('pregrado') && (low.includes('ver') || low.includes('mostrar') || low.includes('carrera') || low.includes('qué') || low.includes('cuál') || low.includes('hay'))) ||
      (low.includes('tecnicatura') && !low.includes('contame') && !low.includes('sobre'))) {
    mostrarListaPregrado(txt);
    return true;
  }
  // ── Ficha individual ──
  const ficha = FICHAS_CARRERA.find(f =>
    f.triggers.some(tr => low.includes(tr.toLowerCase()) || normalizado.includes(normalizar(tr)))
  );
  if (ficha) {
    mostrarFichaCarrera(txt, ficha);
    return true;
  }
  return false;
}

async function send(over) {
  const input = document.getElementById('ui');
  const txt = (over || input.value).trim();

  if (!txt || busy) return;

  input.value = '';
  ar(input);
  document.getElementById('qrs').innerHTML = '';
  hideErr();
  ctx.turnos++;

  // Manejo de comandos especiales
  // Normalizar: minúsculas y sin signos de puntuación al inicio/fin para mejor detección
  const low = txt.toLowerCase().replace(/^[¿¡\s]+|[?!\s]+$/g, '').trim();

  // ── FLUJO CARRERAS: filtrado por tipo desde menú ──────────
  if (low === 'ver todas las ingenierías' || low === 'ver todas las ingenierias' ||
      low === 'ver ingenierías' || low === 'ver ingenierias' || low === 'ingenierías' || low === 'ingenierias') {
    mostrarSoloIngenierias(txt);
    return;
  }
  if (low === '💻 ver licenciaturas' || low === 'ver licenciaturas' || low === 'licenciaturas') {
    mostrarSoloLicenciaturas(txt);
    return;
  }
  if (low === '👨‍🏫 ver profesorados' || low === 'ver profesorados' || low === 'profesorados') {
    mostrarSoloProfessorados(txt);
    return;
  }

  // Fix: ignorar mensajes que son sugerencias reflexivas generadas por el propio bot
  if (IGNORE_MSGS.some(p => low.includes(p))) {
    userMsg(txt);
    botMsg('Entendido 😊 ¿Hay algo más en lo que te pueda ayudar?', null, false,
      ['🎓 Ver carreras', '📅 Calendario académico', '📋 Trámites e inscripción']);
    return;
  }

  if ((low.includes('carreras') || low.includes('opciones') || low.includes('quiero saber')) &&
      (low.includes('informática') || low.includes('informatica') || low.includes('sistemas')) &&
      !low.includes('ingeniería en informática') && !low.includes('ingenieria en informatica')) {
    userMsg(txt);
    botMsg(
      '💻 **Carreras de informática en la FCEyT**\n\n' +
      '• **Licenciatura en Sistemas de Información** → 5 años\n' +
      '• **Programador Universitario en Informática** → 2 años\n' +
      '• **Analista Universitario en Sistemas de Información** → 4 años\n' +
      '• **Profesorado en Informática** → 4 años\n\n' +
      'Si querés, te cuento sobre cualquiera de ellas.',
      'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
      true,
      ['Contame sobre Lic. en Sistemas', 'Contame sobre Programador', 'Contame sobre Analista']
    );
    return;
  }

  // Fix: detectar carreras que no existen y corregir sin inventar
  const carreraInexistente = detectarCarreraInexistente(txt);
  if (carreraInexistente) {
    userMsg(txt);
    botMsg(carreraInexistente.respuesta, carreraInexistente.fuente, true, carreraInexistente.sug);
    return;
  }

  if (esConsultaComparacion(txt)) {
    const carrerasDetectadas = detectarCarrerasEnTexto(txt);
    const fichaContexto = ctx.carrera
      ? FICHAS_CARRERA.find(f => f.nombre.toLowerCase() === ctx.carrera.toLowerCase())
      : null;
    const comparables = [...carrerasDetectadas];

    if (fichaContexto && !comparables.some(f => f.nombre === fichaContexto.nombre)) {
      comparables.unshift(fichaContexto);
    }

    if (comparables.length >= 2) {
      const fichaA = comparables[0];
      const fichaB = comparables[1];
      userMsg(txt);
      botMsg(
        construirComparacionCarreras(fichaA, fichaB),
        'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
        true,
        ['¿Cuál tiene más salida laboral?', '¿Qué materias tiene primer año?', '¿Cuál me conviene más?']
      );
      return;
    }

    userMsg(txt);
    botMsg(
      'Puedo compararte dos carreras, pero necesito que me digas cuáles 😊\n\nPor ejemplo: "Licenciatura en Sistemas e Ingeniería Civil".',
      'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
      true,
      ['Lic. en Sistemas e Ing. Civil', 'Ing. Industrial e Ing. Civil', 'Programador y Analista']
    );
    return;
  }

  if (MENUK.some(w => low.includes(w)) || low.includes('volver') || low.includes('inicio')) {
    userMsg(txt);
    resetChat();
    return;
  }

  // ── FLUJO CALENDARIO ACADÉMICO ──────────────────────────

  // 1. El usuario pide info general del calendario
  if (CALENDARIOK.some(k => low.includes(k)) || low === 'calendario' || low === '📅 calendario académico') {
    userMsg(txt);
    botMsg(
      'El Calendario Académico 2026 de la FCEyT fue aprobado por Resolución HCD Nº 005/2026 (4 de marzo de 2026).\n\n' +
      'Datos clave:\n' +
      '· Inicio 1er cuatrimestre: 25/03/2026\n' +
      '· Fin 1er cuatrimestre: 04/07/2026\n' +
      '· Inicio 2do cuatrimestre: 18/08/2026\n' +
      '· Fin 2do cuatrimestre: 28/11/2026\n\n' +
      '¿Qué querés hacer?',
      null, false,
      ['📅 Ver imagen del calendario', '📄 Ver resolución oficial', '🔍 Consultar una fecha específica']
    );
    return;
  }

  // 2. El usuario quiere ver la imagen
  if (low === '📅 ver imagen del calendario' || low.includes('ver imagen del calendario') ||
      low.includes('mostrar imagen') || low === 'imagen del calendario') {
    userMsg(txt);
    mostrarCalendario();
    setQRlist(['¿Cuándo son los exámenes de febrero?', '¿Cuándo empiezan las clases?', '🔍 Consultar una fecha específica']);
    return;
  }

  // 3. El usuario quiere ver el PDF/resolución
  if (low === '📄 ver resolución oficial' || low.includes('ver resolución') ||
      low.includes('ver resolucion') || low.includes('pdf') || low.includes('resolución completa')) {
    userMsg(txt);
    botMsg(
      'Podés descargar la Resolución HCD Nº 005/2026 con el calendario completo desde el sitio oficial.',
      'https://fce.unse.edu.ar/?q=calendario-academico',
      false,
      ['📅 Ver imagen del calendario', '🔍 Consultar una fecha específica', 'Volver al menú']
    );
    return;
  }

  // 4. El usuario quiere consultar una fecha específica
  if (low === '🔍 consultar una fecha específica' || low.includes('fecha específica') ||
      low.includes('fecha especifica')) {
    userMsg(txt);
    botMsg(
      '¿Sobre qué fecha o evento querés consultar?\n\nPor ejemplo podés preguntarme:',
      null, false,
      ['¿Cuándo son los exámenes de julio?', '¿Cuándo empieza el ingreso?', '¿Cuándo me inscribo a materias?']
    );
    return;
  }

  // ── FLUJOS HARDCODED: lista grado, pregrado, ficha individual — VA PRIMERO ──────
  // Si venimos del flujo "quiero ver materias", no dejemos que la ficha de carrera
  // secuestre la respuesta: primero debe correr el flujo de materias.
  if (!ctx.queriaMateria) {
    const hardcodedResult = handleCarreraHardcoded(low, txt);
    if (hardcodedResult) return;
  }

  // ── FLUJO: MATERIAS DE PRIMER AÑO (va ANTES que fichas para respetar el contexto) ──
  if (ctx.queriaMateria || esConsultaMaterias(txt)) {
    ctx.queriaMateria = false;
    const carreraActual = obtenerCarreraActual(txt);
    if (carreraActual) ctx.carrera = carreraActual;
    const carreraCtx = ctx.carrera || '';
    userMsg(txt);

    const queryMaterias = [carreraActual || carreraCtx || '', 'materias primer año'].filter(Boolean).join(' ');
    if (queryMaterias) {
      const respuestaSemilla = await resolverMateriasDesdeSemilla(queryMaterias);
      if (respuestaSemilla) {
        botMsg(
          respuestaSemilla.texto,
          respuestaSemilla.fuente,
          true,
          ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
        );
        return;
      }
    }

    if (carreraCtx.includes('sistemas') || carreraCtx.includes('programador') || carreraCtx.includes('analista')) {
      // Distinguir entre LSI, Programador y Analista — tienen materias diferentes
      if (carreraCtx.includes('programador')) {
        botMsg(
          '🖥️ **Materias de 1er año — Programador Universitario en Informática**\n\n' +
          '**☀️ 1er cuatrimestre**\n' +
          '📐 Elementos de Álgebra _(anual)_\n' +
          '💡 Fundamentos de la Programación\n' +
          '🌐 Inglés I\n' +
          '🔬 Laboratorio I\n' +
          '🧠 Lógica\n\n' +
          '**🍂 2do cuatrimestre**\n' +
          '📐 Elementos de Álgebra _(anual)_\n' +
          '🌐 Inglés II\n' +
          '🔬 Laboratorio II\n' +
          '💻 Programación I\n\n' +
          '🔗 https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
          'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica', true,
          ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
        );
      } else if (carreraCtx.includes('analista')) {
        botMsg(
          '🔍 **Materias de 1er año — Analista Universitario en Sistemas**\n\n' +
          '**☀️ 1er cuatrimestre**\n' +
          '📐 Álgebra y Geometría Analítica\n' +
          '💡 Introducción a la Programación\n' +
          '🖥️ Introducción a los Sistemas de Información\n' +
          '🌐 Inglés Técnico I\n\n' +
          '**🍂 2do cuatrimestre**\n' +
          '📊 Análisis Matemático I\n' +
          '💻 Programación I\n' +
          '🔧 Organización de Computadoras\n' +
          '🌐 Inglés Técnico II\n\n' +
          '🔗 https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
          'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion', true,
          ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
        );
      } else {
        // Licenciatura en Sistemas
        botMsg(
          '💻 **Materias de 1er año — Lic. en Sistemas de Información**\n\n' +
          '**☀️ 1er cuatrimestre**\n' +
          '📐 Álgebra I _(anual)_\n' +
          '💡 Fundamentos de la Programación _(anual)_\n' +
          '🧠 Lógica\n' +
          '📊 Análisis I _(anual)_\n\n' +
          '**🍂 2do cuatrimestre**\n' +
          '📐 Álgebra I _(continúa)_\n' +
          '💡 Fundamentos de la Programación _(continúa)_\n' +
          '📊 Análisis I _(continúa)_\n' +
          '✍️ Taller de Comunicación Técnico-Científica\n\n' +
          '🔗 https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
          'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion', true,
          ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
        );
      }
    } else if (carreraCtx.includes('civil') || carreraCtx.includes('hidráulica') || carreraCtx.includes('vial') ||
               carreraCtx.includes('industrial') || carreraCtx.includes('agrimensura') ||
               carreraCtx.includes('eléctrica') || carreraCtx.includes('electromecánica') ||
               carreraCtx.includes('electrónica')) {
      botMsg(
        '🏗️ **Materias de 1er año — Ingenierías**\n' +
        '_(Tronco común para todas)_\n\n' +
        '**☀️ 1er cuatrimestre**\n' +
        '📐 Álgebra y Geometría Analítica\n' +
        '🧪 Química General\n' +
        '🌐 Inglés Técnico I\n' +
        '⚙️ Introducción a la Ingeniería (específica de cada carrera)\n\n' +
        '**🍂 2do cuatrimestre**\n' +
        '📊 Análisis Matemático I\n' +
        '⚡ Física I (Mecánica)\n' +
        '💻 Informática I\n' +
        '🌐 Inglés Técnico II\n\n' +
        '💡 Algunas carreras suman Dibujo Técnico desde 1er año.\n' +
        '🔗 https://fce.unse.edu.ar',
        'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
        ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
      );
    } else if (carreraCtx.includes('matemática') || carreraCtx.includes('física') || carreraCtx.includes('informática')) {
      botMsg(
        '👨\u200d🏫 **Materias de 1er año — Profesorados**\n\n' +
        '**☀️ 1er cuatrimestre**\n' +
        '📐 Matemática I / Álgebra (según carrera)\n' +
        '⚡ Física I o 💻 Programación I (según carrera)\n' +
        '📖 Pedagogía General\n' +
        '🌐 Inglés Técnico I\n\n' +
        '**🍂 2do cuatrimestre**\n' +
        '📊 Análisis Matemático / Matemática II\n' +
        '🎓 Didáctica General\n' +
        '🧠 Psicología Educacional\n' +
        '📚 Materia disciplinar (Física II / Programación I / Álgebra II)\n\n' +
        '💡 Desde el día 1 combinás materias de tu disciplina con formación pedagógica.',
        'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
        ['¿Qué tan difícil es?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
      );
    } else {
      botMsg(
        '¡Claro! ¿De qué carrera querés ver las materias? 📋',
        null, false,
        ['Licenciatura en sistemas', 'Ingeniería civil', 'Programador universitario en informática']
      );
      // A partir de acá, si el usuario responde con una carrera,
      // mostramos directamente las materias de 1er año según el contexto.
      ctx.queriaMateria = true;
    }
    return;
  }

  // ── FLUJO: "¿QUÉ TAN DIFÍCIL ES?" ──────────────────────
  if (low.includes('difícil') || low.includes('dificil') || low.includes('dificultad') ||
      low.includes('exigente') || low.includes('compleja') || low.includes('cuesta') ||
      low.includes('se puede') || low.includes('es complicad')) {
    const carreraCtx = ctx.carrera || '';
    // Personalizar según tipo de carrera
    let exigenciaTxt = '· **Matemática** desde el primer día — es el núcleo de casi todas las carreras\n' +
      '· Adaptarse al ritmo universitario si venís directo del secundario';
    if (carreraCtx.includes('sistemas') || carreraCtx.includes('licenciatura en sistemas') || carreraCtx.includes('programador') || carreraCtx.includes('analista')) {
      exigenciaTxt = '· **Fundamento de la programación** en 1er año es la desafiantes\n' +
        '· La lógica de programación requiere práctica constante al principio';
    } else if (carreraCtx.includes('profesorado')) {
      exigenciaTxt = '· Combinar las materias disciplinares con las pedagógicas requiere organización\n' +
        '· Las prácticas docentes en los últimos años son muy intensas';
    }
    userMsg(txt);
    botMsg(
      '💪 ¡Es alcanzable! Requiere dedicación, pero estudiantes la terminan cada año.\n\n' +
      exigenciaTxt + '\n\n' +
      '**Lo que te salva 😅:**\n' +
      '· 👥 **Tutorías de Pares**  → https://fce.unse.edu.ar/?q=tutoriasfceyt\n' +
      '· 🤝 La facu tiene muy buen ambiente colaborativo',
      'https://fce.unse.edu.ar/?q=tutoriasfceyt', true,
      ['¿Cómo funcionan las tutorías?', '¿Qué materias tiene primer año?', '¿Cuándo empieza el ingreso?']
    );
    return;
  }

  // ── FLUJO: TUTORÍAS DE PARES ──────────────────────────
  if (low.includes('tutoría') || low.includes('tutoria') || low.includes('tutor') ||
      low.includes('tutorías de pares') || low.includes('apoyo') && low.includes('académ')) {
    userMsg(txt);
    botMsg(
      '👥 **Tutorías de Pares** — son estudiantes avanzados de tu misma carrera que te ayudan **gratis** 🙌\n\n' +
      '· Consultas sobre materias difíciles\n' +
      '· Orientación para adaptarte a la vida universitaria\n' +
      '· Apoyo especial en primer año (cuando más se necesita)\n\n' +
      '🔗 https://fce.unse.edu.ar/?q=tutoriasfceyt\n\n' +
      '¡Es uno de los recursos más copados de la facu, aprovechalo! 😊',
      'https://fce.unse.edu.ar/?q=tutoriasfceyt', true,
      ['¿Qué materias tiene primer año?', '¿Cómo es el ingreso?', '¿Hay becas disponibles?']
    );
    return;
  }

  const consultaInformatica = low.includes('informática') || low.includes('informatica') ||
    low.includes('sistemas') || low.includes('programador') || low.includes('analista');

    // ── FLUJO: DURACIÓN / CUÁL DURA MENOS ────────────────
  if ((low.includes('dura') && (low.includes('menos') || low.includes('corta') || low.includes('poco'))) ||
      low.includes('más corta') || low.includes('mas corta') ||
      (low.includes('cuánto') && low.includes('dura')) ||
      (low.includes('cuanto') && low.includes('dura'))) {
    if (consultaInformatica) {
      userMsg(txt);
      botMsg(
        '💻 **Carreras más cortas de informática en la FCEyT**\n\n' +
        '• **Programador Universitario en Informática** → 2 años\n' +
        '• **Analista Universitario en Sistemas de Información** → 4 años\n' +
        '• **Licenciatura en Sistemas de Información** → 5 años\n' +
        '• **Profesorado en Informática** → 4 años\n\n' +
        'La opción más corta es **Programador Universitario en Informática**.',
        'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
        ['Contame sobre Programador', 'Contame sobre Analista', '¿Las materias cuentan después?']
      );
      return;
    }

    userMsg(txt);
    botMsg(
      '⏱ **Carreras ordenadas por duración** — todas gratuitas\n\n' +
      '**2 años (Pregrado):**\n' +
      '· Programador Universitario en Informática\n' +
      '· Asistente en Sistemas Eléctricos\n' +
      '· Técnico en Hidrología Subterránea\n\n' +
      '**2,5 años (Pregrado):**\n' +
      '· Tecnicatura Universitaria Vial\n' +
      '· Tecnicatura en Construcciones\n' +
      '· Tecnicatura en Topografía\n' +
      '· Técnico en Organización y Control de la Producción\n\n' +
      '**4 años (Pregrado):**\n' +
      '· Analista Universitario en Sistemas de Información\n\n' +
      '**4 años (Grado):**\n' +
      '· Profesorado en Informática, Matemática y Física\n\n' +
      '**5 años (Grado):**\n' +
      '· Todas las Ingenierías y Licenciaturas\n\n' ,
      'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT', true,
      ['¿Qué materias tiene primer año?', '¿Existen carreras de informática?', '¿Cómo me inscribo?']
    );
    return;
  }

      if (IDENTK.some(q => txt.toLowerCase().includes(q))) {
    userMsg(txt);
    botMsg('Soy Exabot, un chatbot automatizado de la FCEyT UNSE 🤖\n\nNo soy una persona. Estoy aquí para ayudarte con info del ingreso, carreras, horarios y trámites.\n\n¿Hay algo que pueda aclarar?', null, true, []);
    setQRlist(['📞 Datos de contacto', '📋 Inscripción', '🎓 Carreras']);
    return;
  }

  // Restricción de dominio: solo consultas de ingresantes del sitio oficial.
  // Evita que el bot responda cosas genéricas fuera de alcance (ej: operaciones matemáticas).
  if (!esConsultaParaIngresantes(txt, low)) {
    userMsg(txt);
    botMsg(
      'No estoy seguro de haber entendido tu consulta del todo 😊\n\n' +
      'Puedo ayudarte con **carreras, materias, ingreso, trámites, fechas, becas y vida estudiantil** de la FCEyT.\n\n' +
      'Si querés, probá reformulándola así:',
      'https://fce.unse.edu.ar/',
      false,
      ['¿Qué materias tiene 1er año?', '¿Cómo me inscribo?', '¿Cuándo empieza el ingreso?']
    );
    return;
  }

  updateCtx(txt);
  userMsg(txt);
  hist.push({ role: 'user', content: txt });

  // Detectar tema para elegir el prompt correcto - Criterio 5: Robustez
  const temaDetectado = detectarTema(txt);
  ctx.tema = temaDetectado;
  ctx.carrera = obtenerCarreraActual(txt) || ctx.carrera;

  // Guardar en BD
  if (!conversacionId) {
    fetch(`${API_URL}/conversaciones/nueva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuarioId })
    })
      .then(r => r.json())
      .then(d => conversacionId = d.conversacion_id)
      .catch(e => console.error('Error creando conversación:', e));
  }

  setBusy(true);
  showTyping();

  try {
    const raw = await callGroqAPI();
    hideTyping();
    const { msg, opts, src, sug } = parse(raw);
    hist.push({ role: 'assistant', content: raw });

    // Guardar mensaje en BD
    if (conversacionId) {
      fetch(`${API_URL}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversacion_id: conversacionId,
          rol: 'assistant',
          contenido: msg,
          fuente_url: src
        })
      }).catch(e => console.error('Error guardando mensaje:', e));
    }

    botMsg(msg, src, true, sug);
    
    // Mostrar botones solo cuando el flujo realmente los necesita.
    // Evitamos llenar la interfaz con sugerencias genéricas en cada respuesta.
    if (opts.length > 0) {
      setQRlist(opts);
    } else if (sug.length > 0) {
      setQRlist(sug);
    }

    // Criterio 13: Aprendizaje - sugerir ayuda después de cierto tiempo
    if (ctx.turnos === 10 ) {
      setTimeout(() => {
        if (!busy) {
          botMsg('¿Cómo vas? ¿Encontraste lo que buscabas? 😊', null, false, []);
          setQRlist(['✅ Sí, gracias', '📋 Ver menú completo', '📞 Contacto']);
        }
      }, 14000);
    }
  } catch (e) {
    hideTyping();
    console.error('Error:', e);
    showError('Error de conexión. Intentá de nuevo en unos segundos.');
    setQRlist(['🔄 Reintentar', '📞 Contacto ']);
  } finally {
    setBusy(false);
  }
}

// ═══════════════════════════════════════════════════════
//  LLAMADA A GROQ API
// ═══════════════════════════════════════════════════════

async function callGroqAPI() {
  if (!GROQ_KEY || GROQ_KEY.length < 10) {
    throw new Error('API key no configurada');
  }

  // Buscar contexto RAG específico para este tema y query
  const ultimaQuery = hist.length > 0 ? hist[hist.length - 1].content : '';
  // Usar la carrera recordada para sostener contexto cuando el usuario no la repite
  const ragQuery = ctx.carrera ? (ctx.carrera + ' ' + ultimaQuery) : ultimaQuery;
  const contextoRAG = await buscarContextoPorTema(ragQuery, ctx.tema || 'general');

  // Guardar contexto RAG para que el prompt lo use
  baseConocimiento = contextoRAG || 'Consultá en https://fce.unse.edu.ar para más información.';

  // Fix: inyectar URL oficial de carrera detectada para evitar que el LLM la invente
  const urlCarreraDetectada = resolverUrlCarrera(ultimaQuery);
  if (urlCarreraDetectada) {
    baseConocimiento = 'URL OFICIAL DE ESTA CARRERA (usa esta exacta): ' + urlCarreraDetectada + '\n\n' + baseConocimiento;
  }

  // Inyectar contexto explícito para que las sugerencias sean coherentes
  if (ctx.carrera) {
    baseConocimiento = 'CONTEXTO ACTUAL: El usuario habla de "' + ctx.carrera + '". '
      + 'Las 3 SUGERENCIAS DEBEN ser preguntas específicas sobre esta carrera. PROHIBIDO sugerir cosas genéricas.\n\n'
      + baseConocimiento;
  } else if (ctx.tema && ctx.tema !== 'general') {
    baseConocimiento = 'CONTEXTO ACTUAL: Tema = "' + ctx.tema + '". '
      + 'Las 3 SUGERENCIAS deben ser continuación lógica de lo que acabás de responder.\n\n'
      + baseConocimiento;
  }

  const systemMsg = generarSystemPrompt(ctx.tema || 'general');

  // Usar un historial un poco más largo para mejorar conservación de contexto
  const histReciente = hist.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.role === 'assistant' ? m.content.substring(0, 200) : m.content.substring(0, 400)
  }));

  const messages = [
    { role: 'system', content: systemMsg },
    ...(ctx.carrera ? [{ role: 'system', content: `Carrera en contexto actual: ${ctx.carrera}. Si la última pregunta es ambigua, respondela sobre esa carrera.` }] : []),
    ...histReciente
  ];

  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 600
    })
  });

  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Fallo en Groq');
  }

  const d = await r.json();
  if (!d.choices || !d.choices[0].message) {
    throw new Error('Sin respuesta de IA');
  }

  return d.choices[0].message.content;
}

// ═══════════════════════════════════════════════════════
//  PARSEO DE RESPUESTA
// ═══════════════════════════════════════════════════════

function parse(raw) {
  let msg = raw, opts = [], src = null, sug = [];

  const SUGS_BLOQUEADAS = [
    'ingresá a la página', 'ingresa a la página', 'buscá la carrera',
    'busca la carrera', 'consultá el sitio web', 'consulta el sitio web',
    'ingresá al sitio', 'ingresa al sitio', 'visitá la página',
    'visita la página', 'consultá con un asesor', 'consulta con un asesor',
    'ingresá a la página oficial', 'ingresa a la página oficial',
    'anotá las respuestas', 'revisá el plan de estudios',
    'revisa el plan de estudios', 'consultá el plan', 'consulta el plan',
    'más información', 'mas información', 'obtené más', 'obtene mas',
    'buscá más', 'busca más', 'navegá', 'navega por'
  ];

  function limpiarSugs(texto) {
    return (texto.match(/[-•]\s*(.+)/g) || [])
      .map(s => s.replace(/^[-•]\s*/, '').trim())
      .map(s => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'))
      .filter(s => s && s.length > 3 && !SUGS_BLOQUEADAS.some(b => s.toLowerCase().includes(b)))
      .slice(0, 3);
  }

  // Extraer fuente
  const sm = raw.match(/FUENTE:\s*(https?:\/\/[^\s\n]+)/i);
  if (sm) {
    src = sm[1];
    msg = msg.replace(sm[0], '').trim();
  }

  // Extraer sugerencias (con o sin la palabra SUGERENCIAS:)
  const sugM = msg.match(/SUGERENCIAS:\s*([\s\S]+?)(?=OPCIONES:|$)/i);
  if (sugM) {
    sug = limpiarSugs(sugM[1]);
    msg = msg.replace(sugM[0], '').trim();
  }

  // Extraer opciones
  const om = msg.match(/OPCIONES:\s*([\s\S]+?)$/i);
  if (om) {
    msg = msg.replace(om[0], '').trim();
    opts = (om[1].match(/[-•]\s*(.+)/g) || [])
      .map(o => o.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  // Si el LLM metió bullets al final del mensaje sin poner "SUGERENCIAS:",
  // detectarlos y sacarlos del cuerpo del mensaje
  if (sug.length === 0) {
    const lines = msg.split('\n');
    const bulletLines = [];
    const contentLines = [];
    let bulletZone = false;
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i].trim();
      if (/^[•\-]\s*.+/.test(l) && l.length < 80) {
        bulletLines.unshift(l);
        bulletZone = true;
      } else if (bulletZone) {
        // Termina la zona de bullets
        contentLines.unshift(...lines.slice(0, i + 1));
        break;
      } else {
        contentLines.unshift(l);
      }
    }
    if (bulletLines.length >= 2) {
      const candidatos = limpiarSugs(bulletLines.join('\n'));
      if (candidatos.length >= 2) {
        sug = candidatos;
        msg = contentLines.join('\n').trim();
      }
    }
  }

  return { msg: msg.trim(), opts, src, sug };
}

// ═══════════════════════════════════════════════════════
//  CONTEXTO DEL USUARIO
// ═══════════════════════════════════════════════════════

function updateCtx(txt) {
  const low = txt.toLowerCase();
  const nm = txt.match(/me llamo ([A-Za-záéíóúñ]+)/i);
  if (nm) ctx.nombre = nm[1];

  const carreraDetectada = obtenerCarreraActual(txt);
  if (carreraDetectada) ctx.carrera = carreraDetectada;

  ctx.frustrado = FRUSTRK.some(f => low.includes(f));
}

// ═══════════════════════════════════════════════════════
//  NAVEGACIÓN DEL CHAT
// ═══════════════════════════════════════════════════════

function startChat() {
  document.getElementById('wo').style.display = 'none';
  //dsep('Hoy');
  //botMsg('¡Hola! Soy Exabot, el asistente virtual de la FCEyT UNSE 👋\n\n¿Sobre qué te puedo ayudar hoy?', null, false, []);
  setQR4();
  
  // Crear nueva conversación
  fetch(`${API_URL}/conversaciones/nueva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId })
  })
    .then(r => r.json())
    .then(d => conversacionId = d.conversacion_id)
    .catch(e => console.error('Error:', e));
}
function startWithTopic(topic) {
    ctx.topic = topic;
    
    // 1. Ocultar la pantalla de bienvenida (Criterio de Navegación)
    const welcomeOverlay = document.getElementById('wo');
    if (welcomeOverlay) welcomeOverlay.style.display = 'none';

    // 2. Definir los datos por categoría (Criterio de Minimalismo y Estructura)
    const data = {
        carreras: {
            msg: '¡Hola! Veo que te interesa la oferta académica 🎓\n\nLa FCEyT tiene muchas opciones — ¿qué tipo de carrera te interesa?',
            sug: ['Ver todas las ingenierías', '💻 Ver licenciaturas', '📚 Carreras de Pregrado', '👨‍🏫 Ver profesorados']
        },
        horarios: {
            msg: '¡Hola! Para ayudarte con horarios y fechas 📅\n\n¿Qué información necesitás?',
            sug: ['¿Cuándo abren las inscripciones?', '¿Cuándo empieza el Ingreso?', '¿Calendario académico?']
        },
        vida: {
            msg: '¡Hola! Me alegra que quieras conocer la vida en la FCEyT 🏛️\n\n¿Sobre qué querés saber?',
            sug: ['¿Hay becas para estudiantes?', '¿Qué servicios tiene la facultad?', 'Actividades extracurriculares']
        },
        tramites: {
            msg: '¡Hola! Te puedo ayudar con trámites y consultas 📋\n\n¿Qué necesitás resolver?',
            sug: ['Requisitos de inscripción', '¿Cómo uso el SIU Guaraní?', '¿Dónde queda Alumnado?']
        }
    };

    const d = data[topic];
    if (d) {
        // 3. Crear la conversación en la BD antes de mandar el mensaje
        fetch(`${API_URL}/conversaciones/nueva`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioId })
        })
        .then(r => r.json())
        .then(res => {
            conversacionId = res.conversacion_id;
            
            // 4. Mandar el mensaje al chat una vez que tenemos el ID
            botMsg(d.msg, null, false, d.sug);
            
            // 5. Forzar los botones específicos de la categoría abajo
            setQRlist(d.sug);
        })
        .catch(e => {
            console.error('Error al iniciar conversación:', e);
            // Si falla la BD, igual mostramos el mensaje para no trabar al usuario
            botMsg(d.msg, null, false, d.sug);
            setQRlist(d.sug);
        });
    }
}
function resetChat() {
  hist = [];
  ctx = {
    nombre: null,
    carrera: null,
    queriaMateria: false,
    frustrado: false,
    turnos: 0,
    modoOscuro: ctx.modoOscuro,
    idioma: ctx.idioma,
    topic: null
  };
  conversacionId = null;
  document.getElementById('msgs').innerHTML = '';
  document.getElementById('qrs').innerHTML = '';
  hideErr();
  dsep('Reiniciada');
  botMsg('Conversación reiniciada 🔄 ¿En qué te puedo ayudar?', null, false, []);
  setQR4();
}

// ═══════════════════════════════════════════════════════
//  UTILIDADES
// ═══════════════════════════════════════════════════════

function showNotification(msg) {
  alert(msg);
}

function showError(msg) {
  const err = document.getElementById('err');
  err.textContent = '⚠️ ' + msg;
  err.style.display = 'block';
}

function hideErr() {
  document.getElementById('err').style.display = 'none';
}

function hk(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function ar(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\_(.+?)\_/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br>$1')
    .replace(/^<br>/, '')
    .replace(/https?:\/\/[^\s<"]+/g, function(url) {
      var label = url.replace('https://', '').replace('http://', '');
      if (label.length > 45) label = label.substring(0, 42) + '...';
      return '<a href="' + url + '" target="_blank" rel="noopener" style="color:var(--color-text-info);text-decoration:underline;word-break:break-all">' + label + '</a>';
    });
}

function ts() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function sc() {
  const m = document.getElementById('msgs');
  setTimeout(() => m.scrollTop = m.scrollHeight, 60);
}

// Hacer funciones globales para HTML
window.send = send;
window.resetChat = resetChat;
window.startChat = startChat;
window.startWithTopic = startWithTopic;
window.eliminarDocumento = eliminarDocumento;
window.subirPDF = subirPDF;
window.guardarDocumento = guardarDocumento;
window.guardarPreferencias = guardarPreferencias;
