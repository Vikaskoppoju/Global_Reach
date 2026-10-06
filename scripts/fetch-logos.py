"""Download university logos (site icons) into public/logos/ using scripts/university-domains.json.

Usage (from the Global_Reach folder):
    python scripts/fetch-logos.py [--force]

Tries Google's and DuckDuckGo's favicon services, then the icons declared on the
university's homepage, and keeps the largest (downscaled to MAX_SIZE). If none is big
enough, falls back to the logo/seal on the university's English Wikipedia page. Icons smaller
than MIN_SIZE px are discarded (they look blurry) and the site falls back to initials.
Then run scripts/build-universities.py to link the downloaded logos into the data.
"""
import io
import json
import re
import sys
import unicodedata
import ssl
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DOMAINS = json.loads((ROOT / 'scripts' / 'university-domains.json').read_text(encoding='utf-8'))
LOGO_DIR = ROOT / 'public' / 'logos'
# name -> 'site' | 'wikipedia'; only 'site' logos prove the domain is the university's real website
SOURCES_FILE = ROOT / 'scripts' / 'logo-sources.json'
MIN_SIZE = 32
MAX_SIZE = 64  # shown at 32px, so 64px stays sharp on high-density screens
FORCE = '--force' in sys.argv

# Reviewed by eye: these sites serve a generic, parent-brand, invisible, badly pixelated or spam icon,
# so only the Wikipedia fallback is tried for them
REJECTED = {
    "A'Sharqiyah University",
    'Emirates Aviation University',
    'German University of Technology in Oman',
    'K. N. Toosi University of Technology',
    'Neapolis University Pafos',
    'Near East University',
    'University of Sharjah',
    'Zayed University',
    'Chalmers University of Technology',
    'University of Rijeka',
    'Sofia University St. Kliment Ohridski',
    'University of Zimbabwe',  # generic Joomla icon
    'United International University',  # generic WordPress icon
    'Alfaisal University',
    # Icon is gambling spam (hijacked or compromised site)
    'Amity University',
    'National University of Mongolia',
    'International University of Kyrgyzstan',
    'University of Khartoum',
}

# Several university sites have broken certificate chains; we only read public icons
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def slugify(name: str) -> str:
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}
ICON_LINK = re.compile(r'''<link[^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]*>''', re.I)
HREF = re.compile(r'''href=["']([^"']+)["']''')


def get(url: str, timeout: int = 15) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
        return r.read()


def load(url: str) -> Image.Image | None:
    try:
        img = Image.open(io.BytesIO(get(url)))
        if getattr(img, 'format', '') == 'ICO':  # pick the largest frame of an .ico
            img.size = max(img.ico.sizes())
        img.load()
        return img
    except Exception:
        return None


def homepage_icons(domain: str) -> list[str]:
    """Icon URLs declared in the site's own <head> (apple-touch-icon is usually 180px)."""
    for base in (f'https://www.{domain}', f'https://{domain}'):
        try:
            html = get(base, timeout=12).decode('utf-8', 'ignore')
        except Exception:
            continue
        urls = []
        for tag in ICON_LINK.findall(html):
            href = HREF.search(tag)
            if href and not href.group(1).endswith('.svg'):
                urls.append(urllib.parse.urljoin(base + '/', href.group(1)))
        return urls + [base + '/apple-touch-icon.png']
    return []


# Wikipedia's lead image for a university is usually its logo, seal or coat of arms; anything whose
# file name doesn't say so (campus photos, buildings) is ignored
LOGO_FILE = re.compile(r'logo|seal|coat|arms|emblem|crest|insignia|escudo|wappen|shield|badge|brasao|sigillo|\.svg', re.I)
WIKI_UA = {'User-Agent': 'GlobalReachAtlas/1.0 (logo fetcher; info@thewebstart.in)'}


def wiki_json(url: str) -> dict | None:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=WIKI_UA), timeout=15) as r:
            return json.load(r)
    except Exception:
        return None


