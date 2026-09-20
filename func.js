/* ============ Utilidades ============ */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = c => 'S/ ' + (c/100).toLocaleString('es-PE',{minimumFractionDigits:2, maximumFractionDigits:2});
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const pad = n => String(n).padStart(4,'0');
const fmtTime = d => d.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
const fmtDate = d => d.toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'});
const ICON = {
  ticket:'<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.3 2.4 3.5 5.2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',
  check:'<path d="M20 6L9 17l-5-5"/>'
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

/* ============ Datos de ejemplo ============ */
const USERS = {
  admin:     { pass:'admin123',  role:'Administrador',       admin:true  },
  encargado: { pass:'ventas123', role:'Encargado de ventas', admin:false }
};
const PROD = [
  {id:'p1', name:'Torta tres leches',       cat:'Tortas',   price:5800, unit:'torta entera', art:'🍰'},
  {id:'p2', name:'Torta de chocolate',      cat:'Tortas',   price:6200, unit:'torta entera', art:'🎂'},
  {id:'p3', name:'Torta helada de lúcuma',  cat:'Tortas',   price:5500, unit:'torta entera', art:'🍨'},
  {id:'p4', name:'Torta de zanahoria',      cat:'Tortas',   price:5200, unit:'torta entera', art:'🥕'},
  {id:'p5', name:'Tarta de fresa',          cat:'Pasteles', price:950,  unit:'porción',      art:'🍓'},
  {id:'p6', name:'Milhojas',                cat:'Pasteles', price:800,  unit:'unidad',       art:'🥞'},
  {id:'p7', name:'Pionono de manjar',       cat:'Pasteles', price:650,  unit:'porción',      art:'🧁'},
  {id:'p8', name:'Éclair de chocolate',     cat:'Pasteles', price:700,  unit:'unidad',       art:'🍫'},
  {id:'p9', name:'Cheesecake de maracuyá',  cat:'Postres',  price:1000, unit:'porción',      art:'🍮'},
  {id:'p10',name:'Suspiro a la limeña',     cat:'Postres',  price:600,  unit:'copa',         art:'🍮'},
  {id:'p11',name:'Brownie con nueces',      cat:'Postres',  price:650,  unit:'unidad',       art:'🍫'},
  {id:'p12',name:'Keke de naranja',         cat:'Otros',    price:450,  unit:'porción',      art:'🥐'},
  {id:'p13',name:'Alfajores',               cat:'Otros',    price:300,  unit:'unidad',       art:'🍪'},
  {id:'p14',name:'Galletas de mantequilla', cat:'Otros',    price:800,  unit:'bolsa',        art:'🍪'}
];
const CATS = ['Todos','Tortas','Pasteles','Postres','Otros'];
const byId = id => PROD.find(p => p.id === id);

function makeSale(n, h, m, lines, paid, receipt, customer=''){
  const d = new Date(); d.setHours(h, m, 0, 0);
  const items = lines.map(([id,q]) => ({name:byId(id).name, price:byId(id).price, qty:q}));
  const total = items.reduce((s,i) => s + i.price*i.qty, 0);
  return { n, ts:d, items, total, paid, change:paid-total, receipt, customer, user:'encargado' };
}

const state = {
  user:null, view:'venta', cat:'Todos', q:'',
  cart:new Map(), paid:null,
  sales:[
    makeSale(1, 8,41, [['p5',2],['p13',3]], 3000, false),
    makeSale(2, 9,27, [['p1',1]], 6000, true, 'Rosa Medina'),
    makeSale(3,10, 5, [['p9',2],['p11',1]], 2650, false)
  ],
  seq:4
};

/* ============ Inicio de sesión ============ */
const userEl = $('#user'), passEl = $('#pass'), loginMsg = $('#loginMsg');

function setLoginError(msg, which){
  loginMsg.textContent = msg;
  loginMsg.classList.toggle('err', !!msg);
  $('#userBox').classList.toggle('bad', which==='user' || which==='both');
  $('#passBox').classList.toggle('bad', which==='pass' || which==='both');
}
function tryLogin(){
  const u = userEl.value.trim().toLowerCase(), p = passEl.value;
  if(!u){ setLoginError('Ingresa tu nombre de usuario.', 'user'); userEl.focus(); return; }
  if(!p){ setLoginError('Ingresa tu contraseña.', 'pass'); passEl.focus(); return; }
  const btn = $('#loginBtn');
  btn.disabled = true; btn.textContent = 'Verificando…';
  setTimeout(() => {
    btn.disabled = false; btn.textContent = 'Iniciar sesión';
    const acc = USERS[u];
    if(!acc || acc.pass !== p){
      setLoginError('Usuario o contraseña incorrectos. Revisa los datos e inténtalo otra vez.', 'both');
      passEl.select();
      return;
    }
    setLoginError('', '');
    enterApp(u);
  }, 600);
}
$('#loginBtn').addEventListener('click', tryLogin);
[userEl, passEl].forEach(el => {
  el.addEventListener('keydown', e => { if(e.key === 'Enter') tryLogin(); });
  el.addEventListener('input', () => setLoginError('', ''));
});
$('#togglePass').addEventListener('click', e => {
  const show = passEl.type === 'password';
  passEl.type = show ? 'text' : 'password';
  e.currentTarget.textContent = show ? 'Ocultar' : 'Mostrar';
  e.currentTarget.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});
$$('[data-fill]').forEach(b => b.addEventListener('click', () => {
  const [u,p] = b.dataset.fill.split(',');
  userEl.value = u; passEl.value = p; setLoginError('', '');
  $('#loginBtn').focus();
}));

function enterApp(u){
  state.user = { username:u, ...USERS[u] };
  $('#login').hidden = true; $('#app').hidden = false;
  $('#avatar').textContent = u[0];
  $('#whoName').textContent = u;
  $('#whoRole').textContent = state.user.role;
  $('#today').textContent = new Date().toLocaleDateString('es-PE',{weekday:'long', day:'numeric', month:'long'});
  buildNav();
  go('venta');
  window.scrollTo(0,0);
}
$('#logout').addEventListener('click', () => {
  state.user = null; state.cart.clear(); state.paid = null;
  $('#paid').value = ''; $('#receipt').checked = false; $('#cust').value = '';
  closeDrawer();
  $('#app').hidden = true; $('#login').hidden = false;
  userEl.value = ''; passEl.value = '';
  userEl.focus();
});

/* ============ Navegación ============ */
const NAV = [
  {id:'venta',     label:'Nueva venta',        icon:'ticket', group:'Ventas'},
  {id:'historial', label:'Ventas registradas', icon:'list',   group:'Ventas'},
  {id:'productos', label:'Productos',          icon:'box',    group:'Administración', admin:true},
  {id:'usuarios',  label:'Usuarios',           icon:'users',  group:'Administración', admin:true}
];
function buildNav(){
  let html = '', last = '';
  NAV.filter(n => !n.admin || state.user.admin).forEach(n => {
    if(n.group !== last){ html += `<div class="nav-group">${n.group}</div>`; last = n.group; }
    html += `<a href="#" data-go="${n.id}">${icon(n.icon)}${n.label}</a>`;
  });
  $('#nav').innerHTML = html;
}
$('#nav').addEventListener('click', e => {
  const a = e.target.closest('[data-go]'); if(!a) return;
  e.preventDefault(); go(a.dataset.go);
});
function go(view){
  const item = NAV.find(n => n.id === view);
  if(!item || (item.admin && !state.user.admin)) view = 'venta';
  state.view = view;
  $$('.view').forEach(v => v.hidden = v.id !== 'v-' + view);
  $$('#nav a').forEach(a => { if(a.dataset.go === view) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  if(view === 'historial') renderSales();
  closeDrawer();
  updateMobileBar();
}
function openDrawer(){ $('#side').classList.add('open'); $('#scrim').hidden = false; $('#burger').setAttribute('aria-expanded','true'); }
function closeDrawer(){ $('#side').classList.remove('open'); $('#scrim').hidden = true; $('#burger').setAttribute('aria-expanded','false'); }
$('#burger').addEventListener('click', () => $('#side').classList.contains('open') ? closeDrawer() : openDrawer());
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeDrawer(); });

/* ============ Catálogo (RF07, RF10) ============ */
function renderCats(){
  $('#cats').innerHTML = CATS.map(c => `<button type="button" data-cat="${c}" aria-pressed="${c===state.cat}">${c}</button>`).join('');
}
$('#cats').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  state.cat = b.dataset.cat; renderCats(); renderGrid();
});
$('#search').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });

