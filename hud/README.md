# Apex HUD

A single-file health, training and study dashboard. Open `index.html` in any browser; there is nothing to install or build.

Five tabs: **Command** (current mission, readiness light, countdowns, age clock, ranks), **Engine** (running goals, weight trend, training logs), **Longevity** (habits, stress load, blood markers, blood pressure), **Fuel** (calorie and macro targets, food search, deficit maths) and **Mind** (sleep, deep study, breathing and focus timers).

A **Coach** button gives a briefing worked out from your data. Charts can be tapped for exact values, food can be logged by search, one-tap meals, a `FOOD:` line in the sync bar or a quick-add row, and a micronutrient panel explains what each nutrient does and which foods supply it.

## Data and privacy

- The file contains no personal data. Everything you enter is kept in that browser's local storage and nowhere else.
- Load a starting file or a backup from *Settings & data* (paste the JSON or choose the file). Copy a backup from the same place to move between devices.
- The only outside request is the optional UK supermarket search, which sends the search words to [Open Food Facts](https://world.openfoodfacts.org). Its records are entered by volunteers, so check the pack, above all for allergens.

## What the numbers are

- **Readiness** is a weighted score from resting heart rate against your own 14-day baseline, sleep, stress and soreness.
- **Weight decisions** use the 7-day rolling average, never a single weigh-in.
- **Energy burn** is a model (Mifflin–St Jeor resting rate plus steps, running and gym). Expect about ±10%.
- **VO2max** comes from the Daniels–Gilbert race equations.
- **Biological age** and **pace of ageing** are a transparent points model, shown with its workings. They are a motivational estimate, not a clinical measurement.
- **Food values** are typical per 100 g raw weight and can be 10–20% out.

This is general, evidence-informed guidance and not medical advice. Symptoms, out-of-range blood results and anything hormonal belong with a GP.
