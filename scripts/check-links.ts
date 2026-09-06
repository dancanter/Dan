import { sources } from '../src/content/sourceRegistry';
import { sourceUrl, sourceLinkKind } from '../src/content/sourceLinks';

/**
 * Opens every source link and reports the ones that no longer resolve.
 *
 * The Sources screen tells a reader that a citation they can click is a
 * citation they can check. That promise has a shelf life: NHS and GOV.UK
 * reorganise their content, and a link that 404s is worse than no link,
 * because it looks like a check that was done and wasn't.
 *
 * So the check is a machine's job, run on every deploy and once a week. It
 * cannot be run from a development container with no outbound network — which
 * is exactly why it exists as a CI step rather than as something someone is
 * supposed to remember.
 *
 * A redirect is reported but not failed: NHS moves pages behind redirects
 * routinely, and a 301 still gets the reader where they are going. It is
 * worth seeing, because the redirect is where a link starts to rot.
 */

interface Result {
  id: string;
  url: string;
  kind: string;
  status: number | string;
  finalUrl?: string;
}

/** Two attempts, because one timeout is not evidence that a page is gone. */
async function probe(url: string): Promise<{ status: number | string; finalUrl?: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        // HEAD is enough and cheaper, but several NHS pages reject it — so a
        // GET, with the body discarded.
        method: 'GET',
        redirect: 'follow',
        headers: { 'user-agent': 'field-notes-link-check' },
        signal: AbortSignal.timeout(20_000),
      });
      return { status: res.status, finalUrl: res.url === url ? undefined : res.url };
    } catch (error) {
      if (attempt === 1) return { status: error instanceof Error ? error.message : 'failed' };
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return { status: 'failed' };
}

async function main() {
  const linked = sources
    .map((s) => ({ source: s, url: sourceUrl(s) }))
    .filter((x): x is { source: (typeof sources)[number]; url: string } => Boolean(x.url));

  console.log(`Checking ${linked.length} links of ${sources.length} sources\n`);

  const results: Result[] = [];
  // Sequential rather than parallel: this is someone else's server, and a
  // burst of 60 requests to nhs.uk is rude at best.
  for (const { source, url } of linked) {
    const { status, finalUrl } = await probe(url);
    results.push({ id: source.id, url, kind: sourceLinkKind(source), status, finalUrl });
    process.stdout.write(typeof status === 'number' && status < 400 ? '.' : 'X');
  }
  console.log('\n');

  const ok = (s: number | string) => typeof s === 'number' && s >= 200 && s < 300;
  // Publishers bot-block datacentre IPs. BMJ answers doi.org resolution with
  // 403 and NCBI sometimes answers 203 — neither means the page is gone, and
  // failing a build over them would train everyone to ignore this check.
  const blocked = results.filter((r) => r.status === 403 || r.status === 429);
  const broken = results.filter((r) => !ok(r.status) && !blocked.includes(r));
  const redirected = results.filter((r) => ok(r.status) && r.finalUrl);

  if (blocked.length > 0) {
    console.log(`BLOCKED — the publisher refused a robot, not a dead link (${blocked.length})`);
    for (const r of blocked) console.log(`  ${r.status}  ${r.id}\n    ${r.url}`);
    console.log('');
  }

  if (redirected.length > 0) {
    console.log(`REDIRECTED — still reachable, but worth updating (${redirected.length})`);
    for (const r of redirected) console.log(`  ${r.id}\n    ${r.url}\n    → ${r.finalUrl}`);
    console.log('');
  }

  if (broken.length === 0) {
    console.log(`All ${results.length} links resolve.`);
    return;
  }

  console.log(`BROKEN (${broken.length})`);
  for (const r of broken) console.log(`  ${r.status}  ${r.id}  ${r.kind}\n    ${r.url}`);
  console.log('\nA link that goes nowhere is worse than no link. Fix or remove these.');
  process.exitCode = 1;
}

await main();
