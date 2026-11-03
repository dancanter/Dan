import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const SP='/tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad';
const b = await chromium.launch(); const errs=[];
for (const scheme of ['light','dark']) {
const p = await b.newPage({viewport:{width:390,height:844},colorScheme:scheme}); p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error'&&!/CERT|Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.clock.setFixedTime(new Date('2026-11-03T12:00:00'));
await p.goto('http://localhost:8765/app.html');
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('cutblock71.v1',JSON.stringify({weights:{'2026-11-02':129.6},days:{'2026-11-02':{bed:'22:36',wake:'08:26'}},settings:{}}));
 localStorage.setItem('glow-state-v1',JSON.stringify({version:1,days:{'2026-11-03':{items:[{uid:'a',foodId:'salmon-wild',grams:150,meal:'lunch'}],rituals:[]}},weights:[],sleeps:[]}));});
await p.reload(); await p.waitForTimeout(800);
await p.click('#bnav button[data-g="today"]'); await p.waitForTimeout(2500);
const t1 = await p.evaluate(()=>{const h=document.getElementById('glow-host');return h&&h.shadowRoot?h.shadowRoot.textContent.slice(0,120):'NO SHADOW';});
await p.screenshot({path:SP+'/in-food-'+scheme+'.png'});
await p.click('#tabs button[data-g="cellular"]'); await p.waitForTimeout(800);
const t2 = await p.evaluate(()=>document.getElementById('glow-host').shadowRoot.textContent.slice(0,80));
await p.screenshot({path:SP+'/in-cells-'+scheme+'.png'});
await p.click('#bnav button[data-t="today"]'); await p.waitForTimeout(500);
const cc = await p.evaluate(()=>getComputedStyle(document.querySelector('.cc')).borderTopColor+' '+getComputedStyle(document.body).backgroundColor);
const rings = (await p.innerText('#ccCard')).match(/CALORIES\s*\n?\s*(\d+)/);
await p.screenshot({path:SP+'/in-today-'+scheme+'.png'});
console.log(scheme,'| food:',t1.slice(0,70),'| cells:',t2.slice(0,50),'| tracker css:',cc,'| kcal ring:',rings&&rings[1]);
await p.close(); }
console.log(errs.length?errs.slice(0,5):'no errors'); await b.close();
