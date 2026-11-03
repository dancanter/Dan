import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/db/state/main.json')); const S = d.data || d;
const b = await chromium.launch(); const errs=[];
for (const [scheme,f] of [['light','look-light.png'],['dark','look-dark.png']]) {
  const p = await b.newPage({viewport:{width:390,height:1100},colorScheme:scheme}); p.on('pageerror',e=>errs.push(String(e)));
  await p.clock.setFixedTime(new Date('2026-11-03T12:00:00'));
  await p.goto('http://localhost:8765/index.html'); await p.evaluate(s=>{localStorage.clear();localStorage.setItem('cutblock71.v1',JSON.stringify(s));},S); await p.reload(); await p.waitForTimeout(1200);
  await p.evaluate(()=>{const w=document.getElementById('storeWarn');if(w)w.innerHTML='';});
  await p.screenshot({path:'/tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/'+f});
  console.log(scheme,'scroll',await p.evaluate(()=>document.documentElement.scrollWidth));
  await p.close();
}
console.log(errs.length?errs.join('|'):'no errors'); await b.close();
