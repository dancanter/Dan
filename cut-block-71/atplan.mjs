import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
await p.clock.setFixedTime(new Date('2026-11-02T12:00:00'));
await p.goto('file://' + process.cwd() + '/cb71.test.html'); await p.evaluate(()=>{localStorage.clear();localStorage.setItem('cutblock71.v1',JSON.stringify({weights:{'2026-11-02':127},days:{},settings:{}}));}); await p.reload(); await p.waitForTimeout(500);
await p.click('button[data-plan]'); await p.waitForTimeout(200);
const r = await p.evaluate(()=>({plan:S.days['2026-11-02'].plan, sc:ccDayScore('2026-11-02')}));
console.log(JSON.stringify(r), errs.length?'ERR '+errs:'no errors', r.plan===true&&r.sc===2?'PASS':'FAIL');
await b.close();
