# ⚡ GUÍA RÁPIDA - Exabot v2

## 🎯 En 5 minutos...

### 1. **Inicia el Backend**
```powershell
cd exabot-sistema\backend
npm install
npm start
```
✓ Espera hasta ver: "Exabot Backend en puerto 5000"

### 1.1 **Probar que el backend está vivo (PowerShell)**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method Get
```
✓ Debe devolver JSON con `status: "OK"`

### 2. **Abre el Frontend**
```powershell
# En otra terminal, desde la carpeta "frontend":
cd ..\frontend
python -m http.server 8000

o con node.js

```
✓ Abre: `http://localhost:8000`

### 3. **Prueba el Chatbot**
- Click en "Empezar"
- Pregunta algo: "¿Qué carreras hay?"
- Lee respuesta → Presiona Enter
- Ve feedback con 👍👎

> ✅ Este modo está pensado para que el ingresante solo hable con el chatbot; no hay panel de control visible.

---

## 📊 ¿Qué hace cada carpeta?

| Carpeta | Para qué |
|---------|----------|
| **backend/** | Servidor API + Base de datos |
| **frontend/** | Interfaz visual (HTML + CSS + JS) |
| **docs/** | Documentación completa |

---

## 🔑 Archivo más importante: `.env`

```env
aqui va la clave de groq
```
→ Si no funciona, ve a https://console.groq.com y obtén UNA NUEVA

---

## 🎓 16 Criterios = Mejor Chatbot

Están TODOS implementados:

✅ **Personalización** (guarda nombre, carrera, preferencias)  
✅ **Transparencia** (dice "soy un bot")  
✅ **Empatía** (tono cálido, voseo)  
✅ **Contexto** (recuerda conversaciones)  
✅ **Fuentes** (muestra URLs)  
✅ **Responsividad** (funciona en móvil)  
✅ **Base de datos** (guarda todo)  

---

## 💾 Base de Datos Automática

**Sin configuración:** SQLite crea todo automáticamente

```
backend/data/exabot.db
├── documentos       (tu base de conocimiento)
├── conversaciones   (historial de chats)
├── mensajes         (cada pregunta/respuesta)
└── preferencias_usuario (datos del usuario)
```

---

## 🚀 Comandos útiles

**Reiniciar todo:**
```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npx http-server
```

**Limpiar BD (start fresh):**
```powershell
# Simplemente elimina: backend/data/exabot.db
# Se recrea automáticamente
```

**Ver BD:**
```powershell
# Instala: sqlite3 (Windows/Mac/Linux)
sqlite3 backend/data/exabot.db
# Prueba: SELECT COUNT(*) FROM documentos;
```

---

## 🛑 Problemas comunes

| Problema | Solución |
|----------|----------|
| "Cannot connect" | ¿Backend ejecutándose en puerto 5000? |
| "API key error" | ¿Copiaste bien GROQ_KEY en .env? |
| "CORS error" | ¿Frontend y backend en puertos diferentes? |
| "BD vacía" | Normal en primer inicio. Carga documentos. |

---

## 📱 Acceso mobile

Si tienes servidor en tu PC:
```
http://TU_IP_LOCAL:8000
# Ej: http://192.168.1.100:8000
```

Chatbot **100% responsive** en cualquier tamaño.

---

## 📚 Próximo paso: Cargar tu contenido (opcional)

> Esta versión está pensada para que el ingresante solo hable con el chatbot. Si sos administrador o docente, podés cargar datos directamente en la base de datos mediante el backend.

---

## ✨ Tips Profesionales

- El chatbot busca automáticamente la mejor respuesta usando la base de datos.
- Feedback (👍👎) ayuda a mejorar el modelo.
- Si necesitás exportar conversaciones, consultá a quien administra el servidor.

---

**¡Listo!** 🎉  
Tu chatbot con 16 criterios de diseño está corriendo.

Cualquier duda: Abre `docs/README.md` para detalles técnicos.
