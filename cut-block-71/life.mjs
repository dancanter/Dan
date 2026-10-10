import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const errs = [], fails = [];
const ok = (n, c, x) => { if (!c) fails.push(n + (x ? ' — ' + x : '')); else console.log('ok  ' + n); };
const FILE = 'file:///tmp/claude-0/-home-user-Dan/138b4124-109c-57a3-bc88-3111022a89e3/scratchpad/cb71.test.html';
const LS = 'cutblock71.v1';
const st = (o = {}) => Object.assign({ weights: {}, days: {}, bests: {}, settings: { hideDaily: false, fiveK: 1085, fiveKManual: false }, updatedAt: Date.now() }, o);
const sq = s => s.replace(/\s+/g, ' ');
const at = async (when) => {
  const ctx = await b.newContext({ viewport: { width: 430, height: 2400 } });
  await ctx.clock.setFixedTime(new Date(when + 'T12:00:00'));
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  const boot = async (s) => { await p.goto(FILE);
    await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(v)); }, [LS, s]);
    await p.reload(); await p.waitForTimeout(250); await p.click('[data-t="mind"]'); };
  return { ctx, p, boot };
};

// ===== a Wednesday: a film night by default, weeknight picks =====
let { ctx, p, boot } = await at('2026-09-30');
await boot(st());
let t = sq(await p.innerText('#dayCard'));
await p.click('[data-t="study"]');
t = sq(await p.innerText('#dayCard'));
ok('the study-day routine lives on Study, in order, no alarm', /STUDY-DAY ROUTINE/i.test(t) && /No alarm: the order matters, not the clock/.test(t) && await p.evaluate(() => !!document.querySelector('#s-study #dayCard')) && t.indexOf('Deep study') < t.indexOf('Run or walk') && t.indexOf('Run or walk') < t.indexOf('Meditate') && t.indexOf('Gym, 18:00') < t.indexOf('Film night with your yog bowl'), t.slice(0, 500));
await p.click('#dayCard button[data-rt="1"]'); await p.waitForTimeout(100);
ok('tapping a step ticks it for today', await p.evaluate(() => JSON.stringify(S.days[today()].rt) === '[1]'));
await p.click('#dayCard button[data-rt="1"]'); await p.waitForTimeout(100);
ok('tapping again unticks it', await p.evaluate(() => !(S.days[today()] || {}).rt));
await p.click('#dayCard button[data-rt="0"]'); await p.waitForTimeout(100);
ok('it counts study days this week', /1 study day this week/.test(sq(await p.innerText('#dayCard'))));
await p.click('[data-t="mind"]');
t = sq(await p.innerText('#filmCard'));
ok('Wednesday is a film night by default', /TONIGHT IS FILM NIGHT/i.test(t), t.slice(0, 200));
const pick = await p.evaluate(() => filmPick());
ok('a weeknight pick is a series or under ~2 h', pick[2] === 'series' || pick[3] <= 125, JSON.stringify(pick));
await p.click('#filmCard button[data-film="next"]'); await p.waitForTimeout(80);
const pick2 = await p.evaluate(() => FILM_UI.pick);
ok('🔄 gives another', pick2 && pick2 !== pick[0], pick2 + ' vs ' + pick[0]);
await p.click('#filmCard button[data-film="seen"]'); await p.waitForTimeout(120);
ok('✓ Seen it crosses it off, and it syncs in settings', await p.evaluate(p2 => !!S.settings.film.seen[p2] && !filmPool().some(x => x[0] === p2), pick2));
await p.click('#filmCard button[data-fg="thriller"]'); await p.waitForTimeout(80);
ok('a genre chip filters the picks', await p.evaluate(() => filmPick()[2] === 'thriller'));
await p.evaluate(() => { E('filmCard').querySelector('details').open = true; });
await p.click('#filmCard button[data-fn="3"]'); await p.waitForTimeout(120);
t = sq(await p.innerText('#filmCard'));
ok('film nights can be changed, and Wednesday off shows the next one', await p.evaluate(() => S.settings.film.nights.indexOf(3) < 0) && /next: Friday/i.test(t), t.slice(0, 200));
ok('the day card follows: no film step tonight', /Yog bowl and relax/.test(await p.evaluate(() => routineHTML())));
t = sq(await p.innerText('#spotCard'));
ok('get out of Bassingham, with a place', /GET OUT OF BASSINGHAM/i.test(t) && /Somewhere else/.test(t));
await p.click('#spotCard button[data-sk="hills"]'); await p.waitForTimeout(80);
ok('the hills chip picks the Lincoln Edge', /Lincoln Edge around Navenby/.test(sq(await p.innerText('#spotCard'))));
await p.click('#spotCard button[data-sk=""]'); await p.waitForTimeout(80);
const s1 = await p.evaluate(() => SPOT_UI.pick);
await p.click('#spotCard button[data-spot="next"]'); await p.waitForTimeout(80);
ok('🔄 somewhere else changes it', await p.evaluate(s => SPOT_UI.pick !== s, s1));
await p.click('[data-t="today"]');
ok('the testosterone card is on Today', /TESTOSTERONE SUPPORT/i.test(await p.innerText('#tCard')));
ok('films and places live on the Mind tab, the routine on Study, none on Today', await p.evaluate(() => !!document.querySelector('#s-study #dayCard') && !!document.querySelector('#s-mind #filmCard') && !!document.querySelector('#s-mind #spotCard') && !document.querySelector('#s-today #dayCard')));
await p.click('[data-t="mind"]');
// mood, one good thing, boosters, phone out
await p.click('#mindCard button[data-mood="4"]'); await p.waitForTimeout(100);
ok('a mood tap is saved for today', await p.evaluate(() => S.days[today()].mood === 4));
ok('and shows in the 7-day strip', (await p.innerText('#mindCard')).includes('🙂'));
await p.click('#mindCard button[data-mood="4"]'); await p.waitForTimeout(100);
ok('tapping it again clears it', await p.evaluate(() => !(S.days[today()] || {}).mood));
await p.fill('#inGood', 'parkrun with Tom'); await p.press('#inGood', 'Tab'); await p.waitForTimeout(100);
ok('one good thing is saved', await p.evaluate(() => S.days[today()].good === 'parkrun with Tom'));
await p.click('#mindCard button[data-boost="people"]'); await p.waitForTimeout(100);
ok('a booster ticks', await p.evaluate(() => S.days[today()].mb.indexOf('people') >= 0));
await p.click('#mindCard button[data-phone="1"]'); await p.waitForTimeout(100);
ok('phone out tonight lands on tomorrow’s log — the night it belongs to', await p.evaluate(() => S.days[addD(today(), 1)].phoneOut === true && !S.days[today()].phoneOut));
ok('it points to help if mood stays low', /Samaritans on 116 123/.test(await p.innerText('#mindCard')));
// the week's notes
await p.click('#notesCard button[data-ntag="👥"]'); await p.waitForTimeout(60);
await p.fill('#inNote', 'pub quiz with Tom'); await p.click('#btnNote'); await p.waitForTimeout(120);
ok('a note is saved with its tag', await p.evaluate(() => S.days[today()].notes.some(n => n.e === '👥' && n.t === 'pub quiz with Tom')));
ok('the earlier Seen it already left a film note', await p.evaluate(() => S.days[today()].notes.some(n => n.e === '🎬')));
await p.fill('#inNote', 'walk round Whisby'); await p.press('#inNote', 'Enter'); await p.waitForTimeout(120);
let nt = sq(await p.innerText('#notesCard'));
ok('Enter adds one too, and the week lists them by day', /THIS WEEK’S NOTES/i.test(nt) && /pub quiz with Tom/.test(nt) && /walk round Whisby/.test(nt), nt.slice(0, 300));
const before = await p.evaluate(() => S.days[today()].notes.length);
await p.click(`#notesCard button[data-nrm$="|${before - 1}"]`); await p.waitForTimeout(120);
ok('× removes a note (the last one, the walk)', await p.evaluate(b => S.days[today()].notes.length === b - 1 && !S.days[today()].notes.some(n => /Whisby/.test(n.t)), before));
await p.click('#filmCard button[data-film="seen"]'); await p.waitForTimeout(150);
ok('marking a film seen adds a 🎬 note', await p.evaluate(() => S.days[today()].notes.some(n => n.e === '🎬' && /^Watched /.test(n.t))));
ok('and the week review shows what you got up to', await p.evaluate(() => { const w = reviewWeeks().find(x => x.start <= today() && x.end >= today()); return /What you got up to/.test(reviewMindHTML(w)) && /pub quiz with Tom/.test(reviewMindHTML(w)); }));
await p.fill('#inMed', '12'); await p.press('#inMed', 'Tab'); await p.waitForTimeout(100);
ok('meditation minutes are saved', await p.evaluate(() => S.days[today()].medMin === 12));
ok('no film is listed twice', await p.evaluate(() => new Set(FILMS.map(f => f[0])).size === FILMS.length));
await ctx.close();

