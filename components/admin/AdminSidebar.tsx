'use client'

import { useState, type ReactNode } from 'react'
import type { MasterView } from '@/components/admin/AtlasMasters'

export type AdminView = 'applications' | MasterView | 'activity'

interface MenuItem { id: AdminView; label: string }
interface MenuGroup { label: string; icon: ReactNode; items: MenuItem[] }

const ICONS = {
  applications: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h4l2 3h4l2-3h4M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z" />
    </svg>
  ),
  activity: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </svg>
  ),
  masters: (
    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    </svg>
  ),
}

// Top-level entries: a single item, or a group that expands to its sub-items
const MENU: (MenuItem & { icon: ReactNode } | MenuGroup)[] = [
  { id: 'applications', label: 'Applications', icon: ICONS.applications },
  {
    label: 'Masters',
    icon: ICONS.masters,
    items: [
      { id: 'continents', label: 'Continents' },
      { id: 'countries', label: 'Countries' },
      { id: 'universities', label: 'Universities' },
    ],
  },
  { id: 'activity', label: 'Activity Log', icon: ICONS.activity },
]

const isGroup = (entry: (typeof MENU)[number]): entry is MenuGroup => 'items' in entry

interface Props {
  view: AdminView
  onSelect: (view: AdminView) => void
}

export default function AdminSidebar({ view, onSelect }: Props) {
  // Groups start expanded; the header toggles them
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MENU.filter(isGroup).map(g => [g.label, true])))

  const rowCls = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition-colors
     ${active ? 'bg-navy text-white' : 'text-navy/65 hover:bg-gold-pale hover:text-navy'}`

  return (
    <>
      {/* Desktop: fixed-width menu beside the content */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-gold/15 bg-white">
        <nav className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto p-4" aria-label="Admin">
          <p className="px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[1.5px] text-navy/35">Menu</p>
          <ul className="flex flex-col gap-1">
            {MENU.map(entry => isGroup(entry) ? (
              <li key={entry.label}>
                <button type="button" aria-expanded={open[entry.label]}
                  onClick={() => setOpen(o => ({ ...o, [entry.label]: !o[entry.label] }))}
                  className={rowCls(false)}>
                  <span className={entry.items.some(i => i.id === view) ? 'text-gold' : ''}>{entry.icon}</span>
                  <span className={`flex-1 ${entry.items.some(i => i.id === view) ? 'text-navy font-semibold' : ''}`}>
                    {entry.label}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-navy/40 transition-transform ${open[entry.label] ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </button>
                {open[entry.label] && (
                  <ul className="ml-[22px] mt-1 flex flex-col gap-0.5 border-l border-gold/20 pl-3">
                    {entry.items.map(item => (
                      <li key={item.id}>
                        <button type="button" onClick={() => onSelect(item.id)}
                          aria-current={view === item.id ? 'page' : undefined}
                          className={`w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors
                            ${view === item.id ? 'bg-navy text-white font-semibold' : 'text-navy/60 hover:bg-gold-pale hover:text-navy'}`}>
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={entry.id}>
                <button type="button" onClick={() => onSelect(entry.id)}
                  aria-current={view === entry.id ? 'page' : undefined} className={rowCls(view === entry.id)}>
                  <span className={view === entry.id ? 'text-gold' : ''}>{entry.icon}</span>
                  {entry.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile: the same menu as a grouped dropdown above the content */}
      <div className="lg:hidden px-5 pt-5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-navy/45" htmlFor="admin-view">Section</label>
        <select id="admin-view" value={view} onChange={e => onSelect(e.target.value as AdminView)}
          className="mt-1.5 w-full rounded-xl border border-gold/20 bg-white px-4 py-2.5 text-[14px] text-navy outline-none focus:border-gold">
          {MENU.map(entry => isGroup(entry) ? (
            <optgroup key={entry.label} label={entry.label}>
              {entry.items.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </optgroup>
          ) : (
            <option key={entry.id} value={entry.id}>{entry.label}</option>
          ))}
        </select>
      </div>
    </>
  )
}
