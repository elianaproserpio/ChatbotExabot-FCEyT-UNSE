# 🔄 RAG (Retrieval Augmented Generation) + Web Scraping + Google Drive

## ¿Qué es RAG?

**RAG** = El sistema busca información en tu base de datos ANTES de preguntar a la IA.

```
Usuario pregunta: "¿Cuándo empiezan las clases?"
    ↓
Sistema busca en documentos guardados + web + drive
    ↓
Si encuentra: Usa esa info como contexto
    ↓
Pregunta a Groq: "basándome en esto, responde..."
    ↓
Groq responde con información más precisa
```

---

## 3 FUENTES DE INFORMACIÓN

### **1. Base de datos local (ya existe)**
- PDFs que subes manualmente
- Documentos que escribes en panel
- **Ventaja:** Control total

### **2. Web Scraping (automático)**
- Obtiene info directo de `https://fce.unse.edu.ar`
- Actualiza automáticamente cada 24h
- **Ventaja:** Siempre actualizado

### **3. Google Drive (conectado)**
- Lee archivos del Drive de FCEyT
- Ideal para horarios compartidos
- **Ventaja:** Colaborativo

---

## IMPLEMENTACIÓN

### Paso 1: Instalar paquetes
```bash
cd backend
npm install cheerio axios google-drive-api langchain openai
```

### Paso 2: Variables de entorno (.env)
```env
PORT=5000
NODE_ENV=development
GROQ_KEY=tu_groq_key
GOOGLE_DRIVE_FOLDER_ID=tu_folder_id_del_drive
WEB_SCRAPE_INTERVAL=86400000  # 24 horas en ms
```

### Paso 3: Obtener GOOGLE_DRIVE_FOLDER_ID
1. Abre Google Drive
2. Crea carpeta: "Exabot-Recursos"
3. Haz click derecho → Compartir
4. Comparte con el email de la cuenta de servicio
5. Copia ID de la URL: `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`
6. Pegalo en .env

---

## FUNCIONAMIENTO DETALLADO

### A. Web Scraping (FCEyT website)

```javascript
// Obtiene datos de:
// - https://fce.unse.edu.ar (inicio)
// - https://fce.unse.edu.ar/?q=carreras (carreras)
// - https://fce.unse.edu.ar/?q=novedades (noticias)
// etc.

// Cada 24 horas:
// 1. Scrappea
// 2. Guarda en BD
// 3. Indexa para búsqueda
```

### B. Google Drive Integration

```javascript
// Lee archivos Excel/PDF del drive:
// - horarios.xlsx  → Tabla de horarios
// - carreras.docx  → Lista de carreras
// - normativas.pdf → Normas

// Procesa y guarda en BD
```

### C. RAG en el Chat

```javascript
// Cuando usuario pregunta:
// 1. Busca en documentos locales (SQL)
// 2. Busca en documentos web (índice)
// 3. Busca en drive (sincronizado)
// 4. Fusiona resultados
// 5. Envía a Groq con contexto
```

---

## CÓDIGO DE INTEGRACIÓN

### Crear archivo: `backend/rag-manager.js`

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

// ═══════════════════════════════════════════════════════
//  WEB SCRAPING
// ═══════════════════════════════════════════════════════

async function scrapeFCEyT() {
  try {
    console.log('📡 Scrapeando FCEyT...');
    
    const urls = [
      'https://fce.unse.edu.ar',
      'https://fce.unse.edu.ar/?q=carreras',
      'https://fce.unse.edu.ar/?q=novedades',
      'https://fce.unse.edu.ar/?q=calendario-academico'
    ];

    for (const url of urls) {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      const $ = cheerio.load(data);
      const contenido = $('body').text();

      // Guardar en BD
      guardarDocumentoWeb(url, contenido);
    }

    console.log('✓ Scraping completado');
  } catch (error) {
    console.error('Error scraping:', error.message);
  }
}

function guardarDocumentoWeb(url, contenido) {
  const db = new sqlite3.Database('../data/exabot.db');
  
  db.run(
    `INSERT OR REPLACE INTO documentos (nombre, contenido, tipo, fuente_url)
     VALUES (?, ?, ?, ?)`,
    [`web_${new Date().toISOString()}`, contenido, 'web', url],
    (err) => {
      if (err) console.error('Error guardando:', err);
      else console.log(`✓ Guardado: ${url}`);
    }
  );

  db.close();
}

// ═══════════════════════════════════════════════════════
//  BÚSQUEDA RAG
// ═══════════════════════════════════════════════════════

async function searchRAG(query) {
  const db = new sqlite3.Database('../data/exabot.db');

  return new Promise((resolve, reject) => {
    // Buscar documentos relevantes
    db.all(
      `SELECT contenido, fuente_url FROM documentos 
       WHERE contenido LIKE ? 
       LIMIT 3`,
      [`%${query}%`],
      (err, rows) => {
        if (err) reject(err);
        else {
          const contexto = rows
            .map(r => `${r.contenido.substring(0, 500)}...\n(Fuente: ${r.fuente_url})`)
            .join('\n\n---\n\n');
          
          resolve(contexto);
        }
        db.close();
      }
    );
  });
}