// ===== a Saturday: still a film night by default =====
({ ctx, p, boot } = await at('2026-10-03'));
await boot(st());
ok('Saturday is a film night by default', /TONIGHT IS FILM NIGHT/i.test(await p.innerText('#filmCard')));
await ctx.close();

// ===== sets per muscle on the gym log =====
({ ctx, p, boot } = await at('2026-09-28'));
await boot(st({ days: { '2026-09-28': { gym: true, split: 'chest' } } }));
await p.click('[data-t="today"]');
const put = async (m, v) => { await p.fill(`#setsBox input[data-sets="${m}"]`, String(v)); await p.press(`#setsBox input[data-sets="${m}"]`, 'Tab'); await p.waitForTimeout(120); };
ok('a chest day asks for chest and triceps sets', await p.evaluate(() => [...document.querySelectorAll('#setsBox input[data-sets]')].map(i => i.dataset.sets).join() === 'Chest,Triceps'));
await put('Chest', 11); await put('Triceps', 3);
let sb = sq(await p.innerText('#setsBox'));
ok('11 chest sets: just right, with room to push', /CHEST · JUST RIGHT/i.test(sb) && /inside 10–15/.test(sb) && /more gains/.test(sb), sb);
ok('it says it is judged on the week', /Judged on the week/.test(sb));
ok('3 triceps: light, with a nudge not a telling-off', /TRICEPS · LIGHT/i.test(sb) && /1–2 more hard sets/.test(sb));
await put('Chest', 15);
ok('15 chest: right at the top — where the gains come from', /CHEST · RIGHT AT THE TOP/i.test(sq(await p.innerText('#setsBox'))) && /where the gains come from/.test(sq(await p.innerText('#setsBox'))));
await put('Chest', 16);
ok('16 chest: on the high side — recovery and running pay', /CHEST · ON THE HIGH SIDE/i.test(sq(await p.innerText('#setsBox'))) && /your running pays/.test(sq(await p.innerText('#setsBox'))));
await put('Chest', 17);
ok('17 in one session: judged weekly, with a tip not a verdict', !/TOO MUCH FOR ONE SESSION/i.test(sq(await p.innerText('#setsBox'))) && /Tip: past about 16 in one go/.test(sq(await p.innerText('#setsBox'))));
ok('sets are saved on the day', await p.evaluate(() => S.days['2026-09-28'].sets.Chest === 17 && S.days['2026-09-28'].sets.Triceps === 3));
// a second session in the same week adds up
await boot(st({ days: { '2026-09-28': { gym: true, split: 'chest', sets: { Chest: 6 } }, '2026-09-26': { gym: true, split: 'chest', sets: { Chest: 6 } } } }));
ok('the week sums Mon–Sun only (last Saturday is last week)', await p.evaluate(() => weekSets('2026-09-28').Chest === 6));
await boot(st({ days: { '2026-09-28': { gym: true, split: 'chest', sets: { Chest: 6 } }, '2026-10-01': { gym: true, split: 'other', sets: { Chest: 6 } } } }));
ok('a second go in the same week adds up', await p.evaluate(() => weekSets('2026-10-01').Chest === 12));
await p.click('[data-t="training"]');
const tt = sq(await p.innerText('#s-training'));
const ts = sq(await p.innerText('#tSets'));
ok('the Training tab shows this week’s sets as bars with a verdict', /SETS THIS WEEK/i.test(ts) && /Chest 12 \/ 10–15 Just right/i.test(ts), ts.slice(0, 300));
ok('with the deep reasoning folded away', await p.evaluate(() => !E('tDeep').open && !!E('tDeep').querySelector('#tSplit')));
ok('and keeps a sets log by week', /YOUR SETS LOG/i.test(ts) && /Week 2/.test(tt), (tt.match(/SETS LOG.{0,200}/i) || [''])[0]);
ok('calisthenics days do not ask for sets', await p.evaluate(() => setsBoxHTML('2026-09-28') !== '' && (S.days['2026-09-29'] = { gym: true, split: 'calis' }, setsBoxHTML('2026-09-29') === '')));
await ctx.close();

