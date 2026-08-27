export interface Country {
  name: string
  flag: string
  universities: string
  cost: string
  imageUrl: string
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
  country: string
  region: string
  flag: string
  imageUrl: string
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

export interface ScholarshipFilters {
  search: string
  region: string
  level: string
  field: string
  exam: string
  funding: string
  minGPA: number
  marksMode: MarksMode
  userPercentage: number
  userMarks: number
  sortBy: 'deadline' | 'amount' | 'name'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'applicant'
}
