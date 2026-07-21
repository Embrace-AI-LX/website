# Embrace:AI website

Landing page for [Embrace:AI](https://www.meetup.com/embrace-ai/), a non-profit AI community
running free expert-led meetups in Lisbon.

Astro 7, static output, zero client-side JavaScript. Fonts are self-hosted, so the site makes no
third-party requests at all: no Google Fonts, no analytics, no cookies.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve dist/ locally
```

## Events update themselves

Events come from the group's **public Meetup iCal feed**
(`https://www.meetup.com/embrace-ai/events/ical/`). Nobody types an event in by hand.

`scripts/sync-events.mjs` runs automatically before `dev` and `build`:

| File | Committed? | What it holds |
| --- | --- | --- |
| `src/data/upcoming.json` | no (generated) | upcoming events, straight from the feed |
| `src/data/past-events.json` | **yes** | the archive: events land here automatically once their date passes |

Three things worth knowing:

- **The feed has no CORS headers**, so it cannot be fetched from the browser. It must be fetched at
  build time, which is why the deploy workflows run on a daily cron. Without a scheduled rebuild,
  a newly announced meetup won't appear until someone pushes a commit.
- **The feed only contains upcoming events.** That's why the archive is a committed file: the sync
  script moves an event into `past-events.json` the first time it sees that its date has passed.
- **A network failure never empties the site.** If the fetch fails, the script logs a warning, keeps
  the last known-good `upcoming.json`, and exits 0 so the build still succeeds.

Useful overrides when testing:

```bash
MEETUP_GROUP=aws-user-group-lisbon npm run sync   # a group that has upcoming events
MEETUP_ICAL_URL=http://localhost:8899/feed.ics npm run sync
```

## Editing content

Almost everything lives in `src/data/`, not in components:

| File | What to change |
| --- | --- |
| `site.ts` | copy, links, the stat row, nav items, the "what we do" and "who comes" cards |
| `hosts.ts` | companies that hosted a meetup: one line each; add `logo:` to swap the wordmark for artwork |
| `team.ts` | people; `group: 'founders' \| 'core'` picks the row |
| `past-events.json` | the archive (usually maintained automatically) |

**Adding a host logo:** drop the file into `src/assets/hosts/` and set `logo: 'filename.svg'` on
that host in `hosts.ts`. Without a logo, the card renders the company name as a wordmark, so
adding a host is never blocked on having artwork.

**Brand assets:** `npm run images` regenerates `src/assets/embrace-ai-mark.png` (the brain, tinted
into the brand gradient so it reads on the dark canvas), `public/og.png` and
`public/apple-touch-icon.png` from `src/assets/embrace-ai-logo.png`. Outputs are committed; CI
never runs it.

**Newsletter (Brevo):** the section renders an "opening soon" state until `NEWSLETTER.formUrl` in
`site.ts` is set. To switch it on: Brevo → Contacts → Forms → your form → *Share* → copy the action
URL (`https://sibforms.com/serve/…`) and paste it in. It submits as a plain HTML form, so there's
no API key and nothing secret in the repo.

### Still to do

- `TODO_EMAIL` in `src/data/site.ts` is a placeholder (`contact@embrace-ai.org`). One-line change.
- **Replace host company names with real logos.** Drop files into `src/assets/hosts/` and set
  `logo:` on each entry in `src/data/hosts.ts`. Prefer SVG, or PNG with transparency; they render
  at ~36px tall on a dark background, so light or white marks work best.
- Set `NEWSLETTER.formUrl` once the Brevo form exists (see above).
- The default `site` in `astro.config.mjs` is `https://embrace-ai.org`. Update it when the domain
  is settled. (`robots.txt` is generated from it, so it follows automatically.)
- Member count and rating in `site.ts` are a manual snapshot: refresh after a big event.
  (The meetups-held figure is derived from the archive automatically.)

## Deploying

`dist/` is plain static files, so it runs anywhere. Three deploy workflows are committed; to swap
target, drop the `.disabled` suffix from the one you want (and add it to the one you're leaving).

| Target | File | Enabled? | Secrets |
| --- | --- | --- | --- |
| GitHub Pages | `.github/workflows/deploy-pages.yml` | **yes** | none |
| AWS S3 + CloudFront | `deploy-s3.yml.disabled` | no | `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION` |
| Hostinger (FTP) | `deploy-hostinger.yml.disabled` | no | `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR` |

**GitHub Pages needs no secrets and no account**: flip *Settings → Pages → Source* to
"GitHub Actions" and push. The site goes live at `https://<org>.github.io/<repo>/`. That's the
quickest way to get a public URL while the real domain is being decided.

`site` and `base` are env-driven (`SITE_URL` / `BASE_PATH` in `astro.config.mjs`), which is how the
same build serves correctly from a Pages subpath *and* from a domain root. When you move to a
custom domain, delete those two `env:` lines from the Pages workflow.

All three run on push to `main`, on a daily 06:00 UTC cron, and on manual dispatch. All three
commit any newly archived events back to the repo.

Deploying by hand works too: `npm run build`, then upload the contents of `dist/`.

## This repo is public: what that means

Everything here is safe to publish, and was checked for it:

- **`documentation/` is gitignored** and must stay that way. It holds internal decks, financials,
  costs and meeting notes. Nothing in it is referenced by the build.
- **No secrets in the repo.** Deploy credentials live in GitHub Actions secrets, never in files.
  The workflows only trigger on `push` to `main`, `schedule` and `workflow_dispatch`: never on
  `pull_request`, so a fork can't run a workflow and read those secrets.
- **Photo EXIF is stripped.** The source photos were iPhone originals carrying device model and
  capture timestamps (no GPS). They're re-encoded clean.
- **No trackers.** No analytics, no cookies, no third-party requests at all. Fonts are served
  from this domain.

If you ever add a service that needs a key, put it in Actions secrets and reference it as
`${{ secrets.NAME }}`: never commit it, even briefly. Public repo history is permanent and
crawled within minutes.
