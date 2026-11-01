# Glow: cellular nutrition, sleep and rituals

A personal app for eating, sleeping and living for cellular health and looking your best. Training lives in The Good Life; Glow covers everything else.

**Online:** published with the rest of the site at `/glow/` (for example `https://dancanter.github.io/Dan/glow/`) when the Pages workflow runs. Add it to your phone's home screen from the browser's share menu.

## What it does

| Screen | |
| --- | --- |
| **Today** | Type what you ate the way you'd say it ("3 eggs, 150g wild salmon, handful blueberries"). You get a **Glow score** (nutrition 55%, sleep 25%, rituals 20%), a daily quest, macros against your targets, the 8 cellular pillars, all 17 micronutrients (bioavailability-adjusted), and safety warnings for vitamin A, selenium, zinc, copper, iodine, free sugar, alcohol, gluten and low energy availability. There's also a morning weight and sleep check-in. |
| **Foods** | Around 190 whole foods, values per 100 g raw. Each has an A+ to F **optimisation score** (how hard every calorie works), a plain-English "what it does for you", and notes on compounds and bioavailability. Rank by any nutrient. Online search covers 3 million+ packaged products through Open Food Facts, and you can add your own foods. |
| **Cellular** | The 8 pillars, mapped to the 12 hallmarks of ageing (López-Otín 2023): mitochondria, inflammation, DNA, glycation, autophagy, gut, hormones, skin. Plus what to cut out and why, non-training boosters graded by evidence, a glossary and sources. |
| **Body** | Weight trend (7-day average and weekly rate), BMI, and an honest energy-availability check of your cut. Sleep log with duration, quality and regularity scores. |
| **Rituals** | Daily non-training habits with evidence grades, and a breathing pacer (resonance, box, 4-7-8). |
| **Me** | Rank, XP, streaks and badges, settings that shape every target, and backup/restore. |

## How the scoring works

- **Food score** = micronutrient density per 100 kcal (after bioavailability: haem vs plant iron, phytate, oxalate), protein, fibre and omega-3 per calorie, plus bonuses for protective compounds (polyphenols, sulforaphane, fermented, carotenoids, nitrate, spermidine and more), minus penalties for ultra-processing, free sugar, processed meat, frying, alcohol and mercury.
- **Pillar scores** weight the nutrients and compounds linked to each process, with penalties for things that push the wrong way, and include sleep and energy availability where they matter.
- Targets use the higher of UK RNI and EFSA values. Protein is set in g/kg of your latest weight. Upper limits are EFSA's.

All values are typical estimates (±10–20%). This is not medical advice.

## Run it

```bash
cd glow
npm install
npm run dev     # http://localhost:5190
npm test
npm run build
```

Data is stored in the browser (localStorage). Export a backup from **Me** to move devices.
