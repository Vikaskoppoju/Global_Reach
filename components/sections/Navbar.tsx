'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Destinations', href: '#countries' },
  { label: 'Policies', href: '#policies' },
  { label: 'How to Apply', href: '#process' },
  { label: 'Alumni', href: '#testimonials' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
          px-5 md:px-10 lg:px-16 transition-all duration-400
          bg-cream/85 backdrop-blur-xl border-b border-gold/15
          ${scrolled ? 'py-3 shadow-sm' : 'py-5'}`}
      >
        {/* Logo */}
        <a href="#home" className="font-display text-xl font-bold text-navy tracking-tight">
          Global<span className="text-gold">Reach</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-[14px] font-medium text-navy/70 hover:text-navy transition-colors duration-300 group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#application"
            className="bg-navy text-white text-[13px] font-semibold px-5 py-2.5 rounded-full
              transition-all duration-300 hover:bg-navy-mid hover:-translate-y-0.5"
          >
            Apply Now
          </a>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-[5px] w-10 h-10 items-center justify-center p-1 z-[60]"
          aria-label="Toggle menu"
        >
          <span className={`block h-[2px] w-6 bg-navy rounded-full transition-all duration-350
            ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block h-[2px] w-6 bg-navy rounded-full transition-all duration-350
            ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block h-[2px] w-6 bg-navy rounded-full transition-all duration-350
            ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-2 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 + 0.1 }}
                className="font-display text-[32px] font-bold text-navy py-3 hover:text-gold transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#application"
              onClick={closeMobile}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5 bg-navy text-white text-base font-semibold px-10 py-4 rounded-full"
            >
              Apply Now
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
