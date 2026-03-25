/**
 * ══════════════════════════════════════════════════════════
 *  EXABOT - SEED CALENDARIO ACADÉMICO 2026
 *  Fuente: Resolución HCD Nº 005/2026 - FCEyT UNSE
 *  Ejecutar: node scripts/seed_calendario.js
 * ══════════════════════════════════════════════════════════
 */

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, '../../data/exabot.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ No se pudo conectar a la BD:', err.message);
    process.exit(1);
  }
  console.log('✓ BD conectada');
});

const documentos = [

  // ─────────────────────────────────────────────────────
  //  1. CALENDARIO COMPLETO 2026
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Calendario Académico 2026 - FCEyT UNSE',
    tipo: 'calendario',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
CALENDARIO ACADÉMICO 2026 - FCEyT UNSE
Resolución HCD Nº 005/2026
Fuente oficial: https://fce.unse.edu.ar/?q=calendario-academico

FECHAS GENERALES:
- Inicio de actividades de la Facultad: 09/02/2026
- Inicio de actividades académicas: 09/02/2026
- Cierre de actividades académicas: 21/12/2026
- Finalización de actividades de la Facultad: 29/12/2026

CURSO DE INGRESO TRADICIONAL (Nivelación):
- Período: 02/02/2026 al 20/03/2026

PRIMER CUATRIMESTRE:
- Inicio de clases: 25/03/2026
- Finalización de clases: 04/07/2026

SEGUNDO CUATRIMESTRE:
- Inicio de clases: 18/08/2026
- Finalización de clases: 28/11/2026

RECESO INVERNAL:
- Del 20/07/2026 al 31/07/2026
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  2. TURNOS DE EXÁMENES 2026
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Turnos de Exámenes 2026 - FCEyT UNSE',
    tipo: 'calendario',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
TURNOS DE EXÁMENES 2026 - FCEyT UNSE
Resolución HCD Nº 005/2026

TURNO ORDINARIO FEBRERO-MARZO 2026:
- Período total: 09/02/2026 al 13/03/2026
- 1er llamado: 09/02/2026 al 13/02/2026
- 2do llamado: 23/02/2026 al 27/02/2026
- 3er llamado: 09/03/2026 al 13/03/2026

CIERRE AÑO ACADÉMICO 2025 (sin exámenes ni inscripciones):
- 18/03/2026 al 20/03/2026

TURNO EXTRAORDINARIO MAYO 2026 (sin suspensión de clases):
- 04/05/2026 al 08/05/2026
- Inscripción para aprobados: 11/05/2026 al 15/05/2026

MESAS ESPECIALES DE EXAMEN:
- Primera convocatoria: 06/04/2026 y 10/04/2026
- Segunda convocatoria: 08/06/2026 al 12/06/2026
- Tercera convocatoria: 05/10/2026 y 09/10/2026 / 02/11/2026 y 06/11/2026
(Solo para alumnos que cumplen requisitos del Art. 27 del Reglamento General de Estudiantes)

TURNO ORDINARIO JULIO-AGOSTO 2026:
- Período total: 13/07/2026 al 14/08/2026
- 1er llamado: 13/07/2026 al 17/07/2026
- Receso invernal: 20/07/2026 al 31/07/2026
- 2do llamado: 03/08/2026 al 07/08/2026
- 3er llamado: 10/08/2026 al 14/08/2026

TURNO EXTRAORDINARIO SEPTIEMBRE 2026 (sin suspensión de clases):
- 07/09/2026 al 11/09/2026
- Inscripción para aprobados: 14/09/2026 al 18/09/2026

TURNO ORDINARIO NOVIEMBRE-DICIEMBRE 2026:
- Período total: 30/11/2026 al 18/12/2026
- 1er llamado: 30/11/2026 al 04/12/2026
- 2do llamado: 09/12/2026 al 11/12/2026
- 3er llamado: 14/12/2026 al 18/12/2026

TURNO ORDINARIO FEBRERO-MARZO 2027 (cierre año 2026):
- Período total: 10/02/2027 al 12/03/2027
- 1er llamado: 10/02/2027 al 12/02/2027
- 2do llamado: 22/02/2027 al 26/02/2027
- 3er llamado: 08/03/2027 al 12/03/2027
- Cierre año académico 2026: 17/03/2027 al 19/03/2027
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  3. INSCRIPCIONES Y TRÁMITES 2026
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Inscripciones y trámites académicos 2026 - FCEyT',
    tipo: 'calendario',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
INSCRIPCIONES Y TRÁMITES ACADÉMICOS 2026 - FCEyT UNSE

REINSCRIPCIÓN E INSCRIPCIÓN EN MATERIAS (1er cuatrimestre y anuales):
- Del 25/03/2026 al 10/04/2026
- Sistema: SIU Guaraní → https://autogestion.guarani.unse.edu.ar/unse/acceso

REINSCRIPCIÓN E INSCRIPCIÓN EN MATERIAS (2do cuatrimestre):
- Del 18/08/2026 al 21/08/2026
- Sistema: SIU Guaraní → https://autogestion.guarani.unse.edu.ar/unse/acceso

INSCRIPCIÓN CONCURSOS AYUDANTES DE SEGUNDA ESTUDIANTIL:
- 25/03/2026 al 27/03/2026

SUSTANCIACIÓN CONCURSOS AYUDANTES DE SEGUNDA ESTUDIANTIL:
- 01/04/2026 al 06/04/2026

INICIO PREINSCRIPCIÓN INGRESANTES 2027:
- 30/11/2026

INICIO DE ACTIVIDADES FACULTAD 2027:
- 01/02/2027

INICIO ACTIVIDADES ACADÉMICAS 2027:
- 10/02/2027
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  4. FERIADOS Y DÍAS NO LABORABLES 2026
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Feriados y días no laborables 2026 - FCEyT UNSE',
    tipo: 'calendario',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
FERIADOS Y DÍAS NO LABORABLES 2026 - FCEyT UNSE
Resolución HCD Nº 005/2026

- 01/01/2026 (Jueves): Año Nuevo
- 16/02/2026 (Lunes) y 17/02/2026 (Martes): Carnaval
- 23/03/2026 (Lunes): Día no laborable con fines turísticos
- 24/03/2026 (Martes): Día Nacional de la Memoria por la Verdad y la Justicia
- 02/04/2026 (Jueves): Día del Veterano y los Caídos en Malvinas
- 03/04/2026 (Viernes): Viernes Santo
- 27/04/2026 (Lunes): Día de la Autonomía Provincial
- 01/05/2026 (Viernes): Día del Trabajador
- 10/05/2026 (Domingo): Aniversario Creación de la UNSE
- 25/05/2026 (Lunes): Aniversario Revolución de Mayo
- 15/06/2026 (Lunes): Paso a la Inmortalidad del Gral. Martín de Güemes (feriado trasladado del 17/6)
- 20/06/2026 (Sábado): Paso a la Inmortalidad del Gral. Manuel Belgrano
- 09/07/2026 (Jueves): Día de la Independencia
- 10/07/2026 (Viernes): Día no laborable con fines turísticos
- 25/07/2026 (Sábado): Aniversario Fundación de Santiago del Estero
- 17/08/2026 (Lunes): Paso a la Inmortalidad del Gral. José de San Martín
- 17/09/2026 (Jueves): Día del Profesor
- 21/09/2026 (Lunes): Día del Estudiante
- 12/10/2026 (Lunes): Día del Respeto a la Diversidad Cultural
- 23/11/2026 (Lunes): Día de la Soberanía Nacional (trasladado del 20/11)
- 26/11/2026 (Jueves): Día del Trabajador de las Universidades Nacionales
- 07/12/2026 (Lunes): Día no laborable con fines turísticos
- 08/12/2026 (Martes): Día de la Inmaculada Concepción de María
- 25/12/2026 (Viernes): Navidad
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  5. ACTOS ACADÉMICOS Y COLACIONES 2026
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Actos académicos y colaciones 2026 - FCEyT UNSE',
    tipo: 'calendario',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
ACTOS ACADÉMICOS DE RELEVANCIA 2026 - FCEyT UNSE

- 11/05/2026 (Lunes): Acto Aniversario UNSE
- 16/05/2026 (Viernes): 112° Acto Académico de Colación de Grado (Facultades)
- 11/09/2026 (Viernes): 113° Acto Académico de Colación de Grado (Facultades)
- 16/10/2026 (Viernes): 33° Acto Académico de Colación de Postgrado
- 27/11/2026 (Viernes): 114° Acto Académico de Colación de Grado (Facultades)

Las colaciones son las ceremonias de entrega de títulos a los graduados.
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  6. FAQ CALENDARIO
  // ─────────────────────────────────────────────────────
  {
    nombre: 'FAQ Calendario y fechas 2026 - FCEyT',
    tipo: 'faq',
    fuente_url: 'https://fce.unse.edu.ar/?q=calendario-academico',
    contenido: `
Preguntas frecuentes sobre fechas y calendario - FCEyT UNSE 2026

P: ¿Cuándo empiezan las clases en 2026?
R: Las clases del primer cuatrimestre empiezan el 25/03/2026. Las del segundo cuatrimestre el 18/08/2026.

P: ¿Cuándo termina el primer cuatrimestre?
R: El 04/07/2026.

P: ¿Cuándo termina el segundo cuatrimestre?
R: El 28/11/2026.

P: ¿Cuándo son los exámenes de febrero-marzo?
R: Del 09/02/2026 al 13/03/2026. Hay tres llamados: 1ro del 9 al 13 de febrero, 2do del 23 al 27 de febrero, 3ro del 9 al 13 de marzo.

P: ¿Cuándo son los exámenes de julio-agosto?
R: Del 13/07/2026 al 14/08/2026. Hay tres llamados: 1ro del 13 al 17 de julio, 2do del 3 al 7 de agosto, 3ro del 10 al 14 de agosto.

P: ¿Cuándo son los exámenes de noviembre-diciembre?
R: Del 30/11/2026 al 18/12/2026. Hay tres llamados: 1ro del 30/11 al 4/12, 2do del 9 al 11/12, 3ro del 14 al 18/12.

P: ¿Cuándo es el receso invernal?
R: Del 20/07/2026 al 31/07/2026.

P: ¿Cuándo me inscribo a materias del primer cuatrimestre?
R: Del 25/03/2026 al 10/04/2026 en el SIU Guaraní: https://autogestion.guarani.unse.edu.ar/unse/acceso

P: ¿Cuándo me inscribo a materias del segundo cuatrimestre?
R: Del 18/08/2026 al 21/08/2026 en el SIU Guaraní: https://autogestion.guarani.unse.edu.ar/unse/acceso

P: ¿Cuándo es el ingreso o nivelación 2026?
R: Del 02/02/2026 al 20/03/2026.

P: ¿Cuándo empieza la preinscripción para ingresantes 2027?
R: El 30/11/2026.

P: ¿El Día del Estudiante hay clases?
R: No, el 21 de septiembre es feriado (Día del Estudiante).

P: ¿Hay turnos extraordinarios de exámenes?
R: Sí. Turno extraordinario de mayo: 04/05 al 08/05/2026. Turno extraordinario de septiembre: 07/09 al 11/09/2026. Ambos sin suspensión de clases.

P: ¿Qué son las mesas especiales de examen?
R: Son mesas para alumnos que cumplen requisitos especiales del Art. 27 del Reglamento General de Estudiantes. No suspenden clases. Hay tres convocatorias: 06/04 y 10/04, 08/06 al 12/06, y 05/10 y 09/10 / 02/11 y 06/11.
    `.trim()
  }
];

// ══════════════════════════════════════════════════════════
//  INSERCIÓN
// ══════════════════════════════════════════════════════════

function insertar(doc) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url) VALUES (?, ?, ?, ?)`;
    db.run(sql, [doc.nombre, doc.contenido, doc.tipo, doc.fuente_url], function(err) {
      if (err) { console.error(`  ❌ "${doc.nombre}":`, err.message); reject(err); }
      else { console.log(`  ✓ "${doc.nombre}" → ID ${this.lastID}`); resolve(); }
    });
  });
}

async function main() {
  console.log('\n🚀 Cargando Calendario Académico 2026...\n');

  await new Promise((res, rej) => {
    db.run(`DELETE FROM documentos WHERE tipo IN ('calendario')`,
      (err) => err ? rej(err) : res());
  });
  console.log('🗑  Documentos de calendario anteriores eliminados.\n');

  for (const doc of documentos) {
    await insertar(doc);
  }

  console.log(`\n✅ Listo. ${documentos.length} documentos de calendario cargados.`);
  console.log('   El bot ahora puede responder sobre fechas, exámenes y feriados 2026.\n');
  db.close();
}

main().catch(err => { console.error('Error:', err); db.close(); process.exit(1); });
