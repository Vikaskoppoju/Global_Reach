'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

const FEATURES = [
  'Browse 35+ world-class scholarships',
  'Get personalised matches by your scores',
  'Apply through our guided smart form',
  'Track application status in real time',
]

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [agree,    setAgree]    = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  const strength =
    password.length === 0 ? 0 :
    password.length < 6   ? 1 :
    password.length < 10  ? 2 :
    /[A-Z]/.test(password) && /[0-9!@#$%]/.test(password) ? 4 : 3

  const strengthMeta = [
    { label: '',       color: 'bg-navy/10' },
    { label: 'Weak',   color: 'bg-red-400' },
    { label: 'Fair',   color: 'bg-yellow-400' },
    { label: 'Good',   color: 'bg-blue-400' },
    { label: 'Strong', color: 'bg-green-400' },
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!agree) { setError('Please accept the Terms to continue.'); return }
    setError(''); setLoading(true)
    const res = await signup(name, email, password)
    setLoading(false)
    if (!res.ok) { setError(res.error ?? 'Signup failed'); return }
    router.push('/')
  }

  const inp = `w-full px-4 py-3.5 rounded-xl border border-gold/20 bg-cream/60 text-[14px]
    text-navy outline-none transition-all duration-200 font-sans
    focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10`

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-navy p-14 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[450px] h-[450px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-16 w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <Link href="/" className="font-display font-bold text-white text-2xl relative z-10">
          Global<span className="text-gold">Reach</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-block bg-gold/20 text-gold text-[11px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full mb-5">
            Join thousands of scholars
          </div>
          <h2 className="font-display text-white font-bold leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(32px, 3vw, 48px)', letterSpacing: '-1.5px' }}>
            Begin your<br /><em className="text-gold">scholarship journey</em>
          </h2>
          <div className="flex flex-col gap-4 mt-8">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/8 text-gold flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
                  </svg>
                </div>
                <span className="text-white/65 text-[14px] leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-[12px] relative z-10">© 2025 GlobalReach Scholarship Fund</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }} className="w-full max-w-[440px] py-2">

          <Link href="/" className="lg:hidden font-display font-bold text-navy text-xl block mb-10">
            Global<span className="text-gold">Reach</span>
          </Link>

          <h1 className="font-display font-bold text-navy text-[30px] mb-1.5" style={{ letterSpacing: '-1px' }}>
            Create your account
          </h1>
          <p className="text-navy/50 text-[14px] mb-8">
            Already have an account?{' '}
            <Link href="/login" className="text-gold font-semibold hover:underline">Sign in →</Link>
          </p>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium
                rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7.5v5.5M12 16.5v.01" />
              </svg> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Full Name</label>
              <input type="text" className={inp} placeholder="Anika Sharma"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Email Address</label>
              <input type="email" className={inp} placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className={inp} placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-navy/35 hover:text-navy font-medium transition-colors">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-400
                        ${i <= strength ? strengthMeta[strength].color : 'bg-navy/10'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-navy/45 w-10 text-right">
                    {strengthMeta[strength].label}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Confirm Password</label>
              <input type="password"
                className={`${inp} ${confirm && confirm !== password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="Re-enter password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
              {confirm && confirm !== password && (
                <span className="text-[12px] text-red-500 font-medium">Passwords do not match</span>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer mt-1 group">
              <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
                ${agree ? 'bg-gold border-gold' : 'border-navy/25 group-hover:border-gold/50'}`}
                onClick={() => setAgree(!agree)}>
                {agree && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>}
              </div>
              <input type="checkbox" className="sr-only" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span className="text-[13px] text-navy/55 leading-relaxed">
                I agree to the{' '}
                <span className="text-gold font-semibold hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-gold font-semibold hover:underline cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 mt-2 bg-navy text-white font-bold text-[15px] rounded-xl
                transition-all duration-300 hover:bg-navy-mid hover:-translate-y-0.5
                hover:shadow-[0_12px_32px_rgba(15,31,61,0.25)]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                flex items-center justify-center gap-2.5">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-[11px] text-navy/30 mt-7 leading-relaxed">
            Free to join · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  )
}
