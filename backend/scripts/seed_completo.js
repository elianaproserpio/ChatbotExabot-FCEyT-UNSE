/**
 * ══════════════════════════════════════════════════════════
 *  EXABOT - SEED COMPLETO v2
 *  Incluye: carreras con links, ingreso, tips, FAQ
 *  Ejecutar desde la carpeta backend/:
 *    node scripts/seed_completo.js
 * ══════════════════════════════════════════════════════════
 */

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, '../../data/exabot.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ No se pudo conectar a la BD:', err.message);
    console.error('   Corré primero "npm start" para crear la BD.');
    process.exit(1);
  }
  console.log('✓ BD conectada');
});

// ══════════════════════════════════════════════════════════
//  DOCUMENTOS
// ══════════════════════════════════════════════════════════

const documentos = [

  // ─────────────────────────────────────────────────────
  //  1. RESUMEN GENERAL
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Oferta Académica FCEyT - Resumen General',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Oferta Académica - Facultad de Ciencias Exactas y Tecnologías (FCEyT) - UNSE
Sitio oficial: https://fce.unse.edu.ar

CARRERAS DE GRADO - INGENIERÍAS (5 años):
- Ingeniería Civil → https://fce.unse.edu.ar/?q=ingenieria-civil
- Ingeniería Electromecánica → https://fce.unse.edu.ar/?q=ingenieria-electromecanica
- Ingeniería Electrónica → https://fce.unse.edu.ar/?q=ingenieria-electronica
- Ingeniería Eléctrica → https://fce.unse.edu.ar/?q=ingenieria-electrica
- Ingeniería en Agrimensura → https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura
- Ingeniería Hidráulica → https://fce.unse.edu.ar/?q=ingenieria-hidraulica
- Ingeniería Industrial → https://fce.unse.edu.ar/?q=ingenieria-industrial
- Ingeniería Vial → https://fce.unse.edu.ar/?q=ingenieria-vial

CARRERAS DE GRADO - LICENCIATURAS (4-5 años):
- Licenciatura en Sistemas de Información → https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion
- Licenciatura en Matemática → https://fce.unse.edu.ar/?q=lic-en-matematica
- Licenciatura en Matemática (Ciclo de Complementación) → https://fce.unse.edu.ar/?q=lic-en-matematica-cc
- Licenciatura en Hidrología Subterránea → https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea

CARRERAS DE GRADO - PROFESORADOS (4 años):
- Profesorado en Física → https://fce.unse.edu.ar/?q=profesorado-en-fisica
- Profesorado en Informática → https://fce.unse.edu.ar/?q=profesorado-en-informatica
- Profesorado en Matemática → https://fce.unse.edu.ar/?q=profesorado-en-matematica

CARRERAS DE PRE-GRADO (2-3 años):
- Programador Universitario en Informática → https://fce.unse.edu.ar/?q=programador-universitario-en-informatica
- Analista Universitario en Sistemas de Información → https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion
- Asistente Universitario en Sistemas Eléctricos → https://fce.unse.edu.ar/?q=Asistente-Universitario-en-Sistemas-Electricos
- Tecnicatura Universitaria Vial → https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial
- Tecnicatura Universitaria en Construcciones → https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion
- Tecnicatura Universitaria en Topografía → https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia
- Técnico Universitario en Hidrología Subterránea → https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea
- Técnico Universitario en Organización y Control de la Producción → https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion

IMPORTANTE: La FCEyT es una universidad pública y gratuita. No hay aranceles ni cuotas para las carreras de grado y pregrado.
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  2. INGENIERÍAS - DETALLE CON LINKS
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Ingenierías - Detalle y links',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Carreras de Ingeniería - FCEyT UNSE
Duración: 5 años | Título: Ingeniero/a | Gratuitas

INGENIERÍA CIVIL
Perfil: diseño y construcción de obras civiles, edificios, puentes, rutas, diques.
Salida laboral: empresas constructoras, organismos públicos, Vialidad, consultoras.
Más info: https://fce.unse.edu.ar/?q=ingenieria-civil

INGENIERÍA ELECTROMECÁNICA
Perfil: integración de sistemas eléctricos y mecánicos, automatización industrial.
Salida laboral: industrias, plantas de energía, empresas de servicios técnicos.
Más info: https://fce.unse.edu.ar/?q=ingenieria-electromecanica

INGENIERÍA ELECTRÓNICA
Perfil: diseño de sistemas electrónicos, telecomunicaciones, instrumentación y control.
Salida laboral: telecomunicaciones, industria electrónica, I+D.
Más info: https://fce.unse.edu.ar/?q=ingenieria-electronica

INGENIERÍA ELÉCTRICA
Perfil: generación, transmisión y distribución de energía eléctrica.
Salida laboral: empresas de energía, distribuidoras eléctricas, industrias.
Más info: https://fce.unse.edu.ar/?q=ingenieria-electrica

INGENIERÍA EN AGRIMENSURA
Perfil: mensura de tierras, catastro, geodesia, cartografía y ordenamiento territorial.
Salida laboral: escribanías, municipios, organismos catastrales.
Más info: https://fce.unse.edu.ar/?q=ingenieria-en-agrimensura

INGENIERÍA HIDRÁULICA
Perfil: aprovechamiento y gestión del agua, diseño de sistemas de riego, obras hidráulicas.
Salida laboral: CONICET, INTA, organismos de cuencas, consultoras ambientales.
Más info: https://fce.unse.edu.ar/?q=ingenieria-hidraulica

INGENIERÍA INDUSTRIAL
Perfil: optimización de procesos productivos, gestión de calidad, logística y operaciones.
Salida laboral: industrias manufactureras, pymes, consultoras de procesos.
Más info: https://fce.unse.edu.ar/?q=ingenieria-industrial

INGENIERÍA VIAL
Perfil: diseño, construcción y mantenimiento de caminos, autopistas y obras viales.
Salida laboral: Vialidad Nacional, Vialidad Provincial, empresas constructoras viales.
Más info: https://fce.unse.edu.ar/?q=ingenieria-vial
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  3. LICENCIATURAS Y PROFESORADOS - DETALLE CON LINKS
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Licenciaturas y Profesorados - Detalle y links',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Licenciaturas y Profesorados - FCEyT UNSE | Gratuitas

LICENCIATURA EN SISTEMAS DE INFORMACIÓN
Duración: 5 años
Perfil: análisis, diseño y gestión de sistemas informáticos, bases de datos, desarrollo de software.
Salida laboral: empresas de software, áreas de IT, organismos públicos.
Más info: https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion

LICENCIATURA EN MATEMÁTICA
Duración: 5 años
Perfil: matemática pura y aplicada, investigación, docencia, modelado matemático.
Salida laboral: universidades, CONICET, organismos de investigación.
Más info: https://fce.unse.edu.ar/?q=lic-en-matematica

LICENCIATURA EN MATEMÁTICA - CICLO DE COMPLEMENTACIÓN
Para graduados de profesorados en Matemática que quieran el título de licenciado.
Más info: https://fce.unse.edu.ar/?q=lic-en-matematica-cc

LICENCIATURA EN HIDROLOGÍA SUBTERRÁNEA
Duración: 5 años
Perfil: gestión de aguas subterráneas, hidrogeología, manejo de acuíferos.
Salida laboral: CONICET, organismos provinciales de agua, consultoras ambientales.
Más info: https://fce.unse.edu.ar/?q=licenciatura-en-hidrologia-subterranea

PROFESORADO EN FÍSICA
Duración: 4 años | Docencia en física nivel secundario y terciario.
Más info: https://fce.unse.edu.ar/?q=profesorado-en-fisica

PROFESORADO EN INFORMÁTICA
Duración: 4 años | Docencia en informática y tecnología nivel secundario y terciario.
Más info: https://fce.unse.edu.ar/?q=profesorado-en-informatica

PROFESORADO EN MATEMÁTICA
Duración: 4 años | Docencia en matemática nivel secundario y terciario.
Más info: https://fce.unse.edu.ar/?q=profesorado-en-matematica
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  4. PRE-GRADO - DETALLE CON LINKS
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Carreras de Pre-Grado - Detalle y links',
    tipo: 'oferta_academica',
    fuente_url: 'https://fce.unse.edu.ar/?q=Oferta_Academica_FCEyT',
    contenido: `
Carreras de Pre-Grado - FCEyT UNSE
Duración: 2 a 3 años | Título universitario oficial | Gratuitas
Ventaja: son el primer tramo de las carreras de grado, las materias se reconocen.

PROGRAMADOR UNIVERSITARIO EN INFORMÁTICA
Duración: 2 años | Primer ciclo de la Licenciatura en Sistemas de Información.
Perfil: programación, desarrollo web, algorítmica, bases de datos básicas.
Más info: https://fce.unse.edu.ar/?q=programador-universitario-en-informatica

ANALISTA UNIVERSITARIO EN SISTEMAS DE INFORMACIÓN
Duración: 3 años | Segundo ciclo de la Licenciatura en Sistemas de Información.
Perfil: análisis de sistemas, gestión de proyectos informáticos, bases de datos.
Más info: https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion

ASISTENTE UNIVERSITARIO EN SISTEMAS ELÉCTRICOS
Duración: 2 años | Primer ciclo de Ingeniería Eléctrica o Electromecánica.
Más info: https://fce.unse.edu.ar/?q=Asistente-Universitario-en-Sistemas-Electricos

TECNICATURA UNIVERSITARIA VIAL
Duración: 2 años y medio | Primer ciclo de Ingeniería Vial.
Más info: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-vial

TECNICATURA UNIVERSITARIA EN CONSTRUCCIONES
Duración: 2 años y medio | Primer ciclo de Ingeniería Civil.
Más info: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-construccion

TECNICATURA UNIVERSITARIA EN TOPOGRAFÍA
Duración: 2 años y medio | Primer ciclo de Ingeniería en Agrimensura.
Más info: https://fce.unse.edu.ar/?q=Tecnicatura-Universitaria-en-Topografia

TÉCNICO UNIVERSITARIO EN HIDROLOGÍA SUBTERRÁNEA
Duración: 2 años | Primer ciclo de Licenciatura en Hidrología Subterránea.
Más info: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-hidrologia-subterranea

TÉCNICO UNIVERSITARIO EN ORGANIZACIÓN Y CONTROL DE LA PRODUCCIÓN
Duración: 2 años y medio | Primer ciclo de Ingeniería Industrial.
Más info: https://fce.unse.edu.ar/?q=tecnicatura-universitaria-en-organizacion-y-control-de-la-produccion
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  5. INGRESO Y REQUISITOS
  // ─────────────────────────────────────────────────────
  {
    nombre: 'Ingreso FCEyT 2026 - Requisitos y pasos',
    tipo: 'ingreso',
    fuente_url: 'https://fce.unse.edu.ar/?q=ingreso',
    contenido: `
Ingreso 2026 - Facultad de Ciencias Exactas y Tecnologías (FCEyT) UNSE
Más info oficial: https://fce.unse.edu.ar/?q=ingreso

PASOS PARA INSCRIBIRSE:

1. PREINSCRIPCIÓN en el SIU Guaraní
   - Entrá a: https://autogestion.guarani.unse.edu.ar/unse/acceso
   - Creá tu usuario si no tenés uno
   - Seleccioná la carrera que querés cursar
   - Completá tus datos personales
   - Período habitual: noviembre-diciembre del año anterior

2. DOCUMENTACIÓN requerida
   - DNI original y fotocopia
   - Título secundario original y fotocopia (o constancia de título en trámite)
   - Partida de nacimiento
   - Foto carnet (4x4)
   - Llevar todo a la Dirección de Alumnos de la FCEyT

3. CICLO COMÚN DE ARTICULACIÓN (Ingreso / Nivelación)
   - Es obligatorio para todas las carreras de grado e ingeniería
   - NO es eliminatorio: no te quedás afuera si no lo aprobás
   - Se cursa en febrero-marzo antes de empezar primer año
   - Materias habituales: Matemática, Química, Física (según carrera)
   - Más info: https://fce.unse.edu.ar/?q=ciclo-comun-de-articulacion-en-carreras-en-ingenieria

4. INICIO DE CLASES
   - Habitualmente en marzo
   - Las fechas exactas se publican en el calendario académico

DIRECCIÓN Y CONTACTO:
- Facultad de Ciencias Exactas y Tecnologías - UNSE
- Avda. Belgrano (Sud) N° 1912, Santiago del Estero
- Email: apyc-fce@unse.edu.ar

TIPS PARA INGRESANTES:
✓ La UNSE es pública y gratuita. No hay aranceles ni cuotas.
✓ Podés empezar con una tecnicatura (2 años) y después seguir con la ingeniería completa.
✓ Las materias que aprobás en la tecnicatura se reconocen en la ingeniería.
✓ Hay becas disponibles para estudiantes. Consultá en: https://fce.unse.edu.ar/?q=becas-alumnos
✓ El sistema de tutorías de pares te ayuda durante el primer año: https://fce.unse.edu.ar/?q=tutoriasfceyt
✓ Si trabajás, consultá los horarios de cursado antes de inscribirte (hay comisiones de mañana, tarde y a veces noche).
✓ Los horarios actualizados están en el SIU Guaraní: https://autogestion.guarani.unse.edu.ar/unse/acceso
    `.trim()
  },

  // ─────────────────────────────────────────────────────
  //  6. FAQ INGRESANTES
  // ─────────────────────────────────────────────────────
  {
    nombre: 'FAQ Ingresantes FCEyT',
    tipo: 'faq',
    fuente_url: 'https://fce.unse.edu.ar/?q=ingreso',
    contenido: `
Preguntas frecuentes de ingresantes - FCEyT UNSE

P: ¿Hay que pagar para estudiar en la FCEyT?
R: No. La FCEyT forma parte de la UNSE que es una universidad pública nacional y gratuita. No hay aranceles, cuotas, ni ningún costo para estudiar. Solo algunos materiales de estudio corren por cuenta del estudiante.

P: ¿Qué necesito para anotarme a una carrera?
R: DNI, título secundario (o constancia de título en trámite), partida de nacimiento y foto carnet. La inscripción se hace primero en el SIU Guaraní (online) y después presencialmente en la Dirección de Alumnos.


P: ¿Puedo empezar con una tecnicatura y después hacer la ingeniería?
R: Sí. Las tecnicaturas articulan directamente con las ingenierías. Las materias que aprobás se reconocen y no tenés que volver a cursarlas.

P: ¿Qué carrera de sistemas hay?
R: Hay tres niveles articulados:
   - Programador Universitario en Informática (2 años) → https://fce.unse.edu.ar/?q=programador-universitario-en-informatica
   - Analista Universitario en Sistemas (3 años) → https://fce.unse.edu.ar/?q=Analista-en-Sistemas-de-Informacion
   - Licenciatura en Sistemas de Información (5 años) → https://fce.unse.edu.ar/?q=licenciatura-en-sistemas-de-informacion


P: ¿Hay becas?
R: Sí. Podés consultar las becas disponibles en: https://fce.unse.edu.ar/?q=becas-alumnos

P: ¿Dónde queda la facultad?
R: Avda. Belgrano (Sud) N° 1912, Santiago del Estero capital.

P: ¿Cómo me anoto en el SIU Guaraní?
R: Entrá a https://autogestion.guarani.unse.edu.ar/unse/acceso, creá tu usuario con tu DNI y seguí los pasos para preinscribirte en la carrera que elegiste.

P: ¿Hay tutorías o ayuda para primer año?
R: Sí, hay un sistema de Tutorías de Pares donde estudiantes avanzados te ayudan durante el primer año. Más info: https://fce.unse.edu.ar/?q=tutoriasfceyt
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
      if (err) { console.error(`  ❌ Error: "${doc.nombre}":`, err.message); reject(err); }
      else { console.log(`  ✓ "${doc.nombre}" → ID ${this.lastID}`); resolve(); }
    });
  });
}

async function main() {
  console.log('\n🚀 Iniciando carga de datos FCEyT...\n');

  await new Promise((res, rej) => {
    db.run(`DELETE FROM documentos WHERE tipo IN ('oferta_academica','ingreso','faq')`,
      (err) => err ? rej(err) : res());
  });
  console.log('🗑  Documentos anteriores eliminados.\n');

  for (const doc of documentos) {
    await insertar(doc);
  }

  console.log(`\n✅ Carga completada. ${documentos.length} documentos insertados.`);
  console.log('   El bot ahora tiene info de carreras, ingreso, requisitos y FAQ.\n');
  db.close();
}

main().catch(err => { console.error('Error:', err); db.close(); process.exit(1); });
