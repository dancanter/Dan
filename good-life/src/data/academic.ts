export const PARAGRAPH_STEPS: { key: 'point' | 'evidence' | 'explain' | 'limitations' | 'compare' | 'evaluate' | 'link'; label: string; prompt: string; stems: string[] }[] = [
  { key: 'point', label: 'Point', prompt: 'One clear claim that answers part of the question.', stems: ['A key determinant of … is …', 'This essay argues that …'] },
  { key: 'evidence', label: 'Evidence', prompt: 'The strongest source for the claim — what it actually found, with a citation.', stems: ['A systematic review of … found that … (Author, Year).', 'NICE (Year) recommends …'] },
  { key: 'explain', label: 'Explain', prompt: 'Why the evidence supports the point — the mechanism or reasoning.', stems: ['This suggests … because …', 'The mechanism is likely …'] },
  { key: 'limitations', label: 'Limitations', prompt: 'What the evidence cannot show: design, sample, confounding, generalisability.', stems: ['However, as an observational study, it cannot establish causation …', 'The sample was limited to …, so …'] },
  { key: 'compare', label: 'Compare', prompt: 'Another source that agrees, disagrees or adds nuance.', stems: ['In contrast, … (Author, Year) reported …', 'This is consistent with …'] },
  { key: 'evaluate', label: 'Evaluate', prompt: 'Your judgement: how strong, how applicable, and what follows.', stems: ['On balance, the evidence indicates …', 'The weight of higher-quality evidence favours …'] },
  { key: 'link', label: 'Link', prompt: 'Tie back to the question and lead into the next paragraph.', stems: ['This highlights the importance of … which leads to …', 'Therefore, in relation to the question, …'] },
];

export const SOURCE_HIERARCHY: { level: string; examples: string; use: string }[] = [
  { level: 'Systematic reviews & meta-analyses', examples: 'Cochrane reviews; meta-analyses in BMJ, Lancet, AJPH', use: 'Best for "what does the evidence show overall".' },
  { level: 'Official guidance & reports', examples: 'WHO, NICE, UKHSA, OHID, Public Health Scotland, ONS', use: 'Best for policy, recommendations and population data.' },
  { level: 'Randomised controlled trials', examples: 'Individual RCTs', use: 'Best evidence that an intervention causes an effect.' },
  { level: 'Cohort & case-control studies', examples: 'Whitehall II, UK Biobank', use: 'Associations and risk factors — not causation on their own.' },
  { level: 'Qualitative research', examples: 'Interviews, focus groups', use: 'Lived experience, barriers, acceptability.' },
  { level: 'Module materials & textbooks', examples: 'OU module texts', use: 'Frameworks and definitions — support with primary evidence.' },
];

export const PH_TERMS: { term: string; def: string }[] = [
  { term: 'Incidence', def: 'New cases of a condition in a population over a defined period.' },
  { term: 'Prevalence', def: 'All existing cases at a point or over a period.' },
  { term: 'Relative risk', def: 'Risk in an exposed group divided by risk in an unexposed group.' },
  { term: 'Odds ratio', def: 'Ratio of the odds of an outcome in two groups; approximates relative risk when outcomes are rare.' },
  { term: 'Absolute risk reduction', def: 'The actual difference in risk between groups — often more meaningful than relative figures.' },
  { term: 'Confounding', def: 'A third variable associated with both exposure and outcome that distorts the apparent relationship.' },
  { term: 'Herd immunity', def: 'Indirect protection of unvaccinated people when enough of a population is immune.' },
  { term: 'Basic reproduction number (R₀)', def: 'Average number of secondary cases from one case in a fully susceptible population.' },
  { term: 'Social determinants of health', def: 'The conditions in which people are born, grow, live, work and age, shaping health outcomes.' },
  { term: 'Health inequality vs inequity', def: 'Inequality is any measurable difference; inequity is a difference that is unfair and avoidable.' },
  { term: 'Proportionate universalism', def: 'Universal action, with intensity proportionate to need (Marmot Review, 2010).' },
  { term: 'Inverse care law', def: 'Good medical care tends to vary inversely with the need for it (Tudor Hart, 1971).' },
  { term: 'Primary / secondary / tertiary prevention', def: 'Preventing disease onset / detecting it early / reducing its impact once established.' },
  { term: 'Upstream intervention', def: 'Acting on root causes (policy, environment) rather than individual behaviour.' },
  { term: 'Health promotion', def: 'Enabling people to increase control over and improve their health (Ottawa Charter, WHO 1986).' },
  { term: 'Surveillance', def: 'Ongoing systematic collection and analysis of health data to inform action.' },
  { term: 'Zoonosis', def: 'An infection transmitted from animals to humans.' },
  { term: 'Antimicrobial resistance (AMR)', def: 'When microorganisms evolve to survive the drugs designed to kill them.' },
  { term: 'Innate vs adaptive immunity', def: 'Fast, non-specific first-line defences vs slower, specific responses with memory (T and B cells).' },
  { term: 'Vaccine efficacy vs effectiveness', def: 'Performance under trial conditions vs in real-world populations.' },
];

export const AI_INTEGRITY = [
  'Use the coach to understand concepts, quiz yourself, plan, find sources to read, and get feedback on structure.',
  'Do not submit AI-generated text as your own. Write assessed work yourself, in your own words.',
  'Follow your module’s specific guidance on generative AI — check the module website and assessment guide; rules can differ between modules and change between presentations.',
  'If you use AI in a way your module permits, acknowledge it as the module requires.',
  'Verify every source the AI mentions in the OU Library before citing it — AI tools can invent references.',
];

export const CAREER_PATH: { stage: string; detail: string; links?: { label: string; url: string }[] }[] = [
  { stage: 'Now: build relevant experience', detail: 'Your NHS volunteering counts. Add structured experience: health-improvement projects, data/audit work, community health roles. Keep a portfolio of what you did, the skills it shows, and its impact.' },
  { stage: 'Part-time NHS or public-health roles while studying', detail: 'Look for Health Care Assistant, Health Improvement / Health Trainer, Public Health Assistant, research or data assistant roles (often Band 3–4). Local authority public-health teams and voluntary-sector health charities hire too.', links: [{ label: 'NHS Jobs', url: 'https://www.jobs.nhs.uk/' }] },
  { stage: 'Public health practitioner', detail: 'After graduating, practitioner roles (health improvement, health protection, intelligence). The UK Public Health Register offers practitioner registration, which strengthens later applications.', links: [{ label: 'UK Public Health Register', url: 'https://ukphr.org/' }] },
  { stage: 'Public Health Specialty Training', detail: 'A national, competitive ~5-year programme leading to consultant level, open to doctors and to graduates from other backgrounds who meet the eligibility criteria (check the current person specification for experience requirements). It includes a Master of Public Health and Faculty of Public Health examinations.', links: [{ label: 'Faculty of Public Health', url: 'https://www.fph.org.uk/' }] },
  { stage: 'Consultant in Public Health', detail: 'Leads population-health strategy for a local authority, NHS body or national agency. Registration with the GMC or UKPHR as a specialist.' },
];
