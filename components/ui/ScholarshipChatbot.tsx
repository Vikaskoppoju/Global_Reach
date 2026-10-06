'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import scholarshipsData from '@/lib/scholarships.json'
import type { Scholarship } from '@/types'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  items?: Scholarship[]
}

type ProfileFields = {
  name: string
  email: string
  level: string
  field: string
  destination: string
  nationality: string
  gpa: number
  exam: string
  admissionStatus: string
}

const baseScholarships = scholarshipsData as Scholarship[]

const LEVEL_OPTIONS = ["Bachelor's", "Master's", 'PhD', 'Research', 'Vocational']
const EXAM_OPTIONS = ['IELTS', 'TOEFL', 'GRE', 'GMAT', 'TestDaF', 'JLPT']
const NATIONALITY_OPTIONS = ['India', 'Nigeria', 'Bangladesh', 'Pakistan', 'Indonesia', 'Kenya', 'Other']

const normalize = (value: string) => value.trim().toLowerCase()

const parseProfileFromText = (text: string, profile: ProfileFields): ProfileFields => {
  const next = { ...profile }
  const lower = text.toLowerCase()

  const levelMatch = lower.match(/\b(bachelor|master|phd|doctoral|research|vocational)\b/)
  if (levelMatch) {
    const found = levelMatch[1]
    if (found.includes('bachelor')) next.level = "Bachelor's"
    if (found.includes('master')) next.level = "Master's"
    if (found.includes('phd') || found.includes('doctoral')) next.level = 'PhD'
    if (found.includes('research')) next.level = 'Research'
    if (found.includes('vocational')) next.level = 'Vocational'
  }

  const gpaMatch = text.match(/(\d(?:\.\d)?)(?:\s*(?:gpa|grade|score))/i)
  if (gpaMatch) {
    const value = Number(gpaMatch[1])
    if (!Number.isNaN(value) && value >= 0 && value <= 4.5) {
      next.gpa = Math.min(4, value)
    }
  }

  const examMatch = lower.match(/(ielts|toefl|gre|gmat|testdaf|jlpt)/i)
  if (examMatch) {
    next.exam = examMatch[1].toUpperCase()
  }

  const nationalityMatch = text.match(/from\s+([A-Za-z ]+)/i)
  if (nationalityMatch && nationalityMatch[1]) {
    next.nationality = nationalityMatch[1].trim()
  }

  const destinationMatch = text.match(/(?:to|in|for)\s+([A-Za-z ]+)/i)
  if (destinationMatch && destinationMatch[1]) {
    next.destination = destinationMatch[1].trim()
  }

  const fieldMatch = lower.match(/(engineering|business|medicine|law|science|computer science|arts|humanities|social science|public policy|environment|architecture|finance|economics)/i)
  if (fieldMatch) {
    next.field = fieldMatch[1].trim().replace(/computer science/i, 'STEM')
  }

  const nameMatch = text.match(/my name is\s+([A-Za-z ]+)/i)
  if (nameMatch && nameMatch[1]) {
    next.name = nameMatch[1].trim()
  }

  const emailMatch = text.match(/([\w.+-]+@[\w-]+\.[\w.-]+)/)
  if (emailMatch && emailMatch[1]) {
    next.email = emailMatch[1].trim()
  }

  const admissionMatch = lower.match(/(?:offer|admission|applied|application)\b/)
  if (admissionMatch) {
    next.admissionStatus = 'Applied, Awaiting Decision'
  }

  return next
}

