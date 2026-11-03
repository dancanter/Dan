import type { Guide } from '../schema';

export const healthConditionGuides: Guide[] = [
  {
    id: 'conditions-overview',
    section: 'health-conditions',
    title: 'If you have an existing condition: start here',
    summary: 'See your specialist early. Never stop medication without asking.',
    body: [
      'If you have a health condition already, see your specialist or GP **as early as you can**. Before you conceive is best. As soon as you find out is the next best thing.',
      'A team will usually look after you: your specialist, an obstetrician and your midwife. They plan together, so you are not left to join it all up yourself. This is normal practice. It does not mean your case is worrying.',
      '**One rule covers every condition here: never stop or change your medicine without asking your specialist first.** Stopping can be more dangerous than carrying on. That holds even when a medicine feels like something you should not take.',
    ],
    sourceIds: ['nice-ng121'],
    emphasis: 'calm',
  },
  {
    id: 'asthma',
    section: 'health-conditions',
    title: 'Asthma',
    summary: 'Keep taking your preventer inhaler: stopping raises low birthweight risk.',
    body: [
      'Pregnancy can make asthma better, worse, or leave it unchanged. There’s no way to predict which. Tell your GP, asthma nurse and midwife as soon as you know you’re pregnant.',
      '**Keep taking your usual medicines, including your preventer inhaler**: stopping increases the risk of low birthweight. It’s also safe to continue asthma treatment while breastfeeding.',
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
      'If you were born with a heart condition, see your cardiologist before you try to conceive. Do this even if you have not needed one for years. Pregnancy puts real strain on the heart.',
      'A team will care for you: a cardiologist, an obstetrician and a midwife. Some areas have a specialist heart clinic for pregnancy.',
      'Your baby may inherit the condition, depending on which one you have. Ask your specialist about this. You will also be offered regular growth scans, as some conditions affect how well nutrients reach your baby.',
      'Your birth plan will be built around your condition. A caesarean is not automatic. An assisted birth is common, because it means less pushing.',
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
      '**Urgent GP appointment or 111 for:** chest pain or breathlessness that comes and goes. **Call 999 for:** sudden chest pain spreading to arm, back, neck or jaw · chest tightness · pain with sweating or nausea: possible heart attack.',
      'Low-dose aspirin is safe to continue if prescribed. Never stop any heart medication without checking first. Some may need adjusting for pregnancy, but stopping abruptly carries its own risk.',
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
      'Take **5mg folic acid** daily until 12 weeks: a higher, prescription-only dose than the standard 400mcg.',
      'Treatment often changes in pregnancy: tablets are commonly swapped for insulin. You’ll be offered more frequent monitoring and diabetic eye screening, since eye complications carry higher risk in pregnancy specifically.',
      'Birth is recommended in hospital with a consultant-led team; induction may be advised if there’s a risk of your baby growing very large. After birth, feed your baby within 30 minutes to help stabilise their blood sugar. They’ll get a heel-prick test to check.',
      'This entry is about diabetes you had before pregnancy. Gestational diabetes, diabetes that starts in pregnancy, has its own entries below.',
    ],
    sourceIds: ['nhs-diabetes-pregnancy'],
  },
  {
    id: 'gdm-managing',
    section: 'health-conditions',
    title: 'Gestational diabetes: what managing it involves',
    summary: 'Testing, food, and sometimes medicine. Needing medicine is not failing.',
    body: [
      'Gestational diabetes is diabetes that starts in pregnancy. Keeping your blood sugar in range is what lowers the chance of problems, so most of the treatment is about that.',
      '**Testing.** You will be given a kit and shown how to prick your finger and test a drop of blood. Usually that is before breakfast and one hour after each meal. Your team will tell you the level to aim for and how to share your readings with them.',
      '**Food.** You should be referred to a dietitian. The usual advice is to eat regularly (often three meals a day, without skipping) and to choose starchy foods that release sugar slowly. You do not need a completely sugar-free diet.',
      '**Medicine, if needed.** If your levels are not stable after 1 to 2 weeks of changes to food and activity, you may be offered tablets, usually metformin, or insulin. The NHS is clear that blood sugar can rise as pregnancy goes on, so you may need medicine later even if things improved at first.',
      'That last point matters. Needing medicine is not a sign you got the diet wrong or did not try hard enough. It is how this condition often goes.',
      'If you take insulin, your team will explain low blood sugar (hypoglycaemia): feeling shaky, sweaty or hungry, going paler, or finding it hard to concentrate. Test and treat it straight away.',
    ],
    lists: [
      {
        title: 'Foods that release sugar slowly',
        items: [
          'Wholewheat pasta and brown rice',
          'Granary bread',
          'Pulses, beans and lentils',
          'Plain porridge, muesli and all-bran cereals',
        ],
      },
      {
        title: 'Swaps that help',
        items: [
          'Fruit, nuts or seeds instead of cakes and biscuits',
          'Diet or sugar-free drinks instead of sugary ones',
          'Checking the label on fruit juice, smoothies and "no added sugar" drinks, which can still be high in sugar',
        ],
      },
    ],
    sourceIds: ['nhs-gdm-treatment'],
  },
  {
    id: 'gdm-birth',
    section: 'health-conditions',
    title: 'Gestational diabetes: scans, birth and the first hours',
    summary: 'Extra growth scans, and birth usually between 38 and 40 weeks.',
    body: [
      'You should be offered extra scans to check your baby’s growth and the amount of fluid around them, at around 28, 32 and 36 weeks, with regular checks from 38 weeks.',
      'Birth is usually best between 38 and 40 weeks. If your blood sugar is in range and all is well, you may be able to wait for labour to start. If you have not given birth by 40 weeks and 6 days, you will usually be offered an induction or a caesarean. Earlier birth may be suggested if there are concerns.',
      'You should give birth in a hospital with staff trained to care for your baby. **Take your testing kit and any medicines with you**, and keep testing until you are in established labour, or until you are told to stop eating before a caesarean.',
      '**After birth:** feed your baby as soon as you can, ideally within 30 minutes, then every 2 to 3 hours until their blood sugar is steady. Their blood sugar will be tested from 2 to 4 hours after birth. Usually you can see, hold and feed them straight away.',
      'Your own diabetes medicines are usually stopped after the birth.',
    ],
    sourceIds: ['nhs-gdm-treatment'],
  },
  {
    id: 'gdm-after',
    section: 'health-conditions',
    title: 'Gestational diabetes: the part that lasts after birth',
    summary: 'A test at 6 to 13 weeks, then once a year. And free help to lower the risk.',
    body: [
      'Gestational diabetes usually goes after the birth. But it tells you something useful about the future, and this is the part people are most often not told.',
      '**You should have a blood test for diabetes 6 to 13 weeks after giving birth.** A small number of people still have raised blood sugar afterwards. If the result is normal, you will usually be advised to have a test **once a year**.',
      'That is because having had gestational diabetes raises your risk of type 2 diabetes later in life. It is a risk, not a certainty, and it is one you can do something about.',
      '**In England, the NHS Diabetes Prevention Programme** offers help with food, activity and weight to people who have had gestational diabetes, and you can refer yourself. It is one of the few places in this app where there is a free, specific thing you can sign up to that lowers a long-term risk. In Scotland, Wales and Northern Ireland, ask your GP what is offered locally.',
      'If the 6-to-13-week test is not mentioned at your postnatal check, ask for it.',
    ],
    sourceIds: ['nhs-gdm-treatment', 'nhs-dpp-gdm'],
  },
  {
    id: 'epilepsy',
    section: 'health-conditions',
    title: 'Epilepsy',
    summary: 'Stopping suddenly is often more dangerous than continuing. Specialist decision.',
    body: [
      'Most people with epilepsy have healthy pregnancies. Seizures can become more or less frequent, and there is no way to predict which. See a specialist before you conceive if you can.',
      'Some epilepsy medicines carry risks to your baby. But **stopping suddenly is often more dangerous than carrying on.** This is a decision for your specialist, not one to make alone.',
      'Breastfeeding while taking epilepsy medicine is usually fine. Check with your specialist.',
    ],
    lists: [
      {
        title: 'Get help urgently if',
        items: [
          'You are pregnant and have not yet spoken to a specialist',
          'You are being sick, and it is stopping your medicine working',
          'Your seizures have changed',
        ],
      },
      {
        title: 'Call 999 if',
        items: [
          'A seizure lasts longer than usual, or more than 5 minutes',
          'You do not recover as you normally would between seizures',
        ],
      },
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
      'If you’re already on blood pressure medication and planning pregnancy, **talk to your GP first**. Some medicines aren’t safe in pregnancy and need switching before or as soon as you conceive.',
      'Watch for pre-eclampsia, a related but distinct condition affecting the placenta, usually after 20 weeks. This connects directly to the swelling, headache and vision red flags in Get Help.',
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
    summary: 'Flu, whooping cough and RSV: all free, all safe, all needed every pregnancy.',
    body: [
      '**Flu vaccine**: recommended at any stage, free on the NHS. Pregnancy weakens immune response, raising the risk of flu complications and hospital admission. Flu in pregnancy is also linked to premature birth, low birthweight and stillbirth. Protection passes to your baby for their first few months. Not a live virus: it can’t give you flu. Needed every year.',
      '**Whooping cough vaccine**: given around 20 weeks (from 16 weeks), ideally before 32 weeks for the best transfer of protection. Your antibodies cross the placenta and protect your baby until their own vaccination at 8 weeks. Not live. UK safety monitoring of around 20,000 women, published in the BMJ, found no evidence of risk. **Needed every pregnancy**: protection doesn’t carry over.',
      '**RSV vaccine**: offered around your 28-week appointment. Protects your baby against severe RSV, a common virus that’s usually mild but can cause serious lung infections in babies, for their first 6 months.',
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
      '**Live vaccines** are usually put off until after the birth. These are MMR, BCG, oral typhoid and yellow fever. The risk is a theoretical one: no birth defects have been found. Now and then a live vaccine is still advised, when the infection itself is the bigger risk. That is a conversation with your midwife or GP.',
      '**Travel vaccines.** If you can, avoid travelling somewhere that needs one. If you cannot, talk it through with your GP. An untreated infection is often more dangerous to your baby than the vaccine is.',
      '**Malaria is serious in pregnancy** and can be fatal for both of you. Avoid affected areas if at all possible.',
      'If you have to travel, there are tablets you can take. Which one depends on where you are going, how far along you are, and your health history, so this needs a doctor, not a shelf. Avoiding bites matters just as much: use a repellent that is safe in pregnancy, cover your skin from dusk to dawn, and sleep under a net.',
    ],
    sourceIds: ['nhs-vaccinations-pregnancy', 'nhs-travel'],
  },
];
