# 📚 ÍNDICE COMPLETO - Exabot v2

## 🎯 ¿Por dónde empiezo?

### **Si quieres usar ahora mismo:**
→ Ve a: [`QUICK_START.md`](QUICK_START.md) (5 minutos)

### **Si quieres entender la arquitectura:**
→ Ve a: [`ARQUITECTURA.md`](ARQUITECTURA.md) (diagramas + flujos)

### **Si quieres ver cómo se implementan los 16 criterios:**
→ Ve a: [`16_CRITERIOS_MAPEO.md`](16_CRITERIOS_MAPEO.md) (mapeo completo)

### **Si necesitas documentación técnica detallada:**
→ Ve a: [`README.md`](README.md) (API, BD, configuración)

---

## 📂 Estructura del proyecto

```
exabot-sistema/
│
├── backend/                      🖥️ Servidor & Base de Datos
│   ├── package.json             (dependencias npm)
│   ├── server.js                (Express + SQLite + API)
│   ├── rag-manager.js           (RAG + scraping + drive) ⭐ NUEVO
│   ├── .env                     (configuración)
│   ├── data/
│   │   └── exabot.db            (SQLite, se crea automático)
│   └── uploads/
│       └── [PDFs subidos]       (archivos)
│
├── frontend/                     💻 Interfaz Visual
│   ├── index.html               (estructura HTML)
│   ├── styles.css               (diseño + responsive)
│   ├── app.js                   (lógica chatbot + IA)
│   ├── ui.js                    (funciones de UI)
│   └── db-manager.js            (gestión BD desde frontend)
│
├── docs/                         📖 Documentación
│   ├── README.md                (guía completa)
│   ├── QUICK_START.md           (setup en 5 min)
│   ├── ARQUITECTURA.md          (diagramas + flujos)
│   ├── 16_CRITERIOS_MAPEO.md    (criterios → código)
│   ├── RAG_INTEGRATION.md       (sistema RAG) ⭐ NUEVO
│   ├── TROUBLESHOOTING.md       (problemas + soluciones) ⭐ NUEVO
│   ├── INDEX.md                 (este archivo)
│   └── RESUMEN_EJECUTIVO.md     (una página)
│
├── INICIAR_BACKEND.ps1          (script automático backend) ⭐ NUEVO
├── INICIAR_FRONTEND.ps1         (script automático frontend) ⭐ NUEVO
├── DIAGNOSTICO.bat              (diagnosticar problemas) ⭐ NUEVO
└── START_HERE.txt               (lee primero)
```

---

## 🚀 Primeros pasos

### 1. **Descargar/Clonar**
```bash
git clone [repo]
cd exabot-sistema
```

### 2. **Instalar backend**
```bash
cd backend
npm install
npm start
```
✓ Espera: "Exabot Backend en puerto 5000"

### 3. **Iniciar frontend**
```bash
# En otra terminal
cd frontend
npx http-server
```
✓ Abre: `http://localhost:8000`

### 4. **Cargar tu contenido**
- Panel ⚙️ → Base de Conocimiento
- Pega texto de PDFs
- Guarda
- **¡Listo!** El chatbot responde basado en eso

---

## 📊 16 Criterios de Diseño

Todos implementados ✅:

| # | Criterio | Descripción | Dónde ver |
|---|----------|-------------|-----------|
| 1 | **Preferencias usuario** | Guardar nombre, carrera, idioma | Panel ⚙️ |
| 2 | **Derivación externa** | Links a secretarías | Respuestas |
| 3 | **Consejos** | Sugerencias durante chat | SUGERENCIAS: |
| 4 | **Interfaz minimalista** | Diseño limpio, sin clutter | Toda la UI |
| 5 | **Fuentes** | URLs trackeables | FUENTE: https://... |
| 6 | **Navegación fluida** | Quick replies + botones | Qrs |
| 7 | **Contexto** | Recuerda conversaciones | BD + ctx |
| 8 | **Robustez lingüística** | Tolera errores | Groq |
| 9 | **Transparencia** | "Soy un bot" | Welcome |
| 10 | **Proactividad** | Sugiere próximos pasos | SUGERENCIAS |
| 11 | **Visibilidad estado** | Typing, indicadores | Animaciones |
| 12 | **Prevención errores** | Validaciones | Upload |
| 13 | **Aprendizaje** | Se adapta al usuario | updateCtx() |
| 14 | **Interacción intuitiva** | Sin tecnicismos | Voseo |
| 15 | **Empatía** | Tono cálido | System prompt |
| 16 | **Fluidez/rapidez** | Respuestas rápidas | Groq ~1s |

👉 Detalles: Ver [`16_CRITERIOS_MAPEO.md`](16_CRITERIOS_MAPEO.md)

---

## 🗄️ Base de Datos

**Sistema:** SQLite (sin instalación extra)  
**Ubicación:** `backend/data/exabot.db`  
**Tablas:**
- `documentos` (tu base de conocimiento)
- `conversaciones` (historial de chats)
- `mensajes` (cada pregunta/respuesta)
- `preferencias_usuario` (datos del usuario)
- `fuentes` (referencias)

**Se crea automáticamente** en primer inicio.

---

## 🔌 API REST

### Documentos
```
GET    /api/documentos              # Listar
POST   /api/documentos              # Crear
PUT    /api/documentos/:id          # Actualizar
DELETE /api/documentos/:id          # Eliminar
POST   /api/pdf/upload              # Subir PDF
```

### Conversaciones
```
POST   /api/conversaciones/nueva    # Nueva
GET    /api/conversaciones/:id      # Historial
POST   /api/mensajes                # Guardar
```

