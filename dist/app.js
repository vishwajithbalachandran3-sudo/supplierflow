/* Supplierflow: a browser-local product prototype. Email delivery is never implied. */
'use strict';
const C = window.SupplierCore;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  box:'<path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10M7.5 5 17 9"/>',
  inbox:'<path d="M4 4h16l2 12v4H2v-4zM2 16h6l2 3h4l2-3h6"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  workflow:'<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5.5 17v-5h13v5"/>',
  file:'<path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9zM14 2v7h7M7 13h10M7 17h7"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"/>',
  settings:'<path d="m12 3 2 3 3-.5.5 3 3 2-2 2 .5 3-3 .5-2 3-2-2-3 .5-.5-3-3-2 2-2-.5-3 3-.5z"/><circle cx="12" cy="12" r="3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',left:'<path d="m15 5-7 7 7 7"/>',chevrons:'<path d="m8 8 4-4 4 4M8 16l4 4 4-4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  upload:'<path d="M12 16V3M7 8l5-5 5 5M3 15v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/>',
  download:'<path d="M12 3v13M7 11l5 5 5-5M3 16v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  send:'<path d="m22 2-7 20-4-9-9-4 20-7zM22 2 11 13"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  reply:'<path d="m9 10-5 5 5 5M4 15h10a6 6 0 0 0 0-12h-2"/>',
  arrow:'<path d="M4 12h16m-5-5 5 5-5 5"/>',
  up:'<path d="m5 15 6-6 4 4 5-7M15 6h5v5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>',
  dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  check:'<path d="m5 12 4 4L19 6"/>',checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',zap:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-6h4v6"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
  filter:'<path d="M4 7h16M7 12h10M10 17h4"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  link:'<path d="m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 9l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/>',
  alert:'<path d="m12 3 10 18H2zM12 9v5M12 17h.01"/>',edit:'<path d="m15 5 4 4M3 21l5-1L21 7l-5-5L3 15z"/>',
  sheet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18M3 15h18"/>',external:'<path d="M14 3h7v7M10 14 21 3M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  leaf:'<path d="M20 3c-12-1-19 7-13 13S22 15 20 3zM4 21 16 9"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.box}</svg>`;