function renderGrid(){
  const q = norm(state.q.trim());
  const list = PROD.filter(p => (state.cat==='Todos' || p.cat===state.cat) && (!q || norm(p.name).includes(q)));
  if(!list.length){
    $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1">No hay productos que coincidan${q ? ` con “${esc(state.q.trim())}”` : ''}. Prueba con otro nombre o cambia de categoría.</div>`;
    return;
  }
  $('#grid').innerHTML = list.map(p => {
    const qty = state.cart.get(p.id) || 0;
    return `<button type="button" class="prod" data-id="${p.id}" data-cat="${p.cat}" aria-label="Agregar ${esc(p.name)}, ${money(p.price)}">
      <span class="prod-art" aria-hidden="true">${p.art}</span>
      <span class="prod-name">${esc(p.name)}</span>
      <span class="prod-meta"><span class="prod-price num">${money(p.price)}</span><span class="prod-unit">${p.unit}</span></span>
      ${qty ? `<span class="prod-badge num ${p.id===state.lastAdded ? 'pop' : ''}" aria-label="${qty} en la venta">${qty}</span>` : ''}
    </button>`;
  }).join('');
}
$('#grid').addEventListener('click', e => {
  const b = e.target.closest('.prod'); if(!b) return;
  const id = b.dataset.id;
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  state.lastAdded = id;
  refresh();
  const again = $(`.prod[data-id="${id}"]`); if(again) again.focus({preventScroll:true});
});