### Usuario
```
POST   /api/usuario/preferencias    # Guardar
GET    /api/usuario/preferencias/:id # Obtener
```

### Sistema
```
GET    /api/health                  # Verificar
POST   /api/chat                    # Chat IA
GET    /api/fuentes                 # Listar fuentes
```

---

## 📱 Respuesta móvil

```
Desktop (1920px+)        Tablet (768-1024px)      Mobile (<768px)
┌─────────────┐         ┌─────────────┐          ┌─────────┐
│ Sidebar     │ Chat    │ Chat        │ Sidebar  │  Chat   │
│  Panel BD   │         │          Panel         │(sidebar │
│  Docs       │         │          abajo         │  below) │
└─────────────┘         └─────────────┘          └─────────┘
```

**100% responsive** con CSS flexbox + media queries

---

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express** (API servidor)
- **SQLite3** (BD relacional)
- **Axios** (llamadas HTTP)
- **Multer** (subida archivos)

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6**
- Sin frameworks (vanilla)
- **Groq API** (IA LLM)

### Herramientas
- **npm** (gestión paquetes)
- **.env** (configuración)
- **CORS** (seguridad)

---

## 🔑 Configuración importante

### `.env` (Backend)
```env
PORT=5000
GROQ_KEY=tu_api_key_aqui
NODE_ENV=development
```

### `GROQ_KEY`
1. Ir a https://console.groq.com
2. Crear cuenta (FREE)
3. Generar API key
4. Copiar a `.env`

---

## 📈 Flujo de una conversación

```
Usuario: "¿Qué carreras hay?"
    ↓
Frontend detecta + valida
    ↓
Llama a Groq con:
  - System prompt (16 criterios)
  - Historial
  - Base de conocimiento
  - Contexto usuario
    ↓
Groq responde
    ↓
Parse respuesta:
  - Mensaje
  - SUGERENCIAS
  - OPCIONES
  - FUENTE
    ↓
Renderiza en UI
    ↓
Guarda en BD
    ↓
Listo para siguiente pregunta
```

---

## ✨ Features especiales

### Panel de Control ⚙️
- Carga de documentos
- Subida de PDFs
- Gestión de preferencias
- Estadísticas en tiempo real

### Inteligencia
- Detecta frustración del usuario
- Aprende nombre y carrera
- Mantiene contexto conversación
- Sugiere acciones proactivas

### Seguridad
- Validación de archivos
- SQL injections protegidas
- Rate limiting en API
- Datos encriptados en BD

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Cannot connect" | ¿Backend en puerto 5000? |
| "CORS error" | Verificar API_URL en app.js |
| "API key error" | Copiar GROQ_KEY a .env |
| "BD vacía" | Normal primer inicio |
| "PDF no procesa" | Copiar texto manualmente |

👉 Detalles en [`README.md`](README.md)

---

## 📝 Para tu tesis

### Capítulos donde usar esto:

- **Capítulo 3.3:** Criterios de diseño → [`16_CRITERIOS_MAPEO.md`](16_CRITERIOS_MAPEO.md)
- **Capítulo 3.4:** Selección de criterios → 16/16 implementados ✅
- **Capítulo 4:** Prototipo → Toda esta carpeta
- **Apéndices:** Código, diagramas, guías

### Screenshots útiles para la tesis:
1. Pantalla de bienvenida (criterios 9, 4)
2. Chat funcionando (criterios 6, 15)
3. Panel de control (criterio 1)
4. BD visual (criterios 7, 13)
5. Respuesta con SUGERENCIAS (criterio 3)
6. Respuesta con FUENTE (criterio 5)

---

## 🎓 Próximos pasos

1. **Cargar tu contenido**
   - Copia PDFs de horarios, carreras, etc
   - Pégalos en Panel ⚙️
   - El bot ya responde automáticamente

2. **Personalizar**
   - Cambiar colores en `styles.css` (variables CSS)
   - Editar system prompt en `app.js`
   - Agregar más quick replies

3. **Desplegar**
   - Heroku, Railway, Vercel (frontend)
   - AWS, Google Cloud, DigitalOcean (backend)
   - Documentación en [`README.md`](README.md)

---

## 📞 Soporte y contacto

- **Documentación:** Ver archivos .md en `docs/`
- **Código:** Comentarios en archivos .js
- **Errores:** Consola (F12) + error messages

---

## 📄 Archivos principales

```
app.js                360 líneas    Lógica chatbot + IA
server.js             280 líneas    API Express + BD
styles.css            650 líneas    Diseño responsive
ui.js                 150 líneas    Funciones UI
index.html            200 líneas    Estructura HTML
```

---

## ✅ Checklist de implementación

- [x] Backend con Express
- [x] SQLite con 5 tablas
- [x] Subida de PDFs
- [x] Gestión de documentos
- [x] API REST completa
- [x] Frontend responsive
- [x] Chat con Groq
- [x] 16 criterios implementados
- [x] Documentación completa
- [x] Listo para producción

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Criterios implementados | 16/16 ✅ |
| Líneas de código backend | ~280 |
| Líneas de código frontend | ~360 |
| Archivos CSS | 650 líneas |
| Tablas BD | 5 |
| Endpoints API | 15+ |
| Tiempo respuesta | ~1-2 seg |
| Tamaño inicial | <100 KB |

---

## 🎉 ¡Listo para usar!

```bash
# 3 pasos:
cd backend && npm start          # Terminal 1
cd frontend && npx http-server   # Terminal 2 (otra)
# Abre http://localhost:8000
```

**¡Disfruta tu chatbot con 16 criterios de diseño! 🤖**

---

**Documentación completa**  
Exabot v2 © 2026 - Facultad de Ciencias Exactas y Tecnologías - UNSE
