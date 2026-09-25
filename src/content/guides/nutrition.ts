import type { Guide } from '../schema';

export const nutritionGuides: Guide[] = [
  {
    // First in the section on purpose. Everything else here explains or
    // qualifies; this is the one entry that just answers "what should I
    // actually eat". Foods are listed by what they give you, with UK examples,
    // and without fat-level advice — that question has its own entry, which
    // reports both the guidance and the evidence rather than a slogan.
    id: 'best-foods',
    section: 'nutrition',
    title: 'Key foods to eat',
    summary: 'What to put on your plate and how they benefit you and your baby.',
    body: [
      'You do not need special foods or an expensive diet. The foods below are ordinary, easy to find in any UK supermarket, and cover what matters most in pregnancy.',
      '**If you only change three things:** eat more fibre (build it up slowly, more on that under Gut health), add oily fish, and get to five fruit and veg a day. Those are the biggest gaps in UK diets. Only 4% hit the fibre target, and in a four-day survey more than three in four women ate no oily fish at all.',
      'Food alone will not cover two things, so keep taking them: **folic acid** (400 micrograms a day until 12 weeks) and **vitamin D** (10 micrograms a day). The details are in Supplements.',
      'If you have gestational diabetes, the food advice changes a little. There is a separate entry on it under Existing conditions.',
      'How you cook matters a little too. Gentler methods keep more of the goodness in, and the next entry explains why.',
    ],
    lists: [
      {
        title: 'For iron: your blood supply is growing fast',
        items: [
          'Red meat (beef, lamb, pork) cooked all the way through',
          'Beans, lentils and chickpeas',
          'Fortified breakfast cereals',
          'Dark green veg like spinach, kale and broccoli',
          'Tip: have something with vitamin C alongside, like fruit or a glass of orange juice, to help your body absorb it',
        ],
      },
      {
        title: 'For omega-3: your baby’s brain and eyes',
        items: [
          'Salmon, mackerel, sardines, trout and herring',
          'Aim for two portions of fish a week, at least one oily. No more than two portions of oily fish a week',
        ],
      },
      {
        title: 'For calcium and iodine: bones, and brain development',
        items: [
          'Milk, yoghurt and cheese: pasteurised',
          'Hard cheeses like cheddar are fine. Some soft cheeses are not. See Food safety',
        ],
      },
      {
        title: 'For protein: eat some every day',
        items: [
          'Eggs: best with the white cooked and the yolk runny, like a soft-boiled egg',
          'Chicken, meat and fish',
          'Beans, lentils, tofu, nuts and seeds',
        ],
      },
      {
        title: 'For fibre and steady energy',
        items: [
          'Wholemeal bread, oats and porridge',
          'Brown rice and wholewheat pasta',
          'Potatoes with their skins on',
          'Beans and lentils, which count here too',
        ],
      },
      {
        title: 'For your gut: good bacteria',
        items: [
          'Live or "bio" yoghurt and kefir, made from pasteurised milk. Check the label',
          'Have them alongside fibre, which is what the good bacteria feed on',
          'Skip kombucha: the Gut health entry explains why',
        ],
      },
      {
        title: 'Fruit and veg: at least five portions a day',
        items: [
          'Fresh, frozen, tinned and dried all count',
          'Wash fruit, veg and salad well before eating',
        ],
      },
      {
        title: 'Worth avoiding',
        items: [
          'Liver and liver products like pâté: too much vitamin A',
          'Shark, swordfish and marlin',
          'Raw or undercooked meat, and unpasteurised milk',
          'The full list, and what is actually fine, is in Food safety',
        ],
      },
    ],
    sourceIds: ['nhs-healthy-diet-pregnancy', 'sacn-2026', 'nhs-foods-to-avoid'],
    emphasis: 'calm',
  },
  {
    // The safety line leads, deliberately. "Don't overcook" is good advice for
    // vegetables and bad advice for chicken, and in pregnancy undercooked meat
    // is the real risk — toxoplasmosis and listeria are why Food safety says
    // cook it through. Gentle cooking only ever means gentle *and* done.
    //
    // The AGE evidence is stated at the strength it has. That high dry heat
    // raises the AGEs in food is well measured. Whether eating them harms
    // health is still being studied and is not part of UK pregnancy advice, so
    // this is offered as a sensible habit, never as a rule or a warning.
    id: 'cooking-methods',
    section: 'nutrition',
    title: 'How you cook it: gentler is better, but always cook it through',
    summary: 'Steam veg, go for gold not brown, and choose slow or moist cooking where you can.',
    body: [
      '**First, the part that is not optional.** In pregnancy, meat, poultry and eggs that are not British Lion-stamped must be cooked all the way through: no pink, and juices running clear. Gentle cooking means gentle *and* fully cooked, never less cooked. The details are in Food safety.',
      '**Vegetables: steam or microwave rather than boil.** Folate and vitamin C dissolve into cooking water, so boiling pours some of them away. Cook veg until just tender rather than soft. If you do boil, use a little water and keep potato skins on.',
      '**Starchy foods: go for gold.** When you fry, roast or toast potatoes, chips or bread, aim for golden yellow rather than dark brown or burnt. Browning at high heat creates a chemical called acrylamide, and UK food safety advice is to keep it low.',
      '**Meat: slow and moist beats hot and dry.** Stewing, braising, casseroles, slow cookers and poaching are all good choices. Cooking meat at high, dry heat (grilling, frying hard, roasting until charred) creates more compounds called AGEs (advanced glycation end-products). One analysis found stewed meat had around half the AGEs of the same meat grilled.',
      '**How strong is the AGE evidence?** That high heat creates more AGEs in food is well measured. Whether eating more of them affects health is still being researched, mostly in laboratory and small human studies. It is not part of UK pregnancy advice. So treat this as a sensible habit, not a rule.',
      'None of this means fried food is dangerous. A fry-up or a roast now and then is fine. The point is to avoid charring and burning, and to lean towards gentler methods most of the time.',
    ],
    lists: [
      {
        title: 'Gentler ways to cook',
        items: [
          'Steaming or microwaving vegetables',
          'Stews, casseroles and curries',
          'Slow cookers: fine for meat, as long as it ends up cooked through',
          'Poaching fish or eggs',
          'Baking or roasting at a moderate heat, stopping at golden',
        ],
      },
    ],
    sourceIds: ['nhs-starchy-foods', 'uhcw-folate-diet', 'uribarri-2010', 'nhs-foods-to-avoid'],
  },
  {
    // Fermented foods and fibre are presented as a pair: one brings in live
    // bacteria, the other feeds them. Only the fermented foods that are safe
    // in pregnancy are named, and kombucha is steered away from.
    //
    // On foods that cause bloating, the order is deliberate: build up
    // slowly and try smaller portions first, and if a food still disagrees
    // with you, it is fine to leave it out — which is also what the NHS
    // bloating advice says. The one condition is swapping it for something
    // that does the same job, because broccoli and beans are among the best
    // folate and fibre sources there are, and cutting a whole food group
    // like dairy loses calcium and iodine that are hard to replace.
    //
    // "Listen to your body" is scoped to food tolerance only. It is never
    // offered about symptoms — for those, the app's answer is always call.
    id: 'gut-health',
    section: 'nutrition',
    title: 'Gut health: fibre, fermented foods, wind and bloating',
    summary:
      'Add good bacteria with pasteurised live yoghurt or kefir, feed them with fibre, and skip kombucha.',
    body: [
      '**Fermented foods add good bacteria; fibre feeds them.** Live yoghurt and kefir contain live bacteria. Fibre is what gut bacteria live on. So it makes sense to have both.',
      'There is some evidence for this. In one small trial, 36 healthy adults (not pregnant) ate either lots of fermented foods or lots of fibre for several weeks. The fermented-food group ended up with a more varied mix of gut bacteria and lower signs of inflammation. In the fibre group, how people responded depended on how varied their gut bacteria were to begin with.',
      'It is a promising finding rather than settled advice: the trial was small, it was not in pregnancy, and fermented foods are not part of UK pregnancy guidance yet. But the ones below are safe, cheap and easy to add.',
      'Fibre also helps on its own, by softening poo and keeping things moving. That matters a lot in pregnancy, because hormones slow digestion and constipation is very common.',
      '**Fermented foods that are fine in pregnancy:** live or "bio" yoghurt and kefir, **as long as they are made from pasteurised milk**. Most in UK shops are, but check the label. Avoid anything made with unpasteurised milk, including homemade kefir from raw milk.',
      '**Kombucha is one to skip, or ask your midwife about first.** It is brewed from tea, so it contains caffeine. Fermenting also leaves some alcohol in it, and the amount varies, often more than the label says, and more again in home brews. The NHS says there is no known safe amount of alcohol in pregnancy.',
      '**Probiotic supplements** are generally thought to be safe if your immune system is healthy. But they are sold as food, not medicine, so they are not tested the same way, and you cannot always be sure the bacteria on the label are in the tub. Ask your midwife or pharmacist if you want to try one.',
      '**If fibre gives you wind or bloating**, you are not imagining it. Adding a lot of fibre suddenly is a common cause. Build it up gradually over a few days, and drink plenty: fibre needs water to work. Broccoli, cabbage, cauliflower, sprouts, beans, lentils, onions and dried fruit are the usual suspects.',
      'Try smaller portions spread through the week first, eat slowly, and chew well. That is often enough.',
      '**Listen to your body.** If a food still gives you too much bloating or discomfort, it is okay to eat less of it or leave it out, even if everyone says it is healthy. It might just not suit you, and that is fine.',
      'No single food is essential. Just swap it for something that does a similar job, so you still get what it gives you. If broccoli or cabbage disagree with you, try other vegetables. If beans do, get your fibre from oats, wholemeal bread and fruit instead.',
      'The one exception is a whole food group. If dairy is the problem, talk to your midwife before cutting it out, because calcium and iodine are hard to replace from other foods.',
      '**Not sure which food it is?** Keep a food and symptom diary for a week: what you ate, and how you felt afterwards. A pattern usually shows up.',
      'If you are bloated often, very bloated, or it does not go away, tell your midwife or GP. They can refer you to an NHS dietitian.',
      'Wind can be uncomfortable, but it is not the same as severe or constant tummy pain. Pain like that needs a call to your maternity unit, not a change of diet.',
    ],
    sourceIds: [
      'wastyk-2021',
      'nhs-foods-to-avoid',
      'kombucha-ethanol',
      'nhs-alcohol',
      'nhs-probiotics',
      'worcs-high-fibre',
      'nhs-flatulence',
      'nhs-bloating',
    ],
  },
  {
    id: 'eat-for-two',
    section: 'nutrition',
    title: 'You don’t need to "eat for two"',
    summary:
      'A normal varied diet is enough until the third trimester, and even then it’s about 200 extra calories.',
    body: [
      'A normal, varied diet is enough until the third trimester, when about 200 extra calories a day is recommended, roughly two slices of bread.',
      'No calorie counting, no weight-gain target. Intentional weight loss isn’t recommended in pregnancy, whatever your starting weight.',
    ],
    sourceIds: ['sacn-2026', 'nice-ng247'],
    emphasis: 'calm',
  },
  {
    id: 'intake-gaps',
    section: 'nutrition',
    title: 'The gaps that actually matter',
    summary:
      'Fruit, veg and fibre are where UK diets genuinely fall short. Protein already isn’t a gap.',
    body: [
      'Protein is in the table deliberately, to show it *isn’t* a gap. Most people already get 147% of the target, so there’s no need to chase more.',
      'Try adding one extra portion of veg today, and swapping a refined grain for a wholegrain where you can.',
    ],
    table: {
      head: ['Target', 'Aim', 'UK average', 'Hitting it'],
      rows: [
        ['Fruit & veg', '5/day', '3.8', '27%'],
        ['Fibre', '30g', '17.2g', '4%'],
        ['Free sugars', '≤5%', '11.7%', '13%'],
        ['Protein', '45g', '66g', 'already exceeded'],
      ],
    },
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'oily-fish',
    section: 'nutrition',
    title: 'Oily fish & omega-3',
    summary: 'Two portions of fish a week, one oily. One of the widest gaps in the whole UK diet.',
    body: [
      'Two portions of fish a week (140g each), at least one oily: salmon, mackerel, sardines. This is one of the widest gaps in the whole UK diet: average intake is around 42g a week against a 140g target, and 77% of women ate no oily fish at all across a four-day survey.',
      'Oily fish is the main dietary source of long-chain omega-3 fats, important for your baby’s brain and eye development. The UK recommendation is 0.45g/day, which two portions is designed to deliver.',
      'There are safety limits on some fish. See Food safety for the specifics on tuna, shark, swordfish and marlin.',
    ],
    sourceIds: ['sacn-2026'],
  },
  {
    id: 'iron-anaemia',
    section: 'nutrition',
    title: 'Iron & anaemia',
    summary:
      'Iron needs rise substantially. Eating meat less than weekly more than doubles anaemia risk.',
    body: [
      'Iron needs rise substantially in pregnancy to support your increased blood volume and growing baby. Meat, especially red meat, provides a well-absorbed (heme) form, and women eating meat once a week or less have been found to have over double the risk of anaemia (OR 2.02).',
      'Other sources: pulses, fortified cereals, dark leafy greens. Pair with vitamin C to boost absorption.',
    ],
    sourceIds: ['iannotti-2024'],
  },
  {
    id: 'red-meat-quality',
    section: 'nutrition',
    title: 'Grass-fed red meat: worth it, if you can',
    summary:
      'A slightly better fat profile. Identical iron and B12, which is the actual reason to eat it.',
    body: [
      'Grass-fed and grass-finished beef has a modestly better fatty acid profile than grain-finished: more omega-3, a lower omega-6 to omega-3 ratio, and more vitamin E and beta-carotene. That difference is real and consistently measured.',
      'It is also small in absolute terms. Beef is not a meaningful omega-3 source either way. **One portion of oily fish does more for your omega-3 intake than switching every steak you eat**. If you only change one thing, change that one.',
      '**The iron, protein, B12 and zinc are the same regardless of how the animal was fed**, and iron is the actual reason red meat matters in pregnancy. Nothing your baby needs is riding on this choice.',
      'A labelling point worth knowing: in the UK, "grass-fed" does not guarantee **grass-finished**. Many cattle are grass-raised and then grain-finished, and the label still applies. Pasture for Life certification is the one that guarantees a 100% grass diet.',
      'So: if it is affordable and available, it is a reasonable preference with no downside. If it is not, and it is consistently more expensive, you are not missing anything. Ordinary red meat, cooked through, does the job it needs to do here.',
    ],
    sourceIds: ['daley-2010-grassfed', 'iannotti-2024', 'sacn-2026', 'nhs-foods-to-avoid'],
  },
  {
    id: 'dairy-iodine',
    section: 'nutrition',
    title: 'Dairy: birth weight & iodine',
    summary:
      'Linked to healthier birth weight, and a main UK source of the iodine your baby needs for brain development.',
    body: [
      'A review of 14 studies and 111,184 pregnant women linked higher dairy intake to higher birth weight (+51g), longer infant length, and reduced risk of small-for-gestational-age (OR 0.69) and low birth weight (OR 0.63). A separate dose-response analysis of 42 studies found the same pattern.',
      'Dairy is also a main UK source of **iodine**, contributing around 27% of dietary intake, which your baby needs for brain development. Iodine shortfall has re-emerged in the UK, partly because there’s no mandatory fortification here. If you eat little dairy or follow a plant-based diet, worth asking your midwife about.',
      'More isn’t automatically better: very high intake was linked to a slightly increased chance of a larger baby (OR 1.11).',
    ],
    sourceIds: ['iannotti-2024', 'dairy-dose-response', 'razmpoosh-2025'],
  },
  {
    id: 'dairy-fat-level',
    section: 'nutrition',
    title: 'Full-fat or lower-fat dairy?',
    summary:
      'UK guidance says lower-fat. Newer evidence is less certain, and calcium and iodine are identical either way.',
    body: [
      'UK guidance (NHS and the British Heart Foundation) favours lower-fat dairy, to help control calories and saturated fat. That is the line your midwife will be working from.',
      'Whether it is the whole story is discussed in the research. The idea put forward is the **dairy matrix**: that dairy fat may behave differently inside cheese or yoghurt than the same saturated fat eaten on its own. It is an open question rather than a finding, it has not been tested in pregnancy, and dairy research is frequently industry-funded. It is not a reason to go against UK guidance.',
      'A randomised trial from the University of Toronto is reported to have put this to the test: women ate three servings of full-fat dairy a day for twelve weeks. It is reported to have found no adverse effect on weight, body shape or cholesterol, some improvement in blood pressure, and higher intakes of calcium, protein and vitamin D. Because participants were randomised, a trial of that design would avoid the confounding that limits most of the observational dairy research.',
      '**We have not been able to verify that trial.** No DOI, journal or PubMed record has been supplied for it, so unlike everything else in this app you cannot open it and check it for yourself, and it was not a study in pregnancy. It is included because it may well be real, and left flagged because until it can be traced it is not something to act on. If you are weighing this up, weigh the UK guidance, which is checkable.',
      'What is not in question: **calcium, iodine and protein are the same regardless of fat level.** Nothing your baby needs from dairy is lost by choosing one over the other, so within the guidance, this is a reasonable choice to make on your own preference and goals.',
    ],
    sourceIds: [
      'nhs-dairy',
      'bhf-dairy',
      'thorning-2017-matrix',
      'razmpoosh-2025',
      'anderson-2026-dairy',
    ],
  },
];
