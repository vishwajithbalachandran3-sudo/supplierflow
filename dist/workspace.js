'use strict';

function selectOrder(id) {
  if(window.innerWidth<=1100||ui.page!=='orders'){showOrder(id);return;}
  ui.orderId=id;
  const open=!!$('#order-inspector');
  if(open){$('#order-inspector').innerHTML=orderInspector(state.orders.find(o=>o.id===id));refreshTable();}
  else render();
}

function orderInspector(o) {
  if(!o)return '';
  const action=o.lastReply?'acknowledgement':o.lastSent?'reminder':'initial';
  const recent=o.messages.at(-1);
  return `<div class="inspector-head"><div><span class="inspector-kicker">ORDER DETAILS</span><h2>${esc(o.po)}</h2></div><div class="flex"><button class="icon-btn" data-action="edit-order" data-id="${esc(o.id)}" aria-label="Edit order">${icon('edit')}</button><button class="icon-btn" data-action="close-inspector" aria-label="Close detail panel">${icon('close')}</button></div></div>
  <div class="inspector-scroll"><div class="inspector-supplier"><div class="flex gap">${logo(o)}<div><h3>${esc(o.supplier)}</h3><p>${esc(o.supplierCode)} · ${o.email?esc(o.email):'Email not configured'}</p></div></div>${badge(o)}</div>
  <dl class="order-properties"><div><dt>Supplier code</dt><dd>${esc(o.supplierCode)}</dd></div><div><dt>Imported ship date</dt><dd>${dateLabel(o.shipDate,true)}</dd></div><div><dt>Revised ship date</dt><dd>${o.revisedDate?dateLabel(o.revisedDate,true):'Not provided'}</dd></div><div><dt>Last email</dt><dd>${o.lastSent?dateLabel(o.lastSent,true):'Not sent'}</dd></div><div><dt>Reminders</dt><dd>${o.reminders||0} / ${state.settings.maxReminders}</dd></div><div><dt>Supplier automation</dt><dd>${o.automationEnabled===false?'Off':'On'}</dd></div></dl>
  ${o.escalated?'<div class="inspector-alert">'+icon('alert')+'<span><strong>Escalation required</strong>Follow-up limit reached. Contact this supplier directly.</span></div>':C.overdue(o)?`<div class="inspector-alert">${icon('clock')}<span><strong>${C.daysBetween(C.effectiveDate(o))} days overdue</strong>Request the current shipping status and revised date.</span></div>`:''}
  <div class="inspector-section"><div class="between"><h3>Latest message</h3>${recent?`<span class="tiny muted">${relative(recent.at)}</span>`:''}</div>${recent?`<div class="inspector-message"><div class="message-direction">${icon(recent.direction==='incoming'?'reply':'send')}${recent.direction==='incoming'?'Supplier reply':'Outgoing message'}<span>${recent.manual?'Recorded':'Demo'}</span></div><p>${esc(recent.body)}</p></div><button class="link-btn" data-action="open-conversation" data-id="${esc(o.id)}">Open conversation ${icon('arrow')}</button>`:'<p class="inspector-empty">No messages recorded for this order.</p>'}</div>
  ${o.draft?`<div class="inspector-section"><div class="between"><h3>Draft ready</h3><span class="tag green">Review</span></div><p class="draft-subject">${esc(o.draft.subject)}</p><button class="btn" data-action="draft" data-id="${esc(o.id)}">${icon('edit')}Review email draft</button></div>`:''}
  <div class="inspector-section"><h3>Quick actions</h3><button class="inspector-action" data-action="record-reply" data-id="${esc(o.id)}">${icon('reply')}Analyze reply / update date ${icon('chevron')}</button><button class="inspector-action" data-action="ship" data-id="${esc(o.id)}">${icon(o.shipped?'refresh':'checkCircle')}${o.shipped?'Reopen order':'Mark as shipped'} ${icon('chevron')}</button></div></div>
  <div class="inspector-footer"><span>${icon('mail')} ${!o.email?'Add supplier email to enable':o.automationEnabled===false?'Supplier automation is off':'Ready for email connection'}</span><button class="btn primary" data-action="draft" data-id="${esc(o.id)}" data-type="${action}" ${!o.email||o.automationEnabled===false?'disabled':''}>${icon('edit')}${o.draft?'Review draft':action==='acknowledgement'?'Acknowledge update':action==='reminder'?'Prepare reminder':'Confirm shipping date'}</button></div>`;
}

