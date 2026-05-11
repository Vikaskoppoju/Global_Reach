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
