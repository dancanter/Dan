/**
 * The privacy page.
 *
 * Written to be checkable rather than reassuring: every claim here is one
 * someone could verify by reading the source or opening devtools, and none
 * of it is a promise about intentions. If a future change breaks one of
 * these statements, the statement has to change too — that is the point of
 * writing them down this plainly.
 */

export interface PrivacySection {
  id: string;
  title: string;
  body: string[];
}

export const privacySections: PrivacySection[] = [
  {
    id: 'where',
    title: 'Where your information lives',
    body: [
      'Everything you enter — your due date, journal, movement entries, symptoms, ticked items and your maternity unit’s phone number — is stored **on this device only**, in your browser’s own storage.',
      'There is no account, no login, and no server holding any of it. Nothing you type is transmitted anywhere, because there is nowhere for it to go: this app has no backend at all.',
      'The practical consequence is worth knowing both ways round. Nobody else can reach your data — but it also means clearing your browser data, or switching to a different phone, will lose it. There is no copy elsewhere to restore from.',
    ],
  },
  {
    id: 'tracking',
    title: 'What is not happening',
    body: [
      '**No analytics on health data.** Nothing you record is measured, counted or reported.',
      '**No advertising**, and no targeting of any kind — including the pregnancy-symptom-based targeting that is common in this category of app.',
      '**No data sale.** Pregnancy data is commercially valuable and routinely sold elsewhere. None of it leaves this device, so there is nothing to sell.',
      '**No third-party scripts** tracking your use of the app.',
    ],
  },
  {
    id: 'offline',
    title: 'It works with no signal',
    body: [
      'After your first visit, the whole app is stored on your device. That includes every urgent-help screen, and the maternity number you saved. It all works with no internet at all.',
      'That was a safety choice, not a technical one. The screen you need most is the one you might need in a lift, a car park, or somewhere with no signal.',
    ],
  },
  {
    id: 'delete',
    title: 'Deleting what you have',
    body: [
      'Settings has a one-tap reset that clears everything from this device permanently.',
      'If your pregnancy has changed, **My pregnancy has changed** offers deletion alongside pausing and support-after-loss — and offers to save a copy to your device first. Some people want those entries later even when they cannot face them now.',
      'Uninstalling the app, or clearing your browser data for this site, also removes everything.',
    ],
  },
  {
    id: 'wrong',
    title: 'If something here is wrong',
    body: [
      'Health guidance changes. One person maintains this app, not an organisation with a review cycle. Some sources will go out of date before they are updated here.',
      'If you spot something wrong, out of date, or badly worded, you can report it on the project’s public GitHub page. The whole thing is open source — every word of the content, and the reasoning behind each decision.',
      '**This app has not been clinically reviewed.** That is stated plainly rather than buried, and it is the single biggest limitation it has.',
    ],
  },
];