function followupsPage() {
  const queue=state.orders.filter(o=>!o.shipped&&(o.draft||o.escalated||C.automationAction(o,state.settings)));
  const visible=queue.filter(o=>ui.queueFilter==='drafts'?!!o.draft:ui.queueFilter==='review'?!!o.escalated: true);
  return `${heading('Follow-ups','Review pending drafts and orders that need action.',`<button class="btn primary" data-action="run-check">${icon('refresh')}Run check <span class="demo-label">DEMO</span></button>`)}
  <div class="queue-status">${icon('mail')} Supplierflow checks every eligible PO. Live delivery and automatic reply monitoring start after Gmail or Outlook is connected.</div>
  <section class="card queue-card"><div class="table-controls"><div class="tabs" role="tablist" aria-label="Follow-up queue filter">${[['all','All tasks',queue.length],['drafts','Drafts ready',queue.filter(o=>o.draft).length],['review','Escalations',queue.filter(o=>o.escalated).length]].map(([value,label,n])=>`<button class="tab ${ui.queueFilter===value?'active':''}" data-action="queue-filter" data-filter="${value}" role="tab" aria-selected="${ui.queueFilter===value}">${label}<small>${n}</small></button>`).join('')}</div></div><div class="table-wrap"><table><thead><tr><th>Purchase order</th><th>Supplier</th><th>Required action</th><th>Last contact</th><th></th></tr></thead><tbody>${visible.map(o=>{const action=C.automationAction(o,state.settings);return `<tr><td><button class="po-link" data-action="order" data-id="${esc(o.id)}">${esc(o.po)}</button></td><td><div class="supplier-cell">${logo(o)}<span>${esc(o.supplier)}</span></div></td><td><span class="tag ${o.escalated?'red':o.draft?'green':'orange'}">${o.escalated?'Escalation':o.draft?'Draft ready':action==='reminder'?'Reminder due':action==='escalate'?'Review required':'Initial follow-up'}</span></td><td>${o.lastSent?dateLabel(o.lastSent):'Not contacted'}</td><td><div class="queue-row-actions"><button class="btn sm" data-action="${o.escalated?'order':'draft'}" data-id="${esc(o.id)}" data-type="${action==='reminder'?'reminder':'initial'}">${o.escalated?'Review order':o.draft?'Review draft':'Prepare draft'} ${icon('chevron')}</button>${o.draft?`<button class="icon-btn" data-action="discard-draft" data-id="${esc(o.id)}" aria-label="Discard draft for ${esc(o.po)}">${icon('close')}</button>`:''}</div></td></tr>`;}).join('')||'<tr><td colspan="5"><div class="empty"><div class="empty-icon">'+icon('checkCircle')+'</div><h3>No pending tasks</h3><p>Run a check to evaluate overdue orders against your saved rules.</p></div></td></tr>'}</tbody></table></div><div class="table-footer"><span>${visible.length} tasks</span><span>Last check: ${state.lastCheck?relative(state.lastCheck):'Not run'}</span></div></section>`;
}

