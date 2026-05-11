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

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production

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
