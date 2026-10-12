(function (root) {
  'use strict';
  const DAY = 86400000;
  const defaults = {
    enabled: true, reminderDays: 2, escalationDays: 5, maxReminders: 3,
    senderName: 'Purchasing team', company: 'Acme Operations',
    emailProvider: '', fromEmail: '', ccEmails: '',
    templates: {
      initial: { subject: 'Please confirm shipping date · {{po}}', body: 'Hi {{supplier}},\n\nPlease confirm whether the promised shipping date of {{ship_date}} is still valid for purchase order {{po}}.\n\nIf the date has changed, please reply with the new shipping date. If the order has shipped, please send the tracking details.\n\nThank you,\n{{sender}}\n{{company}}' },
      reminder: { subject: 'Reminder: shipping update needed · {{po}}', body: 'Hi {{supplier}},\n\nWe have not received an update for purchase order {{po}}, which was due to ship on {{ship_date}}. Please explain why it has not shipped and confirm the new shipping date.\n\nThank you,\n{{sender}}\n{{company}}' },
      acknowledgement: { subject: 'Re: Shipping update · {{po}}', body: 'Hi {{supplier}},\n\nThank you for the update on purchase order {{po}}. We recorded the revised shipping date as {{revised_date}}.\n\nPlease let us know if this changes and send tracking details when it ships.\n\nBest,\n{{sender}}\n{{company}}' }
    }
  };
  function isoDate(date = new Date()) {
    const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function offsetDate(offset, base = new Date()) { const d = new Date(base); d.setDate(d.getDate() + offset); return isoDate(d); }
  function dayNumber(date) { return Date.parse(`${date}T00:00:00Z`) / DAY; }
  function daysBetween(from, to = isoDate()) { return Math.round(dayNumber(to) - dayNumber(from)); }
  function parseDate(value) {
    if (value instanceof Date) return Number.isNaN(+value) ? '' : isoDate(value);
    if (typeof value === 'number' && Number.isFinite(value) && value > 0 && value < 109575) return new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * DAY).toISOString().slice(0, 10);
    const s = String(value ?? '').trim(); let y, m, d;
    let match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:T.*)?$/);
    if (match) [, y, m, d] = match;
    else { match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (match) [, m, d, y] = match; else return ''; }
    const date = new Date(Date.UTC(+y, +m - 1, +d));
    if (+y < 1900 || +y > 2199 || date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) return '';
    return date.toISOString().slice(0, 10);
  }
  function effectiveDate(order) { return order.revisedDate || order.shipDate; }
  function overdue(order, today = isoDate()) { return !order.shipped && daysBetween(effectiveDate(order), today) > 0; }
  function waiting(order) { return !order.shipped && !!order.lastSent && (!order.lastReply || order.lastSent > order.lastReply); }
  function stage(order, today = isoDate()) {
    if (order.shipped) return 'shipped';
    if (waiting(order)) return 'awaiting';
    if (overdue(order, today)) return 'overdue';
    if (order.revisedDate) return 'updated';
    return 'ontrack';
  }
  function matches(order, filter) {
    return filter === 'all' || (filter === 'overdue' && overdue(order)) || (filter === 'awaiting' && waiting(order)) || (filter === 'updated' && !order.shipped && !!order.revisedDate) || (filter === 'shipped' && order.shipped) || (filter === 'ontrack' && stage(order) === 'ontrack');
  }
  function interpolate(template, order, settings) {
    const values = { supplier: order.supplier, supplier_code: order.supplierCode || '', po: order.po, ship_date: order.shipDate, revised_date: order.revisedDate || 'to be confirmed', sender: settings.senderName, company: settings.company };
    return template.replace(/\{\{([a-z_]+)\}\}/g, (match, key) => values[key] ?? match);
  }
  function draftFor(order, settings, type = 'initial') {
    const t = settings.templates[type]; return { type, subject: interpolate(t.subject, order, settings), body: interpolate(t.body, order, settings), at: new Date().toISOString() };
  }
  function automationAction(order, settings, now = new Date()) {
    if (!settings.enabled || order.automationEnabled === false || !order.email || order.shipped || order.draft) return null;
    if (!order.lastSent && !order.lastReply) return 'initial';
    if (!overdue(order, isoDate(now))) return null;
    if (waiting(order)) {
      const firstSent = order.firstSent || order.lastSent;
      if ((+now - Date.parse(firstSent)) / DAY >= settings.escalationDays || (order.reminders || 0) >= settings.maxReminders) return order.escalated ? null : 'escalate';
      return (+now - Date.parse(order.lastSent)) / DAY >= settings.reminderDays ? 'reminder' : null;
    }
    if (order.lastReply && (+now - Date.parse(order.lastReply)) / DAY < settings.reminderDays) return null;
    return 'initial';
  }
  const aliases = {
    supplier: ['supplier', 'suppliername', 'vendor', 'vendorname', 'company'],
    supplierCode: ['suppliercode', 'vendorcode', 'supplierid', 'vendorid', 'code'],
    email: ['supplieremail', 'vendoremail', 'email', 'emailaddress', 'contactemail'],
    po: ['po', 'ponumber', 'purchaseorder', 'purchaseordernumber', 'order', 'ordernumber'],
    shipDate: ['shipdate', 'shippingdate', 'shippingdates', 'expectedshipdate', 'expectedshippingdate', 'duedate', 'deliverydate', 'promiseddate'],
    status: ['status', 'shippingstatus', 'orderstatus', 'shipmentstatus']
  };
  const normalizeHeader = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  function mapHeaders(headers) {
    return Object.fromEntries(Object.entries(aliases).map(([field, list]) => [field, headers.findIndex(h => list.includes(normalizeHeader(h)))]));
  }
  function validateRows(rows, mapping) {
    const errors = [], orders = [], seen = new Set();
    for (const field of ['supplier', 'supplierCode', 'email', 'po', 'shipDate']) if (mapping[field] < 0 || mapping[field] === undefined) errors.push(`Select a column for ${field === 'shipDate' ? 'shipping date' : field === 'supplierCode' ? 'supplier code' : field === 'email' ? 'supplier email' : field}.`);
    if (errors.length) return { errors, orders };
    const mapped = Object.values(mapping).filter(n => n >= 0);
    if (new Set(mapped).size !== mapped.length) return { errors: ['Each field must use a different column.'], orders: [] };
    rows.forEach((row, index) => {
      if (row.every(v => v === '' || v == null)) return;
      const value = f => String(row[mapping[f]] ?? '').trim();
      const order = { supplier: value('supplier'), supplierCode: value('supplierCode'), po: value('po'), shipDate: parseDate(row[mapping.shipDate]), email: value('email'), shipped: /^(shipped|delivered|complete|completed)$/i.test(value('status')), automationEnabled: true };
      const missing = ['supplier', 'supplierCode', 'email', 'po'].filter(f => !order[f]);
      if (missing.length) { errors.push(`Row ${index + 2}: missing ${missing.join(', ')}.`); return; }
      if ([order.supplier, order.supplierCode, order.po].some(v => v.length > 500)) { errors.push(`Row ${index + 2}: text fields must be under 500 characters.`); return; }
      if (order.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) { errors.push(`Row ${index + 2}: enter a valid supplier email address.`); return; }
      if (!order.shipDate) { errors.push(`Row ${index + 2}: use an Excel date, YYYY-MM-DD, or MM/DD/YYYY.`); return; }
      const key = `${order.supplierCode.toLowerCase()}|${order.po.toLowerCase()}`;
      if (seen.has(key)) { errors.push(`Row ${index + 2}: duplicate supplier code and PO (${order.po}).`); return; }
      seen.add(key); orders.push({ ...order, id: `import-${Date.now()}-${index}`, color: ['green', 'blue', 'sand', 'rose'][index % 4], revisedDate: '', lastSent: '', lastReply: '', reminders: 0, messages: [] });
    });
    return { errors, orders };
  }
  function csvCell(value) {
    let s = String(value ?? ''); if (/^[=+\-@\t\r\n]/.test(s) || /^\s+[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  }
  function exportCsv(orders) {
    return [['Supplier Name', 'Supplier Code', 'PO Number', 'Shipping Date', 'Supplier Email', 'Automation', 'Status', 'Revised Date'], ...orders.map(o => [o.supplier, o.supplierCode, o.po, o.shipDate, o.email, o.automationEnabled === false ? 'Off' : 'On', o.shipped ? 'Shipped' : stage(o), o.revisedDate])].map(row => row.map(csvCell).join(',')).join('\r\n');
  }
  function analyzeReply(text) {
    const value=String(text||'');
    const shipped=/\b(has shipped|already shipped|dispatched|in transit|tracking)\b/i.test(value);
    const datePattern=/(20\d{2}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\/\d{1,2}\/20\d{2}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+20\d{2})?)/i;
    const match=value.match(datePattern);let revisedDate='';
    if(match){const cleaned=match[0].replace(/(st|nd|rd|th)/i,'');const parsed=parseDate(cleaned);if(parsed)revisedDate=parsed;else{const d=new Date(cleaned);if(!Number.isNaN(+d))revisedDate=isoDate(d);}}
    return {shipped,revisedDate,status:shipped?'shipped':revisedDate?'date_found':'needs_review'};
  }
  function sampleState() {
    const names = [ ['Atlas Components', 'Precision bearings', 'Maya Chen', 'green'], ['Nordic Supply Co.', 'Steel fasteners · M12', 'Erik Larsen', 'blue'], ['Vertex Electronics', 'Control board assembly', 'James Park', 'sand'], ['Pacific Materials', 'Aluminum sheets · 2mm', 'Sarah Kim', 'rose'], ['Summit Industrial', 'Hydraulic pump kit', 'David Miller', 'green'], ['Evergreen Packaging', 'Corrugated cartons', 'Olivia Reed', 'sand'], ['Atlas Components', 'Drive shaft couplings', 'Maya Chen', 'green'], ['Nordic Supply Co.', 'Stainless steel brackets', 'Erik Larsen', 'blue'], ['Vertex Electronics', 'Temperature sensors', 'James Park', 'sand'], ['Pacific Materials', 'Copper tubing · 10mm', 'Sarah Kim', 'rose'], ['Summit Industrial', 'Pressure valves', 'David Miller', 'green'], ['Evergreen Packaging', 'Protective foam inserts', 'Olivia Reed', 'sand'] ];
    const ago = (days, hours = 0) => new Date(Date.now() - days * DAY - hours * 3600000).toISOString();
    const orders = Array.from({length:24}, (_, i) => {
      const n = names[i % names.length]; const isLate = i < 7, updated = i >= 7 && i < 10, shipped = i >= 19;
      const order = { id: `sample-${i + 1}`, supplier:n[0], supplierCode:`SUP-${String((i%6)+1).padStart(3,'0')}`, item:'', contact:n[2], color:n[3], po:`PO-${1048 - i}`, email:`orders@${n[0].toLowerCase().replace(/[^a-z]/g,'')}.example`, automationEnabled:true, shipDate:offsetDate(isLate ? -(7 - i) : updated ? -3 : shipped ? -2 : i - 8), revisedDate:updated ? offsetDate(i - 5) : '', shipped, lastSent:i < 5 ? ago(3, i) : updated ? ago(2) : '', firstSent:i < 5 ? ago(4, i) : updated ? ago(2) : '', lastReply:updated ? ago(0, i - 6) : '', reminders:0, messages:[], demo:true };
      if (order.lastSent) order.messages.push({direction:'outgoing', demo:true, subject:`Shipping update requested · ${order.po}`, body:`Hi ${order.contact.split(' ')[0]},\n\nCould you share a shipping update for ${order.po} (${order.item})? The original ship date was ${order.shipDate}. Please confirm the revised date and current status.\n\nThank you,\nPurchasing team`, at:order.lastSent});
      if (updated) order.messages.push({direction:'incoming', demo:true, subject:`Re: Shipping update · ${order.po}`, body:`Hi team,\n\nThanks for checking in. We’ve had a short production delay, but your order is now confirmed for shipment on ${order.revisedDate}. We’ll send tracking information as soon as it leaves our warehouse.\n\nBest,\n${order.contact}`, at:order.lastReply});
      return order;
    });
    return {version:1, orders, settings:structuredClone(defaults), lastCheck:null, mode:'demo', activity:[
      {id:'a1',type:'reply',title:'New shipping date received',detail:'Nordic Supply Co. · PO-1041',at:ago(0,1)},
      {id:'a2',type:'email',title:'Follow-up email previewed',detail:'Atlas Components · PO-1048',at:ago(0,2)},
      {id:'a3',type:'reply',title:'Supplier replied',detail:'Vertex Electronics · PO-1040',at:ago(0,3)},
      {id:'a4',type:'import',title:'24 purchase orders imported',detail:'purchase_orders_october.xlsx · sample file',at:ago(0,4)}
    ]};
  }
  const api = {DAY,defaults,isoDate,offsetDate,parseDate,daysBetween,effectiveDate,overdue,waiting,stage,matches,interpolate,draftFor,automationAction,mapHeaders,validateRows,csvCell,exportCsv,analyzeReply,sampleState};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SupplierCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
