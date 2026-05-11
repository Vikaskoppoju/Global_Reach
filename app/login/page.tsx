'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) { setError(res.error ?? 'Login failed'); return }
    try {
      const stored = localStorage.getItem('gr_user')
      const role   = stored ? JSON.parse(stored).role : 'applicant'
      router.push(role === 'admin' ? '/admin' : '/')
    } catch { router.push('/') }
  }

  const fillDemo = (role: 'admin' | 'applicant') => {
    if (role === 'admin') { setEmail('admin@globalreach.org'); setPassword('admin123') }
    else                  { setEmail('priya@email.com');       setPassword('scholar123') }
  }

  const inp = `w-full px-4 py-3.5 rounded-xl border border-gold/20 bg-cream/60 text-[14px]
    text-navy outline-none transition-all duration-200 font-sans
    focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10`

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-navy p-14 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <Link href="/" className="font-display font-bold text-white text-2xl relative z-10">
          Global<span className="text-gold">Reach</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-block bg-gold/20 text-gold text-[11px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full mb-5">
            Welcome back
          </div>
          <h2 className="font-display text-white font-bold leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(34px, 3vw, 52px)', letterSpacing: '-1.5px' }}>
            Your global<br /><em className="text-gold">future awaits</em>
          </h2>
          <p className="text-white/55 text-[15px] leading-[1.75] max-w-sm mb-10">
            Sign in to track your scholarship application, browse 35+ global programmes, and connect with the GlobalReach community.
          </p>

          {/* Stats row */}
          <div className="flex gap-8">
            {[['35+', 'Scholarships'], ['40+', 'Countries'], ['$12M', 'Awarded']].map(([n, l]) => (
              <div key={l}>
                <div className="font-display font-bold text-white text-[28px] leading-none">{n}</div>
                <div className="text-white/40 text-[12px] font-medium mt-1.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3 mt-10">
            {[
              '🔍  Browse personalised scholarship matches',
              '📋  Track your application in real time',
              '📊  Admin review & status updates',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/60 text-[13px]">{f}</div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-[12px] relative z-10">© 2025 GlobalReach Scholarship Fund</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-14 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }} className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden font-display font-bold text-navy text-xl block mb-10">
            Global<span className="text-gold">Reach</span>
          </Link>

          <h1 className="font-display font-bold text-navy text-[32px] mb-1.5" style={{ letterSpacing: '-1px' }}>
            Sign in
          </h1>
          <p className="text-navy/50 text-[14px] mb-8">
            {"Don't have an account? "}
            <Link href="/signup" className="text-gold font-semibold hover:underline">Create one free →</Link>
          </p>

          {/* Demo quick-fill buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => fillDemo('admin')}
              className="py-3 px-4 text-[12px] font-bold border-2 border-gold/35 rounded-xl
                text-navy/70 hover:border-gold hover:bg-gold-pale hover:text-navy transition-all flex items-center justify-center gap-1.5">
              🔑 Demo Admin
            </button>
            <button type="button" onClick={() => fillDemo('applicant')}
              className="py-3 px-4 text-[12px] font-bold border-2 border-navy/12 rounded-xl
                text-navy/70 hover:border-navy/30 hover:bg-navy/5 hover:text-navy transition-all flex items-center justify-center gap-1.5">
              🎓 Demo Scholar
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-navy/10" />
            <span className="text-[12px] text-navy/30 font-medium whitespace-nowrap">or continue with email</span>
            <div className="flex-1 h-px bg-navy/10" />
          </div>

          {/* Error */}
          <AnimatedError message={error} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Email address</label>
              <input type="email" className={inp} placeholder="you@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-navy/50 uppercase tracking-[0.8px]">Password</label>
                <button type="button" className="text-[12px] text-gold font-semibold hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className={inp} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-navy/35 hover:text-navy transition-colors font-medium">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 mt-1 bg-navy text-white font-bold text-[15px] rounded-xl
                transition-all duration-300 hover:bg-navy-mid hover:-translate-y-0.5
                hover:shadow-[0_12px_32px_rgba(15,31,61,0.25)]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                flex items-center justify-center gap-2.5">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : 'Sign In →'}
            </button>
          </form>

          {/* Browse scholarships shortcut */}
          <Link href="/scholarships"
            className="mt-4 w-full py-3 text-[13px] font-semibold border border-gold/30 rounded-xl
              text-gold hover:bg-gold-pale transition-all flex items-center justify-center gap-2">
            🔍 Browse Scholarships without signing in
          </Link>

          <p className="text-center text-[11px] text-navy/30 mt-8 leading-relaxed">
            By signing in you agree to our{' '}
            <span className="underline cursor-pointer hover:text-navy/50">Terms</span> and{' '}
            <span className="underline cursor-pointer hover:text-navy/50">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function AnimatedError({ message }: { message: string }) {
  if (!message) return null
  return (
    <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
      className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium
        rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
      <span className="text-base">⚠️</span> {message}
    </motion.div>
  )
}
