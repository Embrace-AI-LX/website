/**
 * Pulls events from the public Meetup iCal feed at build time.
 *
 * Why build time and not the browser: the feed serves no CORS headers, so a
 * client-side fetch is blocked. A scheduled rebuild (see .github/workflows/)
 * is what keeps the published site fresh.
 *
 * Two outputs:
 *   src/data/upcoming.json     (generated, gitignored, overwritten each run)
 *   src/data/past-events.json  (committed archive; events migrate here
 *                              automatically once their date passes)
 *
 * Failure policy: a network error must NEVER empty the site. On any failure we
 * keep the existing upcoming.json and exit 0, so the build still succeeds with
 * the last known-good data.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ical from 'node-ical';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');
const UPCOMING = join(DATA, 'upcoming.json');
const PAST = join(DATA, 'past-events.json');

const GROUP = process.env.MEETUP_GROUP ?? 'embrace-ai';
const FEED = process.env.MEETUP_ICAL_URL ?? `https://www.meetup.com/${GROUP}/events/ical/`;
const TIMEOUT_MS = 15_000;

const log = (msg) => console.log(`[sync-events] ${msg}`);

/**
 * Meetup prefixes every DESCRIPTION with the group name on its own line, and
 * the body is Markdown-ish. Strip the prefix, flatten the markup, keep it short.
 */
function toExcerpt(description, groupName, maxLen = 320) {
  if (!description) return '';
  let text = String(description).trim();
  if (groupName && text.startsWith(groupName)) text = text.slice(groupName.length).trim();

  text = text
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> label
    .replace(/[*_`>#]/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (lastStop > maxLen * 0.5 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`).trim();
}

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    console.warn(`[sync-events] could not parse ${path}: ${err.message}`);
    return fallback;
  }
}

async function fetchFeed() {
  const res = await fetch(FEED, {
    headers: { 'User-Agent': 'embrace-ai-website/1.0 (+https://embrace-ai.org)' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.text();
  if (!body.includes('BEGIN:VCALENDAR')) throw new Error('response is not an iCalendar document');
  return body;
}

/**
 * Properties written as `URL;VALUE=URI:https://…` come back from node-ical as
 * `{ params, val }` rather than a string. Stringifying that yields
 * "[object Object]", i.e. a dead link on every event card.
 */
function icalString(value) {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.val === 'string') return value.val;
  return String(value);
}

function parseEvents(ics) {
  const parsed = ical.sync.parseICS(ics);
  const groupName = /^NAME:(.*)$/m.exec(ics)?.[1]?.trim() ?? '';

  return Object.values(parsed)
    .filter((entry) => entry.type === 'VEVENT' && entry.start)
    .map((entry) => ({
      id: icalString(entry.uid) ?? icalString(entry.url) ?? String(entry.summary),
      title: (icalString(entry.summary) ?? 'Embrace:AI meetup').trim(),
      start: new Date(entry.start).toISOString(),
      end: entry.end ? new Date(entry.end).toISOString() : null,
      url: icalString(entry.url) ?? `https://www.meetup.com/${GROUP}/events/`,
      excerpt: toExcerpt(icalString(entry.description), groupName),
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Move anything that has already happened out of `upcoming` and into the archive. */
function archive(events, existingPast, now) {
  const past = [...existingPast];
  const seen = new Set(past.map((e) => e.id));
  const upcoming = [];

  for (const event of events) {
    if (new Date(event.start).getTime() >= now) {
      upcoming.push(event);
    } else if (!seen.has(event.id)) {
      // Archive entries carry no excerpt; the list only renders title + date.
      past.push({ id: event.id, title: event.title, start: event.start, url: event.url });
      seen.add(event.id);
    }
  }

  past.sort((a, b) => b.start.localeCompare(a.start)); // newest first
  return { upcoming, past };
}

async function main() {
  const existingPast = await readJson(PAST, []);
  let events;

  try {
    log(`fetching ${FEED}`);
    events = parseEvents(await fetchFeed());
    log(`feed returned ${events.length} event(s)`);
  } catch (err) {
    // Keep the last known-good upcoming.json rather than writing an empty list.
    console.warn(`[sync-events] FETCH FAILED (${err.message}), keeping last known-good data`);
    if (!existsSync(UPCOMING)) await writeFile(UPCOMING, '[]\n');
    process.exit(0);
  }

  const { upcoming, past } = archive(events, existingPast, Date.now());

  await writeFile(UPCOMING, `${JSON.stringify(upcoming, null, 2)}\n`);
  if (past.length !== existingPast.length) {
    await writeFile(PAST, `${JSON.stringify(past, null, 2)}\n`);
    log(`archived ${past.length - existingPast.length} event(s) into past-events.json`);
  }

  log(`${upcoming.length} upcoming, ${past.length} in archive`);
  if (upcoming.length === 0) log('no upcoming event, so the site renders the "not announced yet" state');
}

main().catch((err) => {
  console.error(`[sync-events] unexpected error: ${err.stack}`);
  process.exit(1);
});
