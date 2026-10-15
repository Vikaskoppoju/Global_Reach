import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import Countries from '@/components/sections/Countries'
// Hidden for now — uncomment to restore these sections
// import Policies from '@/components/sections/Policies'
// import Process from '@/components/sections/Process'
import ScholarshipShowcase from '@/components/sections/ScholarshipShowcase'
// import ApplicationForm from '@/components/sections/ApplicationForm'
// Alumni testimonials are placeholders and hidden for the student audience
// import Testimonials from '@/components/sections/Testimonials'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Countries />
      {/* <Policies /> */}
      {/* <Process /> */}
      <ScholarshipShowcase />
      {/* <ApplicationForm /> */}
      {/* <Testimonials /> */}
      <Footer />
    </main>
  )
}
