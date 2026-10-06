'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAtlas, flattenUniversities, countUniversities } from '@/lib/atlas'
import SearchableSelect from '@/components/ui/SearchableSelect'
import UniversityLogo from '@/components/ui/UniversityLogo'

const PAGE_SIZE = 60

const rowClass = (active: boolean) =>
  `flex w-full items-baseline justify-between gap-3 border-b border-gold/15 py-2.5 text-left text-[14px] transition-colors
   ${active ? 'font-semibold text-navy' : 'text-navy/60 hover:text-navy'}`

export default function UniversityDirectory() {
  const params = useSearchParams()
  const continents = useAtlas()
  const allUniversities = useMemo(() => flattenUniversities(continents), [continents])
  const [q, setQ] = useState(() => params.get('q') ?? '')
  const [country, setCountry] = useState<string | null>(() => {
    const c = params.get('country')
    return allUniversities.some(u => u.country === c) ? c : null
  })
  const [region, setRegion] = useState<string | null>(() => {
    const r = params.get('region')
    if (continents.some(c => c.id === r)) return r
    // A country-only link still selects its region
    return allUniversities.find(u => u.country === params.get('country'))?.continentId ?? null
  })
  const [shown, setShown] = useState(PAGE_SIZE)

  // replaceState keeps the URL shareable without a navigation (and scroll jump) per keystroke
  useEffect(() => {
    const search = new URLSearchParams()
    if (q.trim()) search.set('q', q.trim())
    if (region) search.set('region', region)
    if (country) search.set('country', country)
    const qs = search.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    setShown(PAGE_SIZE)
  }, [q, region, country])

  const continent = continents.find(c => c.id === region) ?? null

  const countryOptions = useMemo(() => {
    const source = continent ? continent.countries : continents.flatMap(c => c.countries)
    const list = [...source].sort((a, b) => a.name.localeCompare(b.name))
    const total = list.reduce((sum, c) => sum + c.universities.length, 0)
    return [
      { value: '', label: continent ? `All of ${continent.name}` : 'All countries', meta: String(total) },
      ...list.map(c => ({ value: c.name, label: c.name, meta: String(c.universities.length) })),
    ]
  }, [continent, continents])

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase()
    return allUniversities.filter(u =>
      (!region || u.continentId === region) &&
      (!country || u.country === country) &&
      (!query || [u.name, u.country].some(f => f.toLowerCase().includes(query))),
    )
  }, [q, region, country, allUniversities])

  const selectRegion = (id: string | null) => {
    setRegion(id)
    // Keep the country only if it belongs to the new region
    if (id && country && !continents.find(c => c.id === id)?.countries.some(c => c.name === country)) {
      setCountry(null)
    }
  }

  const selectCountry = (name: string | null) => {
    setCountry(name)
    if (name) setRegion(allUniversities.find(u => u.country === name)?.continentId ?? null)
  }

  const heading = country ?? continent?.name ?? 'All universities'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy px-5 md:px-10 lg:px-16 pt-32 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-4xl">
          <nav className="text-[13px] text-white/50 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/75">Universities</span>
          </nav>
          <div className="text-gold text-[11px] font-bold tracking-[2px] uppercase mb-3">University Directory</div>
          <h1 className="font-display font-bold text-white mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Every University,<br /><em className="text-gold">Region by Region</em>
          </h1>
          <p className="text-white/55 text-[16px] leading-relaxed max-w-2xl">
            {allUniversities.length.toLocaleString('en-US')} universities across{' '}
            {continents.reduce((sum, c) => sum + c.countries.length, 0)} countries that admit international
            students. Filter by region and country, or search by name.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10 md:py-14 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        {/* Filters */}
        {/* top-24 keeps the sticky sidebar clear of the fixed navbar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <label htmlFor="uq" className="text-[11px] font-bold text-navy/50 uppercase tracking-wide">Search</label>
          <input id="uq" type="search" value={q} onChange={e => setQ(e.target.value)}
            placeholder="University or country"
            className="mt-2 w-full bg-white border border-gold/20 rounded-xl px-4 py-2.5 text-[13px] text-navy
              placeholder:text-navy/35 outline-none focus:border-gold focus:ring-4 focus:ring-gold/10" />

          <p className="mt-6 mb-2 text-[11px] font-bold text-navy/50 uppercase tracking-wide">Country</p>
          <SearchableSelect
            tone="light"
            value={country ?? ''}
            onChange={v => selectCountry(v || null)}
            searchPlaceholder="Search countries…"
            options={countryOptions}
          />

          <p className="mt-8 text-[11px] font-bold text-navy/50 uppercase tracking-wide">Region</p>
          <ul className="mt-2 border-t border-gold/15">
            <li>
              <button type="button" onClick={() => selectRegion(null)} className={rowClass(region === null)}>
                <span>All regions</span><span className="text-navy/40 text-[12px]">{allUniversities.length}</span>
              </button>
            </li>
            {continents.map(c => (
              <li key={c.id}>
                <button type="button" onClick={() => selectRegion(c.id)} className={rowClass(region === c.id)}>
                  <span>{c.name}</span>
                  <span className="text-navy/40 text-[12px]">
                    {countUniversities(c)}
                  </span>
                </button>
              </li>
            ))}
          </ul>


          <div className="mt-8 hidden lg:block rounded-2xl bg-gold-pale border border-gold/20 p-4 text-[13px] leading-relaxed text-navy/65">
            Entry requirements, programmes and tuition vary. Confirm with each university&apos;s international
            admissions office before applying.
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-navy pb-2">
            <h2 className="font-display text-[22px] font-bold text-navy">
              {heading}
            </h2>
            <span className="text-[13px] text-navy/50 whitespace-nowrap">
              {visible.length} {visible.length === 1 ? 'university' : 'universities'}
            </span>
          </div>

          {visible.length === 0 && (
            <p className="py-12 font-display text-lg text-navy/60">
              No universities match &ldquo;{q}&rdquo;.{' '}
              <button type="button" onClick={() => setQ('')} className="text-gold underline underline-offset-4">
                Clear the search
              </button>
            </p>
          )}

          <ul>
            {visible.slice(0, shown).map(u => (
              <li key={`${u.country}-${u.name}`}
                className="grid grid-cols-[56px_1fr] gap-4 sm:gap-5 border-b border-gold/15 py-5 items-center">
                <UniversityLogo name={u.name} logo={u.logo} size="lg" tone="light" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-navy/45">
                    {u.country} · {u.continentName}
                  </p>
                  <h3 className="mt-1 font-display text-[18px] md:text-[20px] font-semibold leading-snug text-navy">
                    {u.name}
                  </h3>
                  <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                    {u.website && (
                      <a href={u.website} target="_blank" rel="noopener noreferrer"
                        className="font-semibold text-gold hover:text-navy transition-colors">
                        Visit website ↗
                      </a>
                    )}
                    {country !== u.country && (
                      <button type="button" onClick={() => selectCountry(u.country)}
                        className="text-navy/55 hover:text-navy transition-colors">
                        More in {u.country}
                      </button>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {shown < visible.length && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setShown(n => n + PAGE_SIZE)}
                className="btn-primary">
                Show more ({visible.length - shown} remaining)
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
