/**
 * ══════════════════════════════════════════════════════════
 *  EXABOT - SEED: Oferta Académica FCEyT UNSE
 *  Ejecutar desde la carpeta del backend:
 *    node seed_oferta_academica.js
 * ══════════════════════════════════════════════════════════
 */

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

// Ajustá la ruta si tu estructura de carpetas es diferente
const DB_PATH = path.join(__dirname, '../../data/exabot.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ No se pudo conectar a la BD:', err.message);
    console.error('   Verificá que el backend haya corrido al menos una vez para crear la BD.');
    process.exit(1);
  }
  console.log('✓ BD conectada:', DB_PATH);
});

// ══════════════════════════════════════════════════════════
//  DOCUMENTOS A CARGAR
//  Cada objeto se guarda como una fila en la tabla "documentos"
// ══════════════════════════════════════════════════════════

const documentos = [

  // ──────────────────────────────────────────────────────
  //  1. RESUMEN GENERAL DE OFERTA
  // ──────────────────────────────────────────────────────
  {
    nombre: 'Oferta Académica FCEyT - Resumen General',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Oferta Académica - Facultad de Ciencias Exactas y Tecnologías (FCEyT) - UNSE

La FCEyT ofrece carreras en cuatro niveles: Pre-Grado, Grado, Posgrado y Doctorado.

CARRERAS DE GRADO - INGENIERÍAS (5 años):
- Ingeniería Civil
- Ingeniería Electromecánica
- Ingeniería Electrónica
- Ingeniería Eléctrica
- Ingeniería en Agrimensura
- Ingeniería Hidráulica
- Ingeniería Industrial
- Ingeniería Vial

CARRERAS DE GRADO - LICENCIATURAS (4-5 años):
- Licenciatura en Sistemas de Información
- Licenciatura en Matemática
- Licenciatura en Matemática (Ciclo de Complementación)
- Licenciatura en Hidrología Subterránea

CARRERAS DE GRADO - PROFESORADOS (4 años):
- Profesorado en Física
- Profesorado en Informática
- Profesorado en Matemática

CARRERAS DE PRE-GRADO (2-3 años):
- Programador Universitario en Informática
- Analista Universitario en Sistemas de Información
- Asistente Universitario en Sistemas Eléctricos
- Tecnicatura Universitaria Vial
- Tecnicatura Universitaria en Construcciones
- Tecnicatura Universitaria en Topografía
- Técnico Universitario en Hidrología Subterránea
- Técnico Universitario en Organización y Control de la Producción



Para más información sobre cada carrera, visitá https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT
    `.trim()
  },

  // ──────────────────────────────────────────────────────
  //  2. INGENIERÍAS - DETALLE
  // ──────────────────────────────────────────────────────
  {
    nombre: 'Carreras de Grado - Ingenierías',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Carreras de Ingeniería - FCEyT UNSE
Nivel: Grado universitario
Duración: 5 años (plan de estudios vigente)
Título: Ingeniero/a en la especialidad correspondiente

─────────────────────────────────────────
INGENIERÍA CIVIL
- Perfil: diseño, construcción y mantenimiento de obras civiles (edificios, puentes, rutas, diques).
- Salida laboral: empresas constructoras, organismos públicos, consultoras, obras viales e hidráulicas.
- URL: https://fce.unse.edu.ar/?q=ingenieria-civil

INGENIERÍA ELECTROMECÁNICA
- Perfil: integración de sistemas eléctricos y mecánicos; mantenimiento industrial, automatización.
- Salida laboral: industrias, plantas de generación de energía, empresas de servicios.
- URL: https://fce.unse.edu.ar/?q=ingenieria-electromecanica

INGENIERÍA ELECTRÓNICA
- Perfil: diseño de sistemas electrónicos, telecomunicaciones, instrumentación y control.
- Salida laboral: telecomunicaciones, industria electrónica, I+D, organismos de control.
- URL: https://fce.unse.edu.ar/?q=ingenieria-electronica

INGENIERÍA ELÉCTRICA
- Perfil: generación, transmisión y distribución de energía eléctrica; instalaciones eléctricas.
- Salida laboral: empresas de energía, ENRE, distribuidoras eléctricas, industrias.
- URL: https://fce.unse.edu.ar/?q=ingenieria-electrica

INGENIERÍA EN AGRIMENSURA
- Perfil: mensura de tierras, catastro, geodesia, cartografía y ordenamiento territorial.
- Salida laboral: escribanías, municipios, obras civiles, organismos catastrales.
- URL: https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura

INGENIERÍA HIDRÁULICA
- Perfil: aprovechamiento y gestión del agua, diseño de sistemas de riego, obras hidráulicas.
- Salida laboral: CONICET, INTA, organismos de cuencas, consultoras hídrico-ambientales.
- URL: https://fce.unse.edu.ar/?q=ingenieria-hidraulica

INGENIERÍA INDUSTRIAL
- Perfil: optimización de procesos productivos, gestión de calidad, logística y operaciones.
- Salida laboral: industrias manufactureras, pymes, consultoras de procesos, organismos públicos.
- URL: https://fce.unse.edu.ar/?q=ingenieria-industrial

INGENIERÍA VIAL
- Perfil: diseño, construcción y mantenimiento de caminos, autopistas y obras viales.
- Salida laboral: Vialidad Nacional, Vialidad Provincial, empresas constructoras viales.
- URL: https://fce.unse.edu.ar/?q=ingenieria-vial
    `.trim()
  },

  // ──────────────────────────────────────────────────────
  //  3. LICENCIATURAS Y PROFESORADOS - DETALLE
  // ──────────────────────────────────────────────────────
  {
    nombre: 'Carreras de Grado - Licenciaturas y Profesorados',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Licenciaturas y Profesorados - FCEyT UNSE
Nivel: Grado universitario
Duración: 4 a 5 años según carrera

─────────────────────────────────────────
LICENCIATURA EN SISTEMAS DE INFORMACIÓN
- Duración: 5 años
- Perfil: análisis, diseño y gestión de sistemas informáticos, bases de datos, desarrollo de software.
- Salida laboral: empresas de software, áreas de IT, organismos públicos, docencia universitaria.
- URL: https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion

LICENCIATURA EN MATEMÁTICA
- Duración: 5 años
- Perfil: matemática pura y aplicada, investigación, docencia, modelado matemático.
- Salida laboral: universidades, CONICET, organismos de investigación, industria.
- URL: https://fce.unse.edu.ar/?q=lic-en-matematica

LICENCIATURA EN MATEMÁTICA (Ciclo de Complementación)
- Para graduados de profesorados en Matemática que quieran obtener el título de licenciado.
- URL: https://fce.unse.edu.ar/?q=lic-en-matematica-cc

LICENCIATURA EN HIDROLOGÍA SUBTERRÁNEA
- Duración: 5 años
- Perfil: estudio y gestión de aguas subterráneas, hidrogeología, manejo de acuíferos.
- Salida laboral: CONICET, organismos provinciales de agua, consultoras ambientales.
- URL: https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea

─────────────────────────────────────────
PROFESORADO EN FÍSICA
- Duración: 4 años
- Perfil: docencia en física para niveles secundario y terciario.
- URL: https://fce.unse.edu.ar/?q=profesorado-en-fisica

PROFESORADO EN INFORMÁTICA
- Duración: 4 años
- Perfil: docencia en informática y tecnología para niveles secundario y terciario.
- URL: https://fce.unse.edu.ar/?q=profesorado-en-informatica

PROFESORADO EN MATEMÁTICA
- Duración: 4 años
- Perfil: docencia en matemática para niveles secundario y terciario.
- URL: https://fce.unse.edu.ar/?q=profesorado-en-matematica
    `.trim()
  },

  // ──────────────────────────────────────────────────────
  //  4. PRE-GRADO - DETALLE
  // ──────────────────────────────────────────────────────
  {
    nombre: 'Carreras de Pre-Grado',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Carreras de Pre-Grado - FCEyT UNSE
Nivel: Universitario no-graduado
Duración: 2 a 3 años
Ventaja: Rapida salida laboral

─────────────────────────────────────────
PROGRAMADOR UNIVERSITARIO EN INFORMÁTICA
- Duración: 2 años
- Perfil: programación, desarrollo web y de aplicaciones, algorítmica.
- URL: https://fce.unse.edu.ar/?q=programador-universitario-en-informatica

ANALISTA UNIVERSITARIO EN SISTEMAS DE INFORMACIÓN
- Duración: 3 años
- Perfil: análisis de sistemas, bases de datos, gestión de proyectos informáticos.
- URL: https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion

ASISTENTE UNIVERSITARIO EN SISTEMAS ELÉCTRICOS
- Duración: 2 años
- Perfil: instalaciones eléctricas, mantenimiento de sistemas eléctricos básicos.
- URL: https://fce.unse.edu.ar/?q=Asistente-Universitario-en-Sistemas-Electricos

TECNICATURA UNIVERSITARIA VIAL
- Duración: 2 años y medio
- Perfil: construcción y mantenimiento de obras viales básicas.
- URL: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial

TECNICATURA UNIVERSITARIA EN CONSTRUCCIONES
- Duración: 2 años y medio
- Perfil: dirección y control de obras de construcción civil.
- URL: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion

TECNICATURA UNIVERSITARIA EN TOPOGRAFÍA
- Duración: 2 años y medio
- Perfil: levantamientos topográficos, cartografía, uso de instrumental de medición.
- URL: https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia

TÉCNICO UNIVERSITARIO EN HIDROLOGÍA SUBTERRÁNEA
- Duración: 2 años
- Perfil: relevamiento y análisis básico de recursos hídricos subterráneos.
- URL: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea

TÉCNICO UNIVERSITARIO EN ORGANIZACIÓN Y CONTROL DE LA PRODUCCIÓN
- Duración: 2 años y medio
- Perfil: gestión de producción, control de calidad, logística básica.
- URL: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion
    `.trim()
  },

  // ──────────────────────────────────────────────────────
  //  5. PREGUNTAS FRECUENTES - OFERTA ACADÉMICA
  // ──────────────────────────────────────────────────────
  {
    nombre: 'FAQ - Preguntas frecuentes sobre carreras FCEyT',
    tipo: 'faq',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Preguntas frecuentes sobre carreras - FCEyT UNSE

P: ¿Cuántas carreras tiene la FCEyT?
R: La FCEyT ofrece más de 25 carreras entre pre-grado, grado y posgrado. En grado hay 8 ingenierías, 4 licenciaturas y 3 profesorados.

P: ¿Qué carrera dura menos?
R: Las tecnicaturas y el Programador Universitario duran entre 2 y 3 años. Son las más cortas y dan título oficial.

P: ¿Qué carrera de informática hay?
R: Hay tres opciones en el área de sistemas/informática:
   - Programador Universitario en Informática (2 años, pre-grado)
   - Analista Universitario en Sistemas de Información (3 años, pre-grado)
   - Licenciatura en Sistemas de Información (5 años, grado)
   -Profesorado en Informática (4 años, grado, para ser docente)

P: ¿Hay carreras de noche?
R: Depende de los horarios de clase de cada materia. Consultá los horarios actualizados en http://docs.google.com/spreadsheets/d/1jLf9CjNGt6zwFbL3tYSAiYplVnR3tqI5/edit?gid=1371653553#gid=1371653553 


P: ¿Hay ingreso eliminatorio?
R: No hay examen eliminatorio. El ingreso es a través del Ciclo Común de Articulación (nivelación), que es obligatorio pero no elimina.


P: ¿La FCEyT tiene posgrados?
R: Sí. Hay maestrías, especializaciones y doctorado en Ciencia y Tecnología. Ver detalles en https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT

    `.trim()
  }
];

// ══════════════════════════════════════════════════════════
//  FUNCIÓN DE INSERCIÓN
// ══════════════════════════════════════════════════════════

function insertarDocumento(doc) {
  return new Promise((resolve, reject) => {
    // Usamos INSERT OR REPLACE para no duplicar si se vuelve a correr el script
    const sql = `
      INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [doc.nombre, doc.contenido, doc.tipo, doc.fuente_url], function (err) {
      if (err) {
        console.error(`  ❌ Error insertando "${doc.nombre}":`, err.message);
        reject(err);
      } else {
        console.log(`  ✓ "${doc.nombre}" → ID ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

// ══════════════════════════════════════════════════════════
//  EJECUCIÓN
// ══════════════════════════════════════════════════════════

async function main() {
  console.log('\n🚀 Iniciando carga de oferta académica FCEyT...\n');

  // Opcional: borrar documentos viejos del mismo tipo para empezar limpio
  await new Promise((res, rej) => {
    db.run(
      `DELETE FROM documentos WHERE tipo IN ('oferta_academica', 'faq')`,
      (err) => err ? rej(err) : res()
    );
  });
  console.log('🗑  Documentos anteriores de tipo oferta_academica/faq eliminados.\n');

  for (const doc of documentos) {
    await insertarDocumento(doc);
  }

  console.log(`\n✅ Carga completada. ${documentos.length} documentos insertados.`);
  console.log('   Ahora el bot puede responder preguntas sobre carreras de la FCEyT.\n');

  db.close();
}

main().catch((err) => {
  console.error('Error general:', err);
  db.close();
  process.exit(1);
});
