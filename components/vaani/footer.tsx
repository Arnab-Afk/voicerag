export function Footer() {
  return (
    <footer className="flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 lg:px-12">
      <div>
        <p className="font-devanagari text-2xl text-paper">वाणी</p>
        <p className="mt-2 max-w-[42ch] text-sm leading-6 text-paper/50">
          Voice-enabled RAG on MSMARCO-XI. HH Goa 2026. Speech through
          ElevenLabs or Sarvam. Answers only from the index.
        </p>
      </div>
      <p className="font-mono text-[11px] tracking-[0.18em] text-paper/40 uppercase">
        #RAGInGoa
      </p>
    </footer>
  )
}