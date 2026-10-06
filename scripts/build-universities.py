"""Regenerate lib/world-universities.json from World_Universities_International_Students.xlsx.

Usage (from the Global_Reach folder):
    python scripts/build-universities.py [path/to/World_Universities_International_Students.xlsx]

WARNING: once the database is in use, it is the source of truth and `npm run db:export` writes
this file. Running this script overwrites admin edits in the snapshot. Only use it to re-import
the spreadsheet, then load it with `npm run db:seed -- --force` (see .claude/skills/atlas-data).
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'World_Universities_International_Students.xlsx'
OUT = ROOT / 'lib' / 'world-universities.json'
LOGO_DIR = ROOT / 'public' / 'logos'  # filled by scripts/fetch-logos.py
DOMAINS = json.loads((ROOT / 'scripts' / 'university-domains.json').read_text(encoding='utf-8'))
_sources = ROOT / 'scripts' / 'logo-sources.json'
LOGO_SOURCES = json.loads(_sources.read_text(encoding='utf-8')) if _sources.exists() else {}

# Countries left off the site even though they appear in the spreadsheet
EXCLUDED_COUNTRIES = {'Israel'}

def slugify(name: str) -> str:
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def university(name: str) -> dict:
    entry = {'name': name}
    logo = LOGO_DIR / f'{slugify(name)}.png'
    if logo.exists():
        entry['logo'] = f'/logos/{logo.name}'
    # Link a website only when its own icon was fetched and reviewed, which proves the domain is live
    # and belongs to the university (some dataset domains are stale or hijacked)
    if LOGO_SOURCES.get(name) == 'site' and name in DOMAINS:
        entry['website'] = f'https://{DOMAINS[name]}'
    return entry


def main() -> None:
    ws = openpyxl.load_workbook(SRC, data_only=True)['All Universities']
    continents: dict[str, dict[str, list[str]]] = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        sno, name, country, continent = row[:4]
        if not isinstance(sno, int) or not name:
            continue  # skip blank and note rows
        if country.strip() in EXCLUDED_COUNTRIES:
            continue
        continents.setdefault(continent.strip(), {}).setdefault(country.strip(), []).append(name.strip())

    data = {
        continent: [{'name': c, 'universities': [university(u) for u in unis]} for c, unis in countries.items()]
        for continent, countries in continents.items()
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    total = sum(len(c['universities']) for cs in data.values() for c in cs)
    logos = sum('logo' in u for cs in data.values() for c in cs for u in c['universities'])
    print(f'wrote {OUT.name}: {len(data)} continents, {sum(map(len, data.values()))} countries, '
          f'{total} universities, {logos} logos')


if __name__ == '__main__':
    main()