const key = 'supplierflow.workspace.v1';
let storageWarning = false;
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(key)); if (s?.version===1&&Array.isArray(s.orders)) {s.orders.forEach((o,i)=>{o.supplierCode ||= `SUP-${String((i%999)+1).padStart(3,'0')}`;o.item='';if(o.automationEnabled===undefined)o.automationEnabled=true;s.settings.emailProvider??='';s.settings.fromEmail??='';s.settings.ccEmails??='';});if(validBackup(s))return s;} } catch { storageWarning = true; }
  return C.sampleState();
}
let state = loadState();
let ui = {page:'orders',filter:'all',orderId:state.orders.find(o=>C.overdue(o))?.id||null,queueFilter:'all',sort:'oldest',search:'',pageNumber:1,selected:new Set(),thread:null,template:'initial',mobile:false};
let upload = null, focusBeforeModal = null, toastTimeout;
const pages = {overview:'Reports',followups:'Follow-ups',orders:'Purchase orders',inbox:'Inbox',suppliers:'Suppliers',automations:'Automation rules',templates:'Email templates',settings:'Settings'};
const stageMeta = {awaiting:['Awaiting reply','orange'],overdue:['Overdue','red'],updated:['ETA updated','blue'],ontrack:['On track','gray'],shipped:['Shipped','green']};
function save() { try {localStorage.setItem(key,JSON.stringify(state));} catch {storageWarning=true;toast('Device storage is full or unavailable. Export your orders to keep a copy.','alert');} }
function dateLabel(date, long=false) { if(!date)return '—';return new Date(`${date.slice(0,10)}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',...(long?{year:'numeric'}:{})}); }
function relative(date) {const mins=Math.max(0,Math.round((Date.now()-Date.parse(date))/60000));return mins<1?'Just now':mins<60?`${mins}m ago`:mins<1440?`${Math.floor(mins/60)}h ago`:`${Math.floor(mins/1440)}d ago`;}
const initials = s => s.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
function logo(o) { return `<span class="supplier-logo ${esc(o.color || '')}">${esc(initials(o.supplier))}</span>`; }
function badge(o) { const [text,color] = stageMeta[C.stage(o)];return `<span class="tag ${color}"><span class="dot"></span>${text}</span>`; }
function matchesFilter(o,filter) {return filter==='drafts'?!!o.draft&&!o.shipped:filter==='escalated'?!!o.escalated&&!o.shipped:C.matches(o,filter);}
function count(filter) { return state.orders.filter(o=>matchesFilter(o,filter)).length; }
function notifyActivity(type,title,detail) {state.activity.unshift({id:crypto.randomUUID(),type,title,detail,at:new Date().toISOString()});state.activity=state.activity.slice(0,100);}
function toast(message,name='checkCircle') { clearTimeout(toastTimeout);$('#toast-root').innerHTML=`<div class="toast" role="status">${icon(name)}<span>${esc(message)}</span></div>`;toastTimeout=setTimeout(()=>$('#toast-root').innerHTML='',4500); }
function go(page,filter='all') {
  if(!pages[page])page='orders';
  ui.page=page;ui.filter=filter;ui.search='';ui.pageNumber=1;ui.selected.clear();ui.mobile=false;
  history.replaceState(null,'',`#${page}`);
  closeModal(false);render();$('#main-content').scrollTop=0;
}

function navButton(page,name,label,bubble='') {return `<button class="nav-item ${ui.page===page?'active':''}" data-action="nav" data-page="${page}" ${ui.page===page?'aria-current="page"':''}>${icon(name)}<span>${label}</span>${bubble?`<span class="nav-count">${bubble}</span>`:''}</button>`;}
function render() {
  const replyCount=state.orders.filter(o=>o.lastReply&&!o.shipped).length;
  const draftCount=count('drafts');
  document.title=`${pages[ui.page]} · Supplierflow`;
  $('#app').innerHTML=`<aside class="sidebar ${ui.mobile?'open':''}" aria-label="Main navigation">
    <a class="logo" href="#orders" data-action="nav" data-page="orders"><span class="brandmark"><svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 6h22l-6 8H3zm24 18H5l6-8h16z" fill="currentColor"/></svg></span>Supplierflow</a>
    <div class="workspace"><div class="workspace-avatar">${icon('building')}</div><div><div class="workspace-name">${esc(state.settings.company)}</div><small>Purchasing</small></div></div>
    <div class="nav-label">Operations</div><nav class="nav-group">${navButton('orders','box','Purchase orders',state.orders.length)}${navButton('followups','send','Follow-ups',draftCount||'')}${navButton('inbox','inbox','Supplier inbox',replyCount||'')}${navButton('suppliers','users','Suppliers')}${navButton('overview','grid','Reports')}</nav>
    <div class="nav-label">Configuration</div><nav class="nav-group">${navButton('automations','workflow','Automation rules')}${navButton('templates','file','Email templates')}</nav>
    <div class="sidebar-bottom"><button class="mailbox-status" data-action="connection"><span class="mailbox-indicator"></span><span>${state.settings.emailProvider?`${state.settings.emailProvider==='gmail'?'Gmail':'Outlook'} selected`:'Email not configured'}<small>${state.settings.fromEmail?esc(state.settings.fromEmail):'Choose provider and From address'}</small></span>${icon('chevron')}</button>
    <button class="nav-item" data-action="help">${icon('help')}<span>Help & shortcuts</span></button>${navButton('settings','settings','Settings')}
    <div class="profile"><div class="avatar">${esc(initials(state.settings.senderName))}</div><div><div class="small strong">${esc(state.settings.senderName)}</div><div class="tiny muted">${state.mode==='demo'?'Sample workspace':'Local workspace'}</div></div></div></div>
  </aside>
  <div class="main-shell"><header class="topbar"><div class="breadcrumb"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Toggle navigation" aria-expanded="${ui.mobile}">${icon('menu')}</button><span>Purchasing</span>${icon('chevron')}<span class="current">${pages[ui.page]}</span></div><div class="header-actions"><button class="global-search" data-action="search" aria-label="Search purchase orders">${icon('search')}<span>Search orders</span><kbd>Ctrl K</kbd></button><span class="separator"></span><button class="icon-btn" data-action="activity" aria-label="View activity">${icon('bell')}${state.activity.length?'<span class="notify-indicator"></span>':''}</button><button class="icon-btn" data-action="nav" data-page="settings" aria-label="Workspace settings"><span class="avatar">${esc(initials(state.settings.senderName))}</span></button></div></header>
  <main class="content view-${ui.page}" id="main-content">${renderPage()}</main><footer class="app-status"><span><i class="dot"></i>${storageWarning?'Storage unavailable':state.mode==='demo'?'Sample data':state.mode==='mixed'?'Sample + imported data':'Local workspace'}<b>·</b> ${state.orders.length} orders</span><span>${icon('shield')} Stored on this device <b>·</b> Email delivery: demo</span></footer></div>`;
  if(ui.page==='templates')updateTemplatePreview();
}

function heading(title,subtitle,actions='',eyebrow='') {return `<div class="page-heading"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h1>${title}</h1><p>${subtitle}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`;}
const importButton = ()=>`<button class="btn primary" data-action="import">${icon('upload')}Import Excel</button>`;
const exportButton = ()=>`<button class="btn" data-action="export">${icon('download')}Export</button>`;
function renderPage() { switch(ui.page) {case'overview':return overview();case'followups':return followupsPage();case'orders':return ordersPage();case'inbox':return inboxPage();case'suppliers':return suppliersPage();case'automations':return automationPage();case'templates':return templatesPage();case'settings':return settingsPage();} }
function sparkline(type) {
  const paths={orders:'M0 27 10 24 18 26 27 18 36 21 46 10 54 15 65 5 75 8 84 0',overdue:'M0 7 10 3 18 14 27 10 36 19 45 16 55 23 65 19 74 25 84 21',awaiting:'M0 24 12 22 20 17 30 20 39 10 49 13 58 7 66 11 75 3 84 5',updated:'M0 27 10 24 20 24 30 18 40 21 50 11 60 13 70 5 84 2'};
  const color=type==='overdue'?'#cb9c7c':type==='updated'?'#92a6bf':'#99b888';
  return `<svg class="sparkline" viewBox="0 0 84 32" aria-hidden="true"><path d="${paths[type]} L84 32H0Z" fill="${color}" opacity=".09"/><path d="${paths[type]}" stroke="${color}" fill="none" stroke-width="1.5"/></svg>`;
}
function metrics() {
  const active=state.orders.filter(o=>!o.shipped).length;
  const values=[['Total orders',state.orders.length,'box','orders','all',`${active} active purchase orders`],['Overdue shipments',count('overdue'),'clock','overdue','overdue','Ready for a shipping update'],['Awaiting reply',count('awaiting'),'send','awaiting','awaiting',`Reminder after ${state.settings.reminderDays} days`],['Updated ship dates',count('updated'),'reply','updated','updated','Supplier updates recorded']];
  return `<section class="metrics" aria-label="Order summary">${values.map(([title,value,name,type,filter,foot])=>`<button class="metric" data-action="metric" data-filter="${filter}"><div class="metric-title"><span>${title}</span>${icon(name)}</div><div class="metric-value">${String(value).padStart(2,'0')}</div>${state.mode==='demo'?sparkline(type):''}<div class="metric-foot">${icon(type==='overdue'?'clock':'checkCircle')}<span>${foot}</span></div></button>`).join('')}</section>`;
}
function overview() {
  return `${heading('Reports','Order status and supplier response activity.',exportButton())}${metrics()}<div class="report-grid"><section class="card"><div class="card-head"><h2>Activity log</h2><button class="btn sm" data-action="activity">View all</button></div><div class="activity-list">${activityList(8)}</div></section>${performanceCard()}</div>`;
}

function activityList(limit=100) {
  if(!state.activity.length)return '<p class="muted small">Your import and follow-up activity will appear here.</p>';
  const map={reply:['reply','blue'],email:['send',''],import:['sheet','orange'],rule:['workflow',''],ship:['box',''],alert:['alert','orange']};
  return state.activity.slice(0,limit).map(a=>{const [name,color]=map[a.type]||['check',''];return `<div class="activity-item"><span class="activity-icon ${color}">${icon(name)}</span><div><div class="activity-text">${esc(a.title)}</div><div class="activity-description">${esc(a.detail)}</div><div class="activity-time">${relative(a.at)}</div></div></div>`;}).join('');
}
function performanceCard() {
  const messages=state.orders.flatMap(o=>o.messages||[]).filter(m=>m.direction==='incoming');
  const days=Array.from({length:7},(_,i)=>C.offsetDate(i-6));
  const counts=days.map(d=>messages.filter(m=>C.isoDate(m.at)===d).length);const max=Math.max(1,...counts);
  return `<section class="card"><div class="card-head"><h2>Supplier responses</h2><span class="tiny muted">Last 7 days</span></div><div class="performance-body"><div class="chart-heading"><span class="chart-value">${counts.reduce((a,b)=>a+b,0)}</span><span class="chart-unit">replies received</span></div><div class="bar-chart" role="img" aria-label="Supplier replies over the last seven days: ${days.map((d,i)=>`${dateLabel(d)}: ${counts[i]}`).join(', ')}">${counts.map((n,i)=>`<div class="chart-col ${i===6?'today':''}" title="${dateLabel(days[i])}: ${n} replies"><div class="bar" style="height:${n?Math.max(10,n/max*100):4}%"></div></div>`).join('')}</div><div class="chart-days">${days.map(d=>`<span>${new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})[0]}</span>`).join('')}</div><div class="chart-note"><span class="dot"></span>${state.mode==='demo'?'Sample conversations · explore your inbox':'Recorded supplier replies'}</div></div></section>`;
}
function tableTabs(compact=false) {
  const filters=compact?[['all','All orders'],['overdue','Overdue'],['awaiting','Awaiting reply']]:[['all','All orders'],['overdue','Overdue'],['awaiting','Awaiting reply'],['updated','ETA updated'],['shipped','Shipped']];
  return `<div class="table-controls"><div class="tabs" role="tablist" aria-label="Filter orders">${filters.map(([value,label])=>`<button class="tab ${ui.filter===value?'active':''}" role="tab" aria-selected="${ui.filter===value}" data-action="filter" data-filter="${value}">${label}${value==='overdue'?`<small>${count(value)}</small>`:''}</button>`).join('')}</div>${compact?`<label class="mini-search">${icon('search')}<input id="order-search" placeholder="Search orders..." aria-label="Search orders" value="${esc(ui.search)}"></label>`:''}</div>`;
}
function filteredOrders(compact=false) {
  const q=ui.search.toLowerCase();let arr=state.orders.filter(o=>matchesFilter(o,ui.filter)&&[o.supplier,o.supplierCode,o.po,o.email].some(v=>String(v||'').toLowerCase().includes(q)));
  if(compact)arr.sort((a,b)=>Number(C.overdue(b))-Number(C.overdue(a))||C.effectiveDate(a).localeCompare(C.effectiveDate(b)));
  else if(ui.sort==='oldest')arr.sort((a,b)=>C.effectiveDate(a).localeCompare(C.effectiveDate(b)));
  else if(ui.sort==='supplier')arr.sort((a,b)=>a.supplier.localeCompare(b.supplier));
  return arr;
}
function orderTable(compact=false) {
  const arr=filteredOrders(compact),size=compact?6:15,total=arr.length,maxPage=Math.max(1,Math.ceil(total/size));ui.pageNumber=Math.min(ui.pageNumber,maxPage);
  const current=arr.slice((ui.pageNumber-1)*size,ui.pageNumber*size);
  const allSelected=current.length&&current.every(o=>ui.selected.has(o.id));
  if(!total)return `<div class="empty"><div class="empty-icon">${icon('box')}</div><h3>${state.orders.length?'No matching orders':'No purchase orders yet'}</h3><p>${state.orders.length?'Change the filters or search to find an order.':'Import a spreadsheet or add your first order.'}</p><button class="btn" data-action="${state.orders.length?'clear-filter':'import'}">${state.orders.length?'Clear filters':'Import Excel'}</button></div>`;
  return `${ui.selected.size?`<div class="selection-bar"><strong>${ui.selected.size} selected</strong><button class="btn sm" data-action="batch-draft">${icon('mail')}Prepare drafts</button><button class="btn sm" data-action="batch-ship">${icon('check')}Mark shipped</button><button class="icon-btn" data-action="clear-selection" aria-label="Clear selection">${icon('close')}</button></div>`:''}<div class="table-wrap"><table class="orders-table"><thead><tr><th class="check-col"><input type="checkbox" data-action="select-all" ${allSelected?'checked':''} aria-label="Select visible orders"></th><th>PO number</th><th>Supplier</th><th>Supplier code</th><th>Shipping date</th><th>Status</th><th><span class="screen-reader">Order actions</span></th></tr></thead><tbody>${current.map(o=>`<tr class="${ui.orderId===o.id?'active-row':''}" data-action="select-order" data-id="${esc(o.id)}"><td><input type="checkbox" data-action="select" data-id="${esc(o.id)}" ${ui.selected.has(o.id)?'checked':''} aria-label="Select ${esc(o.po)}"></td><td><button class="po-link" data-action="select-order" data-id="${esc(o.id)}">${esc(o.po)}</button>${o.draft?'<div class="row-note draft-note">Draft ready</div>':o.escalated?'<div class="row-note late-note">Escalated</div>':''}</td><td><div class="supplier-cell">${logo(o)}<div><div class="supplier-title">${esc(o.supplier)}</div><div class="supplier-meta">${o.email?esc(o.email):'Email required'}</div></div></div></td><td><span class="code-cell">${esc(o.supplierCode)}</span></td><td><div class="date-cell">${dateLabel(C.effectiveDate(o))}</div>${C.overdue(o)?`<div class="date-overdue">${C.daysBetween(C.effectiveDate(o))}d overdue</div>`:o.revisedDate?'<div class="row-note">Revised</div>':''}</td><td>${badge(o)}${o.automationEnabled===false?'<div class="row-note">Automation off</div>':''}</td><td><button class="icon-btn row-open" data-action="select-order" data-id="${esc(o.id)}" aria-label="View ${esc(o.po)}">${icon('chevron')}</button></td></tr>`).join('')}</tbody></table></div><div class="table-footer"><span>${(ui.pageNumber-1)*size+1}–${Math.min(total,ui.pageNumber*size)} of ${total} orders${ui.search?' · filtered':''}</span><div class="pagination"><button class="icon-btn" data-action="prev" ${ui.pageNumber===1?'disabled':''} aria-label="Previous page">${icon('left')}</button><span>${ui.pageNumber} / ${maxPage}</span><button class="icon-btn" data-action="next" ${ui.pageNumber===maxPage?'disabled':''} aria-label="Next page">${icon('chevron')}</button></div></div>`;
}