/* ============ Venta actual (RF10 a RF13) ============ */
const lines = () => [...state.cart].map(([id, qty]) => { const p = byId(id); return {p, qty, amount:p.price*qty}; });
const cartTotal = () => lines().reduce((s,l) => s + l.amount, 0);
const cartCount = () => lines().reduce((s,l) => s + l.qty, 0);

function renderLines(){
  const ls = lines();
  $('#empty').hidden = ls.length > 0;
  $('#lines').hidden = ls.length === 0;
  $('#clear').hidden = ls.length === 0;
  $('#lines').innerHTML = ls.map(({p,qty,amount}) => `
    <li class="line">
      <span class="line-name">${esc(p.name)}</span>
      <span class="line-amt num">${money(amount)}</span>
      <span class="line-unit num">${money(p.price)} c/u</span>
      <span class="line-ctl">
        <span class="stepper">
          <button type="button" data-act="dec" data-id="${p.id}" aria-label="Quitar una unidad de ${esc(p.name)}">${icon('minus')}</button>
          <span class="q num" aria-label="${qty} unidades">${qty}</span>
          <button type="button" data-act="inc" data-id="${p.id}" aria-label="Agregar una unidad de ${esc(p.name)}">${icon('plus')}</button>
        </span>
        <button type="button" class="icon-btn" data-act="rm" data-id="${p.id}" aria-label="Quitar ${esc(p.name)} de la venta">${icon('trash')}</button>
      </span>
    </li>`).join('');
}
$('#lines').addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return;
  const id = b.dataset.id, q = state.cart.get(id) || 0;
  if(b.dataset.act === 'inc') state.cart.set(id, q + 1);
  if(b.dataset.act === 'dec'){ q <= 1 ? state.cart.delete(id) : state.cart.set(id, q - 1); }
  if(b.dataset.act === 'rm') state.cart.delete(id);
  state.lastAdded = null;
  refresh();
  const again = $(`#lines [data-act="${b.dataset.act}"][data-id="${id}"]`);
  if(again) again.focus({preventScroll:true}); else if(state.cart.size) $('#lines [data-act="inc"]').focus({preventScroll:true});
});
$('#clear').addEventListener('click', () => { state.cart.clear(); refresh(); });

