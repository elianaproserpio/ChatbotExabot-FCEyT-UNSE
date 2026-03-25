/* ═══════════════════════════════════════════════════════
   EXABOT v2 - FUNCIONES DE UI
   ═══════════════════════════════════════════════════════ */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br>$1')
    .replace(/^<br>/, '');
}

function ts() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function sc() {
  const m = document.getElementById('msgs');
  if (m) setTimeout(() => m.scrollTop = m.scrollHeight, 60);
}

function ar(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function hk(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (window.send) window.send();
  }
}

function showError(msg) {
  const err = document.getElementById('err');
  if (err) { err.textContent = 'oops: ' + msg; err.style.display = 'block'; }
}

function hideErr() {
  const err = document.getElementById('err');
  if (err) err.style.display = 'none';
}

function userMsg(txt) {
  const m = document.getElementById('msgs');
  const r = document.createElement('div');
  r.className = 'mrow user';
  r.innerHTML = '<div><div class="bub user">' + esc(txt) + '</div><div class="mtime">' + ts() + '</div></div>';
  m.appendChild(r);
  sc();
}


// ── CALENDARIO: mostrar opciones al usuario ─────────────

function mostrarOpcionesCalendario() {
  var m = document.getElementById('msgs');
  var r = document.createElement('div');
  r.className = 'mrow';
  r.innerHTML = '<div class="bav"></div><div style="flex:1">'
    + '<div class="bub bot">'
    + 'Puedo mostrarte mas informacion del calendario. Que preferes?'
    + '</div>'
    + '<div class="mtime">' + ts() + '</div>'
    + '</div>';
  m.appendChild(r);

  // Botones de opcion
  var q = document.getElementById('qrs');
  if (q) {
    q.innerHTML = '';
    var opciones = [
      { label: 'Ver imagen del calendario', fn: mostrarImagenCalendario, cls: '' },
      { label: 'Descargar PDF oficial (Res. 005/2026)', fn: descargarPDFCalendario, cls: 'c' },
      { label: 'Consultar una fecha especifica', fn: function(){ window.send('quiero consultar una fecha especifica del calendario'); }, cls: 'r' }
    ];
    opciones.forEach(function(o) {
      var b = document.createElement('button');
      b.className = 'qrb ' + o.cls;
      b.textContent = o.label;
      b.onclick = o.fn;
      q.appendChild(b);
    });
  }
  sc();
}

// Alias para compatibilidad con send()
function mostrarCalendario() {
  mostrarImagenCalendario();
}

function mostrarImagenCalendario() {
  var m = document.getElementById('msgs');
  var r = document.createElement('div');
  r.className = 'mrow';
  r.innerHTML = '<div class="bav"></div><div style="flex:1">'
    + '<div class="bub bot" style="padding:8px">'
    + '<div style="font-size:12px;color:#6B7A91;margin-bottom:6px">'
    + 'Calendario Academico 2026 - FCEyT UNSE'
    + '<br>Fuente: Resolucion HCD N° 005/2026'
    + '</div>'
    + '<img src="Images/calendario2026.png" alt="Calendario Academico 2026 FCEyT" '
    + 'style="width:100%;border-radius:8px;border:1px solid #D0DBE8;cursor:zoom-in" '
    + 'onclick="verImgGrande(this)" title="Toca para ampliar" />'
    + '<div style="font-size:10px;color:#6B7A91;margin-top:4px">Toca la imagen para ampliarla</div>'
    + '</div>'
    + '<div class="mtime">' + ts() + '</div>'
    + '</div>';
  m.appendChild(r);

  // Ofrecer mas opciones despues de ver la imagen
  var q = document.getElementById('qrs');
  if (q) {
    q.innerHTML = '';
    var b1 = document.createElement('button');
    b1.className = 'qrb c';
    b1.textContent = 'Descargar PDF oficial';
    b1.onclick = descargarPDFCalendario;
    q.appendChild(b1);
    var b2 = document.createElement('button');
    b2.className = 'qrb';
    b2.textContent = 'Consultar una fecha';
    b2.onclick = function(){ window.send('quiero consultar una fecha especifica del calendario'); };
    q.appendChild(b2);
  }
  sc();
}

function descargarPDFCalendario() {
  // Mostrar mensaje en el chat
  var m = document.getElementById('msgs');
  var r = document.createElement('div');
  r.className = 'mrow';
  r.innerHTML = '<div class="bav"></div><div style="flex:1">'
    + '<div class="bub bot" style="padding:10px">'
    + '<div style="font-size:12.5px;margin-bottom:8px">Resolucion HCD N° 005/2026</div>'
    + '<div style="font-size:12px;color:#6B7A91;margin-bottom:8px">'
    + 'Honorable Consejo Directivo - FCEyT UNSE<br>'
    + 'Aprobado el 4 de marzo de 2026'
    + '</div>'
    + '<a href="docs/calendario_resolucion_005_2026.pdf" download="Calendario_FCEyT_2026_Res005.pdf" '
    + 'style="display:inline-flex;align-items:center;gap:6px;background:#2258a2;color:white;'
    + 'text-decoration:none;padding:8px 14px;border-radius:8px;font-size:12.5px;font-weight:600">'
    + 'Descargar PDF completo'
    + '</a>'
    + '<div style="font-size:10px;color:#6B7A91;margin-top:6px">Incluye calendario completo y feriados 2026</div>'
    + '</div>'
    + '<div class="mtime">' + ts() + '</div>'
    + '</div>';
  m.appendChild(r);
  sc();
}

