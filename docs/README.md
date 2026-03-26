# 🤖 Exabot v2 - Sistema de Chatbot Integrado

## 📋 Descripción General

Exabot v2 es un sistema completo de chatbot para la Facultad de Ciencias Exactas y Tecnologías (FCEyT) de UNSE, con **16 criterios de diseño** integrados, **base de datos relacional**, y **procesamiento de PDFs**.

### Características principales:
✅ Chatbot conversacional con IA (Groq Llama 3.3)  
✅ Base de datos SQLite para persistencia  
✅ Gestión de documentos y PDFs  
✅ Preferencias personalizables del usuario  
✅ Historial de conversaciones  
✅ API REST backend  
✅ Interfaz responsive y accesible  

---

## 🗂️ Estructura del Proyecto

```
exabot-sistema/
├── backend/
│   ├── package.json          # Dependencias Node.js
│   ├── server.js             # API Express con SQLite
│   ├── .env                  # Variables de entorno
│   └── [data/]               # BD SQLite (se crea automáticamente)
│
├── frontend/
│   ├── index.html            # Página principal
│   ├── styles.css            # Estilos principales
│   ├── app.js                # Lógica del chatbot
│   ├── ui.js                 # Funciones de interfaz
│   └── db-manager.js         # Gestión de BD
│
└── docs/
    └── README.md             # Esta documentación
```

---

## 🚀 Instalación y Ejecución

### **Backend (Node.js + Express + SQLite)**

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Ejecutar servidor:**
```bash
npm start
```
> El servidor estará en `http://localhost:8000`

### **Frontend (HTML5 + CSS + JavaScript)**

1. **Opción 1: Servidor local simple**
```bash
# Desde la carpeta frontend
python -m http.server 8000
# o con Node.js
npx http-server
```

2. **Opción 2: Desde VS Code**
   - Instalar extensión "Live Server"
   - Click derecho en `index.html` → "Open with Live Server"

3. **Acceder a la aplicación:**
   - Abrir `http://localhost:8000` en el navegador

---

## 🛠️ Configuración

### **Variables de entorno (.env)**
```env
PORT=5000
NODE_ENV=development
GROQ_KEY=tu_api_key_aqui
```

### **API Key de Groq**
1. Ir a https://console.groq.com
2. Crear cuenta gratuita
3. Copiar API key
4. Pegar en `.env` o en el código (`app.js`)

---

## � Restricción de Preguntas (Versión v2.1)

### **¿Cómo funciona?**
El chatbot ahora **solo responde preguntas sobre UNSE/FCEyT**. Si el usuario pregunta algo ajeno (matemáticas, temas políticos, etc.), el bot rechaza la pregunta amablemente:

```
Usuario: "¿Cuánto es 2 + 2?"

Exabot: "Esa pregunta está fuera de mi alcance 😊. Soy asistente de UNSE/FCEyT. ¿Hay algo sobre la FCEyT que pueda ayudarte?"
```

### **¿Dónde está implementado?**
En `frontend/app.js`, función `generarSystemPrompt()`, línea con `⚠️ RESTRICCIÓN MUY IMPORTANTE:`.

El prompt ahora incluye:
- Instrucción explícita: "SOLO respondes preguntas sobre UNSE, FCEyT..."
- Patrón de respuesta para temas ajenos
- Énfasis en usar solo la BD cargada

---

## 🎯 Botones Unificados (Versión v2.1)

### **Problema resuelto:**
Antes: Aparecían botones del menú inicial JUNTO con botones sugeridos (confusión visual).  
Ahora: Solo aparecen los botones sugeridos dinámicos después de que el chat inicia.

### **Comportamiento actual:**

1. **Welcome screen**: 4 botones del menú (Carreras, Horarios, Vida, Trámites)
2. **Usuario hace primera pregunta**: 
3. **Bot sugiere respuestas**: Aparecen solo los botones dinámicos sugeridos

### **¿Dónde está implementado?**
En `frontend/app.js`, función `send()`, líneas con:
```javascript
// Solo mostrar botones sugeridos; nunca volver a setQR4() (solo en welcome)
if (opts.length) {
  setQRlist(opts);
} else {
  document.getElementById('qrs').innerHTML = ''; // Limpiar si no hay sugerencias
}
```

---

## �📚 Gestión de Base de Datos

### **Tablas principales:**

| Tabla | Propósito |
|-------|-----------|
| `documentos` | Base de conocimiento (PDFs, manuales, etc.) |
| `conversaciones` | Historial de chats por usuario |
| `mensajes` | Cada mensaje enviado/recibido |
| `preferencias_usuario` | Configuración personal |
| `fuentes` | URLs de referencia oficial |

