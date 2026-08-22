export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-10 lg:px-12">
      <a href="#console" className="flex items-baseline gap-2.5">
        <span className="font-devanagari text-[1.65rem] leading-none text-paper">
          वाणी
        </span>
        <span className="font-mono text-[11px] tracking-[0.28em] text-paper/55 uppercase">
          Vaani
        </span>
      </a>
      <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.16em] text-paper/50 uppercase">
        <a href="#latency" className="transition-colors hover:text-paper">
          Latency
        </a>
        <a href="#index" className="hidden transition-colors hover:text-paper sm:inline">
          Index
        </a>
        <a href="#docket" className="transition-colors hover:text-paper">
          Rules
        </a>
      </nav>
    </header>
  )
}