function refreshTable() { const region=$('#order-table-region');if(region)region.innerHTML=orderTable(ui.page==='overview'); }
function ordersPage() {
  const active=state.orders.find(o=>o.id===ui.orderId);
  const counts=[['all','All orders',state.orders.length],['overdue','Overdue',count('overdue')],['awaiting','Awaiting reply',count('awaiting')],['updated','ETA updated',count('updated')],['drafts','Drafts',count('drafts')],['shipped','Shipped',count('shipped')]];
  return `${heading('Purchase orders','',`<button class="btn" data-action="export">${icon('download')}Export</button><button class="btn" data-action="new-order">＋ Add order</button>${importButton()}`)}
  <div class="operations-strip"><span class="operation-alert">${icon('clock')}<strong>${count('overdue')}</strong> overdue</span><span><strong>${count('awaiting')}</strong> awaiting reply</span><span><strong>${state.orders.filter(o=>o.escalated&&!o.shipped).length}</strong> escalated</span><button class="link-btn" data-action="run-check">${icon('refresh')}Run automation check</button></div>
  <div class="orders-workspace ${active?'has-detail':''}"><section class="order-register"><div class="order-toolbar"><label class="mini-search">${icon('search')}<input id="order-search" placeholder="Search PO, supplier, code, or email" aria-label="Search purchase orders" value="${esc(ui.search)}"></label><select class="select" id="order-sort" aria-label="Sort orders"><option value="oldest" ${ui.sort==='oldest'?'selected':''}>Ship date: earliest</option><option value="default" ${ui.sort==='default'?'selected':''}>Recently added</option><option value="supplier" ${ui.sort==='supplier'?'selected':''}>Supplier: A–Z</option></select></div>
  <div class="table-controls"><div class="tabs" role="tablist" aria-label="Filter purchase orders">${counts.map(([value,label,n])=>`<button class="tab ${ui.filter===value?'active':''}" role="tab" aria-selected="${ui.filter===value}" data-action="filter" data-filter="${value}">${label}<small>${n}</small></button>`).join('')}</div></div><div id="order-table-region">${orderTable()}</div></section>${active?`<aside class="order-inspector" aria-label="Selected order details" id="order-inspector">${orderInspector(active)}</aside>`:''}</div>`;
}

function inboxPage() {
  const threads=state.orders.filter(o=>o.messages.length||o.draft).sort((a,b)=>(b.lastReply||b.lastSent||'').localeCompare(a.lastReply||a.lastSent||''));
  if(!ui.thread||!threads.some(o=>o.id===ui.thread))ui.thread=threads[0]?.id;
  const o=state.orders.find(x=>x.id===ui.thread);
  return `${heading('Supplier inbox','Order-linked conversations and supplier updates.',`<button class="btn" data-action="connection">${icon('link')}Email connection</button>`)}<div class="notice info" style="margin-bottom:20px">${icon('mail')} &nbsp; ${state.mode==='demo'?'You’re viewing sample conversations.':'Replies are recorded manually in this workspace.'} Connect a production mailbox to receive and send email automatically.</div><section class="card inbox-layout"><div class="thread-list"><div class="thread-list-head between"><h3>Conversations <span class="count-pill">${threads.length}</span></h3>${icon('inbox')}</div>${threads.map(t=>`<button class="thread-item ${ui.thread===t.id?'active':''}" data-action="thread" data-id="${esc(t.id)}"><div class="between"><div class="flex gap">${logo(t)}<span class="small strong">${esc(t.supplier)}</span></div>${t.lastReply?'<span class="dot" style="color:#88a66d"></span>':''}</div><div class="thread-subject">Shipping update · ${esc(t.po)}</div><div class="thread-preview">${esc(t.messages.at(-1)?.body||'Email draft ready for review.')}</div><div class="between" style="margin-top:12px"><span class="tiny muted">${t.draft?'Draft ready':t.lastReply?'Supplier replied':'Awaiting reply'}</span><span class="tiny muted">${relative(t.lastReply||t.lastSent||t.draft?.at)}</span></div></button>`).join('')||'<div class="empty"><p>No conversations yet.</p></div>'}</div><div class="conversation">${o?conversation(o):'<div class="empty"><div class="empty-icon">'+icon('inbox')+'</div><h3>Make your first connection</h3><p>Open an order to prepare an email or record a supplier reply.</p><button class="btn primary" data-action="nav" data-page="orders">View orders</button></div>'}</div></section>`;
}
function messageMarkup(m) {return `<article class="message ${m.direction==='incoming'?'received':''}"><div class="between"><strong class="small">${m.direction==='incoming'?'Supplier update':'Purchasing team'}</strong><span class="message-meta">${dateLabel(m.at)} · ${new Date(m.at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></div><div class="message-body">${esc(m.body)}</div><div class="message-meta">${m.manual?'Manually recorded':m.demo||state.mode==='demo'?'Demo message':'Recorded in workspace'}</div></article>`;}
function conversation(o) {return `<div class="conversation-head"><div class="between"><h2>Shipping update · ${esc(o.po)}</h2><button class="icon-btn" data-action="order" data-id="${esc(o.id)}" aria-label="View order details">${icon('external')}</button></div><p class="small muted">${esc(o.supplier)} <span style="margin:0 5px">·</span> ${esc(o.supplierCode)}</p></div>${o.revisedDate?`<div class="eta-banner">${icon('calendar')}<span>Revised ship date <strong>${dateLabel(o.revisedDate,true)}</strong></span><button class="btn sm" data-action="draft" data-id="${esc(o.id)}" data-type="acknowledgement">Acknowledge update ${icon('arrow')}</button></div>`:''}${o.messages.map(messageMarkup).join('')}<div class="between" style="margin-top:20px"><button class="btn" data-action="record-reply" data-id="${esc(o.id)}">${icon('reply')}Analyze reply</button><button class="btn primary" data-action="draft" data-id="${esc(o.id)}" data-type="${o.lastReply?'acknowledgement':o.lastSent?'reminder':'initial'}">${icon('edit')}${o.draft?'Review draft':'Prepare reply'}</button></div>`;}
function suppliersPage() {
  const suppliers=[...new Set(state.orders.map(o=>o.supplier))].sort().map(name=>({name,orders:state.orders.filter(o=>o.supplier===name)}));
  return `${heading('Suppliers',`${suppliers.length} suppliers in this workspace.`,importButton())}<section class="card supplier-directory"><div class="table-wrap"><table><thead><tr><th>Supplier</th><th>Contact email</th><th>Orders</th><th>Overdue</th><th>Replies</th><th></th></tr></thead><tbody>${suppliers.map(s=>`<tr><td><div class="supplier-cell">${logo(s.orders[0])}<strong>${esc(s.name)}</strong></div></td><td>${esc(s.orders[0].email)}</td><td>${s.orders.length}</td><td><span class="tag ${s.orders.some(o=>C.overdue(o))?'red':'gray'}">${s.orders.filter(o=>C.overdue(o)).length}</span></td><td>${s.orders.filter(o=>o.lastReply).length}</td><td><button class="btn sm" data-action="supplier-orders" data-name="${esc(s.name)}">View orders ${icon('chevron')}</button></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty"><h3>No suppliers yet</h3><p>Add or import orders to populate the directory.</p></div></td></tr>'}</tbody></table></div></section>`;
}

