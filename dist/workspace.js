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
  <div class="inspector-scroll"><div class="inspector-supplier"><div class="flex gap">${logo(o)}<div><h3>${esc(o.supplier)}</h3><p>${esc(o.email)}</p></div></div>${badge(o)}</div>
  <dl class="order-properties"><div><dt>Item</dt><dd>${esc(o.item)}</dd></div><div><dt>Original ship date</dt><dd>${dateLabel(o.shipDate,true)}</dd></div><div><dt>Revised ship date</dt><dd>${o.revisedDate?dateLabel(o.revisedDate,true):'Not provided'}</dd></div><div><dt>Last contact</dt><dd>${o.lastSent?dateLabel(o.lastSent,true):'Not contacted'}</dd></div><div><dt>Follow-ups</dt><dd>${o.reminders||0} / ${state.settings.maxReminders}</dd></div></dl>
  ${o.escalated?'<div class="inspector-alert">'+icon('alert')+'<span><strong>Escalation required</strong>Follow-up limit reached. Contact this supplier directly.</span></div>':C.overdue(o)?`<div class="inspector-alert">${icon('clock')}<span><strong>${C.daysBetween(C.effectiveDate(o))} days overdue</strong>Request the current shipping status and revised date.</span></div>`:''}
  <div class="inspector-section"><div class="between"><h3>Latest message</h3>${recent?`<span class="tiny muted">${relative(recent.at)}</span>`:''}</div>${recent?`<div class="inspector-message"><div class="message-direction">${icon(recent.direction==='incoming'?'reply':'send')}${recent.direction==='incoming'?'Supplier reply':'Outgoing message'}<span>${recent.manual?'Recorded':'Demo'}</span></div><p>${esc(recent.body)}</p></div><button class="link-btn" data-action="open-conversation" data-id="${esc(o.id)}">Open conversation ${icon('arrow')}</button>`:'<p class="inspector-empty">No messages recorded for this order.</p>'}</div>
  ${o.draft?`<div class="inspector-section"><div class="between"><h3>Draft ready</h3><span class="tag green">Review</span></div><p class="draft-subject">${esc(o.draft.subject)}</p><button class="btn" data-action="draft" data-id="${esc(o.id)}">${icon('edit')}Review email draft</button></div>`:''}
  <div class="inspector-section"><h3>Quick actions</h3><button class="inspector-action" data-action="record-reply" data-id="${esc(o.id)}">${icon('reply')}Record reply / update ETA ${icon('chevron')}</button><button class="inspector-action" data-action="ship" data-id="${esc(o.id)}">${icon(o.shipped?'refresh':'checkCircle')}${o.shipped?'Reopen order':'Mark as shipped'} ${icon('chevron')}</button></div></div>
  <div class="inspector-footer"><span>${icon('mail')} Email not connected</span><button class="btn primary" data-action="draft" data-id="${esc(o.id)}" data-type="${action}">${icon('edit')}${o.draft?'Review draft':action==='acknowledgement'?'Acknowledge update':action==='reminder'?'Prepare reminder':'Prepare follow-up'}</button></div>`;
}

function followupsPage() {
  const queue=state.orders.filter(o=>!o.shipped&&(o.draft||o.escalated||C.automationAction(o,state.settings)));
  const visible=queue.filter(o=>ui.queueFilter==='drafts'?!!o.draft:ui.queueFilter==='review'?!!o.escalated: true);
  return `${heading('Follow-ups','Review pending drafts and orders that need action.',`<button class="btn primary" data-action="run-check">${icon('refresh')}Run check <span class="demo-label">DEMO</span></button>`)}
  <div class="queue-status">${icon('mail')} Email is not connected. Messages stay as drafts until you review them.</div>
  <section class="card queue-card"><div class="table-controls"><div class="tabs" role="tablist" aria-label="Follow-up queue filter">${[['all','All tasks',queue.length],['drafts','Drafts ready',queue.filter(o=>o.draft).length],['review','Escalations',queue.filter(o=>o.escalated).length]].map(([value,label,n])=>`<button class="tab ${ui.queueFilter===value?'active':''}" data-action="queue-filter" data-filter="${value}" role="tab" aria-selected="${ui.queueFilter===value}">${label}<small>${n}</small></button>`).join('')}</div></div><div class="table-wrap"><table><thead><tr><th>Purchase order</th><th>Supplier</th><th>Required action</th><th>Last contact</th><th></th></tr></thead><tbody>${visible.map(o=>{const action=C.automationAction(o,state.settings);return `<tr><td><button class="po-link" data-action="order" data-id="${esc(o.id)}">${esc(o.po)}</button></td><td><div class="supplier-cell">${logo(o)}<span>${esc(o.supplier)}</span></div></td><td><span class="tag ${o.escalated?'red':o.draft?'green':'orange'}">${o.escalated?'Escalation':o.draft?'Draft ready':action==='reminder'?'Reminder due':action==='escalate'?'Review required':'Initial follow-up'}</span></td><td>${o.lastSent?dateLabel(o.lastSent):'Not contacted'}</td><td><div class="queue-row-actions"><button class="btn sm" data-action="${o.escalated?'order':'draft'}" data-id="${esc(o.id)}" data-type="${action==='reminder'?'reminder':'initial'}">${o.escalated?'Review order':o.draft?'Review draft':'Prepare draft'} ${icon('chevron')}</button>${o.draft?`<button class="icon-btn" data-action="discard-draft" data-id="${esc(o.id)}" aria-label="Discard draft for ${esc(o.po)}">${icon('close')}</button>`:''}</div></td></tr>`;}).join('')||'<tr><td colspan="5"><div class="empty"><div class="empty-icon">'+icon('checkCircle')+'</div><h3>No pending tasks</h3><p>Run a check to evaluate overdue orders against your saved rules.</p></div></td></tr>'}</tbody></table></div><div class="table-footer"><span>${visible.length} tasks</span><span>Last check: ${state.lastCheck?relative(state.lastCheck):'Not run'}</span></div></section>`;
}

function showOrderEditor(id=null) {
  const order=state.orders.find(o=>o.id===id);
  const o=order||{supplier:'',po:'',item:'',shipDate:C.isoDate(),email:'',shipped:false};
  showModal(order?'Edit purchase order':'Add purchase order','Supplier and shipment details.',`<form id="order-editor" data-id="${esc(id||'')}"><div class="field-row"><div class="field"><label for="editor-po">Purchase order</label><input id="editor-po" name="po" value="${esc(o.po)}" maxlength="100" required placeholder="PO-1049"></div><div class="field"><label for="editor-supplier">Supplier</label><input id="editor-supplier" name="supplier" value="${esc(o.supplier)}" maxlength="200" required placeholder="Supplier name"></div></div><div class="field"><label for="editor-item">Item / Description</label><input id="editor-item" name="item" value="${esc(o.item)}" maxlength="500" required></div><div class="field"><label for="editor-email">Supplier email</label><input type="email" id="editor-email" name="email" value="${esc(o.email)}" maxlength="254" required placeholder="orders@supplier.com"></div><div class="field-row"><div class="field"><label for="editor-date">Original shipping date</label><input type="date" id="editor-date" name="shipDate" value="${esc(o.shipDate)}" required></div><div class="field"><label for="editor-status">Shipment status</label><select id="editor-status" name="status"><option value="Open" ${!o.shipped?'selected':''}>Not shipped</option><option value="Shipped" ${o.shipped?'selected':''}>Shipped</option></select></div></div>${order?.revisedDate?'<p class="tiny muted">The revised date recorded from your supplier remains in effect. Use “Record reply / update ETA” to change it.</p>':''}<div id="editor-error" class="status-message" role="status"></div></form>`,`<button class="btn" data-action="close">Cancel</button><button class="btn primary" type="submit" form="order-editor">${icon('check')}${order?'Save changes':'Add order'}</button>`);
}

document.addEventListener('click',e=>{
  const el=e.target.closest('[data-action="open-conversation"]');
  if(el){ui.thread=el.dataset.id;go('inbox');}
});
document.addEventListener('submit',e=>{
  if(e.target.id!=='order-editor')return;
  e.preventDefault();const form=e.target,data=new FormData(form),id=form.dataset.id;
  const row=['supplier','po','item','shipDate','email','status'].map(f=>data.get(f));
  const result=C.validateRows([row],{supplier:0,po:1,item:2,shipDate:3,email:4,status:5});
  const o=result.orders[0];
  if(result.errors.length){$('#editor-error').textContent=result.errors.join(' ');return;}
  if(state.orders.some(x=>x.id!==id&&x.po.toLowerCase()===o.po.toLowerCase()&&x.item.toLowerCase()===o.item.toLowerCase())){$('#editor-error').textContent='This purchase order and item already exist.';return;}
  if(id){const existing=state.orders.find(o=>o.id===id);Object.assign(existing,{supplier:o.supplier,po:o.po,item:o.item,email:o.email,shipDate:o.shipDate,shipped:o.shipped});delete existing.draft;ui.orderId=id;}
  else {o.id=crypto.randomUUID();state.orders.unshift(o);ui.orderId=o.id;if(state.mode==='demo')state.mode='mixed';}
  notifyActivity('import',id?'Order details updated':'Purchase order added',`${o.supplier} · ${o.po}`);save();go('orders');toast(id?'Order updated.':'Order added.');
});
const route=location.hash.slice(1);if(pages[route])ui.page=route;
window.addEventListener('hashchange',()=>{const page=location.hash.slice(1);if(pages[page]&&page!==ui.page)go(page);});
render();