def wikipedia_image(name: str) -> tuple[str, str] | None:
    """(file name, thumbnail URL) of the page's lead image."""
    query = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'redirects': 1, 'titles': name,
        'prop': 'pageimages', 'piprop': 'thumbnail|name', 'pithumbsize': 160,
    })
    data = wiki_json(f'https://en.wikipedia.org/w/api.php?{query}')
    if data:
        page = next(iter(data['query']['pages'].values()))
        if 'thumbnail' in page:
            return page.get('pageimage', ''), page['thumbnail']['source']
    # The query API skips non-free images, and most university logos on English Wikipedia are
    # non-free; the page summary endpoint still returns them
    title = urllib.parse.quote(name.replace(' ', '_'), safe='')
    data = wiki_json(f'https://en.wikipedia.org/api/rest_v1/page/summary/{title}')
    if data and data.get('thumbnail'):
        src = data['thumbnail']['source']
        return urllib.parse.unquote(urllib.parse.urlparse(src).path.rsplit('/', 1)[-1]), src
    return None


def wikipedia_logo(name: str) -> Image.Image | None:
    found = wikipedia_image(name)
    if not found or not LOGO_FILE.search(found[0]):
        return None
    try:
        req = urllib.request.Request(found[1], headers=WIKI_UA)
        with urllib.request.urlopen(req, timeout=15) as r:
            img = Image.open(io.BytesIO(r.read()))
            img.load()
            return img
    except Exception:
        return None


def site_icon(domain: str) -> Image.Image | None:
    candidates = [
        f'https://www.google.com/s2/favicons?domain={domain}&sz=128',
        f'https://www.google.com/s2/favicons?domain=www.{domain}&sz=128',
        f'https://icons.duckduckgo.com/ip3/{domain}.ico',
    ]
    best = None
    for url in candidates:
        img = load(url)
        if img and (best is None or min(img.size) > min(best.size)):
            best = img
        if best and min(best.size) >= 96:
            break
    if best is None or min(best.size) < 96:
        for url in homepage_icons(domain):
            img = load(url)
            if img and (best is None or min(img.size) > min(best.size)):
                best = img
    return best


def fetch(item: tuple[str, str]) -> tuple[str, str]:
    name, domain = item
    out = LOGO_DIR / f'{slugify(name)}.png'
    if out.exists() and not FORCE and name not in REJECTED:
        return name, 'cached'
    best = None if name in REJECTED else site_icon(domain)
    source = 'site'
    if best is None or min(best.size) < MIN_SIZE:
        wiki = wikipedia_logo(name)
        if wiki:
            best, source = wiki, 'wikipedia'
    if best is None:
        out.unlink(missing_ok=True)
        return name, 'no icon'
    if min(best.size) < MIN_SIZE:
        out.unlink(missing_ok=True)
        return name, f'too small ({best.size[0]}px)'
    best = best.convert('RGBA')
    if max(best.size) > MAX_SIZE:
        best.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
    best.save(out, optimize=True)
    return name, f'ok {source} ({best.size[0]}px)'


def main() -> None:
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(12) as pool:
        results = list(pool.map(fetch, DOMAINS.items()))
    for name, status in results:
        if not status.startswith(('ok', 'cached')):
            print(f'{status:<18} {name} ({DOMAINS[name]})')
    sources = json.loads(SOURCES_FILE.read_text(encoding='utf-8')) if SOURCES_FILE.exists() else {}
    for name, status in results:
        if status.startswith('ok'):
            sources[name] = status.split()[1]
        elif status != 'cached':
            sources.pop(name, None)
    SOURCES_FILE.write_text(json.dumps(dict(sorted(sources.items())), indent=2, ensure_ascii=False) + '\n',
                            encoding='utf-8')
    saved = sum(s.startswith(('ok', 'cached')) for _, s in results)
    print(f'{saved}/{len(results)} logos available in {LOGO_DIR}')


if __name__ == '__main__':
    main()
