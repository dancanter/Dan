import type { Guide } from '../schema';

/**
 * Twins and triplets.
 *
 * The app had nothing on this, and a multiple pregnancy is not a singleton
 * pregnancy with more scans — the monitoring schedule, the birth timing and
 * the things that can go wrong are all genuinely different, and they hinge
 * on one fact established at the first scan.
 *
 * Every figure here is from NICE NG137 and was checked against the guideline
 * itself rather than a summary of it. Two numbers that were offered for this
 * section are not here, because they could not be verified: the proportion of
 * twins arriving before 37 weeks, and of triplets before 35. Both would have
 * been rhetorically useful and neither is worth guessing.
 *
 * The tone rule for this section is the same as the rest of the app, and
 * matters more here. Multiple pregnancy comes with a lot of monitoring, and
 * monitoring is easy to write in a way that reads as constant alarm. More
 * appointments is what good care looks like here, not evidence that something
 * is wrong.
 */
export const multiplesGuides: Guide[] = [
  {
    id: 'chorionicity',
    section: 'multiples',
    title: 'Chorionicity: the thing your first scan is really establishing',
    summary: 'Whether they share a placenta matters more than whether they are identical.',
    body: [
      'At the scan between 11 and 14 weeks, alongside dating and screening, your team works out whether your babies each have their own placenta or share one. This is called chorionicity, and it is the single fact that shapes the rest of your care.',
      'It matters more than whether the babies are identical, which is the thing everyone else will ask about. Sharing a placenta means sharing a blood supply, and that is what determines how closely you are monitored.',
      '**Dichorionic diamniotic (DCDA)**: separate placenta, separate sac each. All non-identical twins are this, and some identical ones.',
      '**Monochorionic diamniotic (MCDA)**: one shared placenta, separate sacs. Closer monitoring, because of the risks that come with a shared blood supply.',
      '**Monochorionic monoamniotic (MCMA)**: one placenta and one sac between them. Rare, and monitored the most closely of all.',
      'If nobody has told you which you are, ask. It determines your scan schedule and your planned birth date, so it is not a technicality.',
    ],
    sourceIds: ['nice-ng137'],
  },
  {
    id: 'multiples-monitoring',
    section: 'multiples',
    title: 'Why the scans are so much more frequent',
    summary: 'Fortnightly from 16 weeks if they share a placenta.',
    body: [
      'If your babies share a placenta, NICE says you should be scanned **every 14 days from 16 weeks until birth**. If they each have their own, scans should be **no more than 28 days apart**.',
      'That is a lot of appointments, and the reason is specific rather than general anxiety: the complications of a shared placenta are found on scans, not through symptoms. There is nothing you could feel that would tell you, which is exactly why the scanning is frequent.',
      'From 24 weeks, each scan also checks whether one baby is growing differently from the other, using several measurements plus the fluid around them.',
      'Your team should have specific experience of multiple pregnancy. This is a recognised part of the guidance, not a favour to ask for.',
    ],
    sourceIds: ['nice-ng137'],
  },
  {
    id: 'ttts',
    section: 'multiples',
    title: 'Twin-to-twin transfusion syndrome',
    summary: 'Around 15% of shared-placenta twins. Found on scans, not symptoms.',
    body: [
      'In monochorionic twins, the blood vessels the babies share in the placenta can connect unevenly, so one baby passes more blood to the other than it receives back. This is twin-to-twin transfusion syndrome, and it affects around **15% of monochorionic diamniotic pregnancies**.',
      'It is picked up on the routine fortnightly scans. You would not notice it yourself, which is the whole point of scanning that often.',
      'If it is found, you are referred to a specialist fetal medicine team. There are treatments, and being referred quickly is what the monitoring schedule exists to make possible.',
      'The same scans also watch for one baby growing more slowly than the other, and for twin anaemia polycythaemia sequence: a related problem with how blood is shared.',
    ],
    sourceIds: ['nice-ng137'],
  },
  {
    id: 'multiples-birth-timing',
    section: 'multiples',
    title: 'When birth is planned, and why it is earlier',
    summary: 'DCDA 37 weeks · MCDA 36 · MCMA 32–34 · triplets 35.',
    body: [
      'Multiple pregnancies are planned to end earlier than singleton ones, because the risk of stillbirth rises sooner. NICE sets these timings:',
      '**Dichorionic diamniotic twins: 37 weeks.** **Monochorionic diamniotic twins: 36 weeks**, earlier because the fetal death rate is consistently higher when a placenta is shared. **Monochorionic monoamniotic twins: between 32 and 34 weeks.** **Triplets with separate sacs: 35 weeks.**',
      'Triplets who share an amnion are not given a standard date. NICE says that timing should be decided with you individually, because there was no evidence to set a general rule from.',
      'If you would rather not have a planned birth at that point, that is a decision you are allowed to make. What changes is the monitoring: weekly appointments with an obstetrician, and a growth scan every fortnight instead.',
    ],
    sourceIds: ['nice-ng137'],
  },
  {
    id: 'multiples-mode-of-birth',
    section: 'multiples',
    title: 'Vaginal birth or caesarean: often genuinely your choice',
    summary: 'Both safe if four conditions are met. More than a third change route.',
    body: [
      'People often assume twins mean an automatic caesarean. NICE says that where all of these hold, planned vaginal birth and planned caesarean are both safe choices, and which one you have is yours to decide.',
      'If the first baby is not head-down at the time of planned birth, a caesarean is recommended.',
      '**What actually happens, so it is not a surprise.** More than a third of people who plan a vaginal birth end up having a caesarean. Almost everyone who plans a caesarean has one. And a small number who give birth to the first twin vaginally need an emergency caesarean for the second.',
      'None of those outcomes means something went wrong, or that the original plan was a mistake. They are the ordinary range of how twin births go, which is worth knowing beforehand rather than finding out on the day.',
    ],
    lists: [
      {
        title: 'All of these have to hold',
        items: [
          'The pregnancy is uncomplicated',
          'It has passed 32 weeks',
          'There is no obstetric reason to avoid labour',
          'The first baby is head-down',
          'There is no significant difference in size between the babies',
        ],
      },
    ],
    sourceIds: ['nice-ng137'],
  },
  {
    id: 'multiples-support',
    section: 'multiples',
    title: 'Support built for multiples',
    summary: 'Twins Trust, whose guidance NICE itself points to.',
    body: [
      'Twins Trust is the UK charity for families expecting or raising multiples. General pregnancy advice often does not fit a twin or triplet pregnancy, and they are the place where it does.',
      'Ask your team about antenatal classes specifically for multiple pregnancy. They exist in many areas and are a different thing from a standard course.',
    ],
    sourceIds: ['twins-trust', 'nice-ng137'],
  },
];
