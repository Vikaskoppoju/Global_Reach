import type { Application, AppStatus, MarksMode } from '@/types'

const STATUSES:  AppStatus[] = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected']
const NATS   = ['Indian', 'Nigerian', 'Bangladeshi', 'Pakistani', 'Indonesian', 'Kenyan', 'Brazilian', 'Vietnamese']
const DESTS  = ['Middle East', 'North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa']
const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Short Course']
const FIELDS = ['Computer Science', 'Medicine', 'Engineering', 'Business Administration', 'Architecture', 'Law', 'Data Science', 'Public Policy']
const FNAME  = ['Anika', 'Emeka', 'Priya', 'Nadia', 'Arjun', 'Fatima', 'Chen', 'Kofi', 'Leila', 'Marcus', 'Soo-Jin', 'Amara']
const LNAME  = ['Sharma', 'Obi', 'Nair', 'Islam', 'Patel', 'Al-Hassan', 'Wei', 'Mensah', 'Zadeh', 'Oliveira', 'Park', 'Diallo']
const MODES: MarksMode[] = ['gpa', 'percentage', 'marks']

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const rndDate = (a: Date, b: Date) =>
  new Date(a.getTime() + Math.random() * (b.getTime() - a.getTime())).toISOString()

function rndMarks() {
  const mode = pick(MODES)
  if (mode === 'gpa')        return { mode, gpa: Math.round((Math.random() * 1.5 + 2.5) * 10) / 10 }
  if (mode === 'percentage') return { mode, percentage: Math.floor(Math.random() * 30 + 65) }
  return { mode, marks: Math.floor(Math.random() * 300 + 650), marksMax: 1000 }
}

export function generateMockApplications(count = 48): Application[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = pick(FNAME)
    const lastName  = pick(LNAME)
    return {
      id:              `GR-2025-${String(i + 1001).padStart(4, '0')}`,
      submittedAt:     rndDate(new Date('2025-01-01'), new Date('2025-03-31')),
      firstName,
      lastName,
      email:           `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      dob:             rndDate(new Date('1995-01-01'), new Date('2005-12-31')).slice(0, 10),
      nationality:     pick(NATS),
      qualification:   pick(["Bachelor's Degree", "Master's Degree", 'High School / 12th Grade']),
      marksInput:      rndMarks(),
      studyLevel:      pick(LEVELS),
      destination:     pick(DESTS),
      fieldOfStudy:    pick(FIELDS),
      selectedTests:   Math.random() > 0.3 ? ['IELTS (6.5+)'] : ['TOEFL (88+)'],
      admissionStatus: pick(['Unconditional Offer Received', 'Conditional Offer Received', 'Applied, Awaiting Decision']),
      personalStatement:  'I am deeply passionate about my field and believe this scholarship will transform my academic journey and enable me to contribute meaningfully to my community.',
      financialStatement: 'My family income is modest and without this scholarship, pursuing international education would not be financially feasible for us.',
      status: pick(STATUSES),
      notes:  '',
    }
  })
}

export const MOCK_APPLICATIONS: Application[] = generateMockApplications(48)