// ===== simple mode: Read more, and Today at a glance =====
({ ctx, p, boot } = await at('2026-09-30'));
await boot(st({ weights: { '2026-09-28': 128.4, '2026-09-29': 128.2, '2026-09-30': 128.0 },
  days: { '2026-09-29': { runs: [{ k: 'reps', dm: 300, n: 6, secs: 276 }], gym: true, split: 'back' }, '2026-09-30': { sleep: 8.2, rt: [0, 1] } } }));
await p.evaluate(() => { document.body.classList.add('simple'); decorateMore(); });
await p.click('[data-t="today"]'); await p.waitForTimeout(200);
ok('Today opens with the log, then calories in and burned', await p.evaluate(() => {
  const kids = [...E('s-today').children].filter(c => c.id !== 'storeWarn');
  return /Log ·/.test(kids[0].querySelector('h2').textContent) && kids[1].id === 'tdeeCard' && /Burn and deficit/.test(kids[1].textContent);
}));
let g = sq(await p.innerText('#glanceCard'));
ok('Today opens with the main things at a glance', /TODAY AT A GLANCE/i.test(g) && /128\.2 lb/.test(g) && /1 hard/.test(g) && /1 session/.test(g) && /8\.2 h · 8 h 12 min ✓/.test(g) && /Tonight is film night/.test(g) && /2 steps done/.test(g), g);
await p.click('#glanceCard button[data-goto="mind"]'); await p.waitForTimeout(150);
ok('tapping a line opens its tab', await p.evaluate(() => !E('s-mind').hidden));
await p.click('[data-t="today"]'); await p.waitForTimeout(150);
const tsup = async () => sq(await p.innerText('#tCard'));
let tc = await tsup();
ok('in simple mode the explanations fold away', !/Most of your testosterone is made while you sleep/.test(tc) && /Read more ▾/.test(tc), tc.slice(0, 300));
await p.click('#tCard button.readmore'); await p.waitForTimeout(120);
tc = await tsup();
ok('Read more opens the card in full', /Most of your testosterone is made while you sleep/.test(tc) && /Show less ▴/.test(tc));
await p.evaluate(() => touch()); await p.waitForTimeout(200);
ok('and it stays open when the page redraws', /Show less ▴/.test(await tsup()));
await p.click('#tCard button.readmore'); await p.waitForTimeout(120);
ok('Show less folds it again', /Read more ▾/.test(await tsup()));
ok('a card that would fold to nothing keeps its first line', await p.evaluate(() => [...document.querySelectorAll('#s-today .p')].filter(c => c.offsetParent).every(c => { const h = c.querySelector('h2'); const txt = (c.innerText || '').replace(h ? h.innerText : '', '').replace(/Read more ▾|Show less ▴/, '').trim(); return txt.length >= 3; })));
await p.click('[data-t="mind"]');
ok('the help line in Mind is never folded', await p.evaluate(() => { const x = [...E('mindCard').querySelectorAll('p')].find(q => /Samaritans/.test(q.textContent)); return x && x.offsetParent !== null; }));
await ctx.close();

// ===== sleep: bed and wake times, phone-free =====
({ ctx, p, boot } = await at('2026-09-30'));
await boot(st());
await p.click('[data-t="today"]');
await p.fill('#inBed', '23:10'); await p.press('#inBed', 'Tab');
await p.fill('#inWake', '07:25'); await p.press('#inWake', 'Tab'); await p.waitForTimeout(150);
let sd = await p.evaluate(() => S.days[today()]);
ok('bed 23:10 and up 07:25 is about 8.0 h asleep (in bed 8 h 15, minus 15 to drop off)', sd.bed === '23:10' && sd.wake === '07:25' && sd.sleep === 8, JSON.stringify(sd));
ok('it says so under the times', /≈ 8\.0 h · 8 hours asleep · in bed 8 h 15 min/.test(sq(await p.innerText('#sleepCalc'))));
await p.click('#tgPhone'); await p.waitForTimeout(120);
ok('📵 no phone in bed is logged with it', await p.evaluate(() => S.days[today()].phoneOut === true) && /phone-free ✓/.test(sq(await p.innerText('#sleepCalc'))));
await p.fill('#inBed', '00:40'); await p.press('#inBed', 'Tab'); await p.waitForTimeout(150);
ok('a bedtime after midnight works', await p.evaluate(() => S.days[today()].sleep === 6.5));
ok('the read-back shows the times and phone-free', await p.evaluate(() => { const r = dayFeedback(today()).find(x => x[0] === 'Sleep'); return /00:40→07:25/.test(r[1]) && /Phone-free/.test(r[2]); }));
ok('the sleep number still feeds everything else', await p.evaluate(() => sleepFromTimes('22:30', '06:45').h === 8 && sleepFromTimes('07:00', '07:10') === null));
await p.click('[data-t="review"]'); await p.waitForTimeout(150);
ok('every week review ends with the whole-cut totals', /YOUR BLOCK SO FAR/i.test(sq(await p.innerText('#revBody')).slice(-1500)));
await p.click('[data-t="today"]'); await p.waitForTimeout(100);
await p.fill('#inBed', '23:20'); await p.press('#inBed', 'Tab'); await p.waitForTimeout(150);
ok('odd minutes are shown exactly: 23:20 → 07:25 is 7.8 h · 7 hours 50 mins', /≈ 7\.8 h · 7 hours 50 mins asleep/.test(sq(await p.innerText('#sleepCalc'))), sq(await p.innerText('#sleepCalc')));
ok('hm() writes hours and minutes', await p.evaluate(() => hm(520, true) === '8 hours 40 mins' && hm(455) === '7 h 35 min' && hm(480) === '8 h' && hDec(455) === '7.6'));
await ctx.close();

// ===== deep work this week =====
({ ctx, p, boot } = await at('2026-10-01'));
await boot(st({ days: { '2026-09-28': { study: 3, deep: 2 }, '2026-09-29': { study: 5, deep: 4.5 }, '2026-09-30': { study: 3, deep: 1.5 }, '2026-10-01': { study: 4, deep: 2 } } }));
await p.click('[data-t="study"]'); await p.waitForTimeout(150);
let dc = sq(await p.innerText('#deepCard'));
ok('the Study tab opens with deep work this week', /DEEP WORK THIS WEEK/i.test(dc) && /10 h/.test(dc) && /SWEET SPOT/i.test(dc), dc.slice(0, 200));
ok('it shows the sweet spot and the ceiling', /sweet spot 8–12 h/.test(dc) && /ceiling 15/.test(dc));
ok('a day past 4 h gets a gentle flag', /Tuesday: 4 h 30 min deep — past about 4 h in a day/.test(dc) && /A lighter day next is the fix/.test(dc));
ok('the verdicts: building, sweet spot, high, past the ceiling', await p.evaluate(() => deepVerdict(5).t === 'Building' && deepVerdict(10).t === 'Sweet spot' && deepVerdict(13.5).t === 'High' && deepVerdict(16).t === 'Past the ceiling'));
ok('the read-back flags a 4.5 h deep day too', await p.evaluate(() => { const r = dayFeedback('2026-09-29').find(x => x[0] === 'Study'); return r && /past about 4/.test(r[2]); }));
ok('what counts as deep is spelled out', /copying, highlighting and tidying do not/.test(await p.evaluate(() => deepHTML())));
await ctx.close();

