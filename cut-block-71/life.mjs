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
ok('Today opens with the main things at a glance', /TODAY AT A GLANCE/i.test(g) && /128\.2 lb/.test(g) && /1 hard · 0 sprints/.test(g) && /1 session/.test(g) && /8\.2 h · 8 h 12 min ✓/.test(g) && /Tonight is film night/.test(g) && /2 steps done/.test(g), g);
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
