/**
 * EXABOT - SYNC HORARIOS desde Google Sheets CSV
 * Lee la hoja DATOS_BOT publicada como CSV y actualiza la BD
 * Ejecutar: node scripts/sync_horarios.js
 */

const axios   = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH   = path.join(__dirname, '../../data/exabot.db');
const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSN4ZYySlFH5WpcsR57Lt9PMn6r4qy-O0kzxo2EhIjHePVYMIJDae4b7cyGXQHawLa4qf1KWJC2Gbnb/pub?output=csv';

const NOMBRES_CARRERA = {
  'LSI':'Licenciatura en Sistemas de Información',
  'PUI':'Programador Universitario en Informática',
  'PI': 'Profesorado en Informática',
  'IC': 'Ingeniería Civil',
  'IH': 'Ingeniería Hidráulica',
  'IV': 'Ingeniería Vial',
  'II': 'Ingeniería Industrial',
  'IA': 'Ingeniería en Agrimensura',
  'IE1':'Ingeniería Eléctrica',
  'IE2':'Ingeniería Electromecánica',
  'IE3':'Ingeniería Electrónica',
  'LM': 'Licenciatura en Matemática',
  'PM': 'Profesorado en Matemática',
  'PF': 'Profesorado en Física',
  'LHS':'Licenciatura en Hidrología Subterránea',
  'TUHS':'Técnico Universitario en Hidrología Subterránea',
  'TUV':'Tecnicatura Universitaria Vial',
  'TUC':'Tecnicatura Universitaria en Construcciones',
  'TUOyCP':'Técnico en Organización y Control de la Producción',
};

function parsearCSV(texto) {
  const lineas = texto.trim().split('\n');
  if (lineas.length < 2) return [];
  const headers = lineas[0].split(',').map(h => h.trim().replace(/\r/g,''));
  return lineas.slice(1).map(linea => {
    const valores = [];
    let enComillas = false, actual = '';
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      if (c === '"') { enComillas = !enComillas; }
      else if (c === ',' && !enComillas) { valores.push(actual.trim().replace(/\r/g,'')); actual = ''; }
      else { actual += c; }
    }
    valores.push(actual.trim().replace(/\r/g,''));
    const obj = {};
    headers.forEach((h,i) => { obj[h] = valores[i] || ''; });
    return obj;
  }).filter(row => row.carrera && row.materia && row.dia);
}

function generarDocumentos(filas) {
  const porCarrera = {};
  filas.forEach(fila => {
    const sigla = fila.carrera.trim();
    if (!porCarrera[sigla]) porCarrera[sigla] = {};
    const mat = fila.materia.trim();
    if (!porCarrera[sigla][mat]) porCarrera[sigla][mat] = [];
    porCarrera[sigla][mat].push(fila);
  });

  return Object.entries(porCarrera).map(([sigla, materias]) => {
    const nombre = NOMBRES_CARRERA[sigla] || sigla;
    let contenido = `Horarios 1er Cuatrimestre 2026 - ${nombre}\n`;
    contenido += `Fuente: Planilla oficial FCEyT\n`;
    contenido += `IMPORTANTE: sujeto a modificaciones. Verificá en https://docs.google.com/spreadsheets/d/1jLf9CjNGt6zwFbL3tYSAiYplVnR3tqI5/edit?gid=1371653553#gid=1371653553\n\n`;

    for (const [materia, clases] of Object.entries(materias)) {
      contenido += `━━ ${materia} ━━\n`;
      const porCom = {};
      clases.forEach(c => {
        const com = c.comision || 'Única';
        if (!porCom[com]) porCom[com] = [];
        porCom[com].push(c);
      });
      for (const [com, cls] of Object.entries(porCom)) {
        if (com !== 'Única') contenido += `  [${com}]\n`;
        cls.forEach(c => {
          contenido += `  ${c.dia} ${c.hora_inicio}-${c.hora_fin}`;
          if (c.tipo) contenido += ` | ${c.tipo}`;
          if (c.aula) contenido += ` | ${c.aula}`;
          if (c.docente) contenido += ` | ${c.docente}`;
          contenido += '\n';
        });
      }
      contenido += '\n';
    }

    return {
      nombre: `Horarios ${nombre} - 1er Cuatrimestre 2026`,
      tipo: 'horarios',
      fuente_url: 'https://autogestion.guarani.unse.edu.ar/unse/acceso',
      contenido: contenido.trim()
    };
  });
}

async function sincronizarHorarios() {
  console.log('[HORARIOS] Sincronizando desde Google Sheets...');
  const db = new sqlite3.Database(DB_PATH);

  try {
    const resp = await axios.get(SHEET_CSV, { timeout: 15000 });
    const filas = parsearCSV(resp.data);
    console.log(`[HORARIOS] ${filas.length} filas descargadas`);

    if (filas.length === 0) {
      db.close();
      return { ok: false, mensaje: 'Sin datos' };
    }

    await new Promise((res,rej) => db.run(
      `DELETE FROM documentos WHERE tipo = 'horarios'`,
      err => err ? rej(err) : res()
    ));

    const docs = generarDocumentos(filas);
    let insertados = 0;

    for (const doc of docs) {
      await new Promise((res,rej) => {
        db.run(
          `INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url) VALUES (?,?,?,?)`,
          [doc.nombre, doc.contenido, doc.tipo, doc.fuente_url],
          function(err) {
            if (err) { console.error(`  ❌ ${doc.nombre}:`, err.message); rej(err); }
            else { console.log(`  ✓ "${doc.nombre}" → ID ${this.lastID}`); insertados++; res(); }
          }
        );
      });
    }

    console.log(`[HORARIOS] ✅ ${insertados} documentos cargados (${filas.length} filas, ${docs.length} carreras)`);
    db.close();
    return { ok: true, insertados, carreras: docs.length };

  } catch (error) {
    console.error('[HORARIOS] Error:', error.message);
    db.close();
    return { ok: false, error: error.message };
  }
}

module.exports = { sincronizarHorarios };

if (require.main === module) {
  sincronizarHorarios().then(r => {
    if (r.ok) console.log(`\n✅ Listo. ${r.carreras} carreras cargadas.\n`);
    else console.log('\n❌ Error:', r.error || r.mensaje);
    process.exit(0);
  });
}
