import type { Metadata } from 'next'
import Navbar from '@/components/sections/Navbar'
import ScholarshipDirectory from '@/components/sections/ScholarshipDirectory'
import scholarships from '@/lib/scholarships.json'

export const metadata: Metadata = {
  title: 'Scholarships — GlobalReach',
  description: `Browse ${scholarships.length} scholarships for international students by study country, university, level, field and grades.`,
}

export default function ScholarshipsPage() {
  return (
    <>
      <Navbar />
      <ScholarshipDirectory />
    </>
  )
}
