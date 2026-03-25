const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/exabot.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, nombre, tipo, fuente_url, substr(contenido,1,80) as preview FROM documentos', [], (err, rows) => {
  if (err) {
    console.error('Error leyendo documentos:', err);
    process.exit(1);
  }
  console.log('Documentos en BD:', rows.length);
  rows.forEach(r => {
    console.log(`- [${r.id}] ${r.nombre} (${r.tipo || 'texto'}) - fuente: ${r.fuente_url || 'sin fuente'}`);
    console.log(`  preview: ${r.preview}`);
  });
  db.close();
});
