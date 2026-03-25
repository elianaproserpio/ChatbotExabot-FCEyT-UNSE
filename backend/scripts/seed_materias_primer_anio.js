/**
 * ══════════════════════════════════════════════════════════
 *  EXABOT - SEED MATERIAS PRIMER AÑO
 *  Fuente: planes de estudio vigentes FCEyT UNSE
 *  Ejecutar: node scripts/seed_materias_primer_anio.js
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

  {
    nombre: 'Materias 1er año - Licenciatura en Sistemas de Información',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
    contenido: `
Materias de Primer Año - Licenciatura en Sistemas de Información (LSI)
FCEyT - UNSE | Plan de estudios vigente

1ER AÑO - 
PRIMER CUATRIMESTRE:
1. Álgebra I(Anual)
2. Fundamentos de la programación (Anual)
3. Logica
4. Analisis (Anual)

SEGUNDO CUATRIMESTRE:
1. Algebra I (anual)
2. Fundamentos de la Programación (Anual)
4. Análisis I (anual)
8. 	Taller de Comunicación Técnico-Científica



Plan de estudios completo:
https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion

Inscripción: SIU Guaraní → https://autogestion.guarani.unse.edu.ar/unse/acceso
    `.trim()
  },

  {
    nombre: 'Materias 1er año - Programador Universitario en Informática',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
    contenido: `
Materias de Primer Año - Programador Universitario en Informática (PUI)
FCEyT - UNSE | Carrera de Pregrado (2 años)

PRIMER CUATRIMESTRE:
1. 	ELEMENTOS DE ÁLGEBRA (Anual)
2. FUNDAMENTOS DE LA PROGRAMACIÓN
3. INGLÉS I
4. LABORATORIO I
5. LOGICA

SEGUNDO CUATRIMESTRE:
1. ELEMENTOS DE ÁLGEBRA (Anual)
6. INGLÉS II
7. LABORATORIO II
8. PROGRAMACION I


Plan completo: https://fce.unse.edu.ar/?q=programador-universitario-en-informatica
    `.trim()
  },

  {
    nombre: 'Materias 1er año - Ingenierías (tronco común)',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Materias de Primer Año - Ingenierías FCEyT UNSE
Todas las ingenierías comparten un tronco común en primer año.

PRIMER CUATRIMESTRE (común):
1. Álgebra y Geometría Analítica
2. Química General
3. Introducción a la Ingeniería (según carrera)
4. Inglés Técnico I

SEGUNDO CUATRIMESTRE (común):
5. Análisis Matemático I
6. Física I (Mecánica)
7. Informática I
8. Inglés Técnico II

MATERIAS ESPECÍFICAS POR INGENIERÍA:
- Civil: Dibujo Técnico y CAD → https://fce.unse.edu.ar/?q=ingenieria-civil
- Vial: Dibujo Técnico → https://fce.unse.edu.ar/?q=ingenieria-vial
- Industrial: Intro. Ingeniería Industrial → https://fce.unse.edu.ar/?q=ingenieria-industrial
- Eléctrica/Electromecánica/Electrónica: Intro. Ingeniería Eléctrica → https://fce.unse.edu.ar/?q=ingenieria-electrica
- Agrimensura: Dibujo Técnico + Topografía I → https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura
- Hidráulica: Intro. Hidrología → https://fce.unse.edu.ar/?q=ingenieria-hidraulica

CONSEJO: El primer año tiene alta exigencia en matemática y física.
Las tutorías de pares ayudan mucho.
Tutorías: https://fce.unse.edu.ar/?q=tutoriasfceyt
    `.trim()
  },

  {
    nombre: 'Materias 1er año - Profesorados (Informática, Matemática, Física)',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Materias de Primer Año - Profesorados FCEyT UNSE

PROFESORADO EN INFORMÁTICA
1er cuatrimestre: Matemática I, Introducción a la Programación, Pedagogía General, Inglés Técnico I
2do cuatrimestre: Matemática II, Programación I, Didáctica General, Psicología Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-informatica

PROFESORADO EN MATEMÁTICA
1er cuatrimestre: Álgebra I, Análisis Matemático I, Pedagogía General, Inglés Técnico I
2do cuatrimestre: Álgebra II, Análisis Matemático II, Didáctica General, Psicología Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-matematica

PROFESORADO EN FÍSICA
1er cuatrimestre: Álgebra y Geometría Analítica, Física I, Pedagogía General, Inglés Técnico I
2do cuatrimestre: Análisis Matemático I, Física II, Didáctica General, Psicología Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-fisica

DATO CLAVE: Los profesorados tienen materias pedagógicas desde primer año
(Pedagogía, Psicología, Didáctica) que los diferencian de licenciaturas e ingenierías.
    `.trim()
  },

  {
    nombre: 'Materias 1er año - Analista Universitario en Sistemas',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
    contenido: `
Materias de Primer Año - Analista Universitario en Sistemas de Información
FCEyT - UNSE | Carrera de Pregrado (3 años)

1ER AÑO - 
PRIMER CUATRIMESTRE:
1. Álgebra I(Anual)
2. Fundamentos de la programación (Anual)
3. Logica
4. Analisis (Anual)

SEGUNDO CUATRIMESTRE:
1. Algebra I (anual)
2. Fundamentos de la Programación (Anual)
4. Análisis I (anual)
8. 	Taller de Comunicación Técnico-Científica


Plan completo: https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion
    `.trim()
  },

  {
    nombre: 'FAQ - Materias y planes de estudio FCEyT',
    tipo: 'faq',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Preguntas frecuentes sobre materias y planes de estudio - FCEyT UNSE


P: ¿Qué materias tiene primer año de Ingeniería Civil?
R: Tronco común: Álgebra, Química General, Inglés Técnico I (1er cuatrimestre); Análisis Matemático I, Física I, Informática I, Inglés Técnico II (2do cuatrimestre). Civil suma Dibujo Técnico y CAD.

P: ¿Son difíciles las materias de primer año?
R: El primer año incluye matemática, física y química que requieren dedicación. Pero las tutorías de pares te pueden ayudar: https://fce.unse.edu.ar/?q=tutoriasfceyt


P: ¿Dónde veo el plan de estudios completo de mi carrera?
R: En el sitio oficial de la FCEyT. Por ejemplo para Sistemas: https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion
    `.trim()
  },
];

function insertar(doc) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url) VALUES (?, ?, ?, ?)`;
    db.run(sql, [doc.nombre, doc.contenido, doc.tipo, doc.fuente_url], function(err) {
      if (err) { console.error(`  ❌ "${doc.nombre}":`, err.message); reject(err); }
      else      { console.log(`  ✓ "${doc.nombre}" → ID ${this.lastID}`); resolve(); }
    });
  });
}

async function main() {
  console.log('\n🚀 Cargando materias de primer año...\n');
  await new Promise((res, rej) => {
    db.run(`DELETE FROM documentos WHERE tipo = 'plan_estudios'`,
      err => err ? rej(err) : res());
  });
  console.log('🗑  Documentos de plan_estudios anteriores eliminados.\n');
  for (const doc of documentos) await insertar(doc);
  console.log(`\n✅ Listo. ${documentos.length} documentos cargados.\n`);
  db.close();
}

main().catch(err => { console.error('Error:', err); db.close(); process.exit(1); });
