import type { Guide } from '../schema';

export const healthConditionGuides: Guide[] = [
  {
    id: 'conditions-overview',
    section: 'health-conditions',
    title: 'If you have an existing condition — start here',
    summary: 'See your specialist early. Never stop medication without asking.',
    body: [
      'If you have an existing health condition, the single most useful thing you can do is see your specialist or GP **as early as possible** — ideally before you conceive, or as soon as you find out you’re pregnant.',
      'Your care will usually involve a team (your specialist, an obstetrician, and your midwife) working together and planning ahead, rather than you having to coordinate everything yourself. This is standard practice, not a sign your case is especially worrying.',
      '**The one rule that applies across every condition here:** never stop or change your regular medication without talking to your specialist first. Stopping can be more dangerous than continuing, even when a medicine feels like something you "shouldn’t" take in pregnancy.',
    ],
    sourceIds: ['nice-ng121'],
    emphasis: 'calm',
  },
  {
    id: 'asthma',
    section: 'health-conditions',
    title: 'Asthma',
    summary: 'Keep taking your preventer inhaler — stopping raises low birthweight risk.',
    body: [
      'Pregnancy can make asthma better, worse, or leave it unchanged — there’s no way to predict which. Tell your GP, asthma nurse and midwife as soon as you know you’re pregnant.',
      '**Keep taking your usual medicines, including your preventer inhaler** — stopping increases the risk of low birthweight. It’s also safe to continue asthma treatment while breastfeeding.',
      '**Call your GP, asthma nurse or 111 immediately if:** you’re using your reliever inhaler more than usual, coughing or wheezing more (especially at night), or feeling breathless or tight-chested. **Call 999** if you’re having an attack and don’t have your inhaler, feel worse despite using it, or don’t improve after 10 puffs.',
      'Asthma attacks in labour are rare; use your reliever as normal if needed.',
    ],
    sourceIds: ['nhs-asthma-pregnancy'],
  },
  {
    id: 'congenital-heart',
    section: 'health-conditions',
    title: 'Congenital heart disease',
    summary: 'See your cardiologist before conceiving, even if you haven’t needed one for years.',
    body: [
      'If you were born with a heart condition, see your cardiologist before trying to conceive, even if you haven’t needed one for years — pregnancy puts real strain on the heart. You’ll be cared for by a team including a cardiologist, obstetrician and midwife, sometimes at a specialist cardiac pregnancy clinic.',
      'Depending on your specific condition, there’s a chance your baby could inherit it — worth discussing with a specialist. You’ll get regular growth scans, as some conditions can affect how well nutrients reach your baby.',
      'Labour and birth plans are individual to your condition — a caesarean isn’t automatic just because you have heart disease, but an assisted delivery to reduce pushing strain is common.',
    ],
    sourceIds: ['nhs-chd-pregnancy'],
  },
  {
    id: 'coronary-heart',
    section: 'health-conditions',
    title: 'Coronary heart disease',
    summary: 'Low-dose aspirin is safe to continue. Know the 999 signs.',
    body: [
      'Your heart works harder in pregnancy, so pre-pregnancy counselling with your cardiologist matters if you have or are at risk of coronary heart disease.',
      '**Urgent GP appointment or 111 for:** chest pain or breathlessness that comes and goes. **Call 999 for:** sudden chest pain spreading to arm, back, neck or jaw · chest tightness · pain with sweating or nausea — possible heart attack.',
      'Low-dose aspirin is safe to continue if prescribed. Never stop any heart medication without checking first — some may need adjusting for pregnancy, but stopping abruptly carries its own risk.',
    ],
    sourceIds: ['nhs-coronary-pregnancy'],
  },
  {
    id: 'diabetes',
    section: 'health-conditions',
    title: 'Diabetes (type 1 or type 2)',
    summary: 'Ask for a pre-conception clinic. You need 5mg folic acid, not 400mcg.',
    body: [
      'Good control before and during pregnancy substantially reduces risks. Ask for a **pre-conception clinic referral** before trying to conceive; aim for an HbA1c under 48mmol/mol beforehand if possible.',
      'Take **5mg folic acid** daily until 12 weeks — a higher, prescription-only dose than the standard 400mcg.',
      'Treatment often changes in pregnancy — tablets are commonly swapped for insulin. You’ll be offered more frequent monitoring and diabetic eye screening, since eye complications carry higher risk in pregnancy specifically.',
      'Birth is recommended in hospital with a consultant-led team; induction may be advised if there’s a risk of your baby growing very large. After birth, feed your baby within 30 minutes to help stabilise their blood sugar — they’ll get a heel-prick test to check.',
      'This section covers pre-existing diabetes, not gestational diabetes.',
    ],
    sourceIds: ['nhs-diabetes-pregnancy'],
  },
  {
    id: 'epilepsy',
    section: 'health-conditions',
    title: 'Epilepsy',
    summary: 'Stopping suddenly is often more dangerous than continuing. Specialist decision.',
    body: [
      'Most people with epilepsy have healthy pregnancies, but seizure frequency can change unpredictably. See a specialist before conceiving if possible.',
      'Some epilepsy medicines carry risks to your baby’s development — but **stopping suddenly is often more dangerous than continuing**, so this is a decision for your specialist, not something to do alone.',
      '**Urgent help needed if:** you’re pregnant and haven’t yet discussed it with a specialist · vomiting is affecting your medicine’s effectiveness · your seizures have changed. **Call 999 if:** a seizure lasts longer than usual or over 5 minutes, or you don’t recover normally between seizures.',
      'Breastfeeding while on epilepsy medicine is usually fine — check with your specialist.',
    ],
    sourceIds: ['nhs-epilepsy-pregnancy'],
  },
  {
    id: 'high-blood-pressure',
    section: 'health-conditions',
    title: 'High blood pressure',
    summary: 'Some BP medicines need switching before or as soon as you conceive.',
    body: [
      'Hypertension in pregnancy is 140/90–159/109; severe is 160/110 or above and needs treatment. Your midwife checks this at every appointment.',
      'If you’re already on blood pressure medication and planning pregnancy, **talk to your GP first** — some medicines aren’t safe in pregnancy and need switching before or as soon as you conceive.',
      'Watch for pre-eclampsia, a related but distinct condition affecting the placenta, usually after 20 weeks — this connects directly to the swelling, headache and vision red flags in Get Help.',
      'In labour, blood pressure is monitored hourly (every 15–30 minutes if severe); this alone doesn’t rule out a vaginal birth. You’ll get a dedicated blood pressure check 2 weeks after birth, in addition to your normal 6-week check.',
    ],
    sourceIds: ['nhs-bp-pregnancy'],
  },
];

