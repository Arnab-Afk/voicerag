const rules = [
  {
    stamp: "STET",
    title: "Entered",
    body: "At least one retrieved exhibit supports the answer, and the answer does not add facts the exhibits omit. The line stays.",
  },
  {
    stamp: "OFF",
    title: "Off the corpus",
    body: "No neighbor in MSMARCO-XI. Sports scores, personal advice, and this week’s news are outside the record. Vaani is silent.",
  },
  {
    stamp: "UNSAFE",
    title: "Unsafe",
    body: "Weapons, self-harm, and criminal how-to never reach generation. The harness returns a refusal before a token is written.",
  },
  {
    stamp: "STRIKE",
    title: "Ungrounded",
    body: "A passage is nearby but does not license the claim — or contradicts it. The model may not complete the thought from memory.",
  },
]

export function Docket() {
  return (
    <section id="docket" className="px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
      <h2 className="max-w-[16ch] text-[2.4rem] leading-[1.05] tracking-[-0.035em] text-paper sm:text-[3.1rem]">
        Knowing when not to speak.
      </h2>
      <p className="mt-5 max-w-[56ch] text-base leading-7 text-paper/58">
        The harness wraps every turn: structured input, tool calls for
        retrieve and rewrite, one retry on empty retrieval, then a grounding
        check. If the check fails, the transcript is struck.
      </p>

      <ol className="mt-12 divide-y divide-rule border-y border-rule">
        {rules.map((rule) => (
          <li
            key={rule.stamp}
            className="grid gap-4 py-8 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-start"
          >
            <p className="font-mono text-[11px] tracking-[0.18em] text-register uppercase">
              {rule.stamp}
            </p>
            <div>
              <h3 className="text-2xl tracking-[-0.03em] text-paper">
                {rule.title}
              </h3>
              <p className="mt-3 max-w-[58ch] text-sm leading-6 text-paper/58">
                {rule.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
