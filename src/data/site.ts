/**
 * Every string, link and number the site shows. Edit here, not in components.
 */

// TODO: swap in the real address once decided (contact@embrace-ai.org vs other).
export const TODO_EMAIL = 'contact@embrace-ai.org';

export const SITE = {
  name: 'Embrace:AI',
  url: 'https://embrace-ai.org',
  tagline: "Lisbon's expert AI community",
  description:
    'Embrace:AI is a non-profit community running free, expert-led AI meetups in Lisbon every month. Engineering, strategy, governance and design. Deep content, no product pitches.',
  locale: 'en',
  city: 'Lisbon, Portugal',
  timeZone: 'Europe/Lisbon',
} as const;

export const LINKS = {
  meetup: 'https://www.meetup.com/embrace-ai/',
  meetupEvents: 'https://www.meetup.com/embrace-ai/events/',
  linkedin: 'https://www.linkedin.com/company/embrace-ai-event',
  youtube: 'https://www.youtube.com/@EmbraceAIOrg',
  email: `mailto:${TODO_EMAIL}`,
  emailHost: `mailto:${TODO_EMAIL}?subject=${encodeURIComponent('We would like to host an Embrace:AI meetup')}`,
  emailPartner: `mailto:${TODO_EMAIL}?subject=${encodeURIComponent('Partnering with Embrace:AI')}`,
  emailSpeak: `mailto:${TODO_EMAIL}?subject=${encodeURIComponent('Talk proposal for Embrace:AI')}`,
  emailNewsletter: `mailto:${TODO_EMAIL}?subject=${encodeURIComponent('Add me to the Embrace:AI newsletter')}`,
} as const;

/**
 * Newsletter, powered by Brevo.
 *
 * To switch it on: Brevo → Contacts → Forms → create/select a form → "Share"
 * → copy the form action URL (it looks like https://sibforms.com/serve/MUIFxxxx)
 * and paste it into `formUrl` below. That's the only change needed.
 *
 * It posts as a plain HTML form, so it needs no JavaScript and no API key.
 * Nothing secret ever touches this repo. Until `formUrl` is set, the section
 * renders an honest "opening soon" state rather than a form that goes nowhere.
 */
export const NEWSLETTER = {
  formUrl: null as string | null,
  /** Brevo's default email field name; change only if you renamed it. */
  emailField: 'EMAIL',
} as const;

/**
 * Refresh member count / rating from meetup.com/embrace-ai after a big event.
 * `from: 'meetupCount'` is filled in from the event archive at build time, so
 * the meetups-held figure can never drift out of date.
 */
export const STATS = [
  { value: '1,045', label: 'members' },
  { value: '4.7★', label: '127 ratings' },
  { from: 'meetupCount', label: 'meetups held' },
  { value: '~60', label: 'per event' },
] as const;

export const NAV = [
  { href: '#next', label: 'Next event' },
  { href: '#what-we-do', label: 'What we do' },
  { href: '#talks', label: 'Past talks' },
  { href: '#hosts', label: 'Hosts' },
  { href: '#team', label: 'Team' },
  { href: '#newsletter', label: 'Newsletter' },
] as const;

export const PILLARS = [
  {
    status: 'live',
    icon: 'calendar',
    title: 'Monthly meetups',
    body: 'Free, in-person expert talks, live demos and networking, every month in Lisbon. Expert-led, community-run, zero hype.',
  },
  {
    status: 'soon',
    icon: 'book',
    title: 'Open learning platform',
    body: 'Talks go up on our YouTube channel. Write-ups and member resources are next, open to everyone, not just attendees.',
  },
  {
    status: 'soon',
    icon: 'spark',
    title: 'Academy',
    body: 'Expert-led workshops for advanced skill-building. Priced to cover costs and pay the experts, never for profit.',
  },
  {
    status: 'soon',
    icon: 'globe',
    title: 'AI for Good hackathon',
    body: 'Our first social-impact hackathon lands in October 2026, alongside open source and AI-for-good projects.',
  },
] as const;

export const AUDIENCE = [
  {
    icon: 'chip',
    title: 'Tech',
    body: 'AI engineers, data scientists, ML researchers, full-stack devs',
  },
  {
    icon: 'chart',
    title: 'Strategy',
    body: 'AI leads, CTOs, product managers, founders and investors',
  },
  {
    icon: 'scale',
    title: 'Governance',
    body: 'Legal experts, AI Act specialists, policy advisors, compliance',
  },
  {
    icon: 'pen',
    title: 'Design & UX',
    body: 'UX/UI designers and human–AI interaction specialists',
  },
] as const;
