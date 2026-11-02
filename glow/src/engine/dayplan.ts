import { addDays, sleepHours, sortByDate } from './body';
import { phaseOn } from './season';
import { recoveryStatus } from './recovery';
import { deloadCall, easeCall, refeedCall, restCall, studyLoad } from './calls';
import { seasonOf, type Season } from '@/data/films';
import type { State } from '@/store';

// Today's plan: a concrete, time-ordered day built from your wake time, the
// season's daylight, your season-plan phase, the recovery clock and the
// coach's calls. Times are suggestions to anchor the day, not a timetable.

export interface PlanItem { time: string; title: string; detail: string; tag: 'body' | 'food' | 'train' | 'mind' | 'study' | 'sleep' }

// Approximate sunrise and sunset for central England, by month (local time).
const SUN: Record<number, [string, string]> = {
  1: ['08:00', '16:20'], 2: ['07:25', '17:15'], 3: ['06:30', '18:05'], 4: ['06:20', '19:55'], 5: ['05:20', '20:45'], 6: ['04:45', '21:20'],
  7: ['05:05', '21:10'], 8: ['05:50', '20:20'], 9: ['06:40', '19:10'], 10: ['07:25', '18:00'], 11: ['07:20', '16:20'], 12: ['08:00', '15:55'],
};

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = (m: number) => { const x = ((Math.round(m / 5) * 5) % 1440 + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };

/** Oily fish days for vitamin D: four a week from October to March, two otherwise. */
export function fishToday(date: string): boolean {
  const dow = new Date(`${date}T12:00:00`).getDay(); // 0 Sun
  const m = Number(date.slice(5, 7));
  const winter = m >= 10 || m <= 3;
  return winter ? [1, 3, 5, 0].includes(dow) : [2, 5].includes(dow);
}

const FISH_ROTA = ['mackerel', 'wild salmon', 'trout', 'wild salmon', 'sardines on GF oatcakes', 'kippers'];

/** Dan's usual day: walk or run around 1pm, gym at 6pm. Editable in Me. */
export const DEFAULT_ROUTINE = { run: '12:45', gym: '18:00' };

export function dayPlan(s: State, date: string): { items: PlanItem[]; season: Season; headline: string } {
  const season = seasonOf(date);
  const month = Number(date.slice(5, 7));
  const [sunrise, sunset] = SUN[month];
  const lastWake = sortByDate(s.sleeps).filter((e) => e.date <= date).at(-1)?.wake ?? '07:00';
  const wake = toMin(lastWake);
  const bed = wake - 8.75 * 60; // 8.5 h asleep + time to fall asleep
  const phase = phaseOn(s.profile.season, date);
  const kg = sortByDate(s.weights).at(-1)?.kg ?? 57;
  const rest = restCall(s, date, kg).kind === 'rest';
  const ease = easeCall(s, date, kg).kind === 'ease';
  const deload = deloadCall(s, date, kg).kind === 'deload' || (s.profile.deloads ?? []).some((d) => d <= date && d > addDays(date, -7));
  const refeed = !!s.days[date]?.refeed || refeedCall(s, date).kind === 'refeed';
  const rec = recoveryStatus(s, date);
  const qualityReady = rec.systems.find((x) => x.system === 'quality')!.readyInDays === 0;
  const legsReady = rec.systems.find((x) => x.system === 'legs')!.readyInDays === 0;
  const study = studyLoad(s, date);
  const fish = fishToday(date);
  const fishName = FISH_ROTA[new Date(`${date}T12:00:00`).getDate() % FISH_ROTA.length];
  const dark = season === 'winter' || season === 'autumn';
  const travel = phase?.kind === 'travel';
  const items: PlanItem[] = [];

  const r = s.profile.routine ?? DEFAULT_ROUTINE;
  const runAt = toMin(r.run), gymAt = toMin(r.gym);
  const quality = qualityReady && legsReady && !ease && !deload && !rest;
  items.push({ time: toTime(wake), tag: 'body', title: 'Wake, same time as always', detail: `Morning heart rate before getting up, then ${phase?.kind === 'cut' ? 'weigh in after the loo, ' : ''}a big glass of water.${s.sleeps.length ? '' : ' Log last night’s sleep.'}` });
  items.push({ time: toTime(wake + 20), tag: 'food', title: 'Meal 1: breakfast', detail: `${refeed ? 'Refeed day: add oats or GF toast and fruit. ' : ''}4 Clarence eggs, or a Fage pot with berries, plus a Brazil nut and kefir: 30+ g protein. SPF50 on before you go out.` });
  const lightAt = Math.max(wake + 40, toMin(sunrise) + 10);
  if (dark && lightAt < runAt - 60) items.push({ time: toTime(lightAt), tag: 'body', title: 'Morning daylight (10–15 min)', detail: `Sunrise is around ${sunrise}. A short spell outside soon after sets your body clock, mood and tonight’s sleep. Your midday walk or run then tops it up in the brightest part of ${season === 'autumn' ? 'an' : 'a'} ${season} day.` });
  if (!travel) {
    items.push({ time: toTime(wake + 75), tag: 'study', title: 'Deep work block 1 (90 min)', detail: study.level === 'too-much' ? 'You’ve been over the deep-work limit lately. Keep this block, and make the rest of today light review.' : 'Your freshest hours. Phone in another room. End with 10 minutes of testing yourself.' });
    if (runAt - (wake + 75 + 105) >= 60 && study.level !== 'too-much') items.push({ time: toTime(wake + 75 + 105), tag: 'study', title: 'Deep work block 2 (60 min)', detail: 'After a 15-minute break away from screens. Retrieval practice or assignment writing.' });
  }
  const sinceBreakfast = runAt - (wake + 20);
  let midday: PlanItem;
  if (rest) midday = { time: r.run, tag: 'train', title: 'Easy walk only', detail: 'Full rest day (see the coach’s call): a gentle daylight walk, no run.' };
  else if (travel) midday = { time: r.run, tag: 'train', title: 'Explore on foot', detail: '12–15k steps of walking the city is your session. A short easy run is fine if you want one.' };
  else if (deload) midday = { time: r.run, tag: 'train', title: 'Deload: easy run or walk', detail: 'An easy run at 60–70% of your usual distance, or just a walk.' };
  else if (ease) midday = { time: r.run, tag: 'train', title: 'Walk or easy run', detail: 'Conversational pace only today.' };
  else if (quality) midday = { time: r.run, tag: 'train', title: 'Run: quality session possible', detail: `You’re recovered for intervals or tempo, if your plan has one today. Warm up properly.${sinceBreakfast >= 240 ? ' It’s a while since breakfast, so have a small carb snack 60–90 minutes before (a banana, or 2 Kallo cakes with 1 tsp honey) to run fast.' : ''}` };
  else midday = { time: r.run, tag: 'train', title: 'Walk or easy run', detail: `Quality running is ${qualityReady ? 'ready' : 'still recovering'}${legsReady ? '' : ' and legs need more time'}. Keep it easy (Zone 2) or walk.` };
  items.push(midday);
  items.push({ time: toTime(Math.max(runAt + 60, toMin('14:00'))), tag: 'food', title: 'Meal 2: after your walk or run', detail: `${fish ? `Oily-fish day for vitamin D: ${fishName}. ` : 'Lean protein (venison, hake, chicken, steak mince). '}Potatoes or rice, plenty of veg, olive oil. The carbs refill your legs and fuel the gym later. 30–40 g protein.` });
  items.push({ time: toTime(Math.min(toMin('14:00'), runAt + 90)), tag: 'body', title: 'Caffeine cut-off', detail: 'Last coffee by about now, so skip pre-workout or coffee before the evening gym. Caffeine has a 5–6 hour half-life (half is still in your system 5–6 hours later), so a 5:30 coffee is still a third active at 11pm and cuts deep sleep.' });
  if (!travel && study.level !== 'too-much') items.push({ time: toTime(Math.max(runAt + 60, toMin('14:00')) + 45), tag: 'study', title: 'Study block 3 (60 min)', detail: study.level === 'heavy' || study.onPlan ? 'Lighter work: notes, reading or planning. Your deep hours are done.' : 'Deep or light depending on how blocks 1 and 2 went. Stop by 4:30 so you arrive at the gym fresh.' });
  const gymDay = !rest && !travel;
  items.push({ time: toTime(gymAt - 35), tag: 'food', title: gymDay ? 'Meal 3: pre-gym' : 'Meal 3: afternoon', detail: gymDay ? 'Protein plus easy carbs, light on fat and fibre so it’s digested by the time you lift: a Fage pot with berries and 1 tsp raw honey, or 2–3 Kallo cakes with eggs. 25–30 g protein.' : 'Protein-led: a Fage pot with berries, or eggs. 25–30 g protein.' });
  if (gymDay) items.push({ time: r.gym, tag: 'train', title: deload ? 'Gym: deload' : ease ? 'Gym: lighter session' : 'Gym', detail: deload ? 'Normal weights, half the sets, nowhere near failure.' : ease ? 'Upper body, or about two thirds of your usual sets. Stop 2–3 reps short of failure.' : `Hit your planned sets (see Body → Training for sets per muscle this week). In a cut, keep the weights heavy and trim volume, not intensity.${legsReady ? '' : ' Legs are still recovering: upper body today if you can.'}` });
  items.push({ time: toTime(gymDay ? gymAt + 100 : toMin('19:30')), tag: 'food', title: gymDay ? 'Meal 4: post-gym dinner' : 'Meal 4: dinner', detail: `${fish && dark ? 'If Meal 2 wasn’t fish, have it now. ' : ''}Your biggest protein hit (35–45 g), carbs to refill glycogen (rice or potatoes), and a colourful veg (something orange for skin tone). Late protein doubles as overnight repair, so you don’t need a separate pre-bed snack. Moist cooking (stew, poach, steam) keeps AGEs down.` });
  items.push({ time: toTime(bed - 60), tag: 'mind', title: 'Wind down', detail: `${dark ? 'It’s been dark since about ' + sunset + ', so keep lights low. ' : ''}Screens off. You trained in the evening, so 10 minutes of wind-down yoga or slow breathing helps your heart rate settle. Plan tomorrow’s first task. Kitchen closed after Meal 4 (teeth brushed is a good signal).` });
  items.push({ time: toTime(bed), tag: 'sleep', title: 'Lights out', detail: `For 8.5 hours asleep before a ${toTime(wake)} wake. Cool, dark room, phone charging outside the bedroom. Finishing the gym about 3 hours before bed doesn’t harm sleep for most people.` });

  items.sort((a, b) => ((toMin(a.time) - wake + 1440) % 1440) - ((toMin(b.time) - wake + 1440) % 1440));
  const headline = rest ? 'Rest and refuel day' : travel ? `${phase!.name}: enjoy it, stay sharp` : refeed ? 'Refeed day' : deload ? 'Deload day' : ease ? 'Easy day' : qualityReady && legsReady ? 'Recovered: a strong day' : 'Steady day';
  return { items, season, headline };
}

export { sleepHours };
