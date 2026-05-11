'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { eligibilityItems } from '@/lib/data'
import AnimatedSection from '@/components/ui/AnimatedSection'

const englishTests = ['IELTS (6.5+)', 'TOEFL (88+)', 'Duolingo English Test', 'Native English Speaker']
const nationalities = ['Indian', 'Pakistani', 'Nigerian', 'Bangladeshi', 'Indonesian', 'Other']
const qualifications = ['High School / 12th Grade', "Bachelor's Degree", "Master's Degree", 'Other']
const studyLevels = ["Bachelor's", "Master's", 'PhD', 'Short Course']
const destinations = ['United Kingdom', 'United States', 'France', 'Germany', 'Japan', 'Australia', 'Canada', 'Other']
const admissionStatuses = ['Unconditional Offer Received', 'Conditional Offer Received', 'Applied, Awaiting Decision', 'Not Yet Applied']

interface FormState {
  firstName: string; lastName: string; email: string; dob: string
  nationality: string; qualification: string; gpa: number
  studyLevel: string; destination: string; fieldOfStudy: string
  selectedTests: string[]; admissionStatus: string
  personalStatement: string; financialStatement: string
}

const initialState: FormState = {
  firstName: '', lastName: '', email: '', dob: '',
  nationality: '', qualification: '', gpa: 35,
  studyLevel: '', destination: '', fieldOfStudy: '',
  selectedTests: [], admissionStatus: '',
  personalStatement: '', financialStatement: '',
}