const paidEl = $('#paid');
paidEl.addEventListener('input', e => {
  let v = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
  const i = v.indexOf('.');
  if(i >= 0) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '').slice(0, 2);
  e.target.value = v;
  state.paid = (v === '' || v === '.') ? null : Math.round(parseFloat(v) * 100);
  updateMoney();
});
$('#quick').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if(!b) return;
  const t = cartTotal();
  if(b.dataset.q === 'exact'){ if(!t) return; state.paid = t; }
  else state.paid = Number(b.dataset.q) * 100;
  paidEl.value = (state.paid / 100).toFixed(2);
  updateMoney();
});
$('#receipt').addEventListener('change', e => { $('#custBox').hidden = !e.target.checked; });

function updateMoney(){
  const t = cartTotal(), p = state.paid;
  $('#total').textContent = money(t);
  const ch = $('#change'); ch.className = 'change num';
  let hint = '', ok = false;
  if(!t){
    ch.innerHTML = '<span>Cambio</span><strong>S/ 0.00</strong>';
    hint = 'Agrega al menos un producto.';
  } else if(p === null){
    ch.innerHTML = '<span>Cambio</span><strong>S/ 0.00</strong>';
    hint = 'Ingresa el monto entregado para confirmar.';
  } else if(p < t){
    ch.classList.add('bad');
    ch.innerHTML = `<span>Falta por cobrar</span><strong>${money(t - p)}</strong>`;
    hint = 'El monto entregado no cubre el total.';
  } else if(p === t){
    ch.classList.add('ok');
    ch.innerHTML = '<span>Pago exacto, sin cambio</span><strong>S/ 0.00</strong>';
    ok = true;
  } else {
    ch.classList.add('ok');
    ch.innerHTML = `<span>Cambio a entregar</span><strong>${money(p - t)}</strong>`;
    ok = true;
  }
  $('#paidBox').classList.toggle('bad', !!t && p !== null && p < t);
  $('#confirm').disabled = !ok;
  $('#hint').textContent = hint;
  updateMobileBar();
}
function updateMobileBar(){
  const n = cartCount();
  const bar = $('#mbar');
  bar.classList.toggle('on', n > 0 && state.view === 'venta');
  $('#mbarLeft').textContent = `Ver venta (${n} ${n === 1 ? 'producto' : 'productos'})`;
  $('#mbarRight').textContent = money(cartTotal());
}
$('#mbar').addEventListener('click', () => $('#ticket').scrollIntoView({behavior:'smooth', block:'start'}));
function refresh(){ renderGrid(); renderLines(); updateMoney(); }

/* ============ Confirmar venta (RF09, RF14) ============ */
function slipHTML(s){
  const rows = s.items.map(i => `<tr><td>${esc(i.name)}<small class="num">${i.qty} × ${money(i.price)}</small></td><td class="r num">${money(i.price*i.qty)}</td></tr>`).join('');
  const code = pad(s.n);
  return `<div class="slip">
    <div class="slip-title">
      <strong>${s.receipt ? 'Comprobante de pago' : 'Resumen de la venta'}</strong>
      <span>Pastelería José Luis</span>
      <span class="num">${s.receipt ? 'N° C-' + code : 'N° V-' + code}</span>
    </div>
    <div class="meta"><span class="num">${fmtDate(s.ts)}, ${fmtTime(s.ts)}</span>${s.customer ? `<span>Cliente: ${esc(s.customer)}</span>` : ''}</div>
    <table>${rows}</table>
    <hr class="sep">
    <div class="sum big num"><span>Total</span><span>${money(s.total)}</span></div>
    <div class="sum num"><span>Monto entregado</span><span>${money(s.paid)}</span></div>
    <div class="sum num"><span>Cambio</span><span>${money(s.change)}</span></div>
    <div class="meta"><span>Atendido por ${esc(s.user)}</span></div>
    ${s.receipt ? '<p class="note">Comprobante de ejemplo del prototipo. No es un documento electrónico válido.</p>' : ''}
  </div>`;
}
function openSale(s, fresh){
  $('#dlgBody').innerHTML = `
    <div class="ok-head">
      <div class="ok-icon">${icon('check')}</div>
      <div>
        <h2 id="dlgTitle">${fresh ? 'Venta registrada' : 'Detalle de la venta'}</h2>
        <p class="num">V-${pad(s.n)}${fresh ? (s.receipt ? ', con comprobante' : ', sin comprobante') : ''}</p>
      </div>
    </div>
    ${slipHTML(s)}
    <div class="dlg-actions">
      ${fresh
        ? `<button class="btn primary lg" type="button" data-d="new" autofocus>Registrar otra venta</button>
           <button class="btn ghost" type="button" data-d="hist">Ver ventas registradas</button>`
        : `<button class="btn primary lg" type="button" data-d="close" autofocus>Cerrar</button>`}
    </div>`;
  $('#dlg').showModal();
}
$('#dlg').addEventListener('click', e => {
  const d = e.target.closest('[data-d]');
  if(e.target === $('#dlg')){ $('#dlg').close(); return; }
  if(!d) return;
  $('#dlg').close();
  if(d.dataset.d === 'hist') go('historial');
  if(d.dataset.d === 'new'){ go('venta'); $('#search').focus(); }
});

