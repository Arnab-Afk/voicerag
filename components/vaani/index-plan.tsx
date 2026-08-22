const strategies = [
  {
    mark: "H",
    name: "Hierarchical parent–child",
    split:
      "Parent windows of 1,200–1,800 tokens keep document sense. Children of 180–280 tokens are what the vector store actually ranks.",
    retrieve:
      "Search children. Expand the winning parent so generation sees surrounding argument, not an orphan sentence.",
  },
  {
    mark: "P",
    name: "Propositional atoms",
    split:
      "Each claim, number, and named entity becomes its own unit. Overlap is zero; identity is the sentence boundary.",
    retrieve:
      "Used when the question is factual and short. High precision, low poetry.",
  },
  {
    mark: "S",
    name: "Sentence-snapped windows",
    split:
      "Fixed 320-token targets with 64-token overlap, then walk back to the nearest sentence end so no chunk starts mid-clause.",
    retrieve:
      "The recall net. Catches passages hierarchical search under-weights.",
  },
  {
    mark: "M",
    name: "Metadata-aware lanes",
    split:
      "Language, passage type, document id, and MSMARCO-XI split ride on every vector. Chunks never mix languages inside one unit.",
    retrieve:
      "Hard filters first. Dense search only inside the matching lane.",
  },
  {
    mark: "X",
    name: "Hybrid fusion",
    split:
      "BM25 on raw text plus dense embeddings on children and propositions. Scores fuse with reciprocal rank.",
    retrieve:
      "Final shortlist is the fused top-k, then a cross-encoder rerank before the harness writes.",
  },
]

export function IndexPlan() {
  return (
    <section id="index" className="px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
      <h2 className="max-w-[14ch] text-[2.4rem] leading-[1.05] tracking-[-0.035em] text-paper sm:text-[3.1rem]">
        Five ways the corpus is cut.
      </h2>
      <p className="mt-5 max-w-[58ch] text-base leading-7 text-paper/58">
        A single fixed window is not an index. Vaani keeps several cuts of
        MSMARCO-XI and picks a lane from the question. This is the plan the
        harness will run — not a promise that every lane is live on this page.
      </p>

      <ol className="mt-12 divide-y divide-rule border-y border-rule">
        {strategies.map((item) => (
          <li
            key={item.mark}
            className="grid gap-6 py-8 md:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.2fr)] md:items-start"
          >
            <p className="font-mono text-2xl text-register">{item.mark}</p>
            <div>
              <h3 className="text-xl tracking-[-0.02em] text-paper">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-paper/55">{item.split}</p>
            </div>
            <p className="text-sm leading-6 text-paper/70">{item.retrieve}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
