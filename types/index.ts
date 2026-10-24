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
export type ActivityEntity = 'continent' | 'country' | 'university' | 'atlas' | 'price'

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

export type ServiceCategory = 'test-prep' | 'application' | 'interview'

// One way to buy a service, e.g. a mock test pack or a live batch
export interface ServicePackage {
  name: string
  // Indian rupees; 0 = free
  priceINR: number
  // Shown after the price, e.g. "per hour"
  per?: string
  detail: string
  // Which student this option suits, in plain words
  goodIf?: string
}

export interface Service {
  slug: string
  category: ServiceCategory
  name: string
  short: string
  // Explains the test or document itself, for a student who has never heard of it
  whatIsIt: string
  // Plain-language "who is this for", shown on cards
  bestFor: string
  description: string
  // What happens after the student signs up, in order
  steps: string[]
  includes: string[]
  format: string
  duration: string
  packages: ServicePackage[]
  // Exam names as examName() returns them, for linking scholarships to their prep
  exams?: string[]
  // Path under public/, e.g. the test's own logo
  logo?: string
  // Shown but not sold yet; students can ask to be told when it launches
  comingSoon?: boolean
}

// One thing in a bundle. With a package, its price comes from the catalogue; without one it's a free extra.
export interface BundleItem {
  service: string
  package?: string
  label: string
}

export interface ServiceBundle {
  slug: string
  name: string
  priceINR: number
  // Plain-language "who should pick this"
  bestFor: string
  duration: string
  items: BundleItem[]
  // Other service pages that should show this bundle
  alsoFor?: string[]
  comingSoon?: boolean
}

export type EnquiryStatus = 'new' | 'contacted' | 'enrolled' | 'closed'

export interface ServiceEnquiry {
  id: number
  createdAt: string
  service: string
  package: string | null
  name: string
  email: string | null
  phone: string | null
  // When the student would like the call: morning | afternoon | evening | any
  callTime: string | null
  currentScore: string | null
  targetIntake: string | null
  scholarshipId: string | null
  message: string | null
  status: EnquiryStatus
}