// ===== study: the aim for a distinction, never "hours under" =====
({ ctx, p, boot } = await at('2026-10-01'));
await boot(st({ days: { '2026-09-28': { study: 2, deep: 1.5 }, '2026-09-29': { study: 1, deep: 1 } } }));
await p.click('[data-t="study"]'); await p.waitForTimeout(150);
let stx = sq(await p.innerText('#s-study'));
ok('the Study tab shows the aim and the too-much line', /For a distinction: 8–12 h of deep study a week/.test(stx) && /Over 15 h a week is too much/.test(stx), stx.slice(0, 400));
ok('and never says how many hours under or short', !/\bunder\b.{0,20}(band|16)|short of the band|h short|\d+ h under/i.test(stx), (stx.match(/.{0,40}(under|short).{0,40}/gi) || []).join(' | '));
const lowFb = await p.evaluate(() => { const c = coachModel(); return c.sug.join(' ') + ' ' + c.strain.join(' '); });
ok('a light study week is not flagged anywhere', !/study|deep/i.test(lowFb), lowFb);
await boot(st({ days: { '2026-09-28': { study: 6, deep: 5 }, '2026-09-29': { study: 6, deep: 5 }, '2026-09-30': { study: 6, deep: 5 }, '2026-10-01': { study: 2, deep: 1.5 } } }));
const hiC = await p.evaluate(() => { const c = coachModel(); return { sug: c.sug.join(' '), st: studyModel().state }; });
ok('past 15 h deep is called too much', hiC.st === 'too' && /Deep study is past 15 h/.test(hiC.sug), JSON.stringify(hiC));
await ctx.close();

// ===== study in hours and minutes =====
({ ctx, p, boot } = await at('2026-10-01'));
await boot(st());
await p.click('[data-t="today"]');
await p.fill('#inStudyH', '3'); await p.press('#inStudyH', 'Tab');
await p.fill('#inStudyM', '40'); await p.press('#inStudyM', 'Tab');
await p.fill('#inDeepH', '2'); await p.press('#inDeepH', 'Tab');
await p.fill('#inDeepM', '15'); await p.press('#inDeepM', 'Tab'); await p.waitForTimeout(150);
const sdy = await p.evaluate(() => S.days[today()]);
ok('3 h 40 min of study is stored as hours, exactly', Math.round(sdy.study * 60) === 220 && Math.round(sdy.deep * 60) === 135, JSON.stringify(sdy));
ok('and read back as hours and minutes', await p.evaluate(() => { const r = dayFeedback(today()).find(x => x[0] === 'Study'); return /3 h 40 min \(2 h 15 min deep\)/.test(r[1]); }));
ok('3.8 reads as 3 h 48 min, 0.5 as 30 min', await p.evaluate(() => sh(3.8) === '3 h 48 min' && sh(0.5) === '30 min' && sh(4) === '4 h'));
await p.reload(); await p.waitForTimeout(200);
ok('the boxes fill back in as hours and minutes', (await p.inputValue('#inStudyH')) === '3' && (await p.inputValue('#inStudyM')) === '40');
// tapping into a box with a number in it replaces it, never tacks on (48 then 15 was 4815 min)
await p.click('#inStudyM'); await p.waitForTimeout(60); await p.keyboard.type('15'); await p.press('#inStudyM', 'Tab'); await p.waitForTimeout(150);
ok('typing into the minutes replaces them: 3 h 15 min', await p.evaluate(() => Math.round(S.days[today()].study * 60) === 195));
await p.fill('#inStudyH', '90'); await p.press('#inStudyH', 'Tab'); await p.waitForTimeout(150);
ok('a typo past 16 h is put back, not saved', await p.evaluate(() => Math.round(S.days[today()].study * 60) === 195) && (await p.inputValue('#inStudyH')) === '3');
await p.fill('#inDeepH', '0'); await p.press('#inDeepH', 'Tab'); await p.fill('#inDeepM', '90'); await p.press('#inDeepM', 'Tab'); await p.waitForTimeout(150);
ok('90 min carries to 1 h 30', await p.evaluate(() => Math.round(S.days[today()].deep * 60) === 90) && (await p.inputValue('#inDeepH')) === '1' && (await p.inputValue('#inDeepM')) === '30');
ok('the study boxes sit inside the screen', await p.evaluate(() => { const r = E('inDeepM').parentNode.getBoundingClientRect(); return r.right <= document.documentElement.clientWidth; }));
await p.fill('#inStudyH', ''); await p.press('#inStudyH', 'Tab'); await p.fill('#inStudyM', ''); await p.press('#inStudyM', 'Tab'); await p.waitForTimeout(150);
ok('emptying both clears it', await p.evaluate(() => S.days[today()].study === undefined));
await p.click('[data-t="study"]'); await p.waitForTimeout(100);
ok('the Study tab shows deep work as hours and minutes', /1 h 30 min/.test(sq(await p.innerText('#deepCard'))));
await ctx.close();

// ===== the reverse: build mode, crank up the weights =====
({ ctx, p, boot } = await at('2026-10-03'));
await boot(st());
let bm = await p.evaluate(() => ({ bw: buildWeek(), chest: setsRange('Chest'), legs: setsRange('Legs') }));
ok('on the cut the sets are the cut ranges', bm.bw === 0 && bm.chest.join() === '10,15' && bm.legs.join() === '6,10', JSON.stringify(bm));
await p.click('[data-t="reverse"]'); await p.waitForTimeout(120);
let rt = sq(await p.innerText('#revTrain'));
ok('the Reverse tab previews build mode and when it starts', /build mode, from 29 Nov/i.test(rt) && /Crank up the weights/.test(rt) && /a rep or 2\.5 kg/.test(rt), rt.slice(0, 300));
ok('the Training tab has no build card yet', !/Build mode/.test(sq(await p.innerText('#tSets'))));
await ctx.close();
for (const [day, wk, chest, legs, line] of [['2026-11-30', 1, '10,15', '6,10', /crank up the weights/i], ['2026-12-14', 3, '11,17', '8,12', /add sets/i], ['2026-12-28', 5, '12,18', '10,14', /full growth range/i]]) {
  ({ ctx, p, boot } = await at(day));
  await boot(st());
  bm = await p.evaluate(() => ({ bw: buildWeek(), chest: setsRange('Chest'), legs: setsRange('Legs'), sug: coachModel().sug[0] || '' }));
  ok('reverse week ' + wk + ': sets ' + chest + ' chest, ' + legs + ' legs', bm.bw === wk && bm.chest.join() === chest && bm.legs.join() === legs, JSON.stringify(bm));
  ok('and Feedback says it first (week ' + wk + ')', line.test(bm.sug), bm.sug);
  await p.click('[data-t="training"]'); await p.waitForTimeout(120);
  ok('the Training tab shows build mode (week ' + wk + ')', new RegExp('Build mode · reverse week ' + wk, 'i').test(sq(await p.innerText('#tSets'))));
  await ctx.close();
}

