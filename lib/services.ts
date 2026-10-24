import type { Scholarship, Service, ServiceBundle, ServiceCategory } from '@/types'
import savedPrices from '@/lib/service-prices.json'

// The services catalogue. Prices here are the defaults, in Indian rupees. Change them in admin → Service Prices:
// those are stored in the database in development and exported to lib/service-prices.json for production.
// Exam names are trademarks of their owners, so the copy says "preparation", never "official".
// Test logos in public/tests/ come from Wikimedia Commons. PTE has none there, so it shows its name instead.
const TEST_LOGOS: Record<string, string> = {
  IELTS: '/tests/ielts.svg', TOEFL: '/tests/toefl.svg', GRE: '/tests/gre.svg', GMAT: '/tests/gmat.svg',
}

export const CATEGORIES: { id: ServiceCategory; label: string; tagline: string }[] = [
  { id: 'test-prep', label: 'Test preparation', tagline: 'Reach the score your scholarships ask for.' },
  { id: 'application', label: 'Application coaching', tagline: 'Get expert feedback on the documents you send with your application.' },
  { id: 'interview', label: 'Interview preparation', tagline: 'Practise with mentors before the real interview.' },
]

const ENGLISH_STEPS = [
  'Take the free diagnostic test online. It shows your level in reading, writing, listening and speaking.',
  'A trainer goes through your result with you and suggests the option that fits your deadline and budget.',
  'Prepare with live classes, a self-paced course or mock tests. Your writing and speaking are checked by a trainer.',
  'Take a final mock test to check you’re ready, then book your real test.',
]

const ENGLISH_PACKAGES: Service['packages'] = [
  { name: 'Diagnostic test', priceINR: 0, detail: 'One timed online test and a score estimate for each section.', goodIf: 'You haven’t taken the test yet. Start here.' },
  { name: 'Mock test pack', priceINR: 1999, detail: '5 full practice tests. A trainer marks your writing and speaking.', goodIf: 'You’ve studied already and want practice in real exam conditions.' },
  { name: 'Self-paced course', priceINR: 3999, detail: 'Video lessons, practice sets and 2 writing reviews. 6 weeks’ access.', goodIf: 'You prefer to study on your own, at your own time.' },
  { name: 'Live batch', priceINR: 11999, detail: 'Live online classes with up to 15 students, covering all four sections, plus weekly speaking practice.', goodIf: 'You want a teacher, a fixed schedule and classmates.' },
  { name: '1:1 tutoring', priceINR: 1499, per: 'per hour', detail: 'Private sessions with a trainer.', goodIf: 'You’re stuck on one section, often writing or speaking.' },
]

const englishTest = (exam: string, whatIsIt: string, bestFor: string): Service => ({
  slug: exam.toLowerCase(),
  category: 'test-prep',
  name: `${exam} preparation`,
  short: `Free diagnostic test, then mock tests, a course or live classes to raise your ${exam} score.`,
  whatIsIt,
  bestFor,
  description: 'Find out where you stand with a free diagnostic test, then close the gap with mock tests, a self-paced course or a small live class.',
  steps: ENGLISH_STEPS,
  includes: [
    'Free diagnostic test with a score estimate',
    'Full-length mock tests with section scores',
    'Writing tasks marked by a trainer',
    'Speaking practice with feedback',
    'A study plan built around your deadline',
  ],
  format: 'Online, self-paced or live',
  duration: '4–6 weeks',
  packages: ENGLISH_PACKAGES,
  logo: TEST_LOGOS[exam],
  exams: [exam],
})

