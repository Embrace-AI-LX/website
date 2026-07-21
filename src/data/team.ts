/** Everyone who runs Embrace:AI. Add a person by appending one entry. */
export type Member = {
  name: string;
  role: string;
  focus: string;
  flag: string;
  base: string;
  linkedin?: string;
};

export const TEAM: Member[] = [
  {
    name: 'Alexandre du Sordet',
    role: 'Co-founder',
    focus: 'AI strategy & project management',
    flag: '🇫🇷',
    base: 'Lisbon',
  },
  {
    name: 'Emilie Daio',
    role: 'Co-founder',
    focus: 'AI transformation & automation',
    flag: '🇵🇹',
    base: 'Lisbon',
  },
  {
    name: 'Philipp Pahl',
    role: 'Co-founder',
    focus: 'AI engineer, RAG & AI advisor',
    flag: '🇩🇪',
    base: 'Algarve',
  },
  {
    name: 'Carina Guedes',
    role: 'Core team',
    focus: 'Marketing & content',
    flag: '🇵🇹',
    base: 'Lisbon',
  },
];