// ===== the reverse, in Dan's order (4 Oct) =====
({ ctx, p, boot } = await at('2026-10-04'));
await boot(st());
await p.click('[data-t="reverse"]'); await p.waitForTimeout(150);
let rc = sq(await p.innerText('#revCard'));
ok('the reverse card leads with his order: lean, health, muscle, times', /1 Lean — the angular, chiselled face · 2 Health and recovery/.test(rc) && /3 Muscle · 4 Times/.test(rc), rc.slice(0, 300));
ok('with the reverse week: 2 hard, 2 easy, gym 5, 11,000 steps', /2 hard · 1–2 easy/.test(rc) && /a 5 mile, a 5 km if fresh/.test(rc) && /4 days/.test(rc) && /About 11,000 a day/.test(rc), rc.slice(0, 600));
ok('the old "times held, a bit of muscle" plan is gone', !/Times held, not chased|A bit of muscle if it turns up/.test(rc));
const rv = await p.evaluate(() => { const R = reverseModel(); return { m: R.maint, mc: R.maintCut, a: R.actAdj, st: stepTarget('2026-12-01'), stc: stepTarget('2026-10-05') }; });
ok('the ladder tops out at reverse-week activity, not cut activity', rv.a > 30 && rv.a < 150 && Math.abs(rv.mc - rv.a - rv.m) <= 10, JSON.stringify(rv));
ok('steps are 11,000 a day on the reverse, the cut pattern before it', rv.st === 11000 && rv.stc === 15000, JSON.stringify(rv));
ok('grass-fed butter and A2 whole milk are on the healthy foods list', await p.evaluate(() => !!hfById('butter') && !!hfById('milkA2')));
await ctx.close();

// ===== up days: 1,899 on hard-run, 5-mile and Saturday; 1,799 otherwise (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-08'));   // a Thursday
await boot(st({ days: { '2026-10-06': { runs: [{ k: 'reps', dm: 800, n: 5, secs: 770 }] }, '2026-10-07': { runs: [{ km: 8.1, secs: 2500, type: 'easy' }] },
  '2026-10-05': { runs: [{ km: 5, secs: 1463, type: 'easy' }] }, '2026-10-03': {} } }));
const ud = await p.evaluate(() => ({ hard: dayTarget('2026-10-06'), five: dayTarget('2026-10-07'), k5: dayTarget('2026-10-05'), sat: dayTarget('2026-10-03'), rest: dayTarget('2026-10-08'), carbs: [CARB_AT, CARB_UP], txt: targetTxt('2026-10-08') }));
ok('hard-run day, 5-mile day and Saturday are 1,899; easy 5 km and rest days 1,799', ud.hard === 1899 && ud.five === 1899 && ud.sat === 1899 && ud.k5 === 1799 && ud.rest === 1799, JSON.stringify(ud));
ok('the extra 100 is all carbs: 207 -> 232 g', ud.carbs[0] === 207 && ud.carbs[1] === 232, JSON.stringify(ud.carbs));
ok('today without a run says 1,799, or 1,899 if you run hard or 5 miles', /1,799 · 1,899 if you run hard or 5 miles/.test(ud.txt), ud.txt);
const fb8 = await p.evaluate(() => { S.days['2026-10-06'].kcal = 1890; return dayFeedback('2026-10-06').find(x => x[0] === 'Food')[2]; });
ok('1,890 on a hard-run day is on budget', /On budget — a 1,899 day/.test(fb8), fb8);
await ctx.close();

// ===== race camp from 12 Oct (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-14'));
await boot(st());
const cw = await p.evaluate(() => ({ t: tmplFor(mondayOf(today())), before: tmplFor('2026-10-05'), ph: campPhase().k }));
ok('camp week 1 is straight in: 2 hard and 3 easy 5-milers, 5 runs (no ramp, his call)', cw.t.hard === 2 && cw.t.easy === 3 && cw.t.runs === 5 && !cw.t.ramp && cw.before.easy === 1 && cw.ph === 'build', JSON.stringify(cw));
await p.click('[data-t="camp"]'); await p.waitForTimeout(150);
let cc = sq(await p.innerText('#campCard'));
ok('the camp card shows the phases, PB targets and dates', /Race camp · PBs before Christmas/i.test(cc) && /Build:/.test(cc) && /400m/i.test(cc) && /5km|5 km|5000/i.test(cc) && /When/i.test(cc) && /PB window/.test(cc) && !/9 Dec/.test(cc), cc.slice(0, 500));
await p.click('[data-t="training"]'); await p.waitForTimeout(120);
let rcw = sq(await p.innerText('#tRuns'));
ok('the runs card says a camp week, 3 easy 5-milers with strides', /A camp week, 5 runs/.test(rcw) && !/Ramp week/.test(rcw) && /Easy 5 miles × 3/.test(rcw) && /strides/.test(rcw) && /EASY 5 MILES 0 of 3/i.test(rcw), rcw.slice(0, 600));
await ctx.close();
({ ctx, p, boot } = await at('2026-12-10'));
await boot(st());
ok('in December the camp is in the PB window', await p.evaluate(() => campPhase().k === 'pb'));
await ctx.close();
({ ctx, p, boot } = await at('2026-12-01'));
await boot(st());
ok('the first reverse week is refuel', await p.evaluate(() => campPhase().k === 'refuel'));
await ctx.close();

