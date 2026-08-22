import { harnessMeta, percentiles, stageLabels } from "@/lib/benchmarks"
import type { Percentile, StageKey } from "@/lib/benchmarks"

const rows: Percentile[] = ["p50", "p70", "p100"]
const cols: StageKey[] = ["stt", "retrieve", "generate", "guard", "total"]

function cell(ms: number | null) {
  return ms == null ? "—" : `${ms}`
}

export function Latency() {
  return (
    <section id="latency" className="px-5 py-16 sm:px-10 lg:px-12 lg:py-20">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <h2 className="max-w-[16ch] text-[2.4rem] leading-[1.05] tracking-[-0.035em] text-paper sm:text-[3.1rem]">
          The clock the judges asked for.
        </h2>
        <p className="max-w-[36ch] text-sm leading-6 text-paper/55">
          P50 / P70 / P100 across the harness run. Cells stay empty until you
          drop the numbers in. Target for retrieve + generate + guard is{" "}
          {harnessMeta.targetMs}ms. {harnessMeta.excluded}.
        </p>
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-y border-rule">
              <th className="py-3 pr-4 font-mono text-[11px] font-normal tracking-[0.16em] text-paper/40 uppercase">
                Percentile
              </th>
              {cols.map((col) => (
                <th
                  key={col}
                  className="px-3 py-3 font-mono text-[11px] font-normal tracking-[0.14em] text-paper/40 uppercase"
                >
                  {stageLabels[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-b border-rule">
                <th className="py-5 pr-4 font-mono text-sm font-normal text-paper">
                  {row.toUpperCase()}
                </th>
                {cols.map((col) => {
                  const value = percentiles[row][col].ms
                  const hot = col === "total"
                  return (
                    <td
                      key={col}
                      className={`px-3 py-5 font-mono text-2xl tracking-[-0.04em] ${
                        hot ? "text-paper" : "text-paper/70"
                      }`}
                    >
                      {cell(value)}
                      {value != null ? (
                        <span className="ml-1 text-[11px] text-paper/35">ms</span>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Ruler />

      <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-paper/35 uppercase">
        Harness {harnessMeta.status} · {harnessMeta.queryCount} queries logged ·
        measured through {harnessMeta.measuredThrough}
      </p>
    </section>
  )
}

function Ruler() {
  const ticks = [0, 50, 100, 150, 200, 250]
  return (
    <div className="mt-10">
      <div className="relative h-10 border-x border-rule">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
        <div
          className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-register"
          style={{ width: `${(200 / 250) * 100}%` }}
        />
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute top-0 flex h-full -translate-x-1/2 flex-col justify-between"
            style={{ left: `${(tick / 250) * 100}%` }}
          >
            <span className="mx-auto h-2 w-px bg-paper/35" />
            <span className="font-mono text-[10px] text-paper/40">{tick}</span>
          </span>
        ))}
        <span
          className="absolute -top-5 font-mono text-[10px] tracking-[0.14em] text-register uppercase"
          style={{ left: `${(200 / 250) * 100}%`, transform: "translateX(-50%)" }}
        >
          Budget
        </span>
      </div>
    </div>
  )
}
