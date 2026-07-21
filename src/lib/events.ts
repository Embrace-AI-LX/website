import upcomingRaw from '../data/upcoming.json';
import pastRaw from '../data/past-events.json';
import { SITE } from '../data/site';

export type EmbraceEvent = {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  url: string;
  excerpt?: string;
  venue?: string;
};

/**
 * Meetup titles carry an internal edition prefix ("Embrace:AI // 2026.03 - ").
 * Strip it for display, but only that exact shape. Collaboration titles like
 * "Embrace:AI x The Kreators - ..." must survive intact.
 */
export function cleanTitle(title: string): string {
  return title
    .replace(/^Embrace:AI\s*\/\/\s*\d{4}\.\d{2}\s*[-–:]?\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const LISBON = { timeZone: SITE.timeZone } as const;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    ...LISBON,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    ...LISBON,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { ...LISBON, hour: '2-digit', minute: '2-digit' });
}

/** Day + month, for the date badge on the next-event card. */
export function dateParts(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-GB', { ...LISBON, day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { ...LISBON, month: 'short' }).toUpperCase(),
  };
}

export const upcomingEvents = upcomingRaw as EmbraceEvent[];
export const nextEvent: EmbraceEvent | null = upcomingEvents[0] ?? null;
export const pastEvents = (pastRaw as EmbraceEvent[])
  .slice()
  .sort((a, b) => b.start.localeCompare(a.start));
