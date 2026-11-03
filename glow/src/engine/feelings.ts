import { addDays, sleepHours, sortByDate } from './body';
import { dayResult } from './game';
import { phaseOn } from './season';
import { refeedCall } from './calls';
import { resolveItems, type State } from '@/store';

// "How do I feel?": tap a feeling, get specific things to do, using your
// own data where it changes the answer (are you actually under-fuelled?
// did you sleep? is a refeed due?).

export interface Feeling { id: string; label: string; emoji: string }

export const FEELINGS: Feeling[] = [
  { id: 'hungry', label: 'Really hungry', emoji: '🍽️' },
  { id: 'bored-eating', label: 'Want to eat out of boredom', emoji: '🍪' },
  { id: 'cravings', label: 'Craving something sweet', emoji: '🍫' },
  { id: 'urge-binge', label: 'Urge to binge', emoji: '🌊' },
  { id: 'lazy', label: 'Lazy / unmotivated', emoji: '🛋️' },
  { id: 'tired', label: 'Tired / drained', emoji: '🥱' },
  { id: 'stressed', label: 'Stressed', emoji: '😤' },
  { id: 'anxious', label: 'Anxious / restless', emoji: '😟' },
  { id: 'low', label: 'Low / flat', emoji: '🌧️' },
  { id: 'study-stuck', label: 'Can’t focus on study', emoji: '📚' },
  { id: 'bloated', label: 'Bloated', emoji: '🎈' },
  { id: 'sore', label: 'Sore', emoji: '🦵' },
  { id: 'cant-sleep', label: 'Can’t sleep', emoji: '🌙' },
  { id: 'great', label: 'Feeling great', emoji: '⚡' },
];