export default function ApplicationForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [submitted, setSubmitted] = useState(false)

  const textFields = ['firstName', 'lastName', 'email', 'dob', 'nationality', 'qualification',
    'studyLevel', 'destination', 'fieldOfStudy', 'admissionStatus', 'personalStatement', 'financialStatement']

  const filledCount = textFields.filter(k => form[k as keyof FormState] !== '').length
  const progress = Math.round((filledCount / textFields.length) * 100)

  const set = (key: keyof FormState) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const toggleTest = (test: string) => {
    setForm(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(test)
        ? prev.selectedTests.filter(t => t !== test)
        : [...prev.selectedTests, test],
    }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const inputCls = "form-input-base"
  const labelCls = "text-[12px] font-bold text-navy/60 uppercase tracking-wide"

  return (
    <section id="application" className="bg-cream-deep py-20 md:py-24 px-5 md:px-10 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-start">

        {/* Left info column */}
        <div>
          <AnimatedSection>
            <div className="section-tag">Apply Now</div>
            <h2 className="section-heading">Your Journey<br />Starts Here</h2>
            <p className="text-[17px] leading-relaxed text-navy/60 max-w-xl">
              Tell us about yourself. Applications for the 2025–26 cohort close on{' '}
              <strong className="text-navy">31 March 2026</strong>.
            </p>
          </AnimatedSection>

          <div className="flex flex-col gap-3 mt-10">
            {eligibilityItems.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1} direction="left">
                <div className="bg-white rounded-2xl border border-gold/15 p-5 flex gap-3 items-start">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-[14px] font-bold text-navy mb-1">{item.title}</div>
                    <div className="text-[13px] text-navy/50 leading-relaxed">{item.description}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Form card */}
        <AnimatedSection direction="up">
          <div className="bg-white rounded-[28px] border border-gold/10 shadow-2xl p-7 md:p-12">
            <h3 className="font-display font-bold text-navy text-[26px] mb-1">Scholarship Application</h3>
            <p className="text-[14px] text-navy/40 mb-6">Complete all sections — takes about 12 minutes</p>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-[12px] text-navy/40 mb-2">
                <span>Application Progress</span>
                <span className="font-bold text-navy">{progress}%</span>
              </div>
              <div className="h-[5px] bg-gold/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>First Name *</label>
                  <input type="text" className={inputCls} placeholder="e.g. Anika"
                    value={form.firstName} onChange={set('firstName')} required />
                </div>
                {/* Last Name */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Last Name *</label>
                  <input type="text" className={inputCls} placeholder="e.g. Sharma"
                    value={form.lastName} onChange={set('lastName')} required />
                </div>
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" className={inputCls} placeholder="you@email.com"
                    value={form.email} onChange={set('email')} required />
                </div>
                {/* DOB */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Date of Birth *</label>
                  <input type="date" className={inputCls}
                    value={form.dob} onChange={set('dob')} required />
                </div>
                {/* Nationality */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Nationality *</label>
                  <select className={inputCls} value={form.nationality} onChange={set('nationality')} required>
                    <option value="">Select country…</option>
                    {nationalities.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                {/* Qualification */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Current Qualification *</label>
                  <select className={inputCls} value={form.qualification} onChange={set('qualification')} required>
                    <option value="">Select level…</option>
                    {qualifications.map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
                {/* GPA Slider */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <label className={labelCls}>GPA Score *</label>
                    <span className="text-[13px] font-bold text-navy">
                      {(form.gpa / 10).toFixed(1)} / 4.0
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={40} step={1} value={form.gpa}
                    onChange={e => setForm(prev => ({ ...prev, gpa: Number(e.target.value) }))}
                    className="w-full accent-[#C9A84C]"
                  />
                </div>
                {/* Study Level */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Desired Study Level *</label>
                  <select className={inputCls} value={form.studyLevel} onChange={set('studyLevel')} required>
                    <option value="">Select…</option>
                    {studyLevels.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                {/* Destination */}
                <div className="flex flex-col gap-2">
                  <label className={labelCls}>Preferred Destination *</label>
                  <select className={inputCls} value={form.destination} onChange={set('destination')} required>
                    <option value="">Select country…</option>
                    {destinations.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                {/* Field of Study */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className={labelCls}>Field of Study *</label>
                  <input type="text" className={inputCls}
                    placeholder="e.g. Computer Science, Medicine, Architecture…"
                    value={form.fieldOfStudy} onChange={set('fieldOfStudy')} required />
                </div>
                {/* English tests */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className={labelCls}>English Proficiency</label>
                  <div className="flex flex-col gap-2.5 mt-1">
                    {englishTests.map(test => (
                      <label key={test} className="flex items-center gap-2.5 text-[13px] text-navy/65 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.selectedTests.includes(test)}
                          onChange={() => toggleTest(test)}
                          className="accent-[#C9A84C] w-4 h-4"
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Admission status */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className={labelCls}>University Admission Status</label>
                  <select className={inputCls} value={form.admissionStatus} onChange={set('admissionStatus')}>
                    <option value="">Select…</option>
                    {admissionStatuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {/* Personal statement */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className={labelCls}>Personal Statement *</label>
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    placeholder="Briefly describe your academic goals, why you need this scholarship, and how studying abroad will shape your career…"
                    value={form.personalStatement} onChange={set('personalStatement')} required
                  />
                </div>
                {/* Financial statement */}
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className={labelCls}>Financial Need Statement *</label>
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    placeholder="Describe your household financial situation and why financial support is necessary…"
                    value={form.financialStatement} onChange={set('financialStatement')} required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-7 py-4 bg-navy text-white font-bold text-[15px] tracking-wide
                  rounded-xl transition-all duration-300 hover:bg-navy-mid hover:-translate-y-0.5
                  hover:shadow-[0_12px_32px_rgba(15,31,61,0.25)] active:translate-y-0"
              >
                Submit Application →
              </button>
            </form>
          </div>
        </AnimatedSection>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'rgba(15,31,61,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-[28px] p-12 md:p-14 text-center max-w-md w-full"
            >
              <span className="text-[60px] block mb-6">🎉</span>
              <h3 className="font-display font-bold text-navy text-[28px] mb-3">Application Submitted!</h3>
              <p className="text-[15px] text-navy/60 leading-[1.7] mb-8">
                Thank you for applying to the GlobalReach Scholarship. Our team will review your
                application and reach out within 4–6 weeks. Keep an eye on your inbox!
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm(initialState) }}
                className="bg-navy text-white font-semibold text-[15px] px-10 py-3.5 rounded-full
                  transition-all duration-300 hover:bg-navy-mid hover:-translate-y-0.5"
              >
                Brilliant, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