function suppliersPage() {
  const groups=new Map();
  state.orders.forEach(o=>{const key=o.supplierCode.toLowerCase();if(!groups.has(key))groups.set(key,{code:o.supplierCode,name:o.supplier,orders:[]});groups.get(key).orders.push(o);});
  const suppliers=[...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
  return `${heading('Suppliers',`${suppliers.length} supplier profiles. Add one email per supplier code and choose whether follow-ups run automatically.`,importButton())}<div class="supplier-guide">${icon('mail')} Supplier emails are not required in the Excel file. Configure them here once; replacement imports keep these settings by supplier code.</div><section class="card supplier-directory"><div class="table-wrap"><table><thead><tr><th>Supplier</th><th>Supplier code</th><th>Email address</th><th>Orders</th><th>Overdue</th><th>Automation</th><th></th></tr></thead><tbody>${suppliers.map(s=>{const first=s.orders[0],enabled=first.automationEnabled!==false;return `<tr><td><div class="supplier-cell">${logo(first)}<strong>${esc(s.name)}</strong></div></td><td><span class="code-cell">${esc(s.code)}</span></td><td>${first.email?`<span class="configured-email">${esc(first.email)}</span>`:'<span class="missing-email">Email required</span>'}</td><td>${s.orders.length}</td><td><span class="tag ${s.orders.some(o=>C.overdue(o))?'red':'gray'}">${s.orders.filter(o=>C.overdue(o)).length}</span></td><td><button type="button" class="switch ${enabled?'on':''}" role="switch" aria-checked="${enabled}" aria-label="Automation for ${esc(s.name)}" data-action="toggle-supplier" data-code="${esc(s.code)}"></button></td><td><button class="btn sm" data-action="supplier-profile" data-code="${esc(s.code)}">${icon('edit')}Configure</button></td></tr>`;}).join('')||'<tr><td colspan="7"><div class="empty"><h3>No suppliers yet</h3><p>Import your Excel file to build the supplier directory.</p></div></td></tr>'}</tbody></table></div></section>`;
}

function showSupplierProfile(code) {
  const orders=state.orders.filter(o=>o.supplierCode.toLowerCase()===code.toLowerCase()),o=orders[0];if(!o)return;
  showModal('Configure supplier',`${esc(o.supplier)} · ${esc(o.supplierCode)}`,`<form id="supplier-form" data-code="${esc(o.supplierCode)}"><div class="field"><label for="supplier-email">Supplier email address</label><input type="email" id="supplier-email" name="email" value="${esc(o.email||'')}" maxlength="254" required placeholder="orders@supplier.com"><p class="help">Used for all ${orders.length} purchase orders with supplier code ${esc(o.supplierCode)}.</p></div><div class="setting-line"><div><p>Automatic follow-ups</p><small>Include this supplier in confirmation emails and two-day reminders.</small></div><button type="button" class="switch ${o.automationEnabled!==false?'on':''}" role="switch" aria-checked="${o.automationEnabled!==false}" data-action="toggle-supplier-modal" data-code="${esc(o.supplierCode)}"></button></div><div class="supplier-rule-summary"><strong>${orders.filter(x=>C.overdue(x)).length}</strong> overdue orders · <strong>${orders.filter(x=>C.waiting(x)).length}</strong> awaiting reply</div><div id="supplier-error" class="status-message" role="status"></div></form>`,`<button class="btn" data-action="close">Cancel</button><button class="btn primary" type="submit" form="supplier-form">${icon('check')}Save supplier</button>`);
}

function setSupplierAutomation(code,enabled) {
  state.orders.filter(o=>o.supplierCode.toLowerCase()===code.toLowerCase()).forEach(o=>{o.automationEnabled=enabled;if(!enabled)delete o.draft;});
  save();
}

function showOrderEditor(id=null) {
  const order=state.orders.find(o=>o.id===id);
  const o=order||{supplier:'',supplierCode:'',po:'',shipDate:C.isoDate(),email:'',shipped:false,automationEnabled:true};
  showModal(order?'Edit purchase order':'Add purchase order','Use the same fields as your spreadsheet.',`<form id="order-editor" data-id="${esc(id||'')}"><div class="field-row"><div class="field"><label for="editor-po">PO number</label><input id="editor-po" name="po" value="${esc(o.po)}" maxlength="100" required placeholder="PO-1049"></div><div class="field"><label for="editor-code">Supplier code</label><input id="editor-code" name="supplierCode" value="${esc(o.supplierCode)}" maxlength="100" required placeholder="SUP-001"></div></div><div class="field"><label for="editor-supplier">Supplier name</label><input id="editor-supplier" name="supplier" value="${esc(o.supplier)}" maxlength="200" required placeholder="Supplier name"></div><div class="field"><label for="editor-date">Shipping date</label><input type="date" id="editor-date" name="shipDate" value="${esc(o.shipDate)}" required></div><div class="field"><label for="editor-status">Shipment status</label><select id="editor-status" name="status"><option value="Open" ${!o.shipped?'selected':''}>Not shipped</option><option value="Shipped" ${o.shipped?'selected':''}>Shipped</option></select></div>${order?.revisedDate?'<p class="tiny muted">The revised date from the supplier remains in effect. Use “Analyze reply / update date” to change it.</p>':''}<div id="editor-error" class="status-message" role="status"></div></form>`,`<button class="btn" data-action="close">Cancel</button><button class="btn primary" type="submit" form="order-editor">${icon('check')}${order?'Save changes':'Add order'}</button>`);
}

document.addEventListener('click',e=>{
  const el=e.target.closest('[data-action="open-conversation"]');
  if(el){ui.thread=el.dataset.id;go('inbox');}
  const action=e.target.closest('[data-action]')?.dataset.action;
  const target=e.target.closest('[data-action]');
  if(action==='supplier-profile')showSupplierProfile(target.dataset.code);
  if(action==='toggle-supplier'){const enabled=target.getAttribute('aria-checked')!=='true';setSupplierAutomation(target.dataset.code,enabled);render();toast(`Supplier automation ${enabled?'enabled':'disabled'}.`);}
  if(action==='toggle-supplier-modal'){const enabled=target.getAttribute('aria-checked')!=='true';setSupplierAutomation(target.dataset.code,enabled);target.classList.toggle('on',enabled);target.setAttribute('aria-checked',enabled);}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='supplier-form'){
    e.preventDefault();const form=e.target,email=new FormData(form).get('email').trim(),code=form.dataset.code;
    if(!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email)){$('#supplier-error').textContent='Enter one valid supplier email address.';return;}
    state.orders.filter(o=>o.supplierCode.toLowerCase()===code.toLowerCase()).forEach(o=>o.email=email);
    notifyActivity('rule','Supplier email configured',`${code} · ${email}`);save();closeModal(false);render();toast('Supplier email saved for all matching orders.');return;
  }
  if(e.target.id!=='order-editor')return;
  e.preventDefault();const form=e.target,data=new FormData(form),id=form.dataset.id;
  const row=['supplier','supplierCode','po','shipDate','status'].map(f=>data.get(f));
  const result=C.validateRows([row],{supplier:0,supplierCode:1,po:2,shipDate:3,status:4});
  const o=result.orders[0];
  if(result.errors.length){$('#editor-error').textContent=result.errors.join(' ');return;}
  if(state.orders.some(x=>x.id!==id&&x.po.toLowerCase()===o.po.toLowerCase()&&x.supplierCode.toLowerCase()===o.supplierCode.toLowerCase())){$('#editor-error').textContent='This supplier code and PO already exist.';return;}
  if(id){const existing=state.orders.find(o=>o.id===id),profile=state.orders.find(x=>x.supplierCode.toLowerCase()===o.supplierCode.toLowerCase());Object.assign(existing,{supplier:o.supplier,supplierCode:o.supplierCode,po:o.po,shipDate:o.shipDate,shipped:o.shipped,email:profile?.email||existing.email||'',automationEnabled:profile?.automationEnabled??existing.automationEnabled});delete existing.draft;ui.orderId=id;}
  else {const profile=state.orders.find(x=>x.supplierCode.toLowerCase()===o.supplierCode.toLowerCase());o.id=crypto.randomUUID();o.email=profile?.email||'';o.automationEnabled=profile?.automationEnabled??true;state.orders.unshift(o);ui.orderId=o.id;if(state.mode==='demo')state.mode='mixed';}
  notifyActivity('import',id?'Order details updated':'Purchase order added',`${o.supplier} · ${o.po}`);save();go('orders');toast(id?'Order updated.':'Order added.');
});
const route=location.hash.slice(1);if(pages[route])ui.page=route;
window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);if(pages[page]&&page!==ui.page)go(page);});
render();
