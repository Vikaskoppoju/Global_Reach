'use client'

import { useState } from 'react'
import ScholarshipChatbot from '@/components/ui/ScholarshipChatbot'

export default function ChatLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy shadow-[0_20px_50px_rgba(255,195,0,0.25)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label="Open scholarship chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 18.5 3 21V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7Z" />
          <path strokeLinecap="round" d="M8 9.5h8M8 13h5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
          <div className="relative w-full max-w-[1040px] rounded-[32px] bg-white shadow-2xl shadow-navy/10 ring-1 ring-navy/10">
            <div className="flex items-center justify-between gap-3 border-b border-gold/10 p-4 sm:p-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold">GlobalReach Chat</div>
                <h3 className="text-lg font-semibold text-navy">Chat advisor for scholarship matches</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-navy/10 bg-cream text-navy transition hover:bg-navy/5"
                aria-label="Close scholarship chat"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
              <ScholarshipChatbot />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
