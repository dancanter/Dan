import type { Guide } from '../schema';

export const everydaySafetyGuides: Guide[] = [
  {
    id: 'dental',
    section: 'everyday-safety',
    title: 'Dental care — and it’s free',
    summary: 'Free NHS dental care throughout pregnancy and for 12 months after.',
    body: [
      'Pregnancy hormones increase your risk of gum disease, sensitive teeth and toothache — plaque builds up more easily, and morning sickness (stomach acid on teeth) adds to it. Keep up brushing twice daily, daily flossing, and don’t skip check-ups.',
      '**Free NHS dental care** — you’re entitled to it throughout pregnancy and for **12 months after your baby’s birth**. Ask your midwife, GP or health visitor for a Maternity Exemption Certificate application form. It covers check-ups, hygiene appointments, fillings, extractions and root canal treatment.',
      'Proof you’ll need: a valid maternity exemption certificate, your MatB1 certificate, or your baby’s birth certificate once born.',
      'Toothache in pregnancy — get it checked rather than waiting. Most dental treatment is safe in pregnancy; you just need to tell your dentist you’re pregnant.',
    ],
    sourceIds: ['nhs-free-dental', 'bupa-dental'],
    emphasis: 'calm',
  },
  {
    id: 'sex-in-pregnancy',
    section: 'everyday-safety',
    title: 'Sex in pregnancy',
    summary: 'Safe unless you’ve been told otherwise. It can’t reach or harm your baby.',
    body: [
      'Sex is safe throughout pregnancy unless your midwife or doctor has specifically told you otherwise. It can’t physically reach or harm your baby. Changes in your sex drive — in either direction — are completely normal.',
      'Sex and orgasm don’t increase miscarriage or early labour risk in a normal, uncomplicated pregnancy. Later on, orgasm or sex can trigger Braxton Hicks (practice) contractions — your womb tightening — which feel odd but aren’t a concern; lying down or a few slow breaths usually settles them.',
      '**Avoid sex if:** you’ve had bleeding this pregnancy · your waters have broken · there’s a known problem with your cervix · you’re carrying twins or have a history of early labour and you’re in later pregnancy. Your midwife will tell you if any of these apply to you specifically.',
      'If either partner has sex outside the relationship, use a condom to protect against STIs.',
      'You’ll likely need to experiment with positions as pregnancy progresses — lying on your side tends to work better than positions with deep penetration or lying on your back.',
    ],
    sourceIds: ['nhs-wales-sex'],
  },
  {
    id: 'chemicals-pollution',
    section: 'everyday-safety',
    title: 'Chemicals and air pollution — the calm version',
    summary: 'Everyday exposure is very low risk. Two indoor things genuinely matter.',
    body: [
      'There’s **no official guidance to avoid all chemicals or pollution in pregnancy** — for most people, day-to-day exposure carries very low risk, and it’s largely outside your control anyway. High-level, sustained exposure is what the research actually links to problems, not living near a road or using ordinary cleaning products.',
      '**Outdoor air:** avoid intense outdoor exercise on high-pollution days — move it indoors or away from busy roads. Face masks generally don’t help, as even charcoal-filter ones miss the smallest, most harmful particles.',
      '**Smoking and secondhand smoke** — the single biggest indoor risk; genuinely linked to premature birth, low birthweight and SIDS. Ask household smokers to go outside.',
      '**Carbon monoxide** — the most serious hidden indoor risk, being odourless and tasteless. Get cookers and heaters serviced on schedule, don’t block vents or chimneys, and fit a CO alarm.',
      '**Cleaning products:** modern ones are low-risk used as directed. Ventilate, wear gloves, take extra care with oven cleaner, and **never mix cleaning products** — bleach with ammonia, or bleach with acid, both release genuinely dangerous gases. That’s a hard rule, not extra caution.',
      'If there’s someone else in the house, the strong-smelling jobs — oven cleaner, bathroom sprays, anything that makes you cough — are a fair thing to hand over. If there isn’t, they’re still fine to do yourself: open a window, wear gloves, and don’t linger over them.',
      '**Painting:** modern water-based paint is low-risk. Avoid solvent-based paint and paint stripping. Ventilate well and wear gloves.',
      '**At work:** your employer must risk-assess your workplace early in pregnancy. Ask for chemical data sheets if you’re concerned, and contact Acas if you feel unsupported.',
    ],
    sourceIds: ['tommys-chemicals'],
  },
  {
    id: 'diy-safety',
    section: 'everyday-safety',
    title: 'DIY and renovation',
    summary: 'One job to hand over entirely: stripping old paint in pre-1980 homes.',
    body: [
      '**Get someone else to do these:**',
      'Sanding, scraping or heat-stripping old paint in homes built before around 1980 — risk of lead dust (no safe exposure level in pregnancy) and possible asbestos in some materials. This is a firm hand-it-over, not a be-careful.',
      'Climbing ladders or high step stools — pregnancy shifts your balance, and falls are a real, avoidable risk. Heavy lifting alone, too.',
      '**Fine with precautions:** general decorating with water-based, low-VOC paint in a ventilated room, with gloves · dusty jobs with a proper mask, good ventilation, and a filtered vacuum rather than dry-sweeping · gardening with gloves always, since soil can carry toxoplasmosis risk.',
      '**Cat litter:** ideally someone else does it. If you must — disposable gloves, change daily (the parasite isn’t infectious until 1–5 days after it’s passed), and wash hands thoroughly.',
      '**Get checked if** you’ve had significant exposure to lead dust, strong solvents or fumes, or develop a persistent cough, chest tightness, headache or breathlessness after a DIY task.',
    ],
    sourceIds: ['tommys-chemicals', 'nhs-infections'],
  },
];

