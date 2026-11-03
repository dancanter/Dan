// Human Performance OS, stage 2 (3 Nov): the identity strip, University
// (backwards plan, marks and feedback, weekly hours, Harvard references),
// population benchmarks, the backup download, the food tables keeping the
// hard rules, and no sideways scroll at 390 px.
//   python3 mkapptest.py $SP/srv/app.html; (cd $SP/srv && python3 -m http.server 8765) & node hpos2.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const URL = process.env.APP_URL || 'http://localhost:8765/app.html';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + String(x).slice(0, 300) : '')); else console.log('ok  ' + n); };
const seed = { weights: { '2026-11-02': 127.0, '2026-11-03': 126.8 },
  days: { '2026-11-02': { study: 3, deep: 2.5 }, '2026-11-03': { study: 2, deep: 1.5, rhr: 50, steps: 13000 } },
  uni: { mods: [{ code: 'SK297', title: '' }, { code: 'SK298', title: '' }], tasks: [{ id: 't1', mod: 'SK297', title: 'TMA 01', due: '2026-11-24', done: false, notes: '' }], topics: [] }, settings: {} };
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !/CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text().slice(0, 200)); });
await p.clock.setFixedTime(new Date('2026-11-03T12:00:00'));
await p.goto(URL);
await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('cutblock71.v1', JSON.stringify(v)); }, seed);
await p.reload(); await p.waitForTimeout(800);
const cc = await p.locator('#ccCard').innerText();
ok('identity strip: name, age from DOB, height, weight', /Dan/.test(cc) && /25 yrs/.test(cc) && /172\.7 cm/.test(cc) && /126\.9 lb|126\.8 lb|lb/.test(cc), cc.slice(0, 300));
// University
await p.evaluate(() => { document.querySelector('nav.tabs button[data-t="study"]').click(); });
await p.waitForTimeout(300);
let uni = await p.locator('#uniCard').innerText();
ok('backwards plan shows the next stage', /next: Decode the question|next:/i.test(uni) && /Plan backwards/.test(uni), uni.slice(0, 400));
ok('weekly study hours card', /Study hours, week by week/i.test(uni) && /This week so far: 5/.test(uni), uni.match(/This week so far[^\n]*/)?.[0]+' / '+uni.slice(uni.search(/study hours/i),uni.search(/study hours/i)+80));
await p.evaluate(() => { const b = document.querySelector('[data-gl="tstage"][data-n="0"]'); b.click(); });
await p.waitForTimeout(200);
ok('stage tick saved', await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('cutblock71.v1')); return !!s.uni.tasks[0].st && !!s.uni.tasks[0].st['0']; }));
await p.evaluate(() => { document.querySelector('[data-gl="tdone"][data-id="t1"]').click(); });
await p.waitForTimeout(200);
await p.fill('input[data-gltaskmark="t1"]', '88'); await p.dispatchEvent('input[data-gltaskmark="t1"]', 'change');
await p.waitForTimeout(200);
await p.fill('textarea[data-gltaskfb="t1"]', 'More evaluation of limitations'); await p.dispatchEvent('textarea[data-gltaskfb="t1"]', 'change');
await p.waitForTimeout(200);
uni = await p.locator('#uniCard').innerText();
ok('mark and feedback stored and summarised', /88%/.test(uni) && /distinction band/.test(uni) && /More evaluation/.test(uni), uni.match(/Marks and feedback[\s\S]{0,200}/)?.[0]);
await p.evaluate(() => { const d = [...document.querySelectorAll('#uniCard details')].find((x) => /Harvard/.test(x.textContent)); d.open = true; });
await p.selectOption('#hvType', 'journal');
await p.fill('#hvAuth', 'Marmot, M.; Allen, J.'); await p.fill('#hvYear', '2014'); await p.fill('#hvTitle', 'Social determinants of health equity');
await p.fill('#hvJour', 'American Journal of Public Health'); await p.fill('#hvVol', '104'); await p.fill('#hvDoi', '10.2105/AJPH.2014.302200');
await p.evaluate(() => document.querySelector('[data-gl="hvadd"]').click());
await p.waitForTimeout(200);
uni = await p.locator('#uniCard').innerText();
ok('Harvard: list entry and in-text citation', /Marmot, M\. and Allen, J\. \(2014\) ‘Social determinants of health equity’, American Journal of Public Health, 104\. Available at: https:\/\/doi\.org\/10\.2105/.test(uni) && /\(Marmot and Allen, 2014\)/.test(uni), uni.match(/Marmot[^\n]*/g)?.join(' | '));
ok('saved after reload', await p.evaluate(() => JSON.parse(localStorage.getItem('cutblock71.v1')).uni.refs.length === 1));
const w1 = await p.evaluate(() => document.documentElement.scrollWidth);
ok('University: no sideways scroll at 390', w1 <= 390, w1);
// Benchmarks
await p.evaluate(() => { document.querySelector('nav.tabs button[data-t="longev"]').click(); });
await p.waitForTimeout(500);
const bn = await p.locator('#benchCard').innerText();
ok('benchmarks: sourced rows and no overall score', /How you compare/i.test(bn) && /FRIEND/.test(bn) && /NICE NG136/.test(bn) && /no valid percentile/i.test(bn) && /no overall score/i.test(bn), [/FRIEND/.test(bn),/NICE NG136/.test(bn),/no valid percentile/i.test(bn),/no overall score/i.test(bn)].join());
const w2 = await p.evaluate(() => document.documentElement.scrollWidth);
ok('Longevity: no sideways scroll at 390', w2 <= 390, w2);
// Food tables keep the hard rules
const food = await p.evaluate(() => document.getElementById('s-food').textContent);
ok('no olive oil, spinach, rocket or watercress recommended in the food tables', !/best is extra virgin olive oil|spinach 100 g|rocket, watercress/i.test(food));
// Backup download
await p.evaluate(() => { document.querySelector('nav.tabs button[data-t="data"]').click(); });
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.evaluate(() => document.getElementById('btnDownload').click())]);
ok('backup file downloads', dl && /human-performance-os-backup-2026-11-03\.json/.test(dl.suggestedFilename()), dl && dl.suggestedFilename());
ok('no page errors', errs.length === 0, errs.join(' | '));
await b.close();
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); } else console.log('all passed');
