/* ============================================================
   NAVIGATION
   ============================================================ */
function go(id) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const t = document.getElementById(id);
  if(t){ t.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
  closeMobile();
  if(id==='view-cobertura' && !mapReady) setTimeout(initMap,120);
}
function showTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  if(btn) btn.classList.add('active');
}
function closeMobile(){
  const mobileNav = document.getElementById('mobile-nav');
  const menuBtn = document.getElementById('menuBtn');
  if(mobileNav) mobileNav.classList.remove('open');
  if(menuBtn) menuBtn.classList.remove('open');
}
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('mobile-nav').classList.toggle('open');
  document.getElementById('menuBtn').classList.toggle('open');
});

/* Navbar scroll */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

/* ============================================================
   DARK MODE & LOGO SWITCHING
   ============================================================ */
let dark = localStorage.getItem('bgital-dark')==='1';
function applyTheme(){
  document.documentElement.setAttribute('data-theme', dark?'dark':'light');
  const themeIcon = document.getElementById('themeIcon');
  if(themeIcon) themeIcon.className = dark?'fa-solid fa-sun':'fa-solid fa-moon';
  
  // Logo text/filter handled by CSS
  const navLogo = document.getElementById('navLogo');
  if(navLogo) {
     navLogo.src = 'img/logo.png';
  }
}
applyTheme();

// Footer Year
const yr = document.getElementById('current-year');
if(yr) yr.textContent = new Date().getFullYear();

// Hero Switcher
function initHeroSwitcher() {
  const items = document.querySelectorAll('.hero-text-item');
  let current = 0;
  if(items.length < 2) return;
  
  setInterval(() => {
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 4000);
}
initHeroSwitcher();
document.getElementById('themeBtn').onclick = () => {
  dark=!dark; localStorage.setItem('bgital-dark',dark?'1':'0'); applyTheme();
};

/* ============================================================
   FADE-IN OBSERVER
   ============================================================ */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold:.1});
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

/* ============================================================
   FAQ
   ============================================================ */
document.querySelectorAll('.faq-q').forEach(q => {
  q.onclick = () => {
    const item = q.parentElement;
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if(!open) item.classList.add('open');
  };
});

/* ============================================================
   CONTACT FORM
   ============================================================ */
function handleForm(e) {
  e.preventDefault();
  const nombre   = document.getElementById('f-nombre').value;
  const apellidos= document.getElementById('f-apellidos').value;
  const email    = document.getElementById('f-email').value;
  const tel      = document.getElementById('f-tel').value;
  const motivo   = document.getElementById('f-motivo').value;
  const dir      = document.getElementById('f-direccion').value;
  const msg      = document.getElementById('f-mensaje').value;

  const body = `Nombre: ${nombre} ${apellidos}
Correo: ${email}
Teléfono: ${tel}
Motivo: ${motivo || 'No especificado'}
Dirección/Colonia: ${dir || 'No indicada'}

Mensaje:
${msg || 'Sin mensaje adicional'}

---
Enviado desde bgital.mx`;

  const subject = `Consulta BGITAL: ${motivo || 'General'} — ${nombre}`;
  const mailto = `mailto:atencionalcliente@bgital.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=${encodeURIComponent(email)}`;
  window.location.href = mailto;

  setTimeout(() => {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if(form) form.style.display='none';
    if(success) success.style.display='block';
  }, 800);
}

/* ============================================================
   CP DATABASE (Toluca, Metepec, San Mateo Atenco)
   ============================================================ */
// Expanded database based on search results
/* CP database handled externally */

// Geocoding for CPs (approx centres for auto-pan)
const cpCenters = {
  "50000": [19.2924, -99.6567], "50010": [19.2900, -99.6550], "50160": [19.2905, -99.6610],
  "52140": [19.2514, -99.6053], "52100": [19.2667, -99.5333]
};

/* ============================================================
   CP LOOKUP LOGIC (Uses window.cpData from js/cp_data.js)
   ============================================================ */