const scoreScholarship = (scholarship: Scholarship, profile: ProfileFields) => {
  const levelMatch = profile.level && scholarship.levels.some(level => normalize(level) === normalize(profile.level))
  const fieldMatch = profile.field && scholarship.fields.some(field => normalize(field) === 'all fields' || normalize(field).includes(normalize(profile.field)))
  const gpaSupported = scholarship.requirements.minGPA == null || profile.gpa >= scholarship.requirements.minGPA
  const examMatch = profile.exam && scholarship.requirements.exams.some(exam => normalize(exam).includes(normalize(profile.exam)))
  const nationalityAllowed = !scholarship.requirements.nationality.some(n => normalize(n).includes('all nationality'))
    ? scholarship.requirements.nationality.some(n => normalize(profile.nationality).includes(normalize(n)) || normalize(n).includes(normalize(profile.nationality)))
    : true

  let score = 0
  if (levelMatch) score += 35
  if (fieldMatch) score += 30
  if (gpaSupported) score += 20
  if (examMatch) score += 15
  if (nationalityAllowed) score += 10
  if (profile.destination && normalize(scholarship.country).includes(normalize(profile.destination))) score += 10
  if (!levelMatch) score -= 10
  if (profile.gpa > 0 && !gpaSupported) score -= 25
  if (profile.exam && !examMatch) score -= 10
  return score
}