const gradTest = (exam: string, whatIsIt: string, bestFor: string, course: number, focus: string): Service => ({
  slug: exam.toLowerCase(),
  category: 'test-prep',
  name: `${exam} preparation`,
  short: `Live classes in ${focus.toLowerCase()}, with full practice tests and score tracking.`,
  whatIsIt,
  bestFor,
  description: `A structured ${exam} course covering ${focus.toLowerCase()}, with full practice tests that adapt to your level like the real exam. Start with a free diagnostic to see your baseline.`,
  steps: [
    'Take the free diagnostic test to see your starting score.',
    'A trainer suggests a target score and a study plan for your application deadline.',
    `Join live classes in ${focus.toLowerCase()}, with practice sets after each class and weekly doubt-clearing.`,
    'Take full practice tests to track your progress, then book your real test.',
  ],
  includes: [
    'Free diagnostic test',
    `${focus} lessons with practice sets`,
    '4 full adaptive practice tests',
    'Doubt-clearing sessions every week',
    'Score tracking across practice tests',
  ],
  format: 'Live online',
  duration: '8–10 weeks',
  packages: [
    { name: 'Diagnostic test', priceINR: 0, detail: 'A timed test with a score for each section.', goodIf: 'You haven’t taken the test yet. Start here.' },
    { name: 'Mock test pack', priceINR: 2999, detail: '4 full practice tests with a detailed analysis of each.', goodIf: 'You’ve studied already and want to test yourself.' },
    { name: 'Live course', priceINR: course, detail: 'Live classes, practice sets and all 4 practice tests.', goodIf: 'You’re starting out or need a big score jump.' },
    { name: '1:1 tutoring', priceINR: 1999, per: 'per hour', detail: 'Private sessions with a trainer.', goodIf: 'You need help with maths (quant) or English (verbal) only.' },
  ],
  logo: TEST_LOGOS[exam],
  exams: [exam],
})

