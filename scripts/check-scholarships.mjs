// Checks that lib/scholarships.json still lines up with the atlas snapshot (lib/world-universities.json).
//
//   node scripts/check-scholarships.mjs
//
// Errors (exit 1): a `studyIn` country that is not in the atlas, duplicate ids.
// Warnings: a `universities` name that is not in the atlas (shown as plain text on the site), or an
// atlas country without a flag in lib/country-codes.json.
// Run it after `npm run db:export` when universities or countries were renamed in the admin.
import { readFileSync } from 'node:fs'

const read = path => JSON.parse(readFileSync(new URL(`../lib/${path}`, import.meta.url), 'utf8'))
const atlas = read('world-universities.json')
const scholarships = read('scholarships.json')
const countryCodes = read('country-codes.json')

const countries = new Set()
const universityCountry = new Map()
for (const list of Object.values(atlas)) {
  for (const country of list) {
    countries.add(country.name)
    for (const u of country.universities) universityCountry.set(u.name, country.name)
  }
}

const errors = []
const outside = new Map()
const seen = new Set()
for (const s of scholarships) {
  if (seen.has(s.id)) errors.push(`${s.id}: duplicate id`)
  seen.add(s.id)
  if (!Array.isArray(s.studyIn) || !Array.isArray(s.universities)) {
    errors.push(`${s.id}: missing studyIn/universities`)
    continue
  }
  for (const c of s.studyIn) {
    if (!countries.has(c)) errors.push(`${s.id}: studyIn "${c}" is not an atlas country`)
  }
  for (const u of s.universities) {
    const c = universityCountry.get(u)
    if (!c) outside.set(u, [...(outside.get(u) ?? []), s.id])
    else if (s.studyIn.length && !s.studyIn.includes(c)) errors.push(`${s.id}: "${u}" is in ${c}, not in studyIn`)
  }
}

const linked = scholarships.filter(s => s.universities.some(u => universityCountry.has(u))).length
const countryWide = scholarships.filter(s => !s.universities.length && s.studyIn.length).length
const anywhere = scholarships.filter(s => !s.universities.length && !s.studyIn.length).length
console.log(`${scholarships.length} scholarships: ${linked} linked to atlas universities, ` +
  `${countryWide} open to universities in their study countries, ${anywhere} not tied to a destination`)
const noFlag = [...countries].filter(c => !countryCodes[c])
if (noFlag.length) {
  console.warn(`\nNo flag for ${noFlag.join(', ')}: add them to lib/country-codes.json and run node scripts/fetch-flags.mjs`)
}
if (outside.size) {
  console.warn(`\n${outside.size} named institutions are not in the atlas:`)
  for (const [u, ids] of outside) console.warn(`  ${u} (${ids.join(', ')})`)
}
if (errors.length) {
  console.error(`\n${errors.length} errors:\n  ${errors.join('\n  ')}`)
  process.exit(1)
}
