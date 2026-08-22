export type AskMode = "auto" | "extractive" | "generative"

export type Health = {
  ok: boolean
  ready: boolean
  shards?: string[]
  faiss?: boolean
  stt_configured?: boolean
  llm_configured?: boolean
  embedding_model?: string
}

export type Chunk = {
  chunk_id: string
  parent_id: string
  text: string
  parent_text: string
  language: string
  score: number
  strategy?: string
  source?: string
}

export type Guardrail = {
  name: string
  passed: boolean
  reason: string
}

export type Timing = {
  name: string
  ms: number
}

export type PipelineResponse = {
  ok: boolean
  refused: boolean
  refuse_reason?: string | null
  query: string
  detected_language?: string | null
  answer: string
  citations: Chunk[]
  grounded: boolean
  confidence: number
  generation_mode: string
  guardrails: Guardrail[]
  timings_ms: Timing[]
  retrieval_ms: number
  end_to_end_ms: number
  retrieval_under_200ms: boolean
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const BASE = "/api/hhrag"

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as {
    detail?: string
  } & T
  if (!res.ok) {
    throw new ApiError(res.status, data.detail || res.statusText)
  }
  return data
}

export async function getHealth(): Promise<Health> {
  const res = await fetch(`${BASE}/health`, { cache: "no-store" })
  return readJson<Health>(res)
}

export function hintLanguage(text: string): "hi-IN" | "en-IN" {
  const letters = text.replace(/[^A-Za-z\u0900-\u097F]/g, "")
  const devanagari = (letters.match(/[\u0900-\u097F]/g) || []).length
  return letters.length > 0 && devanagari / letters.length >= 0.3
    ? "hi-IN"
    : "en-IN"
}

function needsExtractiveFallback(data: PipelineResponse) {
  if (!data.refused && data.grounded) return false
  return (data.citations?.length ?? 0) > 0 || data.generation_mode === "refused"
}

export async function askText(input: {
  query: string
  mode: AskMode
  language?: string
}): Promise<PipelineResponse> {
  const language = input.language ?? hintLanguage(input.query)
  const first = await postAsk({
    query: input.query,
    mode: input.mode,
    language,
  })
  if (input.mode === "extractive" || !needsExtractiveFallback(first)) {
    return first
  }
  return postAsk({
    query: input.query,
    mode: "extractive",
    language,
  })
}

async function postAsk(input: {
  query: string
  mode: AskMode
  language: string
}): Promise<PipelineResponse> {
  const res = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: input.query,
      mode: input.mode,
      language: input.language,
    }),
  })
  return readJson<PipelineResponse>(res)
}

export async function askVoice(input: {
  file: Blob
  mode: AskMode
  language?: string
}): Promise<PipelineResponse> {
  const fd = new FormData()
  fd.append("file", input.file, "query.webm")
  fd.append("mode", input.mode)
  const res = await fetch(`${BASE}/ask/voice`, {
    method: "POST",
    body: fd,
  })
  const first = await readJson<PipelineResponse>(res)
  if (input.mode === "extractive" || !needsExtractiveFallback(first)) {
    return first
  }
  return postAsk({
    query: first.query,
    mode: "extractive",
    language: hintLanguage(first.query),
  })
}

export function timingMs(timings: Timing[], ...names: string[]) {
  return timings
    .filter((item) => names.includes(item.name))
    .reduce((sum, item) => sum + item.ms, 0)
}