const DEFAULT_SERVICES: Service[] = [
  englishTest('IELTS',
    'IELTS is an English test that checks your reading, writing, listening and speaking. Your result is a band from 0 to 9, and most universities ask for 6.0–7.0.',
    'You want to study in the UK, Australia, Canada or Europe. Most universities and scholarships accept it.'),
  englishTest('TOEFL',
    'TOEFL is an English test taken on a computer and scored out of 120. Most US universities accept it, and many ask for 80–100.',
    'You want to study in the United States or Canada.'),
  englishTest('PTE',
    'PTE Academic is an English test taken on a computer and marked by computer, scored from 10 to 90. Results usually arrive in about 2 days.',
    'You want to study in Australia or New Zealand, or you need your result fast.'),
  gradTest('GRE',
    'The GRE is an admissions test for master’s and PhD programmes. It checks maths (called “quant”), English reasoning (“verbal”) and essay writing.',
    'You’re applying for a master’s or PhD, mostly in the US. You’ll usually need an English test too.',
    29999, 'Quant and verbal'),
  gradTest('GMAT',
    'The GMAT is the admissions test business schools ask for. It checks maths, English reasoning and how you read data.',
    'You’re applying for an MBA or a business master’s.',
    34999, 'Quant, verbal and data insights'),

  {
    slug: 'sop',
    category: 'application',
    name: 'SOP review',
    short: 'You’ve written your SOP. A mentor checks it and shows you how to make it stronger.',
    whatIsIt: 'An SOP (Statement of Purpose) is a 1–2 page essay about who you are, why you chose this course and what you want to do after it. Almost every university asks for one.',
    bestFor: 'You already have a draft of your SOP.',
    description: 'A mentor who studied abroad reads your draft and marks what works, what’s missing and what to cut, then talks it through with you. You write it; we help you make it stronger. We never write SOPs for students, because universities treat that as cheating.',
    steps: [
      'Send us your SOP draft and the course and university you’re applying to.',
      'Within 5–7 days, your mentor sends it back with comments on every paragraph.',
      'Talk through the changes on a 30-minute video call.',
      'Rewrite it, send it back, and get a second round of feedback.',
    ],
    includes: [
      'Comments on every paragraph of your draft',
      'A check that your SOP fits the course you’re applying to',
      'A 30-minute video call',
      '2 rounds of feedback',
    ],
    format: 'Written feedback + video call',
    duration: '1–2 weeks',
    packages: [
      { name: 'SOP review', priceINR: 3999, detail: 'Feedback on your draft, a 30-minute call and a second round.', goodIf: 'You have one SOP for one course.' },
      { name: 'Two SOPs', priceINR: 6999, detail: 'The same review for SOPs for 2 different courses or universities.', goodIf: 'You’re applying to different kinds of courses.' },
    ],
  },
  {
    slug: 'sop-coaching',
    category: 'application',
    name: 'SOP coaching',
    short: 'You haven’t started your SOP. A mentor helps you plan it and guides you through every draft.',
    whatIsIt: 'An SOP (Statement of Purpose) is a 1–2 page essay about who you are, why you chose this course and what you want to do after it. Almost every university asks for one.',
    bestFor: 'You haven’t started, or don’t know what to write.',
    description: 'Starting from a blank page is the hardest part. Your mentor helps you find your story, plans the SOP with you, then gives feedback on each draft you write until it’s ready to send. The words are always yours.',
    steps: [
      'A 60-minute video call to talk about your background, your goals and why you chose this course.',
      'Your mentor sends you an outline: what to say in each paragraph.',
      'You write your first draft, and your mentor sends feedback within 5 days.',
      'Up to 3 rounds of drafts and feedback, until your SOP is ready to send.',
    ],
    includes: [
      'A 60-minute planning call',
      'A paragraph-by-paragraph outline',
      'Feedback on up to 3 drafts',
      'A final check before you submit',
    ],
    format: 'Video calls + written feedback',
    duration: '2–3 weeks',
    packages: [
      { name: 'SOP coaching from scratch', priceINR: 9999, detail: 'Planning call, outline and feedback on up to 3 drafts.', goodIf: 'You’re writing your first SOP.' },
    ],
  },
  {
    slug: 'scholarship-essay',
    category: 'application',
    name: 'Scholarship essay review',
    short: 'A mentor checks the extra essays a scholarship asks you to write.',
    whatIsIt: 'Some scholarships ask you to write their own essays, for example about leadership, a challenge you faced or your plans for the future. These essays often decide who wins.',
    bestFor: 'A scholarship asks you to write one or more essays.',
    description: 'Your mentor reads your essay against what that scholarship looks for and tells you what to strengthen: your story, your examples and your tone.',
    steps: [
      'Send your essay and tell us which scholarship it’s for.',
      'Your mentor checks it against what the scholarship looks for.',
      'Within 3–5 days, you get comments on your story, examples and tone.',
      'Revise it and get one more round of feedback.',
    ],
    includes: [
      'A check against the scholarship’s selection criteria',
      'Comments on your story, examples and tone',
      'One more round after you revise',
    ],
    format: 'Written feedback',
    duration: '3–5 days per essay',
    packages: [
      { name: 'One essay', priceINR: 2499, detail: 'Up to 1,000 words, with one revision round.', goodIf: 'You’re applying for one scholarship.' },
      { name: 'Three essays', priceINR: 5999, detail: 'Up to 3 essays of 1,000 words each.', goodIf: 'You’re applying for several scholarships.' },
    ],
  },
  {
    slug: 'lor-cv',
    category: 'application',
    name: 'LOR guidance & CV review',
    short: 'Help getting strong recommendation letters, and a CV in the format universities expect.',
    whatIsIt: 'An LOR (Letter of Recommendation) is a letter from a teacher or manager about why you’ll do well. A CV is a 1–2 page summary of your studies, work and achievements. Most applications ask for both.',
    bestFor: 'You need recommendation letters, a CV, or both.',
    description: 'We tell your recommenders what a strong letter includes, so their letters back up your application, and we turn your CV into the academic format admissions teams expect.',
    steps: [
      'Send us your current CV and tell us who will write your letters.',
      'You get a short note for each recommender: what to mention and examples to use.',
      'Your CV comes back with suggested changes within 3–5 days.',
      'Make the changes and get one more check.',
    ],
    includes: [
      'A note for each recommender (up to 3)',
      'Academic CV review with suggested changes',
      'One more check after you revise',
    ],
    format: 'Written feedback',
    duration: '3–5 days',
    packages: [
      { name: 'LOR guidance', priceINR: 1999, detail: 'Notes for up to 3 recommenders.', goodIf: 'You only need help with recommendation letters.' },
      { name: 'CV review', priceINR: 1999, detail: 'Academic CV review, with one more check after you revise.', goodIf: 'You only need help with your CV.' },
      { name: 'LOR + CV', priceINR: 3499, detail: 'Both together, for less.', goodIf: 'You need both.' },
    ],
  },

  {
    slug: 'admission-interview',
    category: 'interview',
    name: 'Admission interview mock',
    short: 'Practise the questions universities ask, with written feedback.',
    whatIsIt: 'Some universities interview students before making an offer, usually on a video call. They ask about your studies, your goals and why you chose them.',
    bestFor: 'A university has invited you to an interview.',
    description: 'A mentor runs a mock interview based on the university and course you are applying to, records it with your permission, and sends written feedback on your answers and delivery.',
    steps: [
      'Tell us the university, the course and your interview date.',
      'Your mentor prepares questions that university is likely to ask.',
      'A 45-minute mock interview on a video call, recorded with your permission.',
      'Written feedback on your answers and how you came across, within 2 days.',
    ],
    includes: [
      'Questions tailored to your course and university',
      'Recording of the session',
      'Written feedback within 2 days',
    ],
    format: 'Live 1:1 video call, 45 minutes',
    duration: 'One session',
    packages: [
      { name: 'One mock', priceINR: 2499, detail: 'One 45-minute session with feedback.' },
      { name: 'Two mocks', priceINR: 4499, detail: 'Practise, improve, then try again.' },
    ],
  },
  {
    slug: 'scholarship-interview',
    category: 'interview',
    name: 'Scholarship panel mock',
    short: 'Panel-style practice for competitive scholarships.',
    whatIsIt: 'Competitive scholarships such as Chevening, Fulbright and DAAD often end with a panel interview: 2–4 people asking about your plans, leadership and why you deserve the scholarship.',
    bestFor: 'You’re shortlisted for Chevening, Fulbright, DAAD or a similar scholarship.',
    description: 'Competitive scholarships such as Chevening, Fulbright and DAAD often end with a panel interview. Two mentors run a realistic panel and give you feedback on your answers, examples and confidence.',
    steps: [
      'Tell us the scholarship and your interview date.',
      'Two mentors prepare questions based on the scholarship’s selection criteria.',
      'A 60-minute panel-style mock interview on a video call.',
      'Written feedback on your answers, your examples and your confidence.',
    ],
    includes: [
      'Two interviewers, panel format',
      'Questions based on the scholarship’s selection criteria',
      'Recording and written feedback',
    ],
    format: 'Live video call, 60 minutes',
    duration: 'One session',
    packages: [
      { name: 'Panel mock', priceINR: 3999, detail: 'One 60-minute panel with feedback.' },
    ],
  },
  {
    slug: 'visa-interview',
    category: 'interview',
    comingSoon: true,
    name: 'Visa interview preparation',
    short: 'Practise for US F-1, UK and Schengen student visa interviews.',
    whatIsIt: 'Some countries, such as the United States, interview students before giving a student visa. Others, such as the UK, may ask a few questions to check you are a genuine student.',
    bestFor: 'You have your offer letter and are applying for a student visa.',
    description: 'A counsellor takes you through the questions officers commonly ask and checks your documents against a checklist. This is guidance only; always follow the embassy’s official instructions.',
    steps: [
      'Tell us the country you’ll study in and your appointment date.',
      'A counsellor checks your documents against a checklist for that country.',
      'A mock visa interview with the questions officers commonly ask.',
      'Tips on answering clearly about your course, funding and plans.',
    ],
    includes: [
      'Mock visa interview',
      'Document checklist for the country you’ll study in',
      'Tips on answering about funding and plans',
    ],
    format: 'Live 1:1 video call',
    duration: '1–2 sessions',
    packages: [
      { name: 'One session', priceINR: 2999, detail: 'Mock interview and document checklist.' },
      { name: 'Two sessions', priceINR: 4999, detail: 'A second mock closer to your appointment.' },
    ],
  },
]

