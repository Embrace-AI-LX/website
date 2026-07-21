// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/*
 * `site` and `base` are env-driven so the same build works in three places
 * without a code change:
 *
 *   default            -> https://embrace-ai.org        (custom domain, root)
 *   GitHub Pages       -> https://ORG.github.io/REPO/   (subpath, set by CI)
 *   S3 / Hostinger     -> whatever domain you point at it
 *
 * The Pages workflow sets both automatically. Update the defaults once the
 * real domain is decided.
 */
const site = process.env.SITE_URL ?? 'https://embrace-ai.org';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  output: 'static',
  // Plain files, no server rewrites, so it works on S3, Hostinger, Pages, anything.
  build: { format: 'file', inlineStylesheets: 'auto' },
  vite: { plugins: [tailwindcss()] },
});
