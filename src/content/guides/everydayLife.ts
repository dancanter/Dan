import type { Guide } from '../schema';

export const medicationGuides: Guide[] = [
  {
    id: 'golden-rules',
    section: 'medications',
    title: 'The two golden rules',
    summary: 'Check before starting anything new. Never stop a prescribed medicine without asking.',
    body: [
      '**1.** Check with your pharmacist, midwife or GP before taking anything new — prescribed, over-the-counter, or herbal.',
      '**2.** Never stop a medicine you’ve been prescribed without checking first. Stopping suddenly can be more harmful than continuing.',
    ],
    sourceIds: ['nhs-medicines'],
    emphasis: 'calm',
  },
  {
    id: 'paracetamol',
    section: 'medications',
    title: 'Paracetamol — and the autism question',
    summary: 'First-choice painkiller. The MHRA has confirmed there is no evidence it causes autism.',
    body: [
      'Paracetamol is the first-choice painkiller in pregnancy, taken at the lowest effective dose for the shortest time.',
      'The UK’s medicines regulator (MHRA) has confirmed paracetamol in pregnancy remains safe, and that there is **no evidence it causes autism**. If you’ve seen claims otherwise online, that’s the official position.',
    ],
    sourceIds: ['nhs-headaches', 'mhra-paracetamol'],
  },
      {
    id: 'meds-avoid',
    section: 'medications',
    title: 'What to avoid',
    summary: 'Ibuprofen and similar painkillers. Anything with codeine.',
    body: [
      'Avoid ibuprofen and painkillers like it. Avoid anything with codeine in it.',
      'The one exception is if your doctor has prescribed it for you.',
    ],
    sourceIds: ['nhs-headaches'],
    emphasis: 'warn',
  },
  {
    id: 'herbal',
    section: 'medications',
    title: 'Herbal & homeopathic remedies',
    summary: '"Natural" doesn’t automatically mean safe.',
    body: [
      '"Natural" doesn’t automatically mean safe. Some products aren’t tested to the same standard and can contain contaminants like lead.',
      'Tell your midwife or pharmacist if you’re using any, and avoid herbal remedies while trying to conceive. Complementary therapies can’t replace antenatal care.',
    ],
    sourceIds: ['nhs-medicines'],
  },
    {
    id: 'bumps',
    section: 'medications',
    title: 'Where to look something up',
    summary: 'The bumps website, or ask your GP to contact the UK Teratology Information Service.',
    body: [
      '**bumps** is a website with information on single medicines. The name is short for Best Use of Medicines in Pregnancy.',
      'If your medicine is not listed, ask your GP, midwife or pharmacist. They can contact the UK Teratology Information Service for you.',
    ],
    sourceIds: ['nhs-medicines'],
  },
];

export const alcoholSmokingGuides: Guide[] = [
  {
    id: 'alcohol',
    section: 'alcohol-smoking',
    title: 'Alcohol',
    summary: 'Safest not to drink at all. If you drank before you knew, try not to worry.',
    body: [
      'It’s safest not to drink at all. Alcohol crosses the placenta and your baby’s liver can’t process it. Drinking increases the risk of miscarriage, premature birth and low birthweight, and can cause fetal alcohol spectrum disorder (FASD).',
      'If you drank before realising you were pregnant — try not to worry. The risk is likely low. Stop for the rest of the pregnancy and mention it to your midwife if you’re concerned.',
      'Support: Drinkaware helpline 0300 123 1110 · We Are With You · Alcoholics Anonymous.',
    ],
    sourceIds: ['nhs-alcohol'],
  },
  {
    id: 'smoking',
    section: 'alcohol-smoking',
    title: 'Smoking',
    summary: 'Stopping at any point helps immediately. NRT can be prescribed and is far safer.',
    body: [
      'Stopping at any point benefits you and your baby immediately. It reduces the risk of complications, stillbirth, premature birth, low birthweight, and cot death. Even stopping in the last few weeks helps.',
      'Secondhand smoke matters too — if a partner or housemate smokes, it affects you and your baby, and makes quitting harder.',
      'Nicotine replacement therapy (patches, gum, spray) can be prescribed in pregnancy and is far safer than continuing to smoke. Stop-smoking tablets (varenicline, bupropion) are not recommended. Avoid liquorice-flavoured nicotine products.',
      '**National Smokefree helpline: 0300 123 1044.** You’re twice as likely to quit successfully with an adviser’s support.',
    ],
    sourceIds: ['nhs-smoking'],
  },
];

export const travelGuides: Guide[] = [
  {
    id: 'travel-when',
    section: 'travel',
    title: 'When and how to travel',
    summary: 'Mid-pregnancy is most comfortable. Check airline policies early.',
    body: [
      'Most women can travel safely well into pregnancy. Mid-pregnancy (4–6 months) tends to be most comfortable. Take your maternity notes with you.',
      '**Flying:** not harmful, but after 28 weeks airlines may want a letter confirming your due date, and most won’t fly you past 37 weeks (32 for twins). Check the airline’s policy early — letters can take weeks to get.',
      '**Long journeys (4+ hours):** drink plenty of water, move every 30 minutes, consider compression stockings — the clot risk is real.',
      '**Car:** the seatbelt goes with the lap strap under your bump, across your pelvis — never across the bump.',
      '**Insurance:** make sure it covers pregnancy-related care, premature birth, and changing your return date.',
    ],
    sourceIds: ['nhs-travel'],
  },
  {
    id: 'travel-health',
    section: 'travel',
    title: 'Vaccines, malaria & Zika',
    summary: 'Most live vaccines aren’t recommended. Check Zika risk before booking.',
    body: [
      'Most live vaccines aren’t recommended in pregnancy; non-live ones are safe. Some anti-malaria tablets aren’t safe — ask your GP.',
      '**Zika:** postpone non-essential travel to affected areas (parts of South/Central America, the Caribbean, Pacific islands, Africa, Asia). Check country-specific risk on TravelHealthPro before booking.',
    ],
    sourceIds: ['nhs-travel'],
  },
];

export const infectionGuides: Guide[] = [
  {
    id: 'infections-practical',
    section: 'infections',
    title: 'The practical steps that cover most of it',
    summary: 'Most are rare, and you’re screened for several at booking.',
    body: [
      'Most are rare, and you’re screened for several (HIV, hepatitis B, syphilis) at your booking appointment. The genuinely useful precautions:',
      '**Toxoplasmosis:** avoid emptying cat litter (or wear gloves and clean daily), wear gloves gardening, wash hands and all produce, avoid contact with newborn lambs.',
      '**CMV:** wash hands after nappy changes, don’t share food or cutlery with young children, kiss them on the head rather than the face. Particularly relevant if you work with young children.',
      '**Chickenpox:** if you’re not sure you’re immune and you’re exposed, speak to your GP immediately — a blood test can check.',
      '**Rubella:** tell your GP if you’re exposed or develop a rash. The MMR vaccine can’t be given in pregnancy, but you can have it at your 6-week postnatal check to protect future pregnancies.',
      '**STIs:** often symptomless but can affect your baby. Free, confidential testing at any sexual health clinic.',
    ],
    sourceIds: ['nhs-infections'],
  },
];
