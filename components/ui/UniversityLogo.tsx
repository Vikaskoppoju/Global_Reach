import Image from 'next/image'

// Fallback badge text for universities without a logo, e.g. "Qatar University" → "QU"
export const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/[\s-]+/)
    .filter(w => /^[A-Z]/.test(w) && !['The', 'Of', 'In', 'At', 'For', 'And'].includes(w))
    .map(w => w[0])
    .join('')
    .slice(0, 3)

interface Props {
  name: string
  logo?: string
  size?: 'md' | 'lg'
  // Initials badge colours: 'dark' on navy backgrounds, 'light' on cream/white
  tone?: 'dark' | 'light'
}

const SIZES = {
  md: { box: 'w-10 h-10 rounded-lg p-1', img: 'w-8 h-8', px: 32, text: 'text-[11px]' },
  lg: { box: 'w-14 h-14 rounded-xl p-1.5', img: 'w-11 h-11', px: 44, text: 'text-[13px]' },
}

export default function UniversityLogo({ name, logo, size = 'md', tone = 'dark' }: Props) {
  const s = SIZES[size]
  if (logo) {
    return (
      <span className={`shrink-0 bg-white flex items-center justify-center ${s.box}
        ${tone === 'light' ? 'ring-1 ring-gold/20' : ''}`}>
        {logo.startsWith('/') ? (
          <Image src={logo} alt="" width={s.px} height={s.px} className={`${s.img} object-contain`} />
        ) : (
          // Logos added in admin can come from any website, which next/image would reject
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" width={s.px} height={s.px} loading="lazy" className={`${s.img} object-contain`} />
        )}
      </span>
    )
  }
  return (
    <span aria-hidden
      className={`shrink-0 font-bold tracking-wide flex items-center justify-center ${s.box} ${s.text}
        ${tone === 'dark' ? 'bg-gold/15 text-gold-light' : 'bg-gold-pale text-[#8A6A1A]'}`}>
      {initials(name) || name[0]}
    </span>
  )
}
