import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/sections/Navbar'
import UniversityDirectory from '@/components/sections/UniversityDirectory'
import { atlasStats } from '@/lib/data'

export const metadata: Metadata = {
  title: 'University Directory — GlobalReach',
  description: `Browse ${atlasStats.universities} universities that admit international students across ${atlasStats.countries} countries, by region and country.`,
}

export default function UniversitiesPage() {
  // useSearchParams in the directory needs a Suspense boundary for static rendering
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-cream" />}>
        <UniversityDirectory />
      </Suspense>
    </>
  )
}