function lookupCP() {
  const cp = document.getElementById('cpInput').value.trim();
  const coloniesWrap = document.getElementById('colonies-wrap');
  const coloniesSelect = document.getElementById('colonies-select');
  const result = document.getElementById('coverage-result');
  const btnNo = document.getElementById('btnNoColony');

  if(result) result.style.display='none';
  if(btnNo) btnNo.style.display='none';

  if(cp.length !== 5) {
    if(coloniesWrap) coloniesWrap.style.display='none';
    alert('Por favor ingresa un código postal de 5 dígitos.');
    return;
  }

  const data = (window.cpData && window.cpData[cp]) ? window.cpData[cp] : null;

  if(!data) {
    if(coloniesWrap) coloniesWrap.style.display='none';
    if(result) {
      result.className='coverage-result info';
      result.style.display='block';
      result.innerHTML='<i class="fa-solid fa-circle-info" style="margin-right:6px;"></i>No encontramos ese CP en nuestra base oficial, pero podemos llegar a tu zona. Contáctanos.';
    }
    if(btnNo) btnNo.style.display='flex';
    return;
  }

  // Populate colonies
  if(coloniesSelect) {
    coloniesSelect.innerHTML='<option value="">— Elige tu colonia —</option>';
    data.forEach(c => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = c;
      // Check if this specific combo is in our coverage list
      opt.dataset.covered = isCovered(cp, c) ? '1':'0';
      coloniesSelect.appendChild(opt);
    });
    const noneOpt = document.createElement('option');
    noneOpt.value='__none__';
    noneOpt.textContent='Mi colonia no está en esta lista';
    coloniesSelect.appendChild(noneOpt);
  }

  if(coloniesWrap) coloniesWrap.style.display='block';
  
  if(mapReady && cpCenters[cp]) {
    map.setView(cpCenters[cp], 14);
  }
}

function isCovered(cp, colony) {
  // Check default coverage
  const inDefault = defaultZones.some(z => z.cp === cp && (z.name === colony || z.name === 'Todo el CP'));
  if(inDefault) return true;
  // Check custom coverage
  return customZones.some(z => z.cp === cp && (z.colony === colony || z.colony === 'Todo el CP'));
}

function checkColony() {
  const sel = document.getElementById('colonies-select');
  const result = document.getElementById('coverage-result');
  const btnNo = document.getElementById('btnNoColony');
  if(!sel || !result || !btnNo) return;
  
  const val = sel.value;
  result.style.display='none';
  btnNo.style.display='none';

  if(!val) return;
  if(val === '__none__') {
    btnNo.style.display='flex';
    return;
  }

  const cp = document.getElementById('cpInput').value.trim();
  if(isCovered(cp, val)) {
    result.className='coverage-result ok';
    result.innerHTML='<i class="fa-solid fa-circle-check" style="margin-right:6px;"></i>¡Excelente! <strong>'+ val +'</strong> tiene cobertura disponible. Contáctanos para agendar tu instalación.';
  } else {
    result.className='coverage-result no';
    result.innerHTML='<i class="fa-solid fa-circle-xmark" style="margin-right:6px;"></i>Por el momento <strong>'+ val +'</strong> no tiene cobertura activa. Pero estamos expandiéndonos, registra tu interés.';
    btnNo.style.display='flex';
    btnNo.innerHTML='<i class="fa-solid fa-user-headset"></i> Registrar mi interés — Contactar asesor';
  }
  result.style.display='block';
}