export const skincareGuides: Guide[] = [
  {
    id: 'hair-treatments',
    section: 'skincare',
    title: 'Hair dye, relaxing and hair removal',
    summary: 'Dye is considered safe. Waxing and shaving fine. Laser — wait.',
    body: [
      '**Hair dye** is considered safe — very little is absorbed through the scalp. Some suggest waiting until after 12 weeks as extra caution, though the actual risk is thought to be very small. Tell your hairdresser you’re pregnant and ask for a patch test, as skin can react differently during pregnancy.',
      'At home: consider semi-permanent vegetable dye, patch test first, wear gloves, use a well-ventilated room, apply for the minimum time and rinse thoroughly. Highlighting (dye on strands, not scalp) reduces exposure further.',
      '**Hair relaxing/straightening:** studies of Black pregnant women using hair relaxers found no increased risk of prematurity or low birthweight. Treating hair 3–4 times across a pregnancy isn’t thought to carry meaningful risk. Patch test first.',
      '**Hair removal:** waxing, shaving, depilatory creams and hair bleaching are all considered safe throughout pregnancy and breastfeeding. Permanent removal (electrolysis, laser) isn’t well enough studied — best delayed until after pregnancy.',
    ],
    sourceIds: ['nct-beauty-treatments', 'putra-2022-topical'],
  },
    {
    id: 'skincare-ingredients',
    section: 'skincare',
    title: 'Skincare ingredients — what to avoid, what’s fine',
    summary: 'Retinoids are the real one. Most other actives are fine.',
    body: [
      '**Retinoids are the one to avoid.** That means tretinoin, adapalene and tazarotene. Animal studies show a risk of malformation at high doses. Two human studies of women who used it early by accident found no clear pattern of harm — but the safest position is still to avoid it for the whole pregnancy.',
      'If you used it before you knew you were pregnant, the risk looks low. Mention it to your midwife rather than worrying on your own.',
      '**Use sparingly:** strong salicylic acid, or covering large areas with it. Small patches are fine, which covers most face washes and spot treatments.',
      '**Sunscreen.** Mineral sunscreen is the safest pick, because it sits on the skin rather than soaking in. Look for titanium dioxide or zinc oxide. Chemical sunscreen is still considered safe. Mineral is just the more cautious choice.',
      '**For acne.** Azelaic acid, benzoyl peroxide, and erythromycin or clindamycin creams are all fine. Avoid retinoids, in any form. Avoid tetracycline tablets such as doxycycline and minocycline. For worse acne, a short course of erythromycin tablets is usually safe — but that is your GP’s call, not a shelf decision.',
    ],
    lists: [
      {
        title: 'Fine to use — the evidence supports these',
        items: [
          'Azelaic acid. The best pregnancy-safe option for acne and dark patches',
          'Vitamin C and vitamin E',
          'AHAs, such as glycolic and lactic acid, up to the usual 10%',
          'Niacinamide',
        ],
      },
    ],
    sourceIds: ['nct-beauty-treatments', 'putra-2022-topical', 'bozzo-2011-cosmetics'],
  },
    {
    id: 'treatments-procedures',
    section: 'skincare',
    title: 'Massage, nails and cosmetic procedures',
    summary: 'Massage is genuinely beneficial. Fillers and tattoos — avoid.',
    body: [
      '**Massage is good for you in pregnancy.** It is linked to less stress and less discomfort. A few rules: skip deep tissue massage, because of the small chance of missing a clot. Do not lie flat on your back for long. Lying face down is fine with a pregnancy pillow or a proper table. Avoid massage straight onto your bump. Keep essential oils diluted to about 2%.',
      '**Nails are fine.** There is no guidance against nail treatments. Polish and gel sit on the outside and are not really absorbed. If you work as a nail technician, that is a question about ventilation at work — not a reason to skip a manicure.',
      '**Weight-loss injections.** The MHRA says stop GLP-1 medicines straight away if you are trying to conceive, or find out you are pregnant. Speak to your GP as soon as you can. We do not yet know if they are safe in pregnancy or while breastfeeding.',
    ],
    lists: [
      {
        title: 'Avoid entirely',
        items: [
          'Dermal fillers',
          'Liposuction',
          'Sclerotherapy for varicose veins',
          'Tattoos and microblading',
        ],
      },
      {
        title: 'Fine with a qualified practitioner',
        items: ['Botox', 'Some chemical peels', 'Laser and light therapy', 'Microdermabrasion'],
      },
    ],
    sourceIds: ['nct-beauty-treatments'],
  },
  {
    id: 'sun-sauna-tanning',
    section: 'skincare',
    title: 'Tanning, saunas and hot tubs',
    summary: 'Self-tan fine. Tanning pills — avoid. Saunas — general overheating caution.',
    body: [
      '**Sunbeds and tanning booths:** no evidence of harm to your baby specifically, but WHO advises against them for general skin cancer risk — that applies regardless of pregnancy.',
      '**Self-tan cream** is fine; patch test first. **Tanning pills: avoid** — potentially toxic. Tanning spray inhalation risk is unknown, so some caution is reasonable.',
      '**Saunas and hot tubs:** no clear evidence of harm, and some countries (Finland) use them commonly in pregnancy with no higher complication rates. If used, safer after 12 weeks, for shorter periods, at lower temperatures. General overheating caution applies, same as with exercise.',
    ],
    sourceIds: ['nct-beauty-treatments'],
  },
  {
    id: 'skin-changes',
    section: 'skincare',
    title: 'Pregnancy skin changes — reassurance',
    summary: 'Melasma, linea nigra, skin tags — common, and they fade.',
    body: [
      '**Melasma ("mask of pregnancy")** — patchy facial darkening, affects up to 70% of women, fades within a year in most. Sun protection helps prevent it worsening.',
      '**Linea nigra** — the dark line down the belly, affects around 9 in 10 women, fades after birth.',
      '**Skin tags and scars** can increase or darken in pregnancy; removal should wait unless there’s a real reason not to.',
      '**Stretch marks** — no cream or oil is proven to prevent them. A moisturiser can ease the itching and discomfort as skin stretches. They fade but don’t fully disappear, and they aren’t something you need to fix.',
    ],
    sourceIds: ['nct-beauty-treatments'],
  },
];
