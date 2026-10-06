# GlobalReach Scholarship — Next.js Project

A full-featured scholarship website for abroad studies built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Playfair Display + DM Sans (via `next/font/google`)
- **Images**: Next.js `<Image>` with Unsplash

## Project Structure

```
globalreach/
├── app/
│   ├── globals.css          # Global styles + Tailwind directives
│   ├── layout.tsx           # Root layout with font setup + metadata
│   └── page.tsx             # Main page composing all sections
├── components/
│   ├── ui/
│   │   └── AnimatedSection.tsx   # Reusable scroll-triggered animation wrapper
│   └── sections/
│       ├── Navbar.tsx            # Fixed nav + animated mobile drawer
│       ├── Hero.tsx              # Hero with floating badges + stats
│       ├── Countries.tsx         # 6-card destination grid with hover effects
│       ├── Policies.tsx          # Interactive tabbed policy panel
│       ├── Process.tsx           # 6-step application timeline
│       ├── ApplicationForm.tsx   # Full form with progress bar + success modal
│       ├── Testimonials.tsx      # Alumni testimonial cards
│       └── Footer.tsx            # 4-column footer
├── lib/
│   ├── data.ts              # All static content (countries, policies, steps…)
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
├── types/
│   └── index.ts             # TypeScript interfaces
├── tailwind.config.ts       # Custom colours, fonts, animations
├── tsconfig.json
├── next.config.mjs
└── package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Start the database

The atlas masters (continents, countries, universities) and the admin activity log live in
PostgreSQL, run with Docker. Data is kept in the `globalreach-pgdata` volume, so it survives
restarts and `npm run db:down`.

```bash
cp .env.example .env.local   # DATABASE_URL for the local container
npm run db:up                # start PostgreSQL 16 on localhost:5433
npm run db:seed              # first time only: load the spreadsheet data
```

| Script | What it does |
|---|---|
| `npm run db:up` / `db:down` | Start / stop the container (data is kept) |
| `npm run db:seed -- --force` | Wipe the masters and reload the spreadsheet data (the activity log is kept) |
| `npm run db:export` | Write the database into the static snapshot used in production |
| `npm run db:psql` | Open a `psql` shell in the database |

**Development uses the database; production uses a static snapshot.** `next dev` reads and writes
PostgreSQL. `next build` / `next start` serve the JSON snapshot in `lib/` (plus `public/logos/`)
with the admin masters read-only. Set `ATLAS_SOURCE=db` or `ATLAS_SOURCE=static` to override.
If the database is down in development, pages fall back to the snapshot too.

To publish admin edits, run `npm run db:export` (it writes the snapshot from the database), commit the
changed files, and rebuild. `npm run build` also runs the export automatically when the database is up.
The full rules are in `.claude/skills/atlas-data/SKILL.md`.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm run start
```

## Features

- ✅ **Responsive** — mobile-first, works on all screen sizes
- ✅ **Animated** — scroll-triggered reveals, floating badges, staggered grids
- ✅ **Interactive** — tabbed policy panel, GPA slider, real-time progress bar
- ✅ **TypeScript** — fully typed props, data, and form state
- ✅ **SEO ready** — metadata in `layout.tsx`, semantic HTML
- ✅ **Next.js Image** — optimised remote images from Unsplash
- ✅ **Accessible** — aria-labels on interactive elements

## Customisation

- **Content**: Edit `lib/data.ts` to change countries, policies, steps, testimonials
- **Colours**: Edit `tailwind.config.ts` — `gold`, `navy`, `cream` colour scales
- **Fonts**: Swap fonts in `app/layout.tsx` using `next/font/google`
- **Images**: Replace Unsplash URLs in `lib/data.ts` with your own CDN

## Environment

No environment variables required. Remote image domains are pre-configured in `next.config.mjs`.