$('#confirm').addEventListener('click', () => {
  const t = cartTotal(), p = state.paid;
  if(!t || p === null || p < t) return;
  const sale = {
    n: state.seq++, ts: new Date(),
    items: lines().map(l => ({name:l.p.name, price:l.p.price, qty:l.qty})),
    total: t, paid: p, change: p - t,
    receipt: $('#receipt').checked, customer: $('#cust').value.trim(),
    user: state.user.username
  };
  state.sales.push(sale);
  state.cart.clear(); state.paid = null;
  paidEl.value = ''; $('#receipt').checked = false; $('#cust').value = ''; $('#custBox').hidden = true;
  $('#saleId').textContent = 'Venta V-' + pad(state.seq);
  refresh();
  openSale(sale, true);
});

/* ============ Ventas registradas ============ */
function renderSales(){
  const s = state.sales, n = s.length, sum = s.reduce((a,x) => a + x.total, 0), avg = n ? Math.round(sum / n) : 0;
  $('#stats').innerHTML = `
    <div class="stat"><strong class="num">${n}</strong><span>Ventas realizadas hoy</span></div>
    <div class="stat"><strong class="num">${money(sum)}</strong><span>Monto total de ventas</span></div>
    <div class="stat"><strong class="num">${money(avg)}</strong><span>Promedio por venta</span></div>`;
  const rows = [...s].reverse().map((x, idx) => `
    <tr>
      <td class="num"><b>V-${pad(x.n)}</b></td>
      <td class="num">${fmtTime(x.ts)}</td>
      <td class="items">${x.items.map(i => `${esc(i.name)} ×${i.qty}`).join(', ')}</td>
      <td class="r num"><b>${money(x.total)}</b></td>
      <td class="r num">${money(x.paid)}</td>
      <td class="r num">${money(x.change)}</td>
      <td><span class="tag ${x.receipt ? 'yes' : ''}">${x.receipt ? 'Sí' : 'No'}</span></td>
      <td>${esc(x.user)}</td>
      <td><button class="link-btn" type="button" data-sale="${x.n}" aria-label="Ver detalle de la venta V-${pad(x.n)}">Ver</button></td>
    </tr>`).join('');
  $('#salesTable').innerHTML = `
    <thead><tr><th>N°</th><th>Hora</th><th>Productos</th><th class="r">Total</th><th class="r">Entregado</th><th class="r">Cambio</th><th>Comprobante</th><th>Registró</th><th><span class="sr">Acciones</span></th></tr></thead>
    <tbody>${rows}</tbody>`;
}
$('#salesTable').addEventListener('click', e => {
  const b = e.target.closest('[data-sale]'); if(!b) return;
  openSale(state.sales.find(x => x.n === Number(b.dataset.sale)), false);
});

/* ============ Inicio ============ */
renderCats(); refresh();
$('#saleId').textContent = 'Venta V-' + pad(state.seq);