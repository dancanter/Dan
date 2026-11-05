import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('db/state/main.json')); const S = d.data || d;
const b = await chromium.launch(); const errs=[];
for (const [w,h,f] of [[390,900,'cc-phone.png'],[1100,900,'cc-desk.png']]) {
  const p = await b.newPage({viewport:{width:w,height:h}});
  p.on('pageerror', e => errs.push(String(e)));
  await p.clock.setFixedTime(new Date('2026-11-01T19:00:00'));
  await p.goto('file://' + process.cwd() + '/cb71.test.html');
  await p.evaluate(s => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(s)); }, S);
  await p.reload(); await p.waitForTimeout(1500);
  console.log(w, 'scroll', await p.evaluate(()=>document.documentElement.scrollWidth), 'text', (await p.innerText('#ccCard')).slice(0,300).replace(/\n/g,' | '));
  await p.screenshot({path:f});
  await p.close();
}
console.log(errs.length?'ERR '+errs.join('|'):'no errors'); await b.close();
