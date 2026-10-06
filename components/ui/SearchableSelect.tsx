'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

export interface SelectOption {
  value: string
  label: string
  icon?: string
  meta?: string
}

interface Props {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  // Trigger styling: 'dark' for navy sections, 'light' for cream pages (the open menu is navy in both)
  tone?: 'dark' | 'light'
}

const GAP = 16           // breathing room kept between the menu and the viewport edge
const TOP_INSET = 80     // height of the fixed site navbar, which covers the top of the viewport
const SEARCH_ROW = 56    // height of the menu's search box row
const LIST_MAX = 256
const LIST_MIN = 120

const TRIGGER = {
  dark: 'bg-white/10 border-white/15 rounded-full py-2 text-white',
  light: 'bg-white border-gold/20 rounded-xl py-2.5 text-navy',
}

export default function SearchableSelect({
  options, value, onChange, placeholder = 'Select…', searchPlaceholder = 'Search…', className = '', tone = 'dark',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  // Where the menu opens and how tall its list may be, so it always fits on screen. Needed because the
  // control can sit in a sticky sidebar, where page scrolling can't reveal a menu cut off by the viewport.
  const [placement, setPlacement] = useState<{ up: boolean; listMax: number }>({ up: false, listMax: LIST_MAX })

  const selected = options.find(o => o.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const place = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom - GAP - SEARCH_ROW
    const above = rect.top - TOP_INSET - GAP - SEARCH_ROW
    const up = below < LIST_MAX && above > below
    setPlacement({ up, listMax: Math.max(LIST_MIN, Math.min(LIST_MAX, up ? above : below)) })
  }, [])

  // Re-measure while open, as scrolling or resizing moves the trigger
  useEffect(() => {
    if (!open) return
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  // Reset the filter and highlight the current value each time the menu opens
  const openMenu = () => {
    place()
    setQuery('')
    setActive(Math.max(0, options.findIndex(o => o.value === value)))
    setOpen(true)
  }

  // Keep the highlighted option in view
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (o: SelectOption) => {
    onChange(o.value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) choose(filtered[active]) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={e => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); openMenu() } }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 border px-4 text-[13px] outline-none
          focus-visible:border-gold ${TRIGGER[tone]}`}
      >
        <span className="truncate">
          {selected ? <>{selected.icon} {selected.label}{selected.meta && <span className="opacity-60"> ({selected.meta})</span>}</> : placeholder}
        </span>
        <span className={`${tone === 'dark' ? 'text-white/50' : 'text-navy/40'} text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className={`absolute z-30 w-full min-w-[240px] rounded-2xl bg-navy border border-white/15
          shadow-2xl overflow-hidden flex ${placement.up ? 'bottom-full mb-2 flex-col-reverse' : 'top-full mt-2 flex-col'}`}>
          <div className={`p-2 border-white/10 ${placement.up ? 'border-t' : 'border-b'}`}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setActive(0) }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
              className="w-full bg-white/10 rounded-lg px-3 py-1.5 text-[13px] text-white
                placeholder:text-white/40 outline-none"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="overflow-y-auto py-1"
            style={{ maxHeight: placement.listMax }}>
            {filtered.map((o, i) => (
              <li
                key={o.value || '__all'}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={e => e.preventDefault()}
                onClick={() => choose(o)}
                className={`flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer
                  ${i === active ? 'bg-white/10' : ''} ${o.value === value ? 'text-gold-light font-semibold' : 'text-white/85'}`}
              >
                {o.icon && <span>{o.icon}</span>}
                <span className="flex-1 truncate">{o.label}</span>
                {o.meta && <span className="text-white/40 text-[11px]">{o.meta}</span>}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[13px] text-white/45">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
