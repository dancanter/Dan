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

  items.push({ time: toTime(wake), tag: 'body', title: 'Wake, same time as always', detail: `Morning heart rate before getting up, then ${phase?.kind === 'cut' ? 'weigh in after the loo, ' : ''}a big glass of water.${s.sleeps.length ? '' : ' Log last night’s sleep.'}` });
  const lightAt = Math.max(wake + 15, toMin(sunrise) + 10);
  items.push({ time: toTime(lightAt), tag: 'body', title: dark ? 'Daylight walk (priority in the dark months)' : 'Morning daylight', detail: dark ? `Sunrise is around ${sunrise}. 15–20 minutes outside soon after sets your body clock, mood and tonight’s sleep, and matters most in ${season}.` : '10 minutes outside without sunglasses sets your body clock.' });
  items.push({ time: toTime(wake + 60), tag: 'food', title: 'Breakfast: protein feeding 1', detail: `${refeed ? 'Refeed day: add oats or GF toast and fruit. ' : ''}4 Clarence eggs or a Fage pot with berries, a Brazil nut and kefir: 30+ g protein. SPF50 on before you leave.` });
  if (!travel) items.push({ time: toTime(wake + 105), tag: 'study', title: 'Deep work block 1 (90 min)', detail: study.level === 'too-much' ? 'You’ve been over the deep-work limit lately. Keep this block, and make the rest of today light review.' : 'Phone in another room. End with 10 minutes of testing yourself.' });

  // Training slot: in the dark months aim for daylight hours; in summer avoid midday heat.
  const trainAt = season === 'summer' ? wake + 3.5 * 60 : Math.min(toMin(sunset) - 90, Math.max(wake + 5 * 60, 12 * 60));
  let train: PlanItem;
  if (rest) train = { time: toTime(trainAt), tag: 'train', title: 'Full rest day', detail: 'No running or lifting today (see the coach’s call). A gentle walk outside is ideal.' };
  else if (travel) train = { time: toTime(trainAt), tag: 'train', title: 'Explore on foot', detail: 'No formal training needed: 12–15k steps of walking the city is your session. A short easy run is fine if you want one.' };
  else if (deload) train = { time: toTime(trainAt), tag: 'train', title: 'Deload session', detail: 'Normal weights, half the sets, nowhere near failure. Or an easy run at 60–70% of your usual distance.' };
  else if (ease) train = { time: toTime(trainAt), tag: 'train', title: 'Easy session only', detail: 'An easy, conversational run or an upper-body lift at about two thirds of the usual sets.' };
  else if (qualityReady && legsReady) train = { time: toTime(trainAt), tag: 'train', title: 'Green light: quality session possible', detail: 'You’re recovered for intervals, tempo or heavy legs, if your plan has one today. Warm up properly, and stop if your legs say otherwise.' };
  else train = { time: toTime(trainAt), tag: 'train', title: 'Easy run or upper-body lift', detail: `Quality running is ${qualityReady ? 'ready' : 'still recovering'}${legsReady ? '' : ' and legs need more time'}. Keep running easy today. Upper body is fine to train.` };
  items.push({ time: toTime(trainAt - 120), tag: 'food', title: 'Lunch: protein feeding 2 + carbs', detail: `${fish ? `Oily-fish day for vitamin D: ${fishName}. ` : 'Lean protein (venison, hake, chicken, steak mince). '}Potatoes or rice, plenty of veg, olive oil. The carbs fuel your session.` });
  items.push(train);
  if (!rest) items.push({ time: toTime(trainAt + 75), tag: 'food', title: 'After training: protein feeding 3', detail: 'Within a couple of hours: Fage or skyr with fruit, or Kallo lentil cakes with eggs. 25–35 g protein.' });
  if (!travel && study.level !== 'too-much') items.push({ time: toTime(trainAt + 135), tag: 'study', title: 'Deep work block 2 (60–90 min)', detail: 'Retrieval practice or assignment writing. Then stop deep work for the day.' });
  items.push({ time: toTime(Math.min(toMin('14:00'), trainAt)), tag: 'body', title: 'Caffeine cut-off', detail: 'Last coffee by now. Squash only with meals, water or cold green tea between.' });
  const dinner = bed - 3 * 60;
  items.push({ time: toTime(dinner), tag: 'food', title: 'Dinner: protein feeding 4', detail: `${fish && dark ? 'If lunch wasn’t fish, have it now. ' : ''}Protein, a colourful veg (something orange for skin tone), and carbs if you train tomorrow morning. Moist cooking (stew, poach, steam) keeps AGEs down.` });
  items.push({ time: toTime(bed - 75), tag: 'mind', title: 'Wind down', detail: `${dark ? 'It’s been dark since about ' + sunset + ', so keep lights low now. ' : ''}Screens off. 10 minutes of the wind-down yoga or slow breathing. Plan tomorrow’s first task.` });
  items.push({ time: toTime(bed - 30), tag: 'food', title: 'Optional: pre-bed casein', detail: 'A Fage 0% pot or skyr: slow protein for overnight repair.' });
  items.push({ time: toTime(bed), tag: 'sleep', title: 'Lights out', detail: `For 8.5 hours asleep before a ${toTime(wake)} wake. Cool, dark room, phone charging outside the bedroom.` });

  items.sort((a, b) => ((toMin(a.time) - wake + 1440) % 1440) - ((toMin(b.time) - wake + 1440) % 1440));
  const headline = rest ? 'Rest and refuel day' : travel ? `${phase!.name}: enjoy it, stay sharp` : refeed ? 'Refeed day' : deload ? 'Deload day' : ease ? 'Easy day' : qualityReady && legsReady ? 'Recovered: a strong day' : 'Steady day';
  return { items, season, headline };
}

export { sleepHours };
