/* ═══════════════════════════════════════════════════════
   EXABOT v2 - GESTIÓN DE BASE DE DATOS
   ═══════════════════════════════════════════════════════ */

// Carga estadísticas
function actualizarEstadisticas() {
  fetch(`${API_URL}/documentos`)
    .then(r => r.json())
    .then(docs => {
      const stats = document.getElementById('stats');
      if (!stats) return;

      stats.innerHTML = `
        <p><strong>${docs.length}</strong> documentos cargados</p>
        <p>Último: ${docs[0] ? new Date(docs[0].fecha_carga).toLocaleDateString('es-AR') : 'N/A'}</p>
        <p>Almacenamiento: ${Math.round(docs.reduce((a, d) => a + d.contenido.length, 0) / 1024)} KB</p>
      `;
    })
    .catch(e => console.error('Error:', e));
}

// Exportar conversación
function exportarConversacion() {
  if (!conversacionId) {
    alert('No hay conversación para exportar');
    return;
  }

  fetch(`${API_URL}/conversaciones/${conversacionId}`)
    .then(r => r.json())
    .then(mensajes => {
      const data = {
        usuario: usuarioId,
        fecha: new Date().toISOString(),
        conversacion_id: conversacionId,
        contexto: ctx,
        mensajes
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exabot-chat-${conversacionId}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('✓ Conversación exportada');
    })
    .catch(e => console.error('Error:', e));
}

// Limpiar historial
function limpiarHistorial() {
  if (confirm('¿Eliminar todo el historial de chat? (Esta acción no se puede deshacer)')) {
    hist = [];
    document.getElementById('msgs').innerHTML = '';
    conversacionId = null;
    alert('✓ Historial limpiado');
  }
}

// Cargar fuentes
function cargarFuentes() {
  fetch(`${API_URL}/fuentes`)
    .then(r => r.json())
    .then(fuentes => {
      console.log('📚 Fuentes cargadas:', fuentes);
      return fuentes;
    })
    .catch(e => console.error('Error:', e));
}

// Agregar fuente
function agregarFuente(titulo, url, categoria = 'General') {
  fetch(`${API_URL}/fuentes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo,
      url,
      categoria
    })
  })
    .then(r => r.json())
    .then(d => {
      console.log('✓ Fuente agregada:', d);
    })
    .catch(e => console.error('Error:', e));
}

// Sincronización automática de documentos cada 5 minutos
setInterval(cargarDocumentos, 5 * 60 * 1000);

// Sincronización de estadísticas cada 10 segundos
setInterval(actualizarEstadisticas, 10 * 1000);

// Llamadas iniciales
window.exportarConversacion = exportarConversacion;
window.limpiarHistorial = limpiarHistorial;
window.cargarFuentes = cargarFuentes;
window.agregarFuente = agregarFuente;