const buildRecommendations = (profile: ProfileFields) => {
  const sorted = [...baseScholarships]
    .map(s => ({ scholarship: s, score: scoreScholarship(s, profile) }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0)
    .slice(0, 5)
    .map(item => item.scholarship)

  if (sorted.length > 0) return sorted

  return [...baseScholarships]
    .sort((a, b) => b.amountUSD - a.amountUSD)
    .slice(0, 3)
}

const getMissingProfileFields = (profile: ProfileFields) => {
  const missing: string[] = []
  if (!profile.level) missing.push('study level')
  if (!profile.field) missing.push('field of study')
  if (!profile.destination) missing.push('destination country')
  if (profile.gpa <= 0) missing.push('GPA')
  return missing
}

export default function ScholarshipChatbot() {
  const [profile, setProfile] = useState<ProfileFields>({
    name: '',
    email: '',
    level: '',
    field: '',
    destination: '',
    nationality: '',
    gpa: 0,
    exam: '',
    admissionStatus: '',
  })
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi there! I am your GlobalReach chat advisor. Share your study level, field, destination and GPA to get scholarship recommendations and apply quickly via chat.',
    },
  ])
  const [input, setInput] = useState('')
  const [recommendations, setRecommendations] = useState<Scholarship[]>([])
  const [savedApplications, setSavedApplications] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('gr_chat_applications')
    if (stored) {
      try {
        setSavedApplications(JSON.parse(stored))
      } catch {
        // ignore invalid storage
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gr_chat_applications', JSON.stringify(savedApplications))
  }, [savedApplications])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const canRecommend = useMemo(() => {
    const missing = getMissingProfileFields(profile)
    return missing.length === 0
  }, [profile])

  const handleProfileChange = (key: keyof ProfileFields, value: string | number) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const performRecommendation = (updatedProfile: ProfileFields) => {
    const recs = buildRecommendations(updatedProfile)
    setRecommendations(recs)
    return recs
  }

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }

  const handleApplyClick = (scholarship: Scholarship) => {
    if (!savedApplications.includes(scholarship.id)) {
      setSavedApplications(prev => [...prev, scholarship.id])
    }
    addMessage({
      id: `apply-${scholarship.id}-${Date.now()}`,
      role: 'assistant',
      text: `Great choice! I’ve saved a quick chat application for ${scholarship.name}. Use the official scholarship link or continue to the GlobalReach application form on the homepage.`,
    })
  }

  const generateResponse = (text: string, updatedProfile: ProfileFields) => {
    const lower = text.toLowerCase()
    const missing = getMissingProfileFields(updatedProfile)
    const isRecommend = /(recommend|match|suggest|find)/i.test(text)
    const isApply = /(apply|application|submit)/i.test(text)

    if (isRecommend) {
      if (missing.length > 0) {
        return {
          text: `I can give you better matches once I know your ${missing.join(', ')}. You can type them directly, or update the profile fields on the right.`,
        }
      }
      const recs = performRecommendation(updatedProfile)
      const summary = recs.length
        ? `I found ${recs.length} scholarship recommendation${recs.length === 1 ? '' : 's'} based on your profile. Select one to apply by chat or visit the official scholarship page.`
        : 'I could not find a strong match from the available list, but I selected a few programmes worth reviewing.'
      return { text: summary, items: recs }
    }

    if (isApply) {
      if (recommendations.length === 0) {
        if (missing.length > 0) {
          return { text: `Tell me your study level, field, destination and GPA first so I can recommend the best scholarships for you.` }
        }
        const recs = performRecommendation(updatedProfile)
        if (recs.length > 0) {
          return { text: `I found some great scholarships for you. Tap a recommendation below to apply via chat.`, items: recs }
        }
      }
      return { text: `Pick one of the current recommendations and click Apply. I’ll track it for you in this chat.`, items: recommendations }
    }

    if (missing.length > 0) {
      return {
        text: `Tell me a bit more about your background: study level, field of study, destination country and GPA. For example, "I am a Master's student in engineering from Nigeria with a 3.5 GPA and IELTS".`,
      }
    }

    const recs = performRecommendation(updatedProfile)
    if (recs.length > 0) {
      return {
        text: `Thanks! I have a few scholarships that look like a strong fit. Click a recommendation to apply via chat or visit the official programme page.`,
        items: recs,
      }
    }

    return {
      text: 'Great! I am ready to help you match with scholarships. Tell me if you would like a recommendation or want to apply directly.',
    }
  }

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const updatedProfile = parseProfileFromText(trimmed, profile)
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }

    addMessage(userMessage)
    setInput('')
    setProfile(updatedProfile)

    const response = generateResponse(trimmed, updatedProfile)
    addMessage({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: response.text,
      items: response.items,
    })
  }

  const profileItems = [
    { label: 'Study Level', value: profile.level || 'Not set', key: 'level' as const, type: 'select', options: LEVEL_OPTIONS },
    { label: 'Field of Study', value: profile.field || 'Not set', key: 'field' as const, type: 'text' as const },
    { label: 'Destination', value: profile.destination || 'Not set', key: 'destination' as const, type: 'text' as const },
    { label: 'GPA', value: profile.gpa > 0 ? `${profile.gpa.toFixed(2)} / 4.0` : 'Not set', key: 'gpa' as const, type: 'range' as const },
    { label: 'Needed Exam', value: profile.exam || 'Not set', key: 'exam' as const, type: 'select', options: EXAM_OPTIONS },
    { label: 'Nationality', value: profile.nationality || 'Not set', key: 'nationality' as const, type: 'select', options: NATIONALITY_OPTIONS },
  ]

  return (
    <section className="bg-cream py-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 lg:px-16">
        <div className="bg-white rounded-[32px] border border-gold/15 shadow-xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold mb-2">Scholarship Chat</div>
              <h2 className="font-display font-bold text-navy text-[28px] md:text-[34px]">Apply and match by chat</h2>
              <p className="max-w-2xl text-[14px] text-navy/65 mt-2">
                Tell the chat about your profile and get personalized scholarship recommendations from our list. You can also start a quick application right here.
              </p>
            </div>
            <div className="rounded-3xl bg-navy/5 border border-navy/10 p-4 text-[13px] text-navy/80">
              <div className="font-semibold text-navy mb-2">Quick tip</div>
              Share your level, field, destination and GPA in one message, e.g. “I am a Master’s student in STEM with a 3.6 GPA looking for scholarships in Germany.”
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className="h-[420px] overflow-hidden rounded-[32px] border border-gold/10 bg-cream p-4 shadow-sm">
                <div className="h-full overflow-y-auto pr-2">
                  {messages.map(message => (
                    <div key={message.id} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[92%] rounded-3xl p-4 ${message.role === 'user' ? 'bg-navy text-white' : 'bg-white text-navy border border-gold/10'}`}>
                        <div className="text-[13px] leading-6 whitespace-pre-wrap">{message.text}</div>
                        {message.items && message.items.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {message.items.map(item => (
                              <div key={item.id} className="rounded-3xl border border-gold/10 bg-white p-3 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-[14px] font-semibold text-navy">{item.name}</div>
                                    <div className="text-[12px] text-navy/50">{item.provider} · {item.country}</div>
                                  </div>
                                  <button type="button" onClick={() => handleApplyClick(item)}
                                    className="rounded-full bg-gold px-3 py-2 text-[12px] font-semibold text-navy hover:bg-gold/90 transition-all">
                                    Apply
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  type="text"
                  aria-label="Type your chat message"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask for recommendations or share your profile…"
                  className="min-w-0 flex-1 rounded-3xl border border-gold/10 bg-white px-4 py-3 text-[14px] text-navy outline-none transition-all focus:border-gold/60"
                />
                <button type="submit" className="rounded-3xl bg-navy px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-navy-mid">
                  Send
                </button>
              </form>

              <div className="rounded-3xl border border-gold/15 bg-white p-4">
                <div className="text-[12px] font-bold uppercase tracking-[2px] text-navy/50 mb-3">Application status</div>
                {savedApplications.length > 0 ? (
                  <div className="space-y-2 text-[13px] text-navy/70">
                    <p>{savedApplications.length} scholarship application{savedApplications.length === 1 ? '' : 's'} saved in chat.</p>
                    {/* Home page application form is hidden — restore with it
                    <p>Visit the homepage application form if you want to complete the GlobalReach application as well.</p>
                    */}
                  </div>
                ) : (
                  <p className="text-[13px] text-navy/50">No quick chat applications saved yet. Use the chat to recommend and apply to scholarships.</p>
                )}
                {/* Home page application form is hidden — restore with it
                <Link href="/#application"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-4 py-2 text-[13px] font-semibold text-navy transition-all hover:bg-gold/90">
                  Go to Application Form
                </Link>
                */}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-gold/15 bg-white p-5 shadow-sm">
                <div className="text-[12px] font-bold uppercase tracking-[2px] text-navy/50 mb-4">Your profile</div>
                <div className="space-y-3">
                  {profileItems.map(item => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-[12px] text-navy/60">
                        <span>{item.label}</span>
                        <span className="font-semibold text-navy">{typeof item.value === 'string' ? item.value : item.value}</span>
                      </div>
                      {item.type === 'select' ? (
                        <select
                          value={profile[item.key] as string}
                          onChange={e => handleProfileChange(item.key, e.target.value)}
                          className="w-full rounded-2xl border border-gold/15 bg-cream px-3 py-2 text-[13px] text-navy outline-none transition-all focus:border-gold"
                        >
                          <option value="">Choose...</option>
                          {item.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : item.type === 'range' ? (
                        <input
                          type="range"
                          min={0}
                          max={4}
                          step={0.1}
                          value={profile.gpa}
                          onChange={e => handleProfileChange(item.key, Number(e.target.value))}
                          className="w-full accent-[#C9A84C]"
                        />
                      ) : (
                        <input
                          type="text"
                          value={profile[item.key] as string}
                          onChange={e => handleProfileChange(item.key, e.target.value)}
                          placeholder={`Enter ${item.label.toLowerCase()}`}
                          className="w-full rounded-2xl border border-gold/15 bg-cream px-3 py-2 text-[13px] text-navy outline-none transition-all focus:border-gold"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-3xl bg-navy/5 px-4 py-3 text-[13px] text-navy/70">
                  {canRecommend ? 'Your profile is ready for recommendations.' : 'Complete the fields above for the best matches.'}
                </div>
              </div>

              <div className="rounded-3xl border border-gold/15 bg-cream p-5 shadow-sm">
                <div className="text-[12px] font-bold uppercase tracking-[2px] text-navy/50 mb-4">Top recommendations</div>
                {recommendations.length === 0 ? (
                  <p className="text-[13px] text-navy/50">Chat first to generate scholarship matches.</p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map(item => (
                      <div key={item.id} className="rounded-3xl border border-gold/10 bg-white p-3">
                        <div className="mb-2 text-[14px] font-semibold text-navy">{item.name}</div>
                        <div className="mb-3 text-[12px] text-navy/60">{item.provider} · {item.country}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={item.link} target="_blank" rel="noreferrer"
                            className="rounded-full border border-navy/10 bg-navy/5 px-3 py-2 text-[12px] text-navy transition hover:bg-navy/10">
                            View Details
                          </a>
                          <button
                            type="button"
                            onClick={() => handleApplyClick(item)}
                            className="rounded-full bg-gold px-3 py-2 text-[12px] font-semibold text-navy transition hover:bg-gold/90"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