export function adviceFor(id: string, s: State, date: string): { headline: string; steps: string[]; note?: string } {
  const r = dayResult(s, date);
  const items = resolveItems(s.days[date], s);
  const kcal = Math.round(r.analysis.totals.kcal);
  const target = s.profile.kcalTarget;
  const lastSleep = sortByDate(s.sleeps).filter((e) => e.date <= date).map(sleepHours).at(-1);
  const y = dayResult(s, addDays(date, -1));
  const inCut = phaseOn(s.profile.season, date)?.kind === 'cut';
  const refeed = refeedCall(s, date);
  const lowCount = Array.from({ length: 14 }, (_, i) => s.days[addDays(date, -i)]?.feelings?.includes('low')).filter(Boolean).length;

  switch (id) {
    case 'hungry': {
      const steps: string[] = [];
      if (y.ea !== undefined && y.ea < 30) steps.push(`This is real hunger: yesterday’s energy availability was ${Math.round(y.ea)}, in the low zone. Eat a proper meal with protein and carbs. Under-eating on your training load costs hormones and muscle.`);
      if (refeed.kind === 'refeed') steps.push('A refeed day is due. Today is a good day for it (Today → Coach’s call).');
      if (items.length && kcal < target - 400) steps.push(`You’re at ${kcal} of ${target} kcal, so there’s room. Have your next protein feeding now rather than waiting.`);
      steps.push('Protein first: a Fage pot, 2–3 eggs or a tin of fish. Protein is the most filling macronutrient.');
      steps.push('Then volume: potatoes, a big salad with olive oil, berries, soup or broth. Lots of food for few calories.');
      steps.push('Drink a large glass of water. Thirst often reads as hunger, especially after training.');
      if (lastSleep !== undefined && lastSleep < 7) steps.push(`You slept ${lastSleep.toFixed(1)} h. Short sleep raises the hunger hormone ghrelin and lowers leptin. Expect more hunger today and plan an early night.`);
      return { headline: 'Hungry on a cut: fuel it smartly', steps };
    }
    case 'urge-binge': {
      const steps: string[] = [];
      if (items.length && kcal < target - 400) steps.push(`First, the honest check: you’re at ${kcal} of ${target} kcal. Some of this urge is real hunger. Eat a proper planned meal now (protein + carbs), and the urge usually halves.`);
      if (y.ea !== undefined && y.ea < 30) steps.push('Yesterday was under-fuelled (energy availability under 30). Binge urges after low days are biology, not weakness. Eat your full target today.');
      steps.push('Surf the urge: urges rise, peak and fade within about 10–20 minutes if you don’t feed them. Set a 15-minute timer and leave the kitchen.');
      steps.push('While it runs: a walk outside, a shower, call someone, or 10 slow breaths (out longer than in). Anything that takes your hands and attention.');
      steps.push('Still want it after 15 minutes? Have a planned portion on purpose: 50 g oats with 1 tsp raw honey and berries, or a Fage pot with fruit and cinnamon. Weigh it, put the packet away, eat it sitting down, slowly.');
      steps.push('Go easy on sweetener drops in that bowl: very sweet, unlimited-volume food is what keeps a binge going.');
      if (lastSleep !== undefined && lastSleep < 7) steps.push(`You slept ${lastSleep.toFixed(1)} h: short sleep makes sweet food more rewarding. An early night tonight makes tomorrow easier.`);
      return { headline: 'The urge will pass: ride it out, then eat on purpose', steps, note: 'If it happens anyway, log it in “Had a binge?” on Today. No judgement, it’s just data for spotting your pattern.' };
    }
    case 'bored-eating':
      return { headline: 'Boredom, not hunger: give your brain what it’s actually asking for', steps: [
        'Quick test: would you eat an apple or a plate of chicken right now? If not, it’s boredom.',
        'Change state for 10 minutes: a walk outside (also counts towards daylight and steps), a cold-water face splash, or 10 slow breaths.',
        'Do something with your hands: tidy a drawer, cook tomorrow’s lunch, play an instrument, or style tomorrow’s outfit.',
        'Message or call someone. Connection fixes boredom better than snacks.',
        'Pick a film from the Movie night list and plan a proper, planned snack for it instead of grazing.',
        'Still want something after 15 minutes? Have it on purpose: a Fage pot with berries and cinnamon, or 2 squares of 85% chocolate, on a plate, sitting down.',
      ] };
    case 'cravings':
      return { headline: 'Sweet craving', steps: [
        'Have something sweet with protein: Fage or skyr with berries and cinnamon, or a protein shake blended with frozen berries.',
        'Or 2 squares of 85% dark chocolate, eaten slowly. Satisfying, and polyphenol-rich.',
        lastSleep !== undefined && lastSleep < 7 ? 'Short sleep drives sugar cravings. This one might be about last night.' : 'Cravings often peak in the afternoon when lunch was light. Check your protein rhythm card.',
        'If squash and sweeteners are on all day, they keep your palate tuned to “very sweet”. Water or green tea between meals helps reset it within a couple of weeks.',
      ] };
    case 'lazy':
      return { headline: 'Unmotivated: make starting tiny', steps: [
        'Two-minute rule: commit only to starting. Shoes on and out the door, or open the module and read one page. Momentum usually follows.',
        'Change state first: daylight on your face, a cold-water splash, or a coffee if it’s before 2pm.',
        r.sleep && r.sleep.hours < 7 ? `You slept ${r.sleep.hours.toFixed(1)} h, so this might be genuine fatigue, not laziness. Do the minimum version today.` : 'If you slept well and fuelled well, this is likely just inertia. Start small and keep going.',
        'Put on music you love and do the easiest useful task first, for a quick win.',
        'Remember why: France on 3 December, distinctions, the face. Look at your Glow streak and don’t break it.',
      ], note: inCut ? 'Deep deficits flatten motivation. If it lasts several days with low energy, check the refeed and energy-availability cards.' : undefined };
    case 'tired':
      return { headline: 'Tired: work out which kind', steps: [
        lastSleep !== undefined ? `Last night: ${lastSleep.toFixed(1)} h. ${lastSleep < 7.5 ? 'That’s the likely cause. Protect tonight and keep today light.' : 'Sleep was OK, so look at food and training.'}` : 'Log last night’s sleep. It’s usually the answer.',
        y.ea !== undefined && y.ea < 30 ? 'Yesterday’s energy availability was low. Eat properly today, especially carbs around training.' : 'Make sure lunch has carbs as well as protein.',
        'A 10–20 minute nap before 3pm, or a daylight walk. Avoid caffeine after 2pm.',
        'Swap any hard session for an easy one. The Ease off call on Today will say if your data agrees.',
        'If you’re tired most days for 2+ weeks, ask your GP about ferritin and vitamin D (runners and coeliacs often run low).',
      ] };
    case 'stressed':
      return { headline: 'Stressed: bring the body down first', steps: [
        '5 minutes of slow breathing (Rituals → Breathe, resonance 5.5). Long exhales calm the stress response within minutes.',
        'A walk outside without your phone.',
        'Write down the three things on your mind and the next tiny step for each. Getting them out of your head helps.',
        'Keep caffeine and hard intervals light today. Stacking stressors raises cortisol, which brings puffiness and poor sleep.',
        'Do the evening wind-down yoga before bed.',
      ] };
    case 'anxious':
      return { headline: 'Anxious or restless', steps: [
        'Box breathing (4-4-4-4) for 3 minutes, or the 4-7-8 pattern, both in Rituals.',
        'Name 5 things you can see, 4 you can hear, 3 you can touch. It brings attention back to the room.',
        'Move: a brisk 15-minute walk burns off the restless energy.',
        'Cut caffeine for the rest of the day.',
        'If anxiety is frequent or getting in the way, talk to your GP. NHS Talking Therapies also takes self-referrals.',
      ] };
    case 'low':
      return { headline: 'Feeling low', steps: [
        'Get outside into daylight, even 10 minutes, and move gently.',
        'Reach out to one person. A text is enough.',
        'Do one small thing that usually makes you feel good (the joy menu in Rituals). Mood often follows action, not the other way round.',
        'Eat a proper meal. Low mood and under-eating feed each other on a cut.',
        'Go easy on yourself: no hard session today, and an early night.',
      ], note: lowCount >= 5
        ? 'You’ve felt low on several days recently. Please talk to your GP, or self-refer to NHS Talking Therapies. If you’re ever in crisis, Samaritans are free 24/7 on 116 123.'
        : 'If low mood lasts more than two weeks, talk to your GP. If you’re ever in crisis, Samaritans are free 24/7 on 116 123.' };
    case 'study-stuck':
      return { headline: 'Can’t focus on study', steps: [
        'Put your phone in another room. That alone measurably improves focus.',
        'Set a 25-minute timer and do one specific task (e.g. “summarise section 3.2 in five bullet points”).',
        'Switch to retrieval: close the book and write what you remember. It’s easier to start and works better.',
        'If you’ve already done 3–4 deep hours today, you’re done. Switch to light review or rest.',
        'A 10-minute walk outside resets attention better than scrolling.',
      ] };
    case 'bloated':
      return { headline: 'Bloated', steps: [
        'A 10–15 minute walk helps move gas along.',
        'Peppermint tea can ease gut spasms (good evidence in IBS).',
        'Check today’s log for FODMAP foods: lentils, beans, onion, garlic, apples, protein bars. The De-puff card lists them.',
        'Skip fizzy drinks and chewing gum for the rest of the day, and eat slowly.',
        'If it’s frequent despite strict gluten-free eating, mention it to your GP (hidden gluten, lactose or IBS).',
      ] };
    case 'sore':
      return { headline: 'Sore', steps: [
        'Normal 24–72 hours after a new or hard session. Gentle movement (walking, the mobility yoga flow) helps more than total rest.',
        'Hit your protein and carbs today. Repair needs both.',
        'Sleep is the best recovery tool there is.',
        'Train other areas, or go easy on the sore ones. Sharp, one-sided or joint pain isn’t normal soreness: rest it, and see a physio if it lasts.',
      ] };
    case 'cant-sleep':
      return { headline: 'Can’t sleep', steps: [
        'Get up after about 20 minutes awake: dim light, read fiction, go back when sleepy.',
        '4-7-8 breathing or the body-scan rest in Rituals.',
        'Keep the room cool, dark and phone-free.',
        'Tomorrow: morning daylight, caffeine before 2pm, no late hard sessions, and a consistent wake time, even after a bad night.',
      ] };
    case 'great':
      return { headline: 'Feeling great: use it well', steps: [
        'Great day for a quality session, if your morning heart rate and the training load agree.',
        'Bank the energy into your hardest study task.',
        'Don’t add extra training on top of the plan. Good days are when people overdo it.',
        'Note what led here (sleep? food? sunlight?) so you can repeat it.',
      ] };
  }
  return { headline: '', steps: [] };
}