// ===== the fun part: XP, levels, quests, mission, bosses (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-08'));
await boot(st());
await p.click('[data-t="camp"]'); await p.waitForTimeout(120);
ok('before camp it counts down to Monday', /Camp starts in 4 days/.test(sq(await p.innerText('#campCard'))));
ok('the camp has its own tab, next to Today', await p.evaluate(() => { const b = [...document.querySelectorAll('#tabs button')].map(x => x.dataset.t); return b[1] === 'camp'; }));
await p.click('[data-t="today"]'); await p.waitForTimeout(80);
ok('Today at a glance says when the camp starts, and taps through to it', /Race camp starts in 4 days — Mon 12 Oct/.test(sq(await p.innerText('#glanceCard'))) && await p.evaluate(() => !!document.querySelector('#glanceCard button[data-goto="camp"]')));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-15'));   // Thursday of camp week 1
await boot(st({ days: {
  '2026-10-12': { runs: [{ km: 8.1, secs: 2500, type: 'easy' }], gym: true, sleep: 8.2, phoneOut: true },
  '2026-10-13': { runs: [{ k: 'reps', dm: 800, n: 5, secs: 770 }], gym: true, sleep: 8.4 },
  '2026-10-14': { runs: [{ km: 8.1, secs: 2500, type: 'easy' }], gym: true, sleep: 7.5 } } }));
const G = await p.evaluate(() => campGame());
ok('XP adds up from the sessions, sleep and phone-free nights', G.xp === (20 + 20 + 10 + 5) + (30 + 20 + 10) + (20 + 20), JSON.stringify({ xp: G.xp }));
ok('level 1 is Rookie, with day 4 of the camp', G.lv[1] === 'Rookie' && G.day === 4, JSON.stringify({ lv: G.lv, d: G.day }));
ok('quests count the week: hard 1/2, 5-milers 2/3, gym 3/4', JSON.stringify(G.quests.slice(0, 3).map(q => q[2] + '/' + q[3])) === '["1/2","2/3","3/4"]', JSON.stringify(G.quests));
ok('the runs left are listed, never a day: one hard (6 × 200 m) and one easy 5 miles, each with how to run it', G.left.filter(x => x.e === '⚡').length === 1 && /6 × 200 m/.test(G.left[0].n) && /Fast but relaxed/.test(G.left[0].how) && G.left.filter(x => x.e === '🏃').length === 1 && /Chatty/.test(G.left.find(x => x.e === '🏃').how), JSON.stringify(G.left));
ok('seven bosses (200 added), none beaten yet', G.bosses.length === 7 && G.bosses.every(b => !b.won));
ok('the goals: sub-17 5 km, sub-4:50 mile, sub-2:45 1 km, sub-2:00 800, sub-55 400', await p.evaluate(() => { const g = {}; CFG.camp.pb.forEach(x => g[x.dm] = x.goal); return g[5000] === 1020 && g[1609] === 290 && g[1000] === 165 && g[800] === 120 && g[400] === 55 && g[600] && g[200]; }));
ok('no trial lands on his stress-free Saturday', await p.evaluate(() => CFG.camp.pb.every(x => dow(x.on) !== 6)));
ok('the all-time bests are the ultimate bosses: 400 57, 1 km 2:48, mile 4:54, 5 km 17:17', await p.evaluate(() => { const a = CFG.camp.allTime; return a[400].t === 57 && a[1000].t === 168 && a[1609].t === 294 && a[5000].t === 1037; }));
await p.click('[data-t="camp"]'); await p.waitForTimeout(120);
let gc = sq(await p.innerText('#campCard'));
ok('the card shows level, XP, runs left, quests and bosses', /Rookie/.test(gc) && /XP/.test(gc) && /Runs left this week — you pick the days/.test(gc) && !/Today’s mission|Monday|Tuesday|Wednesday|Thursday|Friday|Sunday/.test(gc) && /THIS WEEK’S QUESTS/i.test(gc) && /BOSSES/i.test(gc), gc.slice(0, 500));
await p.click('[data-t="today"]'); await p.waitForTimeout(100);
ok('Today at a glance has the camp line and what is left', /Camp day 4 · 🥉 Rookie/.test(sq(await p.innerText('#glanceCard'))) && /Left this week: 1 hard · 1 easy — you pick the days/.test(sq(await p.innerText('#glanceCard'))));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-17'));   // Saturday, 4 days after the 800s
await boot(st({ days: { '2026-10-13': { runs: [{ k: 'reps', dm: 800, n: 5, secs: 770 }] } } }));
ok('a time trial says how to warm up and pace it', await p.evaluate(() => /15 min easy, drills/.test(runHow('Time trial — 1 km')) && /Even pace/.test(runHow('Time trial — 1 km'))));
await ctx.close();

// ===== sprints only when I say, the shred meter, lifting games (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-14'));
const wts = {}; for (let i = 0; i < 20; i++) { const d = new Date(Date.UTC(2026, 9, 14 - i)).toISOString().slice(0, 10); wts[d] = i < 4 ? 126.9 : 127.6; }
await boot(st({ weights: wts, days: { '2026-10-12': { gym: true, pr: true, split: 'back', sets: { Back: 14, Biceps: 8 } }, '2026-10-13': { runs: [{ km: 8.1, secs: 2500, type: 'easy' }] } } }));
let G2 = await p.evaluate(() => { const g = campGame(); return { spr: g.spr, left: g.left.map(x => x.n), q: g.quests.map(q => q[1] + ' ' + q[2] + '/' + q[3]), shred: g.shred, xp: g.xp }; });
ok('a clear build week turns uphill sprints ON, after a 5-miler', G2.spr.on && G2.left.some(n => /Uphill sprints are ON: \d+ × ~10 s, at the end of a 5-miler/.test(n)), JSON.stringify(G2.spr));
ok('beat last time counts as a quest and XP', G2.q.includes('Beat last time 1/4'), JSON.stringify(G2.q));
ok('the shred meter tracks the 7-day average toward 122–123', G2.shred.now !== null && G2.shred.hi === 123 && G2.shred.lo === 122, JSON.stringify(G2.shred));
await p.click('[data-t="camp"]'); await p.waitForTimeout(120);
let gx = sq(await p.innerText('#campCard'));
ok('the card shows the shred meter and milestones, from the start of the cut', /Shred meter/.test(gx) && /lb to 123/.test(gx) && /the cut · day 26 of 71/.test(gx) && /since 19 Sep/.test(gx), gx.slice(0, 900));
ok('milestones count from the start of the cut, not the camp', await p.evaluate(() => { const g = campGame(), b = weightModel().baseline; return Math.abs(g.shred.start - b) < 0.01 && JSON.stringify(g.shred.miles) === JSON.stringify(MILESTONES.filter(m => b > m && g.shred.now <= m)); }));
await p.click('[data-t="today"]'); await p.waitForTimeout(80);
ok('the 💪 Beat last time toggle shows on a gym day', await p.evaluate(() => { E('logDate').value = '2026-10-12'; paintForm(); return !E('tgPR').hidden; }));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-21'));   // week 5 is a test week
await boot(st());
ok('in a test week the sprints are off, and it says why', await p.evaluate(() => { const g = campGame(); return !g.spr.on && /test week/.test(g.spr.why); }));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-14'));
await boot(st({ days: { '2026-10-14': { niggle: true, niggleWhat: 'calf' } } }));
ok('something hurting turns the sprints off', await p.evaluate(() => !campGame().spr.on));
await ctx.close();

