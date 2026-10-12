const STORE_KEY = 'SUPPLIERFLOW_ORDERS';
const CONFIG_KEY = 'SUPPLIERFLOW_CONFIG';

function configureSupplierflow(accessKey) {
  if (!accessKey || accessKey.length < 16) throw new Error('Use an access key with at least 16 characters.');
  PropertiesService.getScriptProperties().setProperty('SUPPLIERFLOW_KEY', accessKey);
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'runSupplierflow').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runSupplierflow').timeBased().everyHours(6).create();
  return 'Supplierflow Gmail automation is active. Checks run every 6 hours.';
}

function doPost(e) {
  try {
    const request = JSON.parse(e.parameter.payload || '{}');
    authorize_(request.key);
    if (request.action === 'sync') {
      sync_(request.orders || [], request.config || {});
      if (request.runNow) runSupplierflow();
      return json_({ok:true, message:'Orders synchronized'});
    }
    if (request.action === 'run') { runSupplierflow(); return json_({ok:true}); }
    return json_({ok:false, error:'Unknown action'});
  } catch (error) { return json_({ok:false, error:String(error.message || error)}); }
}

function doGet(e) {
  try {
    authorize_(e.parameter.key);
    const result = {ok:true, orders:readJson_(STORE_KEY, []), lastRun:PropertiesService.getScriptProperties().getProperty('LAST_RUN')};
    const body = JSON.stringify(result);
    if (e.parameter.callback) return ContentService.createTextOutput(`${e.parameter.callback}(${body})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return json_({ok:false,error:String(error.message || error)}); }
}

function sync_(incoming, config) {
  const old = new Map(readJson_(STORE_KEY, []).map(o => [`${o.supplierCode}|${o.po}`, o]));
  const orders = incoming.map(o => {
    const prior = old.get(`${o.supplierCode}|${o.po}`) || {};
    return Object.assign({}, prior, o, {
      lastSent: prior.lastSent || o.lastSent || '', reminders: prior.reminders || o.reminders || 0,
      lastReply: prior.lastReply || o.lastReply || '', revisedDate: prior.revisedDate || o.revisedDate || '',
      shipped: prior.shipped || o.shipped || false
    });
  });
  writeJson_(STORE_KEY, orders);
  writeJson_(CONFIG_KEY, config);
}

function runSupplierflow() {
  const config = readJson_(CONFIG_KEY, {}), orders = readJson_(STORE_KEY, []), now = new Date();
  orders.forEach(order => {
    if (!config.enabled || order.automationEnabled === false || order.shipped || !order.email) return;
    inspectReplies_(order);
    if (order.shipped || order.lastReply && (!order.lastSent || new Date(order.lastReply) > new Date(order.lastSent))) return;
    const shipDate = order.revisedDate || order.shipDate;
    const overdue = new Date(`${shipDate}T23:59:59`) < now;
    let type = '';
    if (!order.lastSent) type = 'initial';
    else if (overdue && days_(order.lastSent, now) >= Number(config.reminderDays || 2) && Number(order.reminders || 0) < Number(config.maxReminders || 3)) type = 'reminder';
    if (!type) return;
    const template = config.templates[type], values = {supplier:order.supplier,supplier_code:order.supplierCode,po:order.po,ship_date:order.shipDate,revised_date:order.revisedDate || 'to be confirmed',sender:config.senderName,company:config.company};
    const subject = fill_(template.subject, values), body = fill_(template.body, values);
    GmailApp.sendEmail(order.email, subject, body, {cc:config.ccEmails || '', name:config.senderName || config.company || 'Supplierflow'});
    order.lastSent = now.toISOString();
    if (type === 'reminder') order.reminders = Number(order.reminders || 0) + 1;
  });
  writeJson_(STORE_KEY, orders);
  PropertiesService.getScriptProperties().setProperty('LAST_RUN', now.toISOString());
}

function inspectReplies_(order) {
  if (!order.lastSent) return;
  const threads = GmailApp.search(`in:anywhere from:${order.email} "${order.po}" newer_than:90d`, 0, 10);
  let newest = null;
  threads.forEach(t => t.getMessages().forEach(m => { if (m.getDate() > new Date(order.lastSent) && (!newest || m.getDate() > newest.getDate())) newest = m; }));
  if (!newest) return;
  const text = newest.getPlainBody(); order.lastReply = newest.getDate().toISOString();
  if (/\b(shipped|dispatched|in transit|tracking)\b/i.test(text)) order.shipped = true;
  const match = text.match(/\b(20\d{2})[-\/.](0?[1-9]|1[0-2])[-\/.](0?[1-9]|[12]\d|3[01])\b/);
  if (match) order.revisedDate = `${match[1]}-${String(match[2]).padStart(2,'0')}-${String(match[3]).padStart(2,'0')}`;
}

function authorize_(key) { if (!key || key !== PropertiesService.getScriptProperties().getProperty('SUPPLIERFLOW_KEY')) throw new Error('Unauthorized'); }
function fill_(text, values) { return String(text || '').replace(/{{\s*([a-z_]+)\s*}}/g, (_, k) => values[k] || ''); }
function days_(from, to) { return (to - new Date(from)) / 86400000; }
function readJson_(key, fallback) { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(key) || JSON.stringify(fallback)); } catch (_) { return fallback; } }
function writeJson_(key, value) { PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value)); }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
