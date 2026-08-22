import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import "./globals.css"

export const metadata: Metadata = {
  title: "Vaani — Voice RAG on MSMARCO-XI",
  description:
    "Speak a question. Vaani transcribes it, retrieves from MSMARCO-XI, and answers only when the corpus can support it.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <span
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: A night deposition, not a glowing-orb SaaS hero. Voice is testimony; retrieved passages are exhibits; the red margin is the corpus wall.
OWN-WORLD: Ink field, hairline rules, vermilion register mark, paper type, ElevenLabs-like orb in a well, mono clocks.
STORY: Judges hear a question, watch the pipeline, and see the system refuse when the index cannot speak.
FIRST VIEWPORT: Wordmark and rules, then the orb well, sample lines, live clock and stage rail.
FORM: Court stenographer / night register · seed fd9618eb · assigned 5 fused with pinned dark, orb, and margin lines.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