function verImgGrande(img) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;'
    + 'display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out';
  overlay.onclick = function(){ overlay.remove(); };
  var ig = document.createElement('img');
  ig.src = img.src;
  ig.alt = img.alt;
  ig.style.cssText = 'max-width:100%;max-height:90vh;border-radius:10px;object-fit:contain';
  ig.onclick = function(e){ e.stopPropagation(); };
  var cerrar = document.createElement('button');
  cerrar.textContent = 'Cerrar';
  cerrar.style.cssText = 'position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);'
    + 'color:white;border:1px solid rgba(255,255,255,0.3);border-radius:8px;'
    + 'padding:6px 14px;cursor:pointer;font-size:13px';
  cerrar.onclick = function(){ overlay.remove(); };
  overlay.appendChild(ig);
  overlay.appendChild(cerrar);
  document.body.appendChild(overlay);
}
function botMsg(txt, src, fb, sug) {
  const m = document.getElementById('msgs');
  const id = ++mid;
  const r = document.createElement('div');
  r.className = 'mrow';
  const q = document.getElementById('qrs');
  if (q) q.innerHTML = '';
  
  // 🔧 CORRECCIÓN: Verificar que src sea string antes de usarlo
  const srcStr = (src && typeof src === 'string') ? src : null;
  const srcHtml = srcStr ? '<a class="src-link" href="' + srcStr + '" target="_blank">' + srcStr.replace('https://', '').replace('http://', '') + '</a>' : '';
  
  const fbHtml = fb ? '<div class="fbrow"><span class="fblbl">Util?</span><button class="fbbtn" onclick="doFb(' + id + ',\'si\',this)">+1</button><button class="fbbtn" onclick="doFb(' + id + ',\'no\',this)">-1</button></div>' : '';
  r.innerHTML = '<div class="bav"></div><div style="flex:1"><div class="bub bot">' + fmt(txt) + srcHtml + '</div><div class="mtime">' + ts() + '</div>' + fbHtml + '</div>';
  m.appendChild(r);
  sc();
}
function dsep(lbl) {
  const m = document.getElementById('msgs');
  const s = document.createElement('div');
  s.className = 'dsep';
  s.textContent = lbl;
  m.appendChild(s);
}

function setQR4() {
  const q = document.getElementById('qrs');
  q.innerHTML = '';
  MENU4.forEach(function(o) {
    const b = document.createElement('button');
    b.className = 'qrb ' + o.cls;
    b.textContent = o.label;
    b.onclick = function() {
      const label = o.label.toLowerCase();
      if (label.includes('carreras')) startWithTopic('carreras');
      else if (label.includes('horarios')) startWithTopic('horarios');
      else if (label.includes('vida')) startWithTopic('vida');
      else if (label.includes('tramites') || label.includes('trámites')) startWithTopic('tramites');
      else window.send(o.label);
    };
    q.appendChild(b);
  });
  sc();
}

function setQRlist(opts) {
  const q = document.getElementById('qrs');
  q.innerHTML = '';
  const colorClasses = ['', 'c', 'r', 'g', '', 'c', 'r', 'g'];
  opts.forEach(function(o, i) {
    const b = document.createElement('button');
    const label = typeof o === 'string' ? o : (o.label || o);
    const customCls = typeof o === 'string' ? '' : (o.cls || '');
    b.className = 'qrb ' + (customCls || colorClasses[i % colorClasses.length]);
    b.textContent = label;
    b.onclick = function() { window.send(label); };
    q.appendChild(b);
  });
  sc();
}

function showTyping() {
  const m = document.getElementById('msgs');
  const r = document.createElement('div');
  r.className = 'trow';
  r.id = 'typ';
  r.innerHTML = '<div class="bav">E</div><div class="tbub"><div class="td"></div><div class="td"></div><div class="td"></div></div>';
  m.appendChild(r);
  const stxt = document.getElementById('stxt');
  if (stxt) stxt.textContent = 'Escribiendo...';
  sc();
}

function hideTyping() {
  const t = document.getElementById('typ');
  if (t) t.remove();
  const stxt = document.getElementById('stxt');
  if (stxt) stxt.textContent = 'En linea';
}

function setBusy(v) {
  busy = v;
  const sb = document.getElementById('sb');
  const ui = document.getElementById('ui');
  if (sb) sb.disabled = v;
  if (ui) ui.disabled = v;
}

function doFb(id, type, btn) {
  btn.classList.add('ok');
  btn.closest('.fbrow').querySelectorAll('.fbbtn').forEach(function(b) { b.disabled = true; });
  if (typeof conversacionId !== 'undefined' && conversacionId && typeof API_URL !== 'undefined') {
    fetch(API_URL + '/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversacion_id: conversacionId, rol: 'feedback', contenido: type, fuente_url: null })
    }).catch(function(e) { console.error('Error:', e); });
  }
}

window.userMsg    = userMsg;
window.botMsg     = botMsg;
window.dsep       = dsep;
window.setQR4     = setQR4;
window.setQRlist  = setQRlist;
window.showTyping = showTyping;
window.hideTyping = hideTyping;
window.setBusy    = setBusy;
window.doFb       = doFb;
window.esc        = esc;
window.fmt        = fmt;
window.ts         = ts;
window.sc         = sc;
window.ar         = ar;
window.hk         = hk;
window.hideErr    = hideErr;
window.showError  = showError;
