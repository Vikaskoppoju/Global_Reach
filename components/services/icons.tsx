// Line icons for the services pages, drawn on a 24×24 grid with stroke="currentColor"
const PATHS: Record<string, JSX.Element> = {
  'test-prep': <><path strokeLinejoin="round" d="M9 4h6l1 2h3v14H5V6h3l1-2Z" /><path strokeLinecap="round" strokeLinejoin="round" d="m9 13 2 2 4-4" /></>,
  application: <><path strokeLinejoin="round" d="M6 3h9l4 4v14H6V3Z" /><path strokeLinecap="round" d="M9 11h7M9 15h7M9 7h4" /></>,
  interview: <><path strokeLinejoin="round" d="M4 5h12v9H9l-4 3v-3H4V5Z" /><path strokeLinejoin="round" d="M16 9h4v8h-1v3l-3-3h-5v-3" /></>,
  // A written draft with a tick: someone checked it
  sop: <><path strokeLinejoin="round" d="M6 3h9l4 4v6M6 3v18h7" /><path strokeLinecap="round" d="M9 8h4M9 12h6" /><path strokeLinecap="round" strokeLinejoin="round" d="m14.5 18 2 2 4-4.5" /></>,
  // A light bulb: planning from a blank page
  'sop-coaching': <><path strokeLinejoin="round" d="M9 17h6M10 20.5h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /><path strokeLinecap="round" d="M12 7v3" /></>,
  'scholarship-essay': <><path strokeLinejoin="round" d="M4 20h4L19 9l-4-4L4 16v4Z" /><path strokeLinecap="round" d="m13.5 6.5 4 4" /></>,
  // An envelope (the letter) beside a profile card (the CV)
  'lor-cv': <><rect x="3" y="6" width="11" height="8" rx="1.5" /><path strokeLinejoin="round" d="m3.5 7 5 4 5-4" /><rect x="12" y="10" width="9" height="11" rx="1.5" /><circle cx="16.5" cy="14" r="1.6" /><path strokeLinecap="round" d="M14.3 18.5c.4-1 1.2-1.6 2.2-1.6s1.8.6 2.2 1.6" /></>,
  'admission-interview': <><path strokeLinejoin="round" d="M12 4 2 9l10 5 10-5-10-5Z" /><path strokeLinejoin="round" d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" /></>,
  'scholarship-interview': <><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><path strokeLinecap="round" d="M3.5 18c.7-2.4 2.4-3.6 4.5-3.6s3.8 1.2 4.5 3.6M11.5 18c.7-2.4 2.4-3.6 4.5-3.6s3.8 1.2 4.5 3.6" /></>,
  'visa-interview': <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path strokeLinecap="round" d="M9 17h6" /></>,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />,
  info: <><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 11v5.5M12 7.6v.1" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  steps: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 19h5v-5h5V9h5V4" /><circle cx="19" cy="4" r="0.6" /></>,
  box: <><path strokeLinejoin="round" d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" /><path strokeLinejoin="round" d="m4 7.5 8 3.5 8-3.5M12 11v9" /></>,
  tag: <><path strokeLinejoin="round" d="M3 12V4h8l9 9-8 8-9-9Z" /><circle cx="7.5" cy="8.5" r="1.3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" /></>,
  laptop: <><rect x="5" y="5" width="14" height="10" rx="1.5" /><path strokeLinecap="round" d="M2.5 19h19" /></>,
  scholarship: <><path strokeLinejoin="round" d="M12 3 2 8l10 5 10-5-10-5Z" /><path strokeLinecap="round" d="M20 9v5" /><path strokeLinejoin="round" d="M6 10.5V15c0 1.1 2.7 3 6 3s6-1.9 6-3v-4.5" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path strokeLinecap="round" d="M4 13h16M12 9v11M12 9c-1.5-3-5-3.5-5-1.5S10 9 12 9Zm0 0c1.5-3 5-3.5 5-1.5S14 9 12 9Z" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path strokeLinecap="round" d="M3.5 19c.8-3 2.9-4.5 5.5-4.5s4.7 1.5 5.5 4.5M16 5.5a3 3 0 0 1 0 5.5M17.5 14.7c1.6.6 2.6 2 3 4.3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" /></>,
  wallet: <><path strokeLinejoin="round" d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V7Zm0 0 11-3v3" /><circle cx="16" cy="13.5" r="1.2" /></>,
}

export default function ServiceIcon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      {PATHS[name] ?? PATHS.application}
    </svg>
  )
}
