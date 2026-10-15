// Downloads a PNG flag for every country in lib/country-codes.json into public/flags/<code>.png.
//
//   node scripts/fetch-flags.mjs          # only missing flags
//   node scripts/fetch-flags.mjs --force  # re-download all
//
// Flags come from flagcdn.com (public domain flag images). They are committed so production makes no
// external requests. Add a country to lib/country-codes.json when one is added to the atlas.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const codes = JSON.parse(readFileSync(new URL('../lib/country-codes.json', import.meta.url), 'utf8'))
const dir = new URL('../public/flags/', import.meta.url)
mkdirSync(dir, { recursive: true })
const force = process.argv.includes('--force')

let fetched = 0
for (const code of new Set(Object.values(codes))) {
  const file = new URL(`${code}.png`, dir)
  if (!force && existsSync(file)) continue
  const res = await fetch(`https://flagcdn.com/w160/${code}.png`)
  if (!res.ok) {
    console.error(`${code}: HTTP ${res.status}`)
    process.exitCode = 1
    continue
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  fetched++
}
console.log(`fetched ${fetched} flags into public/flags/`)