export const vaccinationGuides: Guide[] = [
  {
    id: 'vaccines-recommended',
    section: 'vaccinations',
    title: 'The three recommended vaccines',
    summary: 'Flu, whooping cough and RSV — all free, all safe, all needed every pregnancy.',
    body: [
      '**Flu vaccine** — recommended at any stage, free on the NHS. Pregnancy weakens immune response, raising the risk of flu complications and hospital admission. Flu in pregnancy is also linked to premature birth, low birthweight and stillbirth. Protection passes to your baby for their first few months. Not a live virus — it can’t give you flu. Needed every year.',
      '**Whooping cough vaccine** — given around 20 weeks (from 16 weeks), ideally before 32 weeks for the best transfer of protection. Your antibodies cross the placenta and protect your baby until their own vaccination at 8 weeks. Not live. UK safety monitoring of around 20,000 women, published in the BMJ, found no evidence of risk. **Needed every pregnancy** — protection doesn’t carry over.',
      '**RSV vaccine** — offered around your 28-week appointment. Protects your baby against severe RSV, a common virus that’s usually mild but can cause serious lung infections in babies, for their first 6 months.',
      '**You can have more than one at once.** Don’t delay any of them just to combine appointments.',
    ],
    sourceIds: ['nhs-vaccinations-pregnancy', 'nhs-flu-jab', 'nhs-whooping-cough', 'govuk-rsv'],
    emphasis: 'calm',
  },
  {
    id: 'vaccines-live-travel',
    section: 'vaccinations',
    title: 'Live vaccines, travel and malaria',
    summary: 'Live vaccines are usually postponed. Malaria is genuinely serious in pregnancy.',
    body: [
      '**Live vaccines** — MMR, BCG, oral typhoid and yellow fever are usually postponed until after birth. There’s a theoretical risk, though no evidence of birth defects has been found. Occasionally a live vaccine may still be recommended if the risk of the actual infection is judged higher — a discussion with your midwife or GP, not a decision to make alone.',
      '**Travel vaccines:** best to avoid travel to areas needing vaccination while pregnant if possible. If unavoidable, discuss risks and benefits with your GP — untreated infection is often more dangerous to your baby than the vaccine.',
      '**Malaria** is particularly serious in pregnancy, potentially fatal for both of you. Avoid affected areas if you can. If travel is unavoidable, antimalarial tablets are available — the choice depends on destination, pregnancy stage and your history, so this needs proper medical guidance, not self-selection. Bite prevention matters regardless: pregnancy-safe repellent, covering skin dusk to dawn, and sleeping under a net.',
    ],
    sourceIds: ['nhs-vaccinations-pregnancy', 'nhs-travel'],
  },
];
