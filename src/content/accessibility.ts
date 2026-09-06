/**
 * The accessibility statement.
 *
 * Field Notes is not a public sector body, so the Public Sector Bodies
 * (Websites and Mobile Applications) Accessibility Regulations 2018 do not
 * apply to it. This is published anyway, in the shape those regulations ask
 * for, because an app about maternity care should be able to say what it has
 * checked and what it has not.
 *
 * Every figure here comes from a measurement, not from memory. The numbers
 * are re-run before this file is edited, and the date below is the date of
 * that run. A statement that drifts out of date is worse than none, because
 * it reads as a check that was done.
 */

export interface AccessibilitySection {
  id: string;
  title: string;
  body: string[];
}

export const ACCESSIBILITY_MEASURED = '6 September 2026';

export const accessibilityIntro =
  'This page says what has been checked, how, and what has not been checked. Field Notes is not a public body, so it does not have to publish this. It does because an app about maternity care should be able to show its working.';

export const accessibilitySections: AccessibilitySection[] = [
  {
    id: 'status',
    title: 'Where it stands',
    body: [
      'Automated testing finds no accessibility failures. Every screen was checked against WCAG 2.2 at level AA, and the earlier 2.0 and 2.1 versions of the same standard, and none reported a problem.',
      'That is not the same as saying the app is fully accessible. **It has not been tested by anyone who uses a screen reader**, and it has not been audited by an accessibility specialist. Both of those would find things a machine cannot.',
      'So the honest status is: it passes every check that can be automated, and the checks that need a person have not been done yet.',
    ],
  },
  {
    id: 'what-you-can-change',
    title: 'What you can change',
    body: [
      '**Text size** — three sizes in Settings. Extra large makes everything about a third bigger, including the urgent screens.',
      '**Higher contrast** — a Settings toggle that darkens text and strengthens borders.',
      '**Less motion** — a Settings toggle, and the app also follows the reduced-motion setting on your phone or computer without being asked. Nothing on any screen loops or moves on its own.',
      '**Read this to me** — the urgent screens and the loss screens can be read aloud. Phone numbers are read one digit at a time, so you can write them down.',
      'Your device settings work too. The app is built so that browser zoom and system text size both take effect.',
    ],
  },
  {
    id: 'built-in',
    title: 'Things you do not have to turn on',
    body: [
      'Every screen has a "skip to content" link for anyone using a keyboard.',
      'Moving to a new screen moves focus to its heading, so a screen reader announces where you have arrived rather than leaving you at the top of the page.',
      'Every button and link is large enough to hit, and stays large enough at the biggest text size.',
      'The app works with no network, so a bad connection does not take the urgent guidance away.',
      'Nothing requires an account, an email address, or a working phone signal to read.',
    ],
  },
  {
    id: 'not-checked',
    title: 'What has not been checked',
    body: [
      'Automated tools cannot tell whether a heading makes sense, whether a description is useful, or whether a whole task can be completed by someone using a screen reader. Those need a person.',
      '**No screen reader user has tested this app.** That is the largest gap and it is not a small one.',
      '**No accessibility specialist has audited it.** The checks here were written by the person who built it, which is the weakest form of review there is.',
      '**Nobody has used it in a usability test**, with or without assistive technology.',
      'None of that is a reason to stop using it. It is a reason not to take "passes automated testing" as more than it is.',
    ],
  },
  {
    id: 'how-measured',
    title: 'How this was measured',
    body: [
      `Last measured on ${ACCESSIBILITY_MEASURED}, with a tool called axe-core.`,
      'It was run in a real browser, not a simulated one. That matters. A simulated browser cannot work out colour contrast, and this app’s worst accessibility bug hid there for weeks.',
      '**22 screens** were checked in **four set-ups**: a small phone 320 pixels wide, an ordinary phone at 375, a phone at Extra large text, and a desktop screen. The standard also asks you to test 400% zoom, and 320 pixels is how that is done.',
      'This page was one of the 22. It would be a poor accessibility statement that had not been checked itself.',
      'No screen failed in any set-up. None of them scrolled sideways either.',
      'Windows high contrast and reduced motion were checked on their own, on the urgent screens. Those are the screens where getting it wrong costs most.',
      'These checks run again on every change, so a screen cannot slip back without someone noticing.',
    ],
  },
  {
    id: 'problems',
    title: 'If something does not work for you',
    body: [
      'Please report it. A problem nobody mentions is a problem that stays.',
      'The code and its issue tracker are public at **github.com/dancanter/Dan** — an issue there is the quickest route, and you do not need to describe it in technical terms.',
      'Tell us what you were trying to do, what happened, and what you were using if you know it. That is enough.',
    ],
  },
  {
    id: 'regulations',
    title: 'About the regulations',
    body: [
      'UK law requires public bodies to meet WCAG 2.2 AA and to publish a statement like this one. The rules are the Public Sector Bodies Accessibility Regulations 2018.',
      'Field Notes is an independent app, built by one person. It is not a public body. So those rules do not apply here, and there is no complaints body attached to this page.',
      'It follows that format anyway. The format is a good one, and holding the app to a standard it does not have to meet is rather the point.',
    ],
  },
];