const DEFAULT_BUNDLES: ServiceBundle[] = [
  {
    slug: 'score-booster',
    name: 'Score Booster',
    priceINR: 12999,
    bestFor: 'You need a higher IELTS or TOEFL score in the next 2–3 months.',
    duration: '4–6 weeks',
    items: [
      { service: 'ielts', package: 'Live batch', label: 'Live batch for IELTS or TOEFL (you choose)' },
      { service: 'ielts', package: 'Mock test pack', label: '5 full mock tests for the same test' },
      { service: 'ielts', label: '2 extra writing reviews by a trainer' },
    ],
    alsoFor: ['toefl'],
  },
  {
    slug: 'application-ready',
    name: 'Application Ready',
    priceINR: 9999,
    bestFor: 'You have your test score and are starting your applications.',
    duration: '3–4 weeks',
    items: [
      { service: 'sop-coaching', package: 'SOP coaching from scratch', label: 'SOP coaching from scratch' },
      { service: 'scholarship-essay', package: 'One essay', label: 'Review of 1 scholarship essay' },
      { service: 'lor-cv', package: 'LOR + CV', label: 'LOR guidance and CV review' },
    ],
    alsoFor: ['sop'],
  },
  {
    slug: 'interview-ready',
    name: 'Interview Ready',
    priceINR: 7999,
    bestFor: 'You’ve been shortlisted or have an offer and need to prepare for interviews.',
    duration: '2–4 weeks',
    items: [
      { service: 'admission-interview', package: 'One mock', label: 'University admission mock interview' },
      { service: 'scholarship-interview', package: 'Panel mock', label: 'Scholarship panel mock interview' },
      { service: 'visa-interview', package: 'One session', label: 'Visa interview preparation session' },
    ],
    // Opens together with visa interview preparation
    comingSoon: true,
  },
]

