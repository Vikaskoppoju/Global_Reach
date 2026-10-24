'use client'

import { useEffect, useMemo, useState } from 'react'
import { ENQUIRY_OPTIONS, getService, isComingSoon } from '@/lib/services'
import { baseScholarships } from '@/lib/scholarships'

const labelCls = 'text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-1.5'
const optional = <span className="normal-case font-normal">(optional)</span>

interface Props {
  // Preselected service or bundle; the student can still change it
  service?: string
  id?: string
}

const CALL_TIMES = [
  { value: 'any', label: 'Any time' },
  { value: 'morning', label: 'Morning (9am–12pm)' },
  { value: 'afternoon', label: 'Afternoon (12–4pm)' },
  { value: 'evening', label: 'Evening (4–8pm)' },
]

// What happens after the form, shown at the top so students know there's no checkout
const NEXT_STEPS = ['Submit your details', 'Free consultation call', 'Confirm your enrolment']

const EMPTY = { name: '', phone: '', email: '', callTime: 'any', currentScore: '', targetIntake: '', message: '', website: '' }

function PhoneIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinejoin="round" d="M5 4h3.5l1.8 4.4-2.2 1.4a11 11 0 0 0 6.1 6.1l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

export default function EnquiryForm({ service: initialService = '', id = 'enquire' }: Props) {
  const [service, setService] = useState(initialService)
  const [pkg, setPkg] = useState('')
  const [fields, setFields] = useState(EMPTY)
  const [consent, setConsent] = useState(false)
  const [scholarshipId, setScholarshipId] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  // Links from a scholarship (?scholarship=s001) or a package button (?package=…, ?service=…) prefill the form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('scholarship')
    if (sid && baseScholarships.some(s => s.id === sid)) setScholarshipId(sid)
    const svc = params.get('service')
    if (svc && ENQUIRY_OPTIONS.some(o => o.value === svc)) setService(svc)
    const p = params.get('package')
    if (p) setPkg(p)
  }, [])

  const packages = getService(service)?.packages ?? []
  // Drop a package that doesn't belong to the newly chosen service
  useEffect(() => {
    if (pkg && !packages.some(p => p.name === pkg)) setPkg('')
  }, [service]) // eslint-disable-line react-hooks/exhaustive-deps

  const scholarship = useMemo(() => baseScholarships.find(s => s.id === scholarshipId), [scholarshipId])
  const isTestPrep = getService(service)?.category === 'test-prep'
  const notify = isComingSoon(service)
  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [key]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fields.name.trim()) return setError('Please enter your name.')
    if (!fields.phone.trim()) return setError('Please enter your phone or WhatsApp number, so we can call you back.')
    if (!consent) return setError('Please agree that we can call you about your request.')
    setState('sending')
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, service, package: notify ? '' : pkg, scholarshipId, consent }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'We couldn’t send your request. Please try again.')
      setState('sent')
    } catch (err) {
      setError((err as Error).message)
      setState('idle')
    }
  }

  const firstName = fields.name.trim().split(' ')[0]
  const when = CALL_TIMES.find(t => t.value === fields.callTime)

  if (state === 'sent') {
    return (
      <div id={id} className="scroll-mt-28 rounded-3xl bg-white border border-gold/20 p-8 text-center" role="status">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
          {notify ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
            </svg>
          ) : <PhoneIcon className="w-7 h-7" />}
        </div>
        <h3 className="font-display font-bold text-navy text-[22px] mb-2">{notify ? 'You’re on the list' : 'We’ll call you back'}</h3>
        <p className="text-[14px] text-navy/60 max-w-md mx-auto leading-relaxed">
          {notify
            ? <>Thanks, {firstName}. We’ll contact you on <strong className="text-navy">{fields.phone}</strong> as soon as this service opens.</>
            : <>Thanks, {firstName}. A counsellor will call you on <strong className="text-navy">{fields.phone}</strong>
              {when && when.value !== 'any' ? <> in the <strong className="text-navy">{when.value}</strong></> : null}
              {' '}for your free consultation. Please keep your phone handy.</>}
        </p>
      </div>
    )
  }

  return (
    <form id={id} onSubmit={submit} noValidate
      className="scroll-mt-28 rounded-3xl bg-white border border-gold/20 overflow-hidden flex flex-col">
      {/* What happens next */}
      <div className="bg-navy text-white px-6 md:px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-gold text-navy flex items-center justify-center shrink-0">
            <PhoneIcon />
          </span>
          <h3 className="font-display font-bold text-[22px] leading-tight">
            {notify ? 'Get notified when it opens' : 'Request a call back'}
          </h3>
        </div>
        <p className="text-[14px] text-white/65 mt-3 leading-relaxed">
          {notify
            ? 'This service is launching soon. Leave your number and we’ll contact you first.'
            : 'Share your details and a counsellor will call you for a free consultation: we’ll understand your goals, answer your questions and recommend the right programme. No upfront payment.'}
        </p>
        {!notify && (
          <ol className="mt-4 grid grid-cols-3 gap-2">
            {NEXT_STEPS.map((step, i) => (
              <li key={step} className="rounded-xl bg-white/[0.07] px-3 py-2.5">
                <span className="block text-gold text-[12px] font-bold">{i + 1}</span>
                <span className="block text-[12px] leading-snug text-white/80">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-5">
        {scholarship && (
          <p className="rounded-xl bg-gold-pale border border-gold/25 px-4 py-3 text-[13px] text-navy/75">
            Preparing for <strong className="text-navy">{scholarship.name}</strong>
            <button type="button" onClick={() => setScholarshipId('')} className="ml-2 text-gold font-semibold hover:text-navy">Remove</button>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className={labelCls}>Your name</label>
            <input id={`${id}-name`} required autoComplete="name" value={fields.name} onChange={set('name')} className="form-input-base" />
          </div>
          <div>
            <label htmlFor={`${id}-phone`} className={labelCls}>Phone / WhatsApp</label>
            <input id={`${id}-phone`} type="tel" required autoComplete="tel" placeholder="e.g. 98765 43210"
              value={fields.phone} onChange={set('phone')} className="form-input-base" />
          </div>
          <div>
            <label htmlFor={`${id}-time`} className={labelCls}>Best time to call</label>
            <select id={`${id}-time`} value={fields.callTime} onChange={set('callTime')} className="form-input-base">
              {CALL_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-email`} className={labelCls}>Email {optional}</label>
            <input id={`${id}-email`} type="email" autoComplete="email" value={fields.email} onChange={set('email')} className="form-input-base" />
          </div>
          <div>
            <label htmlFor={`${id}-service`} className={labelCls}>What do you need help with?</label>
            <select id={`${id}-service`} value={service} onChange={e => setService(e.target.value)} className="form-input-base">
              <option value="">Not sure yet, help me choose</option>
              {ENQUIRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {packages.length > 1 && !notify ? (
            <div>
              <label htmlFor={`${id}-package`} className={labelCls}>Option {optional}</label>
              <select id={`${id}-package`} value={pkg} onChange={e => setPkg(e.target.value)} className="form-input-base">
                <option value="">Not sure yet</option>
                {packages.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          ) : isTestPrep ? (
            <div>
              <label htmlFor={`${id}-score`} className={labelCls}>Current or target score {optional}</label>
              <input id={`${id}-score`} placeholder="e.g. 6.0 now, need 6.5" value={fields.currentScore} onChange={set('currentScore')} className="form-input-base" />
            </div>
          ) : (
            <div>
              <label htmlFor={`${id}-intake`} className={labelCls}>Planned intake {optional}</label>
              <input id={`${id}-intake`} placeholder="e.g. Fall 2027" value={fields.targetIntake} onChange={set('targetIntake')} className="form-input-base" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-message`} className={labelCls}>Anything we should know before we call? {optional}</label>
          <textarea id={`${id}-message`} rows={2} value={fields.message} onChange={set('message')} className="form-input-base resize-y"
            placeholder="Your deadline, current score, the course you’re applying to…" />
        </div>

        {/* Honeypot: hidden from people, often filled in by bots */}
        <div className="hidden" aria-hidden>
          <label htmlFor={`${id}-website`}>Website</label>
          <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={fields.website} onChange={set('website')} />
        </div>

        <label className="flex items-start gap-3 text-[13px] text-navy/65 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#C9A84C]" />
          <span>I agree that GlobalReach can call me, or message me on WhatsApp or email, about this request.</span>
        </label>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700" role="alert">{error}</p>}

        <button type="submit" disabled={state === 'sending'}
          className="w-full py-3.5 bg-gold text-navy font-bold text-[15px] rounded-xl inline-flex items-center justify-center gap-2
            transition-all hover:bg-gold-light hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0">
          <PhoneIcon className="w-[18px] h-[18px]" />
          {state === 'sending' ? 'Sending…' : notify ? 'Notify me' : 'Request a call back'}
        </button>
        {!notify && <p className="-mt-2 text-center text-[12px] text-navy/45">Free, no obligation. Takes less than a minute.</p>}
      </div>
    </form>
  )
}