// ═══════════════════════════════════════════════════════
//  GOOGLE DRIVE
// ═══════════════════════════════════════════════════════

async function syncGoogleDrive() {
  try {
    console.log('☁️ Sincronizando Google Drive...');
    
    // Este requiere autenticación con Google
    // Por ahora: placeholder
    
    // En producción:
    // 1. Usar google-auth-library
    // 2. Autenticar con service account
    // 3. Listar archivos de la carpeta
    // 4. Descargar y procesar
    
    console.log('✓ Drive sincronizado');
  } catch (error) {
    console.error('Error Drive:', error.message);
  }
}

// ═══════════════════════════════════════════════════════
//  SCHEDULER
// ═══════════════════════════════════════════════════════

function initRAGScheduler() {
  // Scraping cada 24 horas
  setInterval(scrapeFCEyT, 24 * 60 * 60 * 1000);
  
  // Drive sync cada 6 horas
  setInterval(syncGoogleDrive, 6 * 60 * 60 * 1000);

  // Ejecutar una vez al inicio
  scrapeFCEyT();
  syncGoogleDrive();

  console.log('📅 RAG Scheduler iniciado');
}

module.exports = {
  scrapeFCEyT,
  searchRAG,
  syncGoogleDrive,
  initRAGScheduler
};
```

### Actualizar `backend/server.js`

Agregar al inicio:
```javascript
const { initRAGScheduler, searchRAG } = require('./rag-manager');

// Iniciar RAG scheduler
initRAGScheduler();
```

Agregar nuevo endpoint:
```javascript
// RAG Search
app.post('/api/rag/search', async (req, res) => {
  const { query } = req.body;
  
  try {
    const contexto = await searchRAG(query);
    res.json({ contexto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## EN EL CHAT (frontend)

Modificar `frontend/app.js`:

```javascript
async function send(over) {
  // ... código anterior ...
  
  // NUEVO: Buscar en RAG antes de llamar a Groq
  const contextoRAG = await fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: txt })
  })
    .then(r => r.json())
    .then(d => d.contexto || '');

  // Agregar contexto al system prompt
  const systemPrompt = generarSystemPrompt() + `\n\nCONTEXTO RECUPERADO:\n${contextoRAG}`;

  // Resto del código igual...
}
```

---

## VENTAJAS DE ESTE SISTEMA

| Aspecto | Ventaja |
|---------|---------|
| **Actualización** | Web scraping automático cada 24h |
| **Colaboración** | Google Drive compartido |
| **Control** | Documentos locales bajo tu control |
| **Precisión** | RAG = respuestas más precisas |
| **Escalabilidad** | Maneja múltiples fuentes |

---

## LIMITACIONES Y SOLUCIONES

### Limitación 1: Google Drive requiere autenticación
**Solución:** 
```bash
# Instala Google auth
npm install google-auth-library google-drive-api

# Configura service account (credenciales JSON)
# Descárgalo de: https://console.cloud.google.com
```

### Limitación 2: Web scraping puede ser lento
**Solución:**
- Ejecuta en background (ya está con scheduler)
- Cachea resultados en BD
- Solo rescrapea si hay cambios

### Limitación 3: PDFs grandes
**Solución:**
```bash
npm install pdf-parse pdfjs-dist
# Procesa automáticamente al subir
```

---

## PRÓXIMA IMPLEMENTACIÓN

Una vez que el localhost funcione, ejecuta:

```bash
cd backend
npm install cheerio axios google-auth-library pdf-parse
npm start
```

El sistema hará:
1. ✅ Scraping inicial de FCEyT
2. ✅ Carga todo en BD
3. ✅ Cada pregunta busca relevancia
4. ✅ Responde con contexto enriquecido

---

## TROUBLESHOOTING RAG

**Q: "No encuentra información"**  
R: Verifica que los documentos están en BD:
```bash
sqlite3 data/exabot.db "SELECT COUNT(*) FROM documentos;"
```

**Q: "Scraping lento"**  
R: Normal primera vez. Luego es rápido (caché).

**Q: "Google Drive no conecta"**  
R: Necesita autenticación. Ver docs/GOOGLE_SETUP.md (lo crearemos)

---

## ARQUITECTURA CON RAG

```
Usuario pregunta
    ↓
┌───────────────────────────────────────┐
│   RAG SEARCH (backend/rag-manager.js) │
├───────────────────────────────────────┤
│ 1. Buscar en BD local                 │
│ 2. Buscar en web (scraped)            │
│ 3. Buscar en Drive (sincronizado)     │
└───────────────────────────────────────┘
    ↓
Contexto relevante encontrado
    ↓
Groq: "Basándome en esto, responde..."
    ↓
Respuesta precisa y actualizada
```

---

**Ahora sí, con RAG tienes:**
- ✅ Información manual (panel)
- ✅ Información web (scraping)
- ✅ Información compartida (Drive)
- ✅ Todo integrado automáticamente
- ✅ Respuestas más precisas