/* ─── Prices ─────────────────────────────────────────────────────────────── */

// A price set in admin replaces the default above. Keys name one option of a service, or a bundle.
export type PriceOverrides = Record<string, number>
export const packageKey = (service: string, option: string) => `package:${service}:${option}`
export const bundleKey = (bundle: string) => `bundle:${bundle}`

export interface Catalogue { services: Service[]; bundles: ServiceBundle[] }

export function buildCatalogue(overrides: PriceOverrides): Catalogue {
  const price = (key: string, fallback: number) => overrides[key] ?? fallback
  return {
    services: DEFAULT_SERVICES.map(s => ({
      ...s,
      packages: s.packages.map(p => ({ ...p, priceINR: price(packageKey(s.slug, p.name), p.priceINR) })),
    })),
    bundles: DEFAULT_BUNDLES.map(b => ({ ...b, priceINR: price(bundleKey(b.slug), b.priceINR) })),
  }
}

// Every key admin may set, with its default price
export const DEFAULT_PRICES: PriceOverrides = Object.fromEntries([
  ...DEFAULT_SERVICES.flatMap(s => s.packages.map(p => [packageKey(s.slug, p.name), p.priceINR])),
  ...DEFAULT_BUNDLES.map(b => [bundleKey(b.slug), b.priceINR]),
])

// Prices from the static snapshot. Client components and production use these; server pages in
// development read live database prices with getCatalogue() (lib/server/catalogue.ts).
const SNAPSHOT = buildCatalogue(savedPrices as PriceOverrides)
export const SERVICES = SNAPSHOT.services
export const BUNDLES = SNAPSHOT.bundles

