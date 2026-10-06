import type { Continent, Country, Policy, Step, Testimonial, EligibilityItem } from '@/types'
import worldUniversities from './world-universities.json'
import continentMeta from './continent-meta.json'
import countryCosts from './country-costs.json'

// University lists come from World_Universities_International_Students.xlsx.
// Regenerate with: python scripts/build-universities.py
const universitiesByContinent = worldUniversities as Record<string, Country[]>

// Indicative tuition, shown when a country is selected
const COSTS = countryCosts as Record<string, string>

// Display order (Middle East first), taglines, card images and each region's top 5 (its leading
// universities in international rankings). Also read by scripts/db-seed.mjs.
const CONTINENT_META = continentMeta as Omit<Continent, 'countries'>[]

export const continents: Continent[] = CONTINENT_META.map(meta => ({
  ...meta,
  countries: (universitiesByContinent[meta.name] ?? []).map(c => ({ ...c, cost: COSTS[c.name] })),
}))

// Headline numbers rounded down for marketing copy, e.g. 1213 → "1,200+", 137 → "130+"
const roundedPlus = (n: number, step: number) => `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`
const countryTotal = continents.reduce((sum, c) => sum + c.countries.length, 0)
const universityTotal = continents.reduce(
  (sum, c) => sum + c.countries.reduce((s, country) => s + country.universities.length, 0), 0)

export const atlasStats = {
  universities: roundedPlus(universityTotal, 100),
  countries: roundedPlus(countryTotal, 10),
  regions: String(continents.length),
}

export const policies: Policy[] = [
  {
    icon: '💰',
    title: 'Financial Coverage',
    description: 'Full tuition, living allowance, travel support, and health insurance.',
    details: 'The GlobalReach Scholarship provides comprehensive financial support designed to eliminate barriers to world-class education.',
    points: [
      'Full tuition coverage at partner institutions (up to $50,000/year)',
      'Monthly living stipend of $1,200–$2,400 depending on destination city',
      'Return airfare covered once per academic year',
      'Comprehensive health insurance for the full duration',
      'One-time settlement allowance of $800 upon arrival',
      'Book and materials allowance of up to $600/year',
    ],
  },
  {
    icon: '📋',
    title: 'Eligibility Criteria',
    description: 'Merit-based with need-aware provisions. Open to all nationalities.',
    details: 'We believe merit and potential matter more than background. Our selection is holistic, transparent, and globally inclusive.',
    points: [
      'Open to applicants of any nationality aged 17–35',
      'Minimum 3.0 GPA or equivalent academic standing',
      'Must hold or be pursuing admission at a partner institution',
      'Need-aware assessment — lower household income scores higher',
      'No existing full scholarship from another organisation',
      'Demonstrated community leadership or extracurricular impact',
    ],
  },
  {
    icon: '📅',
    title: 'Duration & Renewal',
    description: 'Up to 4 years with annual performance review and renewal.',
    details: 'Scholarships are initially awarded for one academic year and renewed annually based on satisfactory performance.',
    points: [
      'Initial award for 1 academic year, renewable up to 4 years',
      'Annual GPA threshold of 3.0 must be maintained',
      'Renewal application submitted by 1st February each year',
      'Mid-year progress review with assigned academic advisor',
      'Deferral permitted once for documented medical/personal reasons',
      'Extension available for PhD candidates with supervisor approval',
    ],
  },
  {
    icon: '📚',
    title: 'Academic Requirements',
    description: 'Maintain minimum GPA and attend mandatory mentoring sessions.',
    details: 'Scholars are expected to maintain high academic standards and actively engage with the GlobalReach community.',
    points: [
      'Minimum GPA of 3.0 (or host institution equivalent) each semester',
      'Full-time enrolment required — part-time not supported',
      'Attend two mandatory mentoring sessions per semester',
      'Submit annual academic and impact report to the foundation',
      'Notify programme manager within 14 days of any course change',
      'Participation in at least one GlobalReach community event per year',
    ],
  },
  {
    icon: '🔄',
    title: 'Termination Policy',
    description: 'Clear appeal process and transparent grounds for early termination.',
    details: 'We are committed to fairness. Any scholarship modification follows a documented process with full right to appeal.',
    points: [
      'Written notice given 30 days before any scholarship withdrawal',
      'Academic underperformance triggers a structured support plan first',
      'Scholars may appeal decisions within 21 days of notification',
      'Independent review panel considers all appeals impartially',
      'Misconduct cases reviewed under host institution and GlobalReach codes',
      'Repayment of funds only in cases of deliberate misrepresentation',
    ],
  },
  {
    icon: '🤝',
    title: 'Alumni Obligations',
    description: 'Contribute back to the program through mentoring and advocacy.',
    details: 'Scholars join a lifelong global community and are asked to contribute meaningfully to its growth after graduation.',
    points: [
      'Mentor at least one current scholar per year post-graduation',
      'Share your story for GlobalReach communications (with consent)',
      'Attend one virtual alumni summit per year',
      'Contribute to programme advisory board if invited',
      'Refer promising candidates from your home region',
      'Promote access to education in your professional sphere',
    ],
  },
]

export const steps: Step[] = [
  { number: '01', icon: '📝', title: 'Create Profile', description: 'Register and build your academic and personal profile' },
  { number: '02', icon: '🎓', title: 'Choose Program', description: 'Browse 500+ eligible programs and select your destination' },
  { number: '03', icon: '📄', title: 'Submit Documents', description: 'Upload transcripts, essays, and recommendation letters' },
  { number: '04', icon: '🎙️', title: 'Interview Round', description: 'Shortlisted candidates join a virtual panel interview' },
  { number: '05', icon: '📬', title: 'Decision Letter', description: 'Receive award notification within 8 weeks of final deadline' },
  { number: '06', icon: '✈️', title: 'Depart & Thrive', description: 'Our onboarding team guides you every step of the way' },
]

export const testimonials: Testimonial[] = [
  {
    quote: "GlobalReach didn't just fund my Master's at LSE — they paired me with a mentor who guided my career pivot into climate policy. Two years on, I'm advising the UN Environment Programme.",
    name: 'Priya Nair',
    role: "MSc Environmental Policy · LSE '23",
    flag: '🇮🇳',
    avatarUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=100&q=80',
  },
  {
    quote: "Coming from Lagos, I never imagined studying at TU Munich. The scholarship covered everything — I graduated debt-free and joined a robotics startup in Berlin right after.",
    name: 'Emeka Obi',
    role: "MEng Robotics · TU Munich '22",
    flag: '🇳🇬',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80',
  },
  {
    quote: "The application process was smooth and the team was incredibly supportive. Now I'm doing my PhD at Kyoto University — something I never dared dream about back home in Dhaka.",
    name: 'Nadia Islam',
    role: "PhD Biotechnology · Kyoto '24",
    flag: '🇧🇩',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
  },
]

export const eligibilityItems: EligibilityItem[] = [
  { icon: '🎂', title: 'Age Requirement', description: 'Between 17 and 35 years at time of application' },
  { icon: '📊', title: 'Academic Standing', description: 'Minimum GPA of 3.0 or equivalent in your last qualification' },
  { icon: '🌐', title: 'Language Proficiency', description: 'IELTS 6.5+ or TOEFL 88+ (or equivalent for non-English programs)' },
  { icon: '📜', title: 'Admission Status', description: 'Conditional or unconditional offer from a partner university required' },
]