### **Operaciones comunes:**

**Agregar un documento:**
```javascript
POST /api/documentos
{
  "nombre": "Calendario 2024",
  "contenido": "[contenido del PDF copiado]",
  "tipo": "pdf",
  "fuente_url": "https://fce.unse.edu.ar/..."
}
```

**Obtener documentos:**
```javascript
GET /api/documentos
```

**Guardar preferencias:**
```javascript
POST /api/usuario/preferencias
{
  "usuario_id": "user_123",
  "nombre": "Juan",
  "carrera": "Ingeniería Informática",
  "modo_oscuro": 0,
  "idioma": "es"
}
```

---

## 🎯 16 Criterios de Diseño Implementados

### **Integrados en el system prompt:**

1. **✓ Preferencias de usuario** - Panel de configuración
2. **✓ Derivación a canales externos** - Links a secretarías
3. **✓ Consejos y explicaciones** - Respuestas detalladas
4. **✓ Fácil localización e interfaz minimalista** - Diseño limpio
5. **✓ Fuentes de información** - URLs trackeables
6. **✓ Navegación fluida y simplicidad** - Quick replies
7. **✓ Conservación del contexto** - Historial y memoria
8. **✓ Robustez lingüística** - Tolerancia a errores
9. **✓ Transparencia en la identidad** - "Soy un bot"
10. **✓ Proactividad** - Sugerencias automáticas
11. **✓ Visibilidad del estado** - Indicadores (typing, etc)
12. **✓ Prevención de errores** - Confirmaciones
13. **✓ Aprendizaje** - Adaptación al usuario
14. **✓ Interacción intuitiva** - Voseo rioplatense
15. **✓ Empatía y confianza** - Tono cálido
16. **✓ Fluidez y rapidez** - Respuestas concisas

---

## 🔌 API REST - Endpoints principales

### **Documentos:**
```
GET    /api/documentos           # Listar todos
POST   /api/documentos           # Crear
PUT    /api/documentos/:id       # Actualizar
DELETE /api/documentos/:id       # Eliminar
POST   /api/pdf/upload           # Subir PDF
```

### **Conversaciones:**
```
POST   /api/conversaciones/nueva # Iniciar chat
GET    /api/conversaciones/:id   # Ver historial
POST   /api/mensajes             # Guardar mensaje
```

### **Usuario:**
```
POST   /api/usuario/preferencias       # Guardar
GET    /api/usuario/preferencias/:id   # Obtener
```

### **Sistema:**
```
GET    /api/health               # Verificar servidor
GET    /api/fuentes              # Listar fuentes
POST   /api/fuentes              # Agregar fuente
POST   /api/chat                 # Chat con IA
```

---

## 🔐 Seguridad y Mejores Prácticas

- ✓ CORS configurado
- ✓ Validación de archivos (solo PDF)
- ✓ Límites de tamaño (10MB)
- ✓ SQL injections: prepared statements
- ✓ Las API keys en `.env` (no en código)
- ✓ Sincronización automática de BD

---

## 🐛 Troubleshooting

### **Error: "Cannot POST /api/documentos"**
→ Asegúrate que el backend está corriendo en puerto 5000

### **Error: "CORS policy"**
→ El backend está en otro puerto. Verificar en `app.js` la variable `API_URL`

### **Error: "API key no configurada"**
→ Agregar GROQ_KEY en `.env` o al principio de `app.js`

### **Base de datos vacía**
→ Primer inicio es normal. Carga documentos desde el panel.

### **PDF no procesa**
→ Asegurate que sea PDF válido y < 10MB. Luego copiar el texto manualmente.

---

## 🔄 RAG (Retrieval Augmented Generation)

**NUEVO:** Sistema integrado con 3 fuentes de datos:

1. **Base de datos local** - Documentos que subes
2. **Web Scraping** - Info de `fce.unse.edu.ar` (automático cada 24h)
3. **Google Drive** - Archivos compartidos (horarios, carreras, etc)

El chatbot busca en TODAS las fuentes antes de responder → respuestas más precisas.

📖 Ver: [`RAG_INTEGRATION.md`](RAG_INTEGRATION.md)

## 📈 Próximas mejoras

- [x] Sistema RAG implementado ✅
- [ ] Google Drive full integration
- [ ] PDF text extraction automático
- [ ] Multiidioma completo


---

## 📄 Licencia

Proyecto académico - Trabajo Final de Coria Luz Antonella y Eliana Naily Proserpio - 2026  
Facultad de Ciencias Exactas y Tecnologías - UNSE

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026  
**Autor:**  Coria Luz Antonella y Eliana Naily Proserpio
