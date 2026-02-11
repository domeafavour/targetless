import { Link } from '@tanstack/react-router'
import { CalendarCheck2 } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Events', exact: true },
  { to: '/events/new', label: 'Create Event', exact: false },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-white">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <CalendarCheck2 className="h-6 w-6 text-cyan-400" />
          Event Tracker
        </Link>
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-2 text-slate-300 transition-colors hover:text-white"
              activeProps={{
                className:
                  'rounded-full bg-cyan-500 px-4 py-2 text-slate-900',
              }}
              activeOptions={{ exact: link.exact }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