function automationPage() {
  const s=state.settings;
  return `${heading('Automation rules','Configure reminders, escalation delays, and follow-up limits.',`<button class="btn primary" data-action="run-check">${icon('zap')}Run automation check</button>`)}<div class="notice info" style="margin-bottom:23px">Rules prepare local email drafts when you run a check. Background scheduling and automatic delivery require a connected production email service.</div><div class="two-column"><section class="card"><div class="card-head"><div><h2>Rule sequence</h2><p class="card-subtitle">Applies to unshipped, overdue purchase orders.</p></div><span class="tag ${s.enabled?'green':'gray'}">${s.enabled?'Demo enabled':'Paused'}</span></div><div class="workflow">${[['sheet','Import your purchase orders','Upload Supplier Name, Supplier Code, Supplier Email, PO Number, and Shipping Date.'],['calendar','Check the promised ship date','Find unshipped orders past their original or revised ship date.'],['send','Prepare a personalized email','Ask your supplier for a new ship date and shipping status.'],['reply','Keep the conversation moving',`Record replies and revised dates. Remind after ${s.reminderDays} days without a reply.`],['grid','Bring the update back here','Track every order, draft, response, and overdue shipment.']].map(([name,title,desc],i)=>`<div class="flow-step"><div class="flow-icon">${icon(name)}</div><div><h3>${title}</h3><p>${desc}</p></div><span class="step-number">0${i+1}</span></div>`).join('')}</div><div class="form-section"><div class="rule-explain"><strong>When there’s no reply</strong><br>Prepare a reminder after ${s.reminderDays} days. Flag for your attention after ${s.escalationDays} days or ${s.maxReminders} reminders. Shipped orders are always excluded.</div></div></section><section class="card"><div class="card-head"><h2>Rule settings</h2>${icon('settings')}</div><form id="rules-form"><div class="form-section"><div class="setting-line"><div><p>Enable automation rules</p><small>Check eligible orders and prepare due messages</small></div><button type="button" class="switch ${s.enabled?'on':''}" role="switch" aria-checked="${s.enabled}" aria-label="Enable automation rules" data-action="toggle-automation"></button></div></div><div class="form-section"><div class="field"><label for="reminder-days">Send a reminder after</label><select id="reminder-days" name="reminderDays">${[1,2,3,5,7].map(n=>`<option value="${n}" ${s.reminderDays===n?'selected':''}>${n} day${n>1?'s':''} without a reply</option>`).join('')}</select></div><div class="field"><label for="escalation-days">Escalate for review after</label><select id="escalation-days" name="escalationDays">${[3,5,7,10,14].map(n=>`<option value="${n}" ${s.escalationDays===n?'selected':''}>${n} days without a reply</option>`).join('')}</select></div><div class="field"><label for="max-reminders">Maximum reminders</label><select id="max-reminders" name="maxReminders">${[1,2,3,4,5].map(n=>`<option value="${n}" ${s.maxReminders===n?'selected':''}>${n} reminder${n>1?'s':''}</option>`).join('')}</select><p class="help">After this limit, the order is flagged for manual review.</p></div></div><div class="form-section"><button class="btn primary" type="submit" style="width:100%">${icon('check')}Save rules</button><p class="tiny muted" style="text-align:center;margin-top:13px">Last automation check: ${state.lastCheck?relative(state.lastCheck):'not run yet'}</p></div></form></section></div>`;
}
function templatesPage() {
  const t=state.settings.templates[ui.template],labels={initial:'Initial follow-up',reminder:'No-reply reminder',acknowledgement:'Reply acknowledgement'};
  return `${heading('Email templates','Edit the messages used in supplier follow-ups.')}<div class="template-tabs">${Object.entries(labels).map(([id,label])=>`<button class="btn ${id===ui.template?'active':''}" data-action="template" data-type="${id}">${icon(id==='acknowledgement'?'reply':'mail')}${label}</button>`).join('')}</div><div class="two-column"><section class="card"><div class="card-head"><h2>${labels[ui.template]}</h2><span class="tag gray">Email template</span></div><form id="template-form" class="padded" style="padding-top:0"><div class="field"><label for="template-subject">Subject line</label><input id="template-subject" name="subject" value="${esc(t.subject)}" maxlength="250" required></div><div class="field"><label for="template-body">Email body</label><textarea id="template-body" name="body" rows="13" required>${esc(t.body)}</textarea><p class="help">Click a field below to personalize your email.</p><div class="template-variables">${['supplier','supplier_code','po','ship_date','revised_date','sender','company'].map(v=>`<button type="button" class="variable" data-action="variable" data-value="${v}">{{${v}}}</button>`).join('')}</div></div><div class="between"><button class="link-btn" type="button" data-action="reset-template">Restore default</button><button class="btn primary" type="submit">${icon('check')}Save template</button></div></form></section><section class="card padded"><div class="between" style="margin-bottom:22px"><h2>Message preview</h2><span class="tag green">Personalized</span></div><div id="template-preview" class="template-preview"></div><p class="tiny muted" style="margin-top:16px">Preview uses ${state.orders.length?'the first order in your workspace':'a sample purchase order'}. You can review and edit every draft before using it.</p></section></div>`;
}
function updateTemplatePreview() {
  const o=state.orders[0]||C.sampleState().orders[7];
  const subject=$('#template-subject')?.value||'',body=$('#template-body')?.value||'';
  $('#template-preview').innerHTML=`<p class="tiny muted">TO <span style="margin-left:8px">${esc(o.email)}</span></p><h3 style="font-family:'DM Sans';font-size:12px;margin-top:14px;line-height:1.6">${esc(C.interpolate(subject,o,state.settings))}</h3><div class="message-body">${esc(C.interpolate(body,o,state.settings))}</div>`;
}
function settingsPage() {
  return `${heading('Settings','Workspace details, email connection, and data.')}<div class="two-column"><div><section class="card"><div class="card-head"><h2>Workspace details</h2>${icon('building')}</div><form id="settings-form" class="padded" style="padding-top:0"><div class="field"><label for="company">Company name</label><input id="company" name="company" value="${esc(state.settings.company)}" maxlength="80" required></div><div class="field"><label for="sender">Email signature name</label><input id="sender" name="senderName" value="${esc(state.settings.senderName)}" maxlength="80" required><p class="help">Used in personalized email drafts.</p></div><div class="field"><label for="email-provider">Send using</label><select id="email-provider" name="emailProvider"><option value="">Choose Gmail or Outlook</option><option value="gmail" ${state.settings.emailProvider==='gmail'?'selected':''}>Gmail</option><option value="outlook" ${state.settings.emailProvider==='outlook'?'selected':''}>Microsoft Outlook</option></select></div><div class="field"><label for="from-email">From email address</label><input type="email" id="from-email" name="fromEmail" value="${esc(state.settings.fromEmail||'')}" maxlength="254" placeholder="purchasing@company.com"></div><div class="field"><label for="cc-emails">Default CC</label><input id="cc-emails" name="ccEmails" value="${esc(state.settings.ccEmails||'')}" maxlength="1000" placeholder="manager@company.com, buyer@company.com"><p class="help">Separate multiple CC addresses with commas.</p></div><button class="btn primary" type="submit">Save changes</button></form></section><section class="card" style="margin-top:20px"><div class="card-head"><h2>Email connection</h2><span class="tag gray">Not connected</span></div><div class="integration-card" style="padding-top:0"><div class="integration-icon">${icon('mail')}</div><div class="integration-content"><h3>Gmail or Microsoft Outlook</h3><p>Send supplier follow-ups and match incoming replies to purchase orders. This prototype includes the complete workflow with local drafts and manually recorded replies.</p><button class="btn" style="margin-top:17px" data-action="connection">View connection requirements ${icon('arrow')}</button></div></div></section></div><section class="card padded" style="align-self:start"><h2>Workspace data</h2><p class="section-intro" style="margin-top:12px">${state.orders.length} orders saved in this browser. Your Excel files are processed on this device.</p><div class="notice info" style="margin:19px 0">This prototype saves data locally. It doesn’t sync between devices or run automation when the page is closed.</div><div class="field"><button class="btn" data-action="export">${icon('download')}Export purchase orders</button></div><div class="field"><button class="btn" data-action="backup">${icon('download')}Download workspace backup</button><p class="help">Includes orders, conversations, templates, and rules.</p></div><div class="field"><label for="restore-file">Restore a workspace backup</label><input id="restore-file" type="file" accept=".json,application/json" style="font-size:10px;padding:8px;"></div><div style="border-top:1px solid var(--line);padding-top:20px;margin-top:23px"><button class="link-btn" data-action="reset">Reset to sample workspace</button><p class="tiny muted" style="margin-top:8px">You’ll be asked to confirm before any data is replaced.</p></div></section></div>`;
}

