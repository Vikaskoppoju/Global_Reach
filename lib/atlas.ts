'use client'

// The atlas (continents → countries → universities).
//   db mode (development): loaded from PostgreSQL via /api/atlas. Pages render the bundled
//     snapshot first, then switch to the database copy; if the database is unreachable they
//     keep showing the snapshot.
//   static mode (production): the bundled snapshot in lib/ only, no request is made.
// See lib/atlas-source.ts and .claude/skills/atlas-data/SKILL.md.

import { useCallback, useEffect, useState } from 'react'
import { continents as bundledContinents } from '@/lib/data'
import { ATLAS_SOURCE } from '@/lib/atlas-source'
import type { Continent, UniversityListing } from '@/types'

const CHANGE_EVENT = 'gr-atlas-change'

export interface AtlasState {
  atlas: Continent[]
  // 'db' once loaded from the database; 'fallback' if it couldn't be reached;
  // 'static' when the app runs on the bundled snapshot by design (production)
  source: 'loading' | 'db' | 'fallback' | 'static'
  error?: string
}

// One request shared by every component on the page; cleared when an admin change is saved
let pending: Promise<Continent[]> | null = null

function fetchAtlas(): Promise<Continent[]> {
  pending ??= fetch('/api/atlas', { cache: 'no-store' }).then(async res => {
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new Error(body?.error ?? `Could not load the atlas (${res.status})`)
    return body as Continent[]
  })
  pending.catch(() => { pending = null }) // allow a retry after a failure
  return pending
}

// Call after any admin change so every page showing the atlas reloads it
export function notifyAtlasChanged() {
  pending = null
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useAtlasState(): AtlasState & { reload: () => void } {
  const [state, setState] = useState<AtlasState>({
    atlas: bundledContinents,
    source: ATLAS_SOURCE === 'static' ? 'static' : 'loading',
  })

  const load = useCallback(() => {
    if (ATLAS_SOURCE === 'static') return
    fetchAtlas()
      .then(atlas => setState({ atlas, source: 'db' }))
      .catch((err: Error) => setState({ atlas: bundledContinents, source: 'fallback', error: err.message }))
  }, [])

  useEffect(() => {
    load()
    window.addEventListener(CHANGE_EVENT, load)
    return () => window.removeEventListener(CHANGE_EVENT, load)
  }, [load])

  return { ...state, reload: notifyAtlasChanged }
}

export function useAtlas(): Continent[] {
  return useAtlasState().atlas
}

// Admin API call; throws with the server's message so forms can show it
export async function adminRequest<T = unknown>(
  method: 'POST' | 'PUT' | 'DELETE', path: string, actor: string, body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-user': actor },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`)
  return data as T
}

// Uploads an image and returns its URL (/api/uploads/<id>) for use as a logo
export async function adminUpload(file: File, actor: string): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/admin/uploads', { method: 'POST', headers: { 'x-admin-user': actor }, body })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`)
  return data.url as string
}

export function flattenUniversities(atlas: Continent[]): UniversityListing[] {
  return atlas.flatMap(c =>
    c.countries.flatMap(country =>
      country.universities.map(u => ({ ...u, country: country.name, continentId: c.id, continentName: c.name })),
    ),
  )
}

export function countUniversities(continent: Continent) {
  return continent.countries.reduce((sum, country) => sum + country.universities.length, 0)
}

export function topUniversities(continent: Continent): UniversityListing[] {
  const all = flattenUniversities([continent])
  return continent.top
    .map(name => all.find(u => u.name === name))
    .filter((u): u is UniversityListing => u !== undefined)
}
