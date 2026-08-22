export type Percentile = "p50" | "p70" | "p100"

export type StageKey = "stt" | "retrieve" | "generate" | "guard" | "total"

export type BenchmarkCell = {
  ms: number | null
  note?: string
}

/**
 * Swap `ms: null` for measured milliseconds when the harness run lands.
 * Do not invent percentiles. The UI treats null as awaiting measurement.
 */
export const harnessMeta = {
  status: "awaiting" as const,
  queryCount: 0,
  targetMs: 200,
  measuredThrough: "chunking + retrieval + generation + guardrail",
  excluded: "speech-to-text is timed separately and is not inside the 200ms budget",
}

export const percentiles: Record<Percentile, Record<StageKey, BenchmarkCell>> = {
  p50: {
    stt: { ms: null },
    retrieve: { ms: null },
    generate: { ms: null },
    guard: { ms: null },
    total: { ms: null },
  },
  p70: {
    stt: { ms: null },
    retrieve: { ms: null },
    generate: { ms: null },
    guard: { ms: null },
    total: { ms: null },
  },
  p100: {
    stt: { ms: null },
    retrieve: { ms: null },
    generate: { ms: null },
    guard: { ms: null },
    total: { ms: null },
  },
}

export const stageLabels: Record<StageKey, string> = {
  stt: "Speech to text",
  retrieve: "Retrieve",
  generate: "Generate",
  guard: "Guard",
  total: "Indexed path",
}