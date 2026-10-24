import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Countries from '@/components/sections/Countries'
import ScholarshipShowcase from '@/components/sections/ScholarshipShowcase'
import ServicesShowcase from '@/components/sections/ServicesShowcase'
import StartCta from '@/components/sections/StartCta'
import Footer from '@/components/sections/Footer'
// Older sections, not on the page right now: Policies, Process, ApplicationForm, Testimonials

// Order follows the student's journey: pick a path, see how it works, scholarships,
// where to study, help applying, then a fallback call to action.
export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <ScholarshipShowcase />
      <Countries />
      <ServicesShowcase />
      <StartCta />
      <Footer />
    </main>
  )
}
