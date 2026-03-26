/**
 * ============================================================
 *  EXABOT - SEED MATERIAS PRIMER ANIO
 *  Fuente: planes de estudio vigentes FCEyT UNSE
 *  Ejecutar: node scripts/seed_materias_primer_anio.js
 * ============================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/exabot.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('No se pudo conectar a la BD:', err.message);
    process.exit(1);
  }
  console.log('BD conectada');
});

const documentos = [
  {
    nombre: 'Materias 1er ano - Licenciatura en Sistemas de Informacion',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion',
    contenido: `
Materias de Primer Ano - Licenciatura en Sistemas de Informacion (LSI)
FCEyT - UNSE | Plan de estudios vigente

PRIMER CUATRIMESTRE:
1. Algebra I (Anual)
2. Fundamentos de la Programacion (Anual)
3. Logica
4. Analisis I (Anual)

SEGUNDO CUATRIMESTRE:
1. Algebra I (Anual)
2. Fundamentos de la Programacion (Anual)
3. Analisis I (Anual)
4. Taller de Comunicacion Tecnico-Cientifica

DATO CLAVE:
La LSI combina desde primer año matematica, logica y bases de programacion.

Plan de estudios completo:
https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion

Inscripcion: SIU Guarani -> https://autogestion.guarani.unse.edu.ar/unse/acceso
    `.trim()
  },
  {
    nombre: 'Materias 1er ano - Programador Universitario en Informatica',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=programador-universitario-en-informatica',
    contenido: `
Materias de Primer Ano - Programador Universitario en Informatica (PUI)
FCEyT - UNSE | Carrera de Pregrado (2 anos)

PRIMER CUATRIMESTRE:
1. Elementos de Algebra (Anual)
2. Fundamentos de la Programacion
3. Ingles I
4. Laboratorio I
5. Logica

SEGUNDO CUATRIMESTRE:
1. Elementos de Algebra (Anual)
2. Ingles II
3. Laboratorio II
4. Programacion I

Plan completo:
https://fce.unse.edu.ar/?q=programador-universitario-en-informatica
    `.trim()
  },
  {
    nombre: 'Materias 1er ano - Ingenierias (tronco comun)',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Materias de Primer Ano - Ingenierias FCEyT UNSE
Todas las ingenierias comparten un tronco comun en primer ano.

PRIMER CUATRIMESTRE (comun):
1. Algebra y Geometria Analitica
2. Quimica General
3. Introduccion a la Ingenieria (segun carrera)
4. Ingles Tecnico I

SEGUNDO CUATRIMESTRE (comun):
5. Analisis Matematico I
6. Fisica I (Mecanica)
7. Informatica I
8. Ingles Tecnico II

MATERIAS ESPECIFICAS POR INGENIERIA:
- Civil: Dibujo Tecnico y CAD -> https://fce.unse.edu.ar/?q=ingenieria-civil
- Vial: Dibujo Tecnico -> https://fce.unse.edu.ar/?q=ingenieria-vial
- Industrial: Intro. Ingenieria Industrial -> https://fce.unse.edu.ar/?q=ingenieria-industrial
- Electrica/Electromecanica/Electronica: Intro. Ingenieria Electrica -> https://fce.unse.edu.ar/?q=ingenieria-electrica
- Agrimensura: Dibujo Tecnico + Topografia I -> https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura
- Hidraulica: Intro. Hidrologia -> https://fce.unse.edu.ar/?q=ingenieria-hidraulica

CONSEJO:
El primer ano tiene alta exigencia en matematica y fisica.
Tutorias: https://fce.unse.edu.ar/?q=tutoriasfceyt
    `.trim()
  },
  {
    nombre: 'Materias 1er ano - Profesorados (Informatica, Matematica, Fisica)',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Materias de Primer Ano - Profesorados FCEyT UNSE

PROFESORADO EN INFORMATICA
1er cuatrimestre: Matematica I, Introduccion a la Programacion, Pedagogia General, Ingles Tecnico I
2do cuatrimestre: Matematica II, Programacion I, Didactica General, Psicologia Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-informatica

PROFESORADO EN MATEMATICA
1er cuatrimestre: Algebra I, Analisis Matematico I, Pedagogia General, Ingles Tecnico I
2do cuatrimestre: Algebra II, Analisis Matematico II, Didactica General, Psicologia Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-matematica

PROFESORADO EN FISICA
1er cuatrimestre: Algebra y Geometria Analitica, Fisica I, Pedagogia General, Ingles Tecnico I
2do cuatrimestre: Analisis Matematico I, Fisica II, Didactica General, Psicologia Educacional
Plan: https://fce.unse.edu.ar/?q=profesorado-en-fisica

DATO CLAVE:
Los profesorados tienen materias pedagogicas desde primer ano.
    `.trim()
  },
  {
    nombre: 'Materias 1er ano - Analista Universitario en Sistemas',
    tipo: 'plan_estudios',
    fuente_url: 'https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion',
    contenido: `
Materias de Primer Ano - Analista Universitario en Sistemas de Informacion
FCEyT - UNSE | Carrera de Pregrado (4 anos)

PRIMER CUATRIMESTRE:
1. Algebra y Geometria Analitica
2. Introduccion a la Programacion
3. Introduccion a los Sistemas de Informacion
4. Ingles Tecnico I

SEGUNDO CUATRIMESTRE:
1. Analisis Matematico I
2. Programacion I
3. Organizacion de Computadoras
4. Ingles Tecnico II

DATO CLAVE:
En Analista, el primer ano arranca con programacion y sistemas de informacion desde el inicio.

Plan completo:
https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion
    `.trim()
  },
  {
    nombre: 'FAQ - Materias y planes de estudio FCEyT',
    tipo: 'faq',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Preguntas frecuentes sobre materias y planes de estudio - FCEyT UNSE

P: Que materias tiene primer ano de Ingenieria Civil?
R: Tronco comun: Algebra, Quimica General, Ingles Tecnico I (1er cuatrimestre); Analisis Matematico I, Fisica I, Informatica I, Ingles Tecnico II (2do cuatrimestre). Civil suma Dibujo Tecnico y CAD.

P: Son dificiles las materias de primer ano?
R: El primer ano incluye matematica, fisica y quimica que requieren dedicacion. Pero las tutorias de pares te pueden ayudar: https://fce.unse.edu.ar/?q=tutoriasfceyt

P: Donde veo el plan de estudios completo de mi carrera?
R: En el sitio oficial de la FCEyT. Por ejemplo para Sistemas: https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion
    `.trim()
  }
];

function insertar(doc) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url) VALUES (?, ?, ?, ?)`;
    db.run(sql, [doc.nombre, doc.contenido, doc.tipo, doc.fuente_url], function(err) {
      if (err) {
        console.error(`"${doc.nombre}":`, err.message);
        reject(err);
      } else {
        console.log(`"${doc.nombre}" -> ID ${this.lastID}`);
        resolve();
      }
    });
  });
}

async function main() {
  console.log('\nCargando materias de primer ano...\n');
  await new Promise((res, rej) => {
    db.run(`DELETE FROM documentos WHERE tipo = 'plan_estudios'`, err => err ? rej(err) : res());
  });
  console.log('Documentos de plan_estudios anteriores eliminados.\n');
  for (const doc of documentos) await insertar(doc);
  console.log(`\nListo. ${documentos.length} documentos cargados.\n`);
  db.close();
}

main().catch(err => {
  console.error('Error:', err);
  db.close();
  process.exit(1);
});
