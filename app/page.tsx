import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import Countries from '@/components/sections/Countries'
import Policies from '@/components/sections/Policies'
import Process from '@/components/sections/Process'
import ScholarshipShowcase from '@/components/sections/ScholarshipShowcase'
import ApplicationForm from '@/components/sections/ApplicationForm'
import Testimonials from '@/components/sections/Testimonials'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Countries />
      <Policies />
      <Process />
      <ScholarshipShowcase />
      <ApplicationForm />
      <Testimonials />
      <Footer />
    </main>
  )
}
