const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('./dist/core.js');
test('calendar dates are validated without silent rollover',()=>{
  assert.equal(C.parseDate('2026-02-30'),'');
  assert.equal(C.parseDate('2024-02-29'),'2024-02-29');
  assert.equal(C.parseDate('12/31/2026'),'2026-12-31');
  assert.equal(C.parseDate('31/12/2026'),'');
  assert.equal(C.parseDate(45000),'2023-03-15');
  assert.equal(C.daysBetween('2026-03-07','2026-03-09'),2);
});
test('revised dates and shipment completion control overdue classification',()=>{
  const order={shipDate:'2026-10-01',revisedDate:'2026-10-15',shipped:false};
  assert.equal(C.overdue(order,'2026-10-11'),false);
  order.revisedDate='2026-10-10';assert.equal(C.overdue(order,'2026-10-11'),true);
  order.shipped=true;assert.equal(C.overdue(order,'2026-10-11'),false);
});
test('import maps common headers and rejects invalid rows and duplicate items',()=>{
  const map=C.mapHeaders(['Vendor Name','PO Number','Description','Shipping Date','Email Address','Status']);
  assert.deepEqual(map,{supplier:0,po:1,item:2,shipDate:3,email:4,status:5});
  const valid=['Atlas','PO-1','Bearing','2026-10-02','ops@example.com','Shipped'];
  assert.equal(C.validateRows([valid],map).orders[0].shipped,true);
  assert.equal(C.validateRows([valid,valid],map).errors.length,1);
  const wrong=[...valid];wrong[4]='invalid';assert.match(C.validateRows([wrong],map).errors[0],/valid supplier email/);
  wrong[4]='ops@example.com';wrong[3]='2026-02-31';assert.match(C.validateRows([wrong],map).errors[0],/Excel date/);
});
test('automation respects no-reply delays, revised dates, drafts, and escalation',()=>{
  const now=new Date('2026-10-11T12:00:00Z'),s=structuredClone(C.defaults);
  const order={shipDate:'2026-10-01',shipped:false,messages:[]};
  assert.equal(C.automationAction(order,s,now),'initial');
  order.lastSent='2026-10-10T12:00:00Z';order.firstSent=order.lastSent;
  assert.equal(C.automationAction(order,s,now),null);
  order.lastSent='2026-10-08T12:00:00Z';order.firstSent=order.lastSent;
  assert.equal(C.automationAction(order,s,now),'reminder');
  order.firstSent='2026-10-05T12:00:00Z';assert.equal(C.automationAction(order,s,now),'escalate');
  order.escalated=true;assert.equal(C.automationAction(order,s,now),null);
  order.lastReply='2026-10-11T10:00:00Z';order.revisedDate='2026-10-15';
  assert.equal(C.waiting(order),false);assert.equal(C.automationAction(order,s,now),null);
  order.revisedDate='2026-10-10';assert.equal(C.automationAction(order,s,now),null);
  order.draft={body:'test'};assert.equal(C.automationAction(order,s,now),null);
  delete order.draft;order.shipped=true;assert.equal(C.automationAction(order,s,now),null);
});
test('exports quote cells and neutralize spreadsheet formula prefixes',()=>{
  assert.equal(C.csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"');
  assert.equal(C.csvCell('  =1+1'),'"\'  =1+1"');
  assert.equal(C.csvCell('safe, text'),'"safe, text"');
});
test('sample state metrics and personalized drafts are consistent',()=>{
  const s=C.sampleState();assert.equal(s.orders.length,24);
  assert.equal(s.orders.filter(o=>C.overdue(o)).length,7);
  assert.equal(s.orders.filter(o=>C.waiting(o)).length,5);
  assert.equal(s.orders.filter(o=>o.revisedDate).length,3);
  const d=C.draftFor(s.orders[0],s.settings);assert.ok(d.body.includes(s.orders[0].po));assert.ok(!d.body.includes('{{'));
});