// "Which one do I need?" on the services page: a student's situation, and the service that fits
export const CHOOSERS: Partial<Record<ServiceCategory, {
  title: string
  rows: { situation: string; service: string }[]
  glossary: { term: string; meaning: string }[]
}>> = {
  'test-prep': {
    title: 'Which test do I need?',
    rows: [
      { situation: 'I want to study in the UK, Europe, Australia or Canada', service: 'ielts' },
      { situation: 'I want to study in the United States', service: 'toefl' },
      { situation: 'I want to study in Australia or New Zealand and need results fast', service: 'pte' },
      { situation: 'I’m applying for a master’s or PhD in the US', service: 'gre' },
      { situation: 'I’m applying for an MBA or business master’s', service: 'gmat' },
    ],
    glossary: [
      { term: 'Score or band', meaning: 'Your result. IELTS gives a band from 0 to 9; TOEFL a score out of 120.' },
      { term: 'Diagnostic test', meaning: 'A free practice test that shows your level today, before you prepare.' },
      { term: 'Mock test', meaning: 'A full practice test, timed like the real exam.' },
    ],
  },
  application: {
    title: 'Which one do I need?',
    rows: [
      { situation: 'I’ve written my SOP and want it checked', service: 'sop' },
      { situation: 'I haven’t started my SOP, or don’t know what to write', service: 'sop-coaching' },
      { situation: 'A scholarship asks me to write essays', service: 'scholarship-essay' },
      { situation: 'I need recommendation letters or a CV', service: 'lor-cv' },
    ],
    glossary: [
      { term: 'SOP', meaning: 'Statement of Purpose: a 1–2 page essay on who you are and why you chose the course.' },
      { term: 'LOR', meaning: 'Letter of Recommendation: a letter from a teacher or manager about you.' },
      { term: 'CV', meaning: 'A 1–2 page summary of your studies, work and achievements.' },
    ],
  },
}

export const getService = (slug: string) => SERVICES.find(s => s.slug === slug)
export const getBundle = (slug: string) => BUNDLES.find(b => b.slug === slug)

// Each item with its price when bought on its own, and what the bundle saves.
// Pass the services the page is showing, so the comparison uses the same prices.
export function bundleBreakdown(b: ServiceBundle, services: Service[] = SERVICES) {
  const packagePrice = (service: string, pkg?: string) =>
    pkg ? services.find(s => s.slug === service)?.packages.find(p => p.name === pkg)?.priceINR ?? null : null
  const lines = b.items.map(item => ({ ...item, priceINR: packagePrice(item.service, item.package) }))
  const separately = lines.reduce((sum, l) => sum + (l.priceINR ?? 0), 0)
  return { lines, separately, saving: Math.max(separately - b.priceINR, 0) }
}

export const bundleServices = (b: ServiceBundle) => Array.from(new Set([...b.items.map(i => i.service), ...(b.alsoFor ?? [])]))

// Stored as the service when a student asks for help choosing
export const NOT_SURE = 'not-sure'

// Anything a student can enquire about: a service or a bundle
export const ENQUIRY_OPTIONS = [
  ...SERVICES.map(s => ({ value: s.slug, label: s.comingSoon ? `${s.name} (coming soon)` : s.name })),
  ...BUNDLES.map(b => ({ value: b.slug, label: b.comingSoon ? `${b.name} bundle (coming soon)` : `${b.name} bundle` })),
]
export const isComingSoon = (slug: string) => !!(getService(slug)?.comingSoon || getBundle(slug)?.comingSoon)

// True when nothing in the category can be bought yet
export const categoryComingSoon = (id: ServiceCategory) =>
  SERVICES.filter(s => s.category === id).every(s => s.comingSoon)
export const isEnquiryOption = (slug: string) => ENQUIRY_OPTIONS.some(o => o.value === slug)

export const formatINR = (n: number) => (n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`)

export function startingPrice(s: Service) {
  const paid = s.packages.filter(p => p.priceINR > 0 && !p.per)
  return Math.min(...(paid.length ? paid : s.packages).map(p => p.priceINR))
}

// Same as examName() in lib/scholarships, which can't be imported here because that module uses React hooks
// and this one is also used by server components
const examKey = (exam: string) => exam.split(/[\s(]/)[0].toUpperCase()

// Test-prep services for the exams a scholarship lists
export function prepForScholarship(s: Scholarship): Service[] {
  const exams = new Set(s.requirements.exams.map(examKey))
  return SERVICES.filter(svc => svc.exams?.some(e => exams.has(e)))
}
