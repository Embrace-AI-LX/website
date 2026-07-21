/**
 * Companies that have hosted an Embrace:AI meetup (venue + food & drinks).
 *
 * Adding one is a single line. To upgrade a text card to a real logo, drop an
 * SVG/PNG into src/assets/hosts/ and set `logo` to that filename. The
 * component falls back to a wordmark card whenever `logo` is absent.
 */
export type Host = { name: string; logo?: string; url?: string };

export const HOSTS: Host[] = [
  { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
  { name: 'Devoteam', url: 'https://www.devoteam.com' },
  { name: 'Unit4', url: 'https://www.unit4.com' },
  { name: 'Nagarro', url: 'https://www.nagarro.com' },
  { name: 'Quidgest', url: 'https://quidgest.com' },
  { name: 'Rauva', url: 'https://rauva.com' },
  { name: 'Evolution', url: 'https://www.evolution.com' },
  // AI Hub is run by Unicorn Factory Lisboa; aihub.pt is an unrelated parked domain.
  { name: 'AI Hub', url: 'https://unicornfactorylisboa.com' },
  { name: 'The Kreators' },
  { name: 'A Dama Rosa' },
];