function noColonyContact() {
  const cpInput = document.getElementById('cpInput');
  const sel = document.getElementById('colonies-select');
  const cp = cpInput ? cpInput.value : 'no especificado';
  const colony = (sel && sel.value && sel.value !== '__none__') ? sel.value : 'no listada';
  const msg = `Hola, quiero verificar si tienen cobertura en mi zona.\nCP: ${cp}\nColonia: ${colony}\n¿Cuándo llegará la cobertura?`;
  window.open(`https://wa.me/5561469929?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ============================================================
   LEAFLET MAP
   ============================================================ */
let map = null, mapReady = false;
let customZones = JSON.parse(localStorage.getItem('bgital-zones')||'[]');
let drawnLayers = [];

const defaultZones = [
  {name:'Santa Ana Tlapaltitlán',lat:19.2905,lng:-99.6610,r:850,cp:'50160'},
  {name:'Toluca de Lerdo Centro',lat:19.2924,lng:-99.6567,r:1000,cp:'50000'},
];

function initMap(){
  if(mapReady) return;
  const mapEl = document.getElementById('coverage-map');
  if(!mapEl) return;
  
  map = L.map('coverage-map',{zoomControl:true}).setView([19.2905,-99.6610],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'\u00A9 OpenStreetMap',maxZoom:18}).addTo(map);

  const icon = L.divIcon({
    html:'<div style="background:#20A0F6;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(32,160,246,.8);"></div>',
    iconSize:[14,14],iconAnchor:[7,7]
  });
  L.marker([19.2905,-99.6610],{icon}).addTo(map)
   .bindPopup('<strong>BGITAL — Oficinas</strong><br>Av. Ignacio Comonfort 107, Toluca');

  // Draw coverage circles
  defaultZones.forEach(z => drawZoneCircle(z));
  customZones.forEach(z => {
      // For custom zones, we might need to get lat/lng from CP if not stored
      const centre = cpCenters[z.cp] || [19.2905, -99.6610];
      drawZoneCircle({lat:centre[0], lng:centre[1], r:800, name:z.colony});
  });
  renderZoneList();
  mapReady=true;
}

function drawZoneCircle(z){
  const c = L.circle([z.lat,z.lng],{
    radius:z.r||800,color:'#20A0F6',fillColor:'#20A0F6',fillOpacity:.16,weight:2
  }).addTo(map).bindPopup(`<strong>✅ Cobertura BGITAL</strong><br>${z.name}`);
  drawnLayers.push(c);
}

// ADMIN FUNCTIONS
function updateAdminColonies() {
  const cp = document.getElementById('z-cp').value.trim();
  const list = document.getElementById('colony-options');
  if(!list) return;
  list.innerHTML = '';
  if(window.cpData && window.cpData[cp]) {
    window.cpData[cp].forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      list.appendChild(opt);
    });
  }
}

function addZone(){
  const cp = document.getElementById('z-cp').value.trim();
  const colony = document.getElementById('z-colony').value;
  if(!cp || !colony) { alert('Selecciona un CP y una Colonia.'); return; }
  
  const z = {cp, colony};
  customZones.push(z);
  localStorage.setItem('bgital-zones',JSON.stringify(customZones));
  
  // Refresh map circles
  if(mapReady) {
    const centre = cpCenters[cp] || [19.2905, -99.6610];
    drawZoneCircle({lat:centre[0], lng:centre[1], r:800, name:colony});
  }
  renderZoneList();
}

function removeZone(i){
  customZones.splice(i,1);
  localStorage.setItem('bgital-zones',JSON.stringify(customZones));
  // Refresh all drawings
  if(mapReady){
    drawnLayers.forEach(l => map.removeLayer(l));
    drawnLayers = [];
    defaultZones.forEach(z => drawZoneCircle(z));
    customZones.forEach(z => {
      const centre = cpCenters[z.cp] || [19.2905, -99.6610];
      drawZoneCircle({lat:centre[0], lng:centre[1], r:800, name:z.colony});
    });
  }
  renderZoneList();
}

function renderZoneList(){
  const list=document.getElementById('zone-list');
  if(!list) return;
  if(!customZones.length){list.innerHTML='<div style="font-size:12.5px;color:var(--text-muted);padding:8px 0;">No hay zonas personalizadas.</div>';return;}
  list.innerHTML=customZones.map((z,i)=>`<div class="zone-row"><span>${z.cp} — ${z.colony}</span><button onclick="removeZone(${i})"><i class="fa-solid fa-trash"></i></button></div>`).join('');
}

/* ============================================================
   ADMIN MODAL & LOGIN
   ============================================================ */
function adminLogin(){
  const u=document.getElementById('a-user').value;
  const p=document.getElementById('a-pass').value;
  const err=document.getElementById('admin-err');
  if(u==='admin'&&p==='Bgital2026'){
    document.getElementById('admin-login-form').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    renderZoneList();
    if(err) err.style.display='none';
    if(!mapReady) setTimeout(initMap, 100);
  } else {
    if(err) err.style.display='block';
  }
}
function closeAdmin(){
  const modal = document.getElementById('admin-modal');
  if(modal) modal.classList.remove('open');
  document.getElementById('admin-login-form').style.display='block';
  document.getElementById('admin-panel').style.display='none';
  document.getElementById('a-user').value='';
  document.getElementById('a-pass').value='';
}
const adminModal = document.getElementById('admin-modal');
if(adminModal) {
  adminModal.addEventListener('click',function(e){ if(e.target===this) closeAdmin(); });
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAdmin();closeMobile();}});

