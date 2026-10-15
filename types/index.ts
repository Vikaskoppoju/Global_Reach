// `id`s are present when the atlas comes from the database (absent in the bundled fallback data)
export interface University {
  id?: number
  name: string
  logo?: string
  website?: string
}

// A university together with where it sits in the atlas
export interface UniversityListing extends University {
  country: string
  continentId: string
  continentName: string
}

export interface Country {
  id?: number
  name: string
  universities: University[]
  cost?: string
}

export interface Continent {
  id: string
  name: string
  tagline: string
  imageUrl: string
  // Names of the universities featured on the landing page, in display order
  top: string[]
  topIds?: number[]
  countries: Country[]
}

export interface Policy {
  icon: string
  title: string
  description: string
  details: string
  points: string[]
}

export interface Step {
  number: string
  icon: string
  title: string
  description: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  flag: string
  avatarUrl: string
}

export interface EligibilityItem {
  icon: string
  title: string
  description: string
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  dob: string
  nationality: string
  qualification: string
  gpa: number
  studyLevel: string
  destination: string
  fieldOfStudy: string
  englishTests: string[]
  admissionStatus: string
  personalStatement: string
  financialStatement: string
}

export type AppStatus = 'Pending' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected'

export type MarksMode = 'gpa' | 'percentage' | 'marks'

export interface MarksInput {
  mode: MarksMode
  gpa?: number
  percentage?: number
  marks?: number
  marksMax?: number
}

export interface Application {
  id: string
  submittedAt: string
  firstName: string
  lastName: string
  email: string
  dob: string
  nationality: string
  qualification: string
  marksInput: MarksInput
  studyLevel: string
  destination: string
  fieldOfStudy: string
  selectedTests: string[]
  admissionStatus: string
  personalStatement: string
  financialStatement: string
  status: AppStatus
  notes?: string
}

export interface ScholarshipRequirements {
  minGPA: number | null
  minPercentage: number | null
  minMarks: number | null
  exams: string[]
  minIELTS?: number | null
  minTOEFL?: number | null
  nationality: string[]
  ageLimit?: number | null
}

export interface Scholarship {
  id: string
  name: string
  provider: string
  // Listing country and region (for country-specific editions this is the applicant's country)
  country: string
  region: string
  // Atlas countries where the scholarship is used; empty = not tied to one destination.
  // Optional because admin-created scholarships in localStorage may predate these fields.
  studyIn?: string[]
  // Atlas university names it is tied to; empty = any eligible institution in studyIn.
  // Checked against the atlas by scripts/check-scholarships.mjs
  universities?: string[]
  levels: string[]
  fields: string[]
  amount: string
  amountUSD: number
  deadline: string
  duration: string
  description: string
  benefits: string[]
  requirements: ScholarshipRequirements
  tags: string[]
  link: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'applicant'
}

export type ActivityAction = 'create' | 'update' | 'delete' | 'seed'
export type ActivityEntity = 'continent' | 'country' | 'university' | 'atlas'

export interface ActivityEntry {
  id: number
  occurredAt: string
  actor: string
  action: ActivityAction
  entity: ActivityEntity
  entityId: string | null
  summary: string
  changes: Record<string, unknown> | null
}