// ===== the glance runs line shows what is left, not what is done (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-08'));
await boot(st({ days: { '2026-10-05': { runs: [{ km: 5, secs: 1463, type: 'easy' }] }, '2026-10-08': { runs: [{ k: 'reps', dm: 800, n: 3, secs: 471 }] } } }));
let gl8 = sq(await p.innerText('#glanceCard'));
ok('the runs line: 1 hard, 1 × 5 km easy, and only the short session left to pick', /1 hard · 1 × 5 km easy/.test(gl8) && /still to pick from: 5 × 400 m/.test(gl8) && !/still to pick from: 5 × 800/.test(gl8) && !/0 sprints/.test(gl8), gl8.slice(0, 600));
await ctx.close();

// ===== the stress-free Saturday and the 4-work-day week (8 Oct) =====
({ ctx, p, boot } = await at('2026-10-18'));   // Sunday of camp week 1
await boot(st({ days: { '2026-10-17': { steps: 6000 }, '2026-10-16': { gym: true, study: 3 } } }));
const SF = await p.evaluate(() => { const g = campGame(); return { q: g.quests.find(q => /Stress-free Saturday/.test(q[1])), xp: g.xp }; });
ok('a Saturday with no run, weights or study ticks the stress-free quest', SF.q && SF.q[2] === 1, JSON.stringify(SF));
await boot(st({ days: { '2026-10-17': { study: 2 } } }));
ok('studying on Saturday does not count as stress-free', await p.evaluate(() => campGame().quests.find(q => /Stress-free Saturday/.test(q[1]))[2] === 0));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-14'));
await boot(st());
await p.click('[data-t="camp"]'); await p.waitForTimeout(120);
let wk4 = sq(await p.innerText('#campCard'));
ok('the camp says the week shape: 4 work days, 2 light, Saturday stress-free', /4 work days — study plus the hard training/.test(wk4) && /2 light days/.test(wk4) && /Saturday: the stress-free day/.test(wk4) && /No runs, no weights, no study/.test(wk4), wk4.slice(0, 900));
ok('the study aim says 2–3 h on each of the 4 work days', /on your 4 work days that is about 2–3 h each/.test(await p.evaluate(() => DEEP_AIM)));
await ctx.close();

// ===== the goal plan (9 Oct) =====
({ ctx, p, boot } = await at('2026-11-04'));   // week 7: mile pace + 800 pace
await boot(st());
let M7 = await p.evaluate(() => { const m = weekRunsModel(); return { l: m.P.long, s: m.P.short, lg: pacedOf(m.P.lp), sg: pacedOf(m.P.sp) }; });
ok('week 7 is 10 × 400 m at mile pace and 4 × 400 m at 800 pace, with goal-pace guides', /10 × 400 m at mile pace/.test(M7.l) && /4 × 400 m at 800 pace/.test(M7.s) && /goal pace 72 s/.test(M7.lg) && /goal pace 60 s/.test(M7.sg), JSON.stringify(M7));
await p.click('[data-t="training"]'); await p.waitForTimeout(120);
let r7 = sq(await p.innerText('#tRuns'));
ok('the runs card shows the goal-pace guide and what the session does', /\d+–\d+ s a rep · goal pace 72 s/.test(r7) && /sub-4:50 rhythm/.test(r7), r7.slice(0, 800));
await ctx.close();
({ ctx, p, boot } = await at('2026-12-07'));   // PB window, week 12
await boot(st());
const pb = await p.evaluate(() => { const g = campGame(); return { left: g.left.map(x => x.n), ph: campPhase().k }; });
ok('in the PB window the week’s trials are the hard runs: 400 and 5 km', pb.ph === 'pb' && pb.left.some(n => /400m trial — goal sub-55/.test(n)) && pb.left.some(n => /5 km trial — goal sub-17:00/.test(n)), JSON.stringify(pb));
await p.click('[data-t="training"]'); await p.waitForTimeout(120);
ok('and the runs card lists them', /This week’s trials/.test(sq(await p.innerText('#tRuns'))));
await ctx.close();

// ===== plans appear when their week comes; the five-milers adapt (9 Oct) =====
({ ctx, p, boot } = await at('2026-10-14'));
await boot(st({ days: { '2026-10-14': { niggle: true, niggleWhat: 'calf' } } }));
ok('a flagged week asks for one fewer five-miler', await p.evaluate(() => { const m = weekRunsModel(); return m.easeOff && m.easyTarget === 2 && m.T.easy === 3; }));
await p.click('[data-t="training"]'); await p.waitForTimeout(120);
ok('and says why', /one fewer this week — recovery first/.test(sq(await p.innerText('#tRuns'))));
await ctx.close();
({ ctx, p, boot } = await at('2026-12-01'));
await boot(st());
await p.click('[data-t="camp"]'); await p.waitForTimeout(120);
ok('the trial dates appear from the refuel week', /6 Dec/.test(sq(await p.innerText('#campCard'))));
await ctx.close();

// ===== current fitness moves the paces (9 Oct) =====
({ ctx, p, boot } = await at('2026-11-04'));
await boot(st());
const F0 = await p.evaluate(() => ({ m: fitnessEst(1609), e: easyPaceTxt(), g: pacedOf([1609, 400]) }));
ok('fitness is read off his own bests: mile about 5:06 now', Math.abs(F0.m - 306) < 6, JSON.stringify(F0));
await boot(st({ days: { '2026-11-02': { runs: [{ k: 'reps', dm: 1000, n: 1, secs: 170 }] } } }));   // a 2:50 1 km trial
const F1 = await p.evaluate(() => ({ m: fitnessEst(1609), g: pacedOf([1609, 400]) }));
ok('a faster 1 km moves the mile estimate and the guide down', F1.m < F0.m - 10 && F1.g !== F0.g, JSON.stringify({ F0, F1 }));
await p.click('[data-t="camp"]'); await p.waitForTimeout(100);
ok('the camp card shows his fitness right now', /Your fitness right now/.test(sq(await p.innerText('#campCard'))));
await ctx.close();