// Accessible modal/drawer primitives.
function showModal(title,subtitle,body,footer='',wide=false) {
  if(!$('#overlay-root').children.length)focusBeforeModal=document.activeElement;
  $('#overlay-root').innerHTML=`<div class="overlay" data-overlay="true"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-head"><div><h2 id="dialog-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-btn" data-action="close" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
  document.body.style.overflow='hidden';$('#app').inert=true;setTimeout(()=>$('.modal .icon-btn')?.focus(),30);
}
function closeModal(restore=true) {$('#overlay-root').innerHTML='';document.body.style.overflow='';$('#app').inert=false;if(restore&&focusBeforeModal?.isConnected)focusBeforeModal.focus();}
function showOrder(id) {
  const o=state.orders.find(x=>x.id===id);if(!o)return;
  if(!$('#overlay-root').children.length)focusBeforeModal=document.activeElement;
  $('#overlay-root').innerHTML=`<div class="overlay drawer-overlay" data-overlay="true"><section class="drawer" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="modal-head"><div><p class="tiny muted" style="margin:0 0 5px">PURCHASE ORDER</p><h2 id="dialog-title">${esc(o.po)}</h2></div><button class="icon-btn" data-action="close" aria-label="Close order">${icon('close')}</button></div><div class="drawer-body"><div class="between"><div class="flex gap">${logo(o)}<div><h3>${esc(o.supplier)}</h3><p class="tiny muted" style="margin-top:4px">${esc(o.email||'Email address required')}</p></div></div>${badge(o)}</div><div class="detail-grid"><div class="full"><label>Supplier code</label><strong>${esc(o.supplierCode)}</strong></div><div><label>Original ship date</label><strong>${dateLabel(o.shipDate,true)}</strong></div><div><label>Revised ship date</label><strong>${dateLabel(o.revisedDate,true)}</strong></div><div><label>Last follow-up</label><strong>${o.lastSent?dateLabel(o.lastSent,true):'No follow-up yet'}</strong></div><div><label>Reminders</label><strong>${o.reminders||0} of ${state.settings.maxReminders}</strong></div></div>${o.escalated?'<div class="notice" style="margin-bottom:17px">This order needs your attention. Consider contacting the supplier directly.</div>':''}${C.overdue(o)?`<div class="notice">${icon('clock')} &nbsp; ${C.daysBetween(C.effectiveDate(o))} days past the expected ship date. A quick follow-up can help.</div>`:''}${o.draft?`<div class="notice info" style="margin-top:15px">${icon('file')} &nbsp; A personalized email draft is ready to review.</div>`:''}<div class="detail-section"><div class="between"><h3>Conversation</h3><button class="link-btn" data-action="record-reply" data-id="${esc(o.id)}">${icon('reply')}Record reply</button></div>${o.messages.length?o.messages.map(messageMarkup).join(''):'<div class="empty" style="padding:30px 15px"><div class="empty-icon">'+icon('mail')+'</div><h3>Start the conversation</h3><p>Prepare a personalized shipping update request for this supplier.</p></div>'}</div></div><div class="modal-footer"><button class="btn" data-action="ship" data-id="${esc(o.id)}">${icon(o.shipped?'refresh':'check')}${o.shipped?'Reopen order':'Mark shipped'}</button><button class="btn primary" data-action="draft" data-id="${esc(o.id)}" data-type="${o.lastReply?'acknowledgement':o.lastSent?'reminder':'initial'}">${icon('mail')}${o.draft?'Review draft':'Prepare email'}</button></div></section></div>`;
  document.body.style.overflow='hidden';$('#app').inert=true;setTimeout(()=>$('.drawer .icon-btn')?.focus(),30);
}
function showDraft(id,type='initial') {
  const o=state.orders.find(x=>x.id===id);if(!o)return;
  const draft=o.draft||C.draftFor(o,state.settings,type);
  showModal('Email draft',`Review your message for ${esc(o.po)}.`, `<form id="draft-form" data-id="${esc(id)}" data-type="${esc(draft.type)}"><div class="field-row"><div class="field"><label>Send using</label><div class="notice info">${state.settings.emailProvider==='gmail'?'Gmail':state.settings.emailProvider==='outlook'?'Microsoft Outlook':'Provider not selected'}</div></div><div class="field"><label>From</label><div class="notice info">${esc(state.settings.fromEmail||'Not configured')}</div></div></div><div class="field"><label>To</label><div class="notice info">${esc(o.supplier)} &lt;${esc(o.email)}&gt;</div></div><div class="field"><label for="draft-cc">CC</label><input id="draft-cc" name="cc" value="${esc(draft.cc??state.settings.ccEmails??'')}" placeholder="Optional CC recipients, separated by commas"></div><div class="field"><label for="draft-subject">Subject</label><input id="draft-subject" name="subject" value="${esc(draft.subject)}" maxlength="250" required></div><div class="field"><label for="draft-body">Message</label><textarea id="draft-body" name="body" rows="10" required>${esc(draft.body)}</textarea></div><p class="tiny muted">Email is not connected. Save this draft, open your email app, or simulate sending to try the follow-up workflow.</p><div id="draft-error" class="status-message" role="status"></div></form>`, `<button class="btn" data-action="save-draft" data-id="${esc(id)}">Save draft</button><div class="footer-stack"><button class="btn" data-action="email-app" data-id="${esc(id)}">${icon('external')}Open email app</button><button class="btn primary" data-action="simulate-send" data-id="${esc(id)}">${icon('send')}Simulate send</button></div>`);
}
function readDraft(id) {
  const form=$('#draft-form');if(!form?.reportValidity())return null;const o=state.orders.find(x=>x.id===id);if(!o)return null;
  const data=new FormData(form);if(!data.get('subject').trim()||!data.get('body').trim()){$('#draft-error').textContent='Add a subject and a message before continuing.';return null;}
  const cc=data.get('cc').trim(),addresses=cc?cc.split(',').map(x=>x.trim()).filter(Boolean):[];if(addresses.some(x=>!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(x))){$('#draft-error').textContent='Enter valid CC addresses separated by commas.';return null;}o.draft={type:form.dataset.type,subject:data.get('subject').trim(),body:data.get('body').trim(),cc:addresses.join(', '),from:state.settings.fromEmail||'',provider:state.settings.emailProvider||'',at:new Date().toISOString()};return o;
}
function showReply(id) {
  const o=state.orders.find(x=>x.id===id);if(!o)return;
  showModal('Analyze supplier reply',`Paste the email reply for ${esc(o.po)}.`,`<form id="reply-form" data-id="${esc(id)}"><div class="field"><label for="reply-body">Supplier email reply</label><textarea name="body" id="reply-body" rows="7" required placeholder="Paste the complete supplier reply here..."></textarea><p class="help">Supplierflow looks for a revised shipping date and shipment confirmation.</p></div><div id="reply-analysis" class="reply-analysis">${icon('search')} Waiting for reply text</div><div class="field"><label for="revised-date">Detected / revised shipping date</label><input type="date" id="revised-date" name="revisedDate" value="${esc(o.revisedDate)}"></div><label class="flex gap small muted"><input type="checkbox" name="shipped" ${o.shipped?'checked':''}>Supplier confirmed this PO has shipped</label></form>`,`<span class="tiny muted">Review detected values before saving</span><button class="btn primary" type="submit" form="reply-form">${icon('check')}Update order</button>`);
}
function showConnection() {
  showModal('Bring your inbox into the flow','Email connection is the next production step.',`<div class="notice info" style="margin-bottom:23px">This is an interactive design prototype. No Gmail or Outlook account is connected, and no emails are sent automatically.</div><h3 style="margin-bottom:15px">What your live application will connect</h3><ol class="help-flow"><li><strong>A purchasing mailbox.</strong> Connect Gmail or Microsoft Outlook through the provider’s secure sign-in.</li><li><strong>Your purchase order threads.</strong> Match replies using the email thread and PO number. Review ambiguous replies before updating orders.</li><li><strong>A scheduled follow-up service.</strong> Check late orders, send approved messages, retry failed requests, and stop reminders when a reply arrives.</li><li><strong>A shared order database.</strong> Keep your uploads, messages, and shipping updates available across devices.</li></ol><p class="small muted">For now, you can import real spreadsheets, record responses, save personalized drafts, and open them in your email app.</p>`,`<button class="link-btn" data-action="nav" data-page="settings">Workspace settings</button><button class="btn primary" data-action="close">Got it</button>`);
}
function showHelp() {
  showModal('How Supplierflow works','Import orders, supplier emails, and control automation.',`<ol class="help-flow"><li><strong>Import your Excel file.</strong> Use Supplier Name, Supplier Code, Shipping Date, and PO Number. You can replace all old orders during import.</li><li><strong>Add each supplier’s email once.</strong> Open Suppliers and enter the address for each supplier code.</li><li><strong>Control automation per supplier.</strong> Turn automation on or off beside each supplier. Disabled suppliers are always skipped.</li><li><strong>Confirm the promised date.</strong> The first message asks whether the imported shipping date is still valid.</li><li><strong>Handle overdue orders.</strong> If the date passes, a reminder asks why the PO has not shipped. Reminders are due every ${state.settings.reminderDays} days.</li><li><strong>Analyze replies.</strong> Paste a reply to detect a revised date or shipment confirmation and update the order.</li></ol><div class="notice info">Live sending and inbox monitoring require Gmail or Outlook to be connected. Until then, the app prepares and records the complete workflow without sending.</div>`,`<button class="btn" data-action="close">Close</button><button class="btn primary" data-action="import">${icon('upload')}Import Excel</button>`);
}

// Spreadsheet import: local file parsing, explicit field mapping, and validation.
function showImport() {
  upload=null;
  showModal('Import purchase orders','Upload your supplier shipment file with email addresses.',`<div class="import-steps"><span class="step active"><span class="num">1</span>Upload file</span>${icon('chevron')}<span class="step"><span class="num">2</span>Match columns</span>${icon('chevron')}<span class="step"><span class="num">3</span>Replace or add</span></div><div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Choose or drop an Excel file"><div class="upload-icon">${icon('upload')}</div><h3>Drop your spreadsheet here</h3><p>Excel (.xlsx, .xls) or CSV · up to 10 MB · 5,000 rows</p><span class="btn primary">Choose a file ${icon('arrow')}</span></div><input type="file" id="excel-file" accept=".xlsx,.xls,.csv" class="hidden"><div id="import-error" class="status-message" role="status"></div><div class="import-template"><div><h4>Required columns</h4><p>Supplier Name, Supplier Code, Supplier Email, Shipping Date, PO Number</p></div><button class="btn sm" data-action="download-template">${icon('download')}Download template</button></div><div class="notice info">Supplier Email is imported and used as the recipient for that supplier email messages.</div>`,`<span class="tiny muted">${icon('shield')} Your spreadsheet stays in your browser.</span><button class="btn" data-action="close">Cancel</button>`);
}
async function readFile(file) {
  const error=$('#import-error');
  if(!file)return;
  if(!/\.(xlsx|xls|csv)$/i.test(file.name)){error.textContent='Choose an Excel (.xlsx or .xls) or CSV file.';return;}
  if(file.size>10*1024*1024){error.textContent='This file is over 10 MB. Split it into smaller files and try again.';return;}
  if(!window.XLSX){error.textContent='The spreadsheet reader could not load. Refresh the page and try again.';return;}
  error.textContent='Reading your spreadsheet…';
  try {
    const buffer=await file.arrayBuffer();const wb=XLSX.read(buffer,{type:'array',cellDates:true,sheetRows:5002});
    if(!wb.SheetNames.length)throw new Error('Your workbook has no worksheets.');
  upload={name:file.name,workbook:wb,sheet:wb.SheetNames[0],replaceAll:true};
    chooseSheet(upload.sheet);
  } catch(e) {if(error.isConnected)error.textContent=`Couldn’t read this file. ${e.message?.includes('password')?'Remove password protection and try again.':'Check that it is a valid, unencrypted spreadsheet with a header row.'}`;}
}
function chooseSheet(name) {
  upload.sheet=name;
  const rows=XLSX.utils.sheet_to_json(upload.workbook.Sheets[name],{header:1,defval:'',raw:true,blankrows:false});
  if(rows.length>5001){showImportProblem('This worksheet has more than 5,000 rows. Split it into smaller files first.');return;}
  if(rows.length<2){showImportProblem('This worksheet needs a header row and at least one purchase order.');return;}
  upload.headers=rows[0].map((v,i)=>String(v||`Column ${i+1}`));upload.rows=rows.slice(1);upload.mapping=C.mapHeaders(upload.headers);
  showMapping();
}
function showImportProblem(message) {
  showModal('Choose a worksheet',esc(upload.name),`<div class="field"><label for="sheet-select">Worksheet</label><select id="sheet-select">${upload.workbook.SheetNames.map(s=>`<option ${s===upload.sheet?'selected':''}>${esc(s)}</option>`).join('')}</select></div><div class="notice">${esc(message)}</div>`,`<button class="btn" data-action="import">Choose another file</button><button class="btn" data-action="close">Cancel</button>`);
}
function showMapping() {
  showModal('Map spreadsheet columns',`${esc(upload.name)} · ${upload.rows.length} rows found`, `<div class="import-steps"><span class="step"><span class="num">✓</span>Upload file</span>${icon('chevron')}<span class="step active"><span class="num">2</span>Match columns</span>${icon('chevron')}<span class="step"><span class="num">3</span>Replace or add</span></div>${upload.workbook.SheetNames.length>1?`<div class="field"><label for="sheet-select">Worksheet</label><select id="sheet-select">${upload.workbook.SheetNames.map(s=>`<option ${s===upload.sheet?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`:''}<div class="mapping-grid">${Object.entries({supplier:'Supplier name',supplierCode:'Supplier code',email:'Supplier email',shipDate:'Shipping date',po:'PO number'}).map(([field,label])=>`<div class="field"><label for="map-${field}">${label}</label><select id="map-${field}" data-map="${field}"><option value="-1">Select a column</option>${upload.headers.map((h,i)=>`<option value="${i}" ${upload.mapping[field]===i?'selected':''}>${esc(h)}</option>`).join('')}</select></div>`).join('')}</div><p class="tiny muted">Use Excel dates, YYYY-MM-DD, or MM/DD/YYYY. The first row is used for column headings.</p><div class="import-mode"><label><input type="radio" name="import-mode" value="replace" checked> <strong>Replace old orders</strong><span>Remove the current order list and load this file. Supplier emails and automation settings are kept by supplier code.</span></label><label><input type="radio" name="import-mode" value="add"> <strong>Add new orders</strong><span>Keep current orders and skip matching supplier code + PO combinations.</span></label></div><div id="import-validation"></div><div id="import-preview"></div>`,`<button class="btn" data-action="import">${icon('left')}Choose another file</button><button class="btn primary" id="confirm-import" data-action="confirm-import">${icon('check')}Analyze & import</button>`,true);
  validateImport();
}
function validateImport() {
  if(!upload)return;
  upload.mapping=Object.fromEntries($$('[data-map]').map(el=>[el.dataset.map,Number(el.value)]));
  upload.replaceAll=$('input[name="import-mode"]:checked')?.value!=='add';
  upload.result=C.validateRows(upload.rows,upload.mapping);
  const {errors,orders}=upload.result;
  const existing=upload.replaceAll?new Set():new Set(state.orders.map(o=>`${o.supplierCode.toLowerCase()}|${o.po.toLowerCase()}`));
  upload.ready=orders.filter(o=>!existing.has(`${o.supplierCode.toLowerCase()}|${o.po.toLowerCase()}`));
  $('#import-validation').innerHTML=`<div class="validation ${errors.length?'error':''}" style="margin-top:18px">${errors.length?`${errors.length} issue${errors.length>1?'s':''} to fix before importing:<br>${errors.slice(0,5).map(esc).join('<br>')}${errors.length>5?'<br>…and '+(errors.length-5)+' more.':''}`:`${icon('checkCircle')} &nbsp; ${upload.ready.length} orders ready to import.${orders.length!==upload.ready.length?` ${orders.length-upload.ready.length} existing PO/item pairs will be skipped.`:''}`}</div>`;
  $('#import-preview').innerHTML=orders.length?`<div class="preview-table"><table><thead><tr><th>Supplier</th><th>Code</th><th>Email</th><th>PO</th><th>Shipping date</th></tr></thead><tbody>${orders.slice(0,4).map(o=>`<tr><td>${esc(o.supplier)}</td><td>${esc(o.supplierCode)}</td><td>${esc(o.email)}</td><td>${esc(o.po)}</td><td>${esc(o.shipDate)}</td></tr>`).join('')}</tbody></table></div><p class="tiny muted">Preview of the first ${Math.min(4,orders.length)} valid rows.</p>`:'';
  $('#confirm-import').disabled=errors.length>0||upload.ready.length===0;
}
function confirmImport() {
  validateImport();if(!upload||upload.result.errors.length||!upload.ready.length)return;
  const n=upload.ready.length;
  const profiles=new Map(state.orders.map(o=>[o.supplierCode?.toLowerCase(),{email:o.email||'',automationEnabled:o.automationEnabled!==false}]));
  upload.ready.forEach(o=>Object.assign(o,{automationEnabled:profiles.get(o.supplierCode.toLowerCase())?.automationEnabled??true}));
  if(upload.replaceAll){state.orders=[];state.activity=[];state.lastCheck=null;}
  state.orders.unshift(...upload.ready);state.mode=state.orders.some(o=>o.demo)?'mixed':'local';
  notifyActivity('import',`${n} purchase orders imported`,upload.name);save();closeModal(false);ui.page='orders';ui.filter='all';ui.search='';ui.pageNumber=1;ui.orderId=upload.ready[0]?.id;ui.selected.clear();history.replaceState(null,'','#orders');render();toast(`${n} orders imported. Import complete.`);upload=null;
}
function downloadBlob(blob,name) {const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function exportOrders() {downloadBlob(new Blob(['\uFEFF'+C.exportCsv(state.orders)],{type:'text/csv;charset=utf-8;'}),`supplierflow-orders-${C.isoDate()}.csv`);toast(`Exported ${state.orders.length} purchase orders.`);}
function downloadTemplate() {
  if(!window.XLSX){toast('Spreadsheet reader unavailable. Refresh and try again.','alert');return;}
  const rows=[['Supplier Name','Supplier Code','Supplier Email','Shipping Date','PO Number'],['Example Components','SUP-001','orders@example-components.com',C.offsetDate(-3),'PO-1001'],['Example Packaging','SUP-002','orders@example-packaging.com',C.offsetDate(5),'PO-1002']];
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:26},{wch:18},{wch:32},{wch:18},{wch:18}];XLSX.utils.book_append_sheet(wb,ws,'Purchase orders');XLSX.writeFile(wb,'Supplierflow-import-template.xlsx');
}
function runCheck() {
  if(!state.settings.enabled){toast('Demo rules are paused. Enable them to run a check.','alert');return;}
  let drafts=0,escalated=0;
  let skipped=0;state.orders.forEach(o=>{const action=C.automationAction(o,state.settings);if((o.automationEnabled===false||!o.email)&&C.overdue(o))skipped++;if(action==='escalate'){o.escalated=true;escalated++;notifyActivity('alert','Order flagged for review',`${o.supplier} · ${o.po}`);}else if(action){o.draft=C.draftFor(o,state.settings,action);drafts++;notifyActivity('email',`${action==='reminder'?'Reminder':'Follow-up'} draft prepared`,`${o.supplier} · ${o.po}`);}});
  state.lastCheck=new Date().toISOString();save();render();
  showModal('Follow-up analysis complete','Every imported order was checked.',`<div class="metrics" style="grid-template-columns:repeat(3,1fr);margin:0 0 20px"><div class="metric"><div class="metric-title">Drafts prepared</div><div class="metric-value">${drafts}</div></div><div class="metric"><div class="metric-title">Escalated</div><div class="metric-value">${escalated}</div></div><div class="metric"><div class="metric-title">Skipped</div><div class="metric-value">${skipped}</div></div></div><div class="notice info">Skipped orders have supplier automation off or no supplier email. Connect Gmail or Outlook to replace demo sending with live delivery and inbox monitoring.</div>`,`<button class="btn" data-action="close">Done</button><button class="btn primary" data-action="nav" data-page="followups">Review follow-ups ${icon('arrow')}</button>`);
}
function globalSearch() {showModal('Find a purchase order','Search by supplier, supplier code, PO, or email.',`<div class="field"><label for="global-query" class="screen-reader">Search all purchase orders</label><input id="global-query" placeholder="Try SUP-001 or PO-1048…" autocomplete="off"></div><div id="global-results" class="search-results"><p class="small muted">Start typing to find an order.</p></div>`);setTimeout(()=>$('#global-query')?.focus(),50);}
function searchResults(q) {
  const arr=state.orders.filter(o=>[o.supplier,o.supplierCode,o.po,o.email].some(s=>String(s||'').toLowerCase().includes(q.toLowerCase()))).slice(0,8);
  $('#global-results').innerHTML=q?arr.map(o=>`<button data-action="order" data-id="${esc(o.id)}"><div class="flex gap">${logo(o)}<div><div class="small strong">${esc(o.supplier)} <span class="muted">· ${esc(o.po)}</span></div><div class="tiny muted" style="margin-top:4px">${esc(o.supplierCode)}</div></div></div>${badge(o)}</button>`).join('')||'<p class="small muted">No orders match that search.</p>':'<p class="small muted">Start typing to find an order.</p>';
}
function resetConfirmation() {
  showModal('Start again with sample orders?','This replaces the orders and settings saved on this device.',`<p class="small muted">Your ${state.orders.length} orders, conversations, drafts, and custom templates will be replaced. Download a workspace backup first if you want to keep them.</p>`,`<button class="btn" data-action="backup">${icon('download')}Back up first</button><div class="footer-stack"><button class="btn" data-action="close">Cancel</button><button class="btn danger" data-action="confirm-reset">Replace with sample data</button></div>`);
}
function validBackup(s) {
  const str=(v,max=100000)=>typeof v==='string'&&v.length<=max;
  if(s?.version!==1||!Array.isArray(s.orders)||s.orders.length>10000||!Array.isArray(s.activity)||!s.settings)return false;
  const config=s.settings;
  if(!str(config.company,80)||!str(config.senderName,80)||typeof config.enabled!=='boolean'||!Number.isInteger(config.reminderDays)||config.reminderDays<1||config.reminderDays>30||!Number.isInteger(config.escalationDays)||config.escalationDays<=config.reminderDays||config.escalationDays>90||!Number.isInteger(config.maxReminders)||config.maxReminders<1||config.maxReminders>10)return false;
  if(!['initial','reminder','acknowledgement'].every(k=>str(config.templates?.[k]?.subject,250)&&str(config.templates[k].body)))return false;
  const ids=new Set();
  return s.orders.every(o=>{
    if(!str(o.id,100)||ids.has(o.id))return false;ids.add(o.id);
    return ['supplier','supplierCode','po'].every(f=>str(o[f],500))&&str(o.email||'',254)&&typeof o.automationEnabled==='boolean'&&C.parseDate(o.shipDate)===o.shipDate&&(!o.revisedDate||C.parseDate(o.revisedDate)===o.revisedDate)&&Array.isArray(o.messages)&&o.messages.every(m=>str(m.body)&&str(m.at)&&!Number.isNaN(Date.parse(m.at)))&&(!o.draft||(str(o.draft.subject,250)&&str(o.draft.body)&&str(o.draft.type)))&&['lastSent','lastReply','firstSent'].every(f=>!o[f]||!Number.isNaN(Date.parse(o[f])));
  })&&s.activity.every(a=>str(a.title,1000)&&str(a.detail,2000)&&!Number.isNaN(Date.parse(a.at)));
}
let pendingBackup=null;
async function restoreBackup(file) {
  if(!file)return;
  if(file.size>10*1024*1024){toast('Choose a workspace backup under 10 MB.','alert');return;}
  try {const data=JSON.parse(await file.text());if(!validBackup(data))throw new Error('invalid');pendingBackup=data;showModal('Restore this workspace?','Your current workspace will be replaced.',`<p class="small muted">This backup contains <strong>${data.orders.length} orders</strong> for <strong>${esc(data.settings.company)}</strong>, along with its conversations, templates, and rules.</p>`,`<button class="btn" data-action="close">Cancel</button><button class="btn primary" data-action="confirm-restore">Restore workspace</button>`);}catch{toast('This is not a valid Supplierflow workspace backup.','alert');}
}

// User actions are delegated so every route and modal uses the same behavior.
document.addEventListener('click',e=>{
  if(e.target.dataset.overlay){closeModal();return;}
  const el=e.target.closest('[data-action]');if(!el)return;
  e.preventDefault();const {action,id}=el.dataset;
  switch(action) {
    case'nav':go(el.dataset.page);break;
    case'menu':ui.mobile=!ui.mobile;$('.sidebar').classList.toggle('open',ui.mobile);el.setAttribute('aria-expanded',ui.mobile);break;
    case'close':closeModal();break;
    case'import':showImport();break;
    case'confirm-import':confirmImport();break;
    case'download-template':downloadTemplate();break;
    case'export':exportOrders();break;
    case'help':showHelp();break;
    case'connection':showConnection();break;
    case'activity':showModal('The latest in your workspace',state.mode==='demo'?'Sample events from your demo workspace.':'Your imports, drafts, and supplier updates.',`<div class="activity-full">${activityList()}</div>`,`<span class="tiny muted">${state.activity.length} recorded events</span><button class="btn" data-action="close">Done</button>`);break;
    case'search':globalSearch();break;
    case'metric':go('orders',el.dataset.filter);break;
    case'filter':ui.filter=el.dataset.filter;ui.pageNumber=1;ui.selected.clear();render();break;
    case'clear-filter':ui.filter='all';ui.search='';ui.pageNumber=1;render();break;
    case'prev':ui.pageNumber=Math.max(1,ui.pageNumber-1);refreshTable();break;
    case'next':ui.pageNumber++;refreshTable();break;
    case'select':ui.selected.has(id)?ui.selected.delete(id):ui.selected.add(id);refreshTable();break;
    case'select-all':{const size=ui.page==='overview'?6:15;const current=filteredOrders(ui.page==='overview').slice((ui.pageNumber-1)*size,ui.pageNumber*size);const all=current.every(o=>ui.selected.has(o.id));current.forEach(o=>all?ui.selected.delete(o.id):ui.selected.add(o.id));refreshTable();break;}
    case'clear-selection':ui.selected.clear();refreshTable();break;
    case'order':showOrder(id);break;
    case'select-order':selectOrder(id);break;
    case'close-inspector':ui.orderId=null;render();break;
    case'new-order':showOrderEditor();break;
    case'edit-order':showOrderEditor(id);break;
    case'queue-filter':ui.queueFilter=el.dataset.filter;render();break;
    case'discard-draft':{const order=state.orders.find(o=>o.id===id);if(order){delete order.draft;save();render();toast('Draft removed.');}break;}
    case'thread':ui.thread=id;render();break;
    case'draft':showDraft(id,el.dataset.type);break;
    case'record-reply':showReply(id);break;
    case'save-draft':{const o=readDraft(id);if(!o)break;notifyActivity('email','Email draft saved',`${o.supplier} · ${o.po}`);save();closeModal(false);render();toast('Draft saved. No email was sent.');break;}
    case'email-app':{const o=readDraft(id);if(!o)break;save();const uri=`mailto:${encodeURIComponent(o.email)}?subject=${encodeURIComponent(o.draft.subject)}${o.draft.cc?'&cc='+encodeURIComponent(o.draft.cc):''}&body=${encodeURIComponent(o.draft.body)}`;if(uri.length>7500){$('#draft-error').textContent='This message is too long for an email link. Save the draft and copy it into your email app.';break;}const a=document.createElement('a');a.href=uri;a.click();$('#draft-error').textContent='Draft saved. If your email app opens, review and send it there. Supplierflow cannot confirm delivery.';break;}
    case'simulate-send':{const o=readDraft(id);if(!o)break;const now=new Date().toISOString();const previousReply=o.lastReply&&o.lastReply>=o.lastSent;if(o.draft.type==='reminder')o.reminders=(o.reminders||0)+1;else{o.reminders=0;o.escalated=false;}o.messages.push({direction:'outgoing',subject:o.draft.subject,body:o.draft.body,at:now,demo:true});if(o.draft.type!=='acknowledgement'){o.lastSent=now;if(!o.firstSent||previousReply)o.firstSent=now;}delete o.draft;notifyActivity('email','Email send simulated',`${o.supplier} · ${o.po} · no email delivered`);save();closeModal(false);render();toast('Demo email recorded. No real email was sent.');break;}
    case'ship':{const o=state.orders.find(o=>o.id===id);o.shipped=!o.shipped;if(o.shipped){delete o.draft;o.escalated=false;}notifyActivity('ship',o.shipped?'Order marked shipped':'Order reopened',`${o.supplier} · ${o.po}`);save();render();if(ui.page!=='orders'||window.innerWidth<=1100)showOrder(id);toast(o.shipped?'Order marked shipped. Follow-ups stopped.':'Order reopened.');break;}
    case'batch-draft':{let n=0;state.orders.filter(o=>ui.selected.has(o.id)&&!o.shipped&&!o.draft&&o.email&&o.automationEnabled!==false).forEach(o=>{o.draft=C.draftFor(o,state.settings,o.lastReply?'acknowledgement':o.lastSent?'reminder':'initial');n++;});notifyActivity('email',`${n} email drafts prepared`,'Selected eligible purchase orders · no email sent');save();ui.selected.clear();render();toast(n?`${n} drafts prepared. Open an order to review.`:'No selected orders are eligible. Check email addresses and supplier automation.');break;}
    case'batch-ship':{let n=0;state.orders.filter(o=>ui.selected.has(o.id)&&!o.shipped).forEach(o=>{o.shipped=true;delete o.draft;o.escalated=false;n++;});notifyActivity('ship',`${n} orders marked shipped`,'Follow-ups stopped for selected orders');save();ui.selected.clear();render();toast(`${n} orders marked shipped.`);break;}
    case'supplier-orders':ui.page='orders';ui.filter='all';ui.search=el.dataset.name;ui.pageNumber=1;ui.orderId=state.orders.find(o=>o.supplier===el.dataset.name)?.id;ui.selected.clear();history.replaceState(null,'','#orders');render();break;
    case'toggle-automation':{state.settings.enabled=!state.settings.enabled;save();el.classList.toggle('on',state.settings.enabled);el.setAttribute('aria-checked',state.settings.enabled);const badge=$('.two-column > section:first-child > .card-head .tag');if(badge){badge.textContent=state.settings.enabled?'Demo enabled':'Paused';badge.className=`tag ${state.settings.enabled?'green':'gray'}`;}toast(state.settings.enabled?'Demo rules enabled.':'Demo rules paused.');break;}
    case'run-check':runCheck();break;
    case'template':ui.template=el.dataset.type;render();break;
    case'variable':{const input=$('#template-body');const start=input.selectionStart,end=input.selectionEnd;input.setRangeText(`{{${el.dataset.value}}}`,start,end,'end');input.focus();updateTemplatePreview();break;}
    case'reset-template':$('#template-subject').value=C.defaults.templates[ui.template].subject;$('#template-body').value=C.defaults.templates[ui.template].body;updateTemplatePreview();toast('Default restored in the editor. Save to apply.');break;
    case'backup':downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),`supplierflow-backup-${C.isoDate()}.json`);toast('Workspace backup downloaded.');break;
    case'reset':resetConfirmation();break;
    case'confirm-reset':state=C.sampleState();save();go('overview');toast('Sample workspace restored.');break;
    case'confirm-restore':if(pendingBackup){state=pendingBackup;pendingBackup=null;save();go('overview');toast('Your workspace has been restored.');}break;
  }
});
document.addEventListener('input',e=>{
  if(e.target.id==='order-search'){ui.search=e.target.value;ui.pageNumber=1;refreshTable();}
  if(e.target.id==='global-query')searchResults(e.target.value.trim());
  if(['template-subject','template-body'].includes(e.target.id))updateTemplatePreview();
});
document.addEventListener('change',e=>{
  if(e.target.id==='excel-file')readFile(e.target.files[0]);
  if(e.target.id==='sheet-select')chooseSheet(e.target.value);
  if(e.target.dataset.map||e.target.name==='import-mode')validateImport();
  if(e.target.id==='order-sort'){ui.sort=e.target.value;ui.pageNumber=1;refreshTable();}
  if(e.target.id==='restore-file')restoreBackup(e.target.files[0]);
});
document.addEventListener('input',e=>{
  if(e.target.id!=='reply-body')return;
  const analysis=C.analyzeReply(e.target.value),box=$('#reply-analysis');
  if(analysis.revisedDate)$('#revised-date').value=analysis.revisedDate;
  if(analysis.shipped)$('input[name="shipped"]').checked=true;
  box.className=`reply-analysis ${analysis.status==='needs_review'?'':'found'}`;
  box.innerHTML=analysis.shipped?`${icon('checkCircle')} Shipment confirmation detected${analysis.revisedDate?` · date ${dateLabel(analysis.revisedDate,true)}`:''}`:analysis.revisedDate?`${icon('calendar')} Revised date detected: ${dateLabel(analysis.revisedDate,true)}`:`${icon('search')} No date or shipment confirmation detected yet`;
});
document.addEventListener('submit',e=>{
  e.preventDefault();const form=e.target,data=new FormData(form);
  if(form.id==='rules-form'){
    const reminderDays=Number(data.get('reminderDays')),escalationDays=Number(data.get('escalationDays'));
    if(escalationDays<=reminderDays){toast('Choose an escalation delay longer than the reminder delay.','alert');return;}
    Object.assign(state.settings,{reminderDays,escalationDays,maxReminders:Number(data.get('maxReminders'))});notifyActivity('rule','Follow-up rules updated',`Remind after ${reminderDays} days · escalate after ${escalationDays} days`);save();render();toast('Your follow-up rules are saved.');
  }
  if(form.id==='template-form'){
    const subject=data.get('subject').trim(),body=data.get('body').trim();if(!subject||!body){toast('Add both a subject and a message.','alert');return;}state.settings.templates[ui.template]={subject,body};save();toast('Email template saved.');
  }
  if(form.id==='settings-form'){
    const company=data.get('company').trim(),senderName=data.get('senderName').trim(),emailProvider=data.get('emailProvider'),fromEmail=data.get('fromEmail').trim(),ccEmails=data.get('ccEmails').trim();if(!company||!senderName){toast('Enter your company and signature name.','alert');return;}const emailOk=x=>/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(x);if(fromEmail&&!emailOk(fromEmail)){toast('Enter a valid From email address.','alert');return;}if(ccEmails&&ccEmails.split(',').map(x=>x.trim()).filter(Boolean).some(x=>!emailOk(x))){toast('Enter valid CC addresses separated by commas.','alert');return;}Object.assign(state.settings,{company,senderName,emailProvider,fromEmail,ccEmails});save();render();toast('Workspace details updated.');
  }
  if(form.id==='reply-form'){
    const o=state.orders.find(x=>x.id===form.dataset.id),body=data.get('body').trim(),date=data.get('revisedDate');if(!body){toast('Add the supplier’s response.','alert');return;}
    if(date&&!C.parseDate(date)){toast('Enter a valid revised shipping date.','alert');return;}
    o.lastReply=new Date().toISOString();o.revisedDate=date||'';o.shipped=data.get('shipped')==='on';o.escalated=false;o.reminders=0;delete o.draft;
    o.messages.push({direction:'incoming',subject:`Re: Shipping update · ${o.po}`,body,at:o.lastReply,manual:true});notifyActivity('reply',o.shipped?'Supplier confirmed shipment':date?'Revised ship date recorded':'Supplier reply recorded',`${o.supplier} · ${o.po}${date?' · '+dateLabel(date):''}`);save();closeModal(false);render();toast('Supplier update saved. Previous reminders stopped.');
  }
});
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();globalSearch();}
  if(e.key==='Escape'){if($('#overlay-root').children.length)closeModal();else if(ui.mobile){ui.mobile=false;$('.sidebar').classList.remove('open');}}
  if((e.key==='Enter'||e.key===' ')&&e.target.id==='dropzone'){e.preventDefault();$('#excel-file').click();}
  if(e.key==='Tab'&&$('#overlay-root').children.length){const focusable=$$('button:not(:disabled),a[href],input:not([type=hidden]),select,textarea,[tabindex="0"]',$('#overlay-root')).filter(el=>el.offsetParent!==null);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}
});
document.addEventListener('click',e=>{if(e.target.closest('#dropzone'))$('#excel-file')?.click();});
document.addEventListener('dragover',e=>{const zone=e.target.closest('#dropzone');if(zone){e.preventDefault();zone.classList.add('drag');}});
document.addEventListener('dragleave',e=>e.target.closest('#dropzone')?.classList.remove('drag'));
document.addEventListener('drop',e=>{const zone=e.target.closest('#dropzone');if(zone){e.preventDefault();zone.classList.remove('drag');readFile(e.dataTransfer.files[0]);}});
