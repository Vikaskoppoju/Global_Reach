const footerLinks: Record<string, { label: string; href: string }[]> = {
  Explore: [
    { label: 'Scholarships', href: '/scholarships' },
    { label: 'Universities', href: '/universities' },
    { label: 'Services', href: '/services' },
  ],
  Services: [
    { label: 'IELTS & TOEFL preparation', href: '/services#test-prep' },
    { label: 'GRE & GMAT preparation', href: '/services/gre' },
    { label: 'SOP review & coaching', href: '/services#application' },
    { label: 'Interview preparation', href: '/services#interview' },
  ],
  'By level': [
    { label: 'Bachelor’s scholarships', href: "/scholarships?level=Bachelor's" },
    { label: 'Master’s scholarships', href: "/scholarships?level=Master's" },
    { label: 'PhD scholarships', href: '/scholarships?level=PhD' },
  ],
  Help: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Scholarship words explained', href: '/#scholarship-words' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-navy text-white/60 pt-16 pb-9 px-5 md:px-10 lg:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 pb-12
        border-b border-white/8">
        <div>
          <div className="font-display font-bold text-white text-2xl mb-4">
            Global<span className="text-gold">Reach</span>
          </div>
          <p className="text-sm leading-[1.7] max-w-[280px]">
            Helping students discover universities around the world and the scholarships that can take them there.
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <div className="text-white text-sm font-bold mb-5">{title}</div>
            <div className="flex flex-col gap-2.5">
              {links.map(link => (
                <a key={link.label} href={link.href}
                  className="text-sm text-white/50 hover:text-gold-light transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-7 text-[13px]">
        <span>© {new Date().getFullYear()} GlobalReach. All rights reserved.</span>
        <span>Always confirm details on each scholarship’s official website.</span>
      </div>
    </footer>
  )
}