// ===== achievements and celebrations (9 Oct) =====
({ ctx, p, boot } = await at('2026-10-15'));
await boot(st({ days: { '2026-10-13': { runs: [{ k: 'reps', dm: 1000, n: 1, secs: 175 }], gym: true, pr: true }, '2026-10-14': { runs: [{ k: 'reps', dm: 400, n: 1, secs: 56.5 }] } } }));
const AC = await p.evaluate(() => campAchievements().map(a => ({ id: a.id, t: a.tier, n: a.n })));
ok('a 2:55 km is a best of 2026; a 56.5 400 is an all-time best', AC.some(a => /pb1000/.test(a.id) && a.t === 'year') && AC.some(a => /pb400/.test(a.id) && a.t === 'all' && /ALL-TIME BEST — 400m/.test(a.n)), JSON.stringify(AC));
ok('the first beat-last-time is a badge', AC.some(a => a.id === 'pr1'), JSON.stringify(AC));
await p.click('[data-t="today"]'); await p.waitForTimeout(100);
let cel = sq(await p.innerText('#glanceCard'));
ok('Today celebrates the newest one', /ALL-TIME BEST — 400m/.test(cel) && /\+350 XP/.test(cel) && /Let’s go/.test(cel), cel.slice(0, 300));
await p.click('#glanceCard button[data-cele]'); await p.waitForTimeout(150);
ok('and once dismissed it moves on to the next', !/ALL-TIME BEST — 400m/.test(sq(await p.innerText('#glanceCard'))));
await p.click('[data-t="camp"]'); await p.waitForTimeout(100);
let ach = sq(await p.innerText('#campCard'));
ok('the camp tab has the achievements wall, with locked goals to chase', /ACHIEVEMENTS/.test(ach) && /earned/.test(ach) && /sub-2:45/.test(ach), ach.slice(-700));
await ctx.close();
({ ctx, p, boot } = await at('2026-12-07'));
await boot(st({ days: { '2026-12-06': { runs: [{ k: 'reps', dm: 1000, n: 1, secs: 164 }] } } }));
ok('a 2:44 km smashes the goal', await p.evaluate(() => campAchievements().some(a => a.tier === 'goal' && /GOAL SMASHED — 1 km/.test(a.n))));
await ctx.close();

// ===== the 3rd quality session, when recovery is green (10 Oct) =====
({ ctx, p, boot } = await at('2026-10-28'));   // camp week 3
await boot(st({ days: { '2026-10-27': { sleep: 8.2 }, '2026-10-26': { sleep: 8.1 } } }));
let TH = await p.evaluate(() => { const m = weekRunsModel(); return { on: m.thrOn, easy: m.easyTarget, ok: thresholdOK() }; });
ok('a green week from camp week 3 adds the threshold run and drops one five-miler', TH.on && TH.easy === 2, JSON.stringify(TH));
await p.click('[data-t="training"]'); await p.waitForTimeout(120);
ok('the runs card shows it with a pace', /Threshold run — your 3rd quality session/.test(sq(await p.innerText('#tRuns'))) && /\d:\d\d–\d:\d\d a km/.test(sq(await p.innerText('#tRuns'))));
await boot(st({ days: { '2026-10-27': { sleep: 6.5 }, '2026-10-26': { sleep: 6.8 } } }));
ok('short sleep keeps it off', await p.evaluate(() => !weekRunsModel().thrOn));
await boot(st({ days: { '2026-10-21': { runs: [{ k: 'reps', dm: 400, n: 5, secs: 300, rpe: 9 }] } } }));
ok('a 9 last week keeps it off', await p.evaluate(() => !weekRunsModel().thrOn));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-14'));
await boot(st());
ok('not in camp weeks 1–2', await p.evaluate(() => !thresholdOK()));
await ctx.close();
({ ctx, p, boot } = await at('2026-10-30'));
await boot(st({ days: { '2026-10-26': { runs: [{ k: 'reps', dm: 1609, n: 3, secs: 1000 }] }, '2026-10-28': { runs: [{ km: 5, secs: 1160, type: 'threshold' }] }, '2026-10-29': { runs: [{ k: 'reps', dm: 300, n: 5, secs: 230 }] }, '2026-10-27': { sleep: 8.2 }, '2026-10-29b': {} } }));
ok('three planned quality sessions do not trip the “done loads” warning', await p.evaluate(() => { const s = weekStatus(); return !(s && /done loads/.test(s.t)); }));
await ctx.close();

// ===== tap a sleep bar to see the night =====
({ ctx, p, boot } = await at('2026-09-28'));
await boot(st({ days: { '2026-09-28': { bed: '23:10', wake: '07:25', sleep: 8, phoneOut: true }, '2026-09-25': { sleep: 7 } } }));
await p.click('[data-t="sleep"]'); await p.waitForTimeout(150);
let sp = sq(await p.innerText('#slPick'));
ok('the latest night shows by default', /Sun night/.test(sp) && /8\.0 h/.test(sp) && /8 hours/.test(sp) && /23:10 → ☀️ 07:25/.test(sp) && /Phone-free ✓/.test(sp), sp);
await p.click('#slChart button[data-sd="2026-09-25"]'); await p.waitForTimeout(100);
sp = sq(await p.innerText('#slPick'));
ok('tapping a bar shows that night', /Thu night/.test(sp) && /7\.0 h/.test(sp) && /7 hours/.test(sp) && /1 h under/i.test(sp) && /Phone not marked out/.test(sp), sp);
await p.evaluate(() => { S.days['2026-09-26'] = { bed: '22:50', wake: '07:45', sleep: 8.7 }; renderSleep(); });
await p.click('#slChart button[data-sd="2026-09-26"]'); await p.waitForTimeout(100);
sp = sq(await p.innerText('#slPick'));
ok('exact to the minute: 22:50 → 07:45 is 8.7 h · 8 hours 40 mins, 40 min over', /8\.7 h/.test(sp) && /8 hours 40 mins/.test(sp) && /40 min over the line/i.test(sp) && /in bed 8 h 55 min/.test(sp), sp);
await p.click('#slChart button[data-sd="2026-09-25"]'); await p.waitForTimeout(100);
ok('and highlights the bar', await p.evaluate(() => E('slChart').querySelector('button.sel').dataset.sd === '2026-09-25'));
await p.click('#slChart button[data-sd="2026-09-20"]'); await p.waitForTimeout(100);
ok('an unlogged night says so, without judging', /Not logged — ignored, not judged/.test(await p.innerText('#slPick')));
await ctx.close();

await b.close();
if (errs.length) fails.push(...errs);
console.log(fails.length ? 'FAIL (' + fails.length + ')\n - ' + fails.join('\n - ') : 'all passed');
