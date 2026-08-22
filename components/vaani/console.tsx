"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  ApiError,
  askText,
  askVoice,
  getHealth,
  timingMs,
  type AskMode,
  type Health,
  type PipelineResponse,
} from "@/lib/api"
import { sampleQueries } from "@/lib/samples"
import type { AgentState, PipelineStage } from "@/lib/demo-session"
import { pipelineLabels } from "@/lib/demo-session"
import { cn } from "@/lib/utils"
import { Orb } from "@/components/vaani/orb"
import { Waveform } from "@/components/vaani/waveform"

const STAGE_ORDER: PipelineStage[] = [
  "listening",
  "transcribe",
  "retrieve",
  "generate",
  "guard",
]

export function Console() {
  const [agent, setAgent] = useState<AgentState>("idle")
  const [stage, setStage] = useState<PipelineStage>("idle")
  const [result, setResult] = useState<PipelineResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [micOn, setMicOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<AskMode>("extractive")
  const [health, setHealth] = useState<Health | null>(null)
  const [activeSample, setActiveSample] = useState<string | null>(null)
  const volumeRef = useRef(0)
  const runningRef = useRef(false)
  const clockRef = useRef<number | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const startedAtRef = useRef(0)
  const holdingRef = useRef(false)
  const modeRef = useRef(mode)
  const healthRef = useRef(health)
  modeRef.current = mode
  healthRef.current = health

  const getVolume = useCallback(() => volumeRef.current, [])

  const stopClock = useCallback(() => {
    if (clockRef.current) {
      window.clearInterval(clockRef.current)
      clockRef.current = null
    }
  }, [])

  const startClock = useCallback(() => {
    stopClock()
    setElapsed(0)
    const started = performance.now()
    clockRef.current = window.setInterval(() => {
      setElapsed(performance.now() - started)
    }, 16)
  }, [stopClock])

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch(() => {
        if (!cancelled) {
          setHealth({ ok: false, ready: false, stt_configured: false })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const finish = useCallback(
    (data: PipelineResponse) => {
      setResult(data)
      setQuery(data.query)
      setStage(data.refused ? "refused" : "answered")
      setAgent("idle")
      stopClock()
      setElapsed(data.end_to_end_ms)
      runningRef.current = false
      setBusy(false)
    },
    [stopClock]
  )

  const fail = useCallback(
    (err: unknown) => {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "Index is warming. Try again in a moment."
            : err.message
          : err instanceof Error
            ? err.message
            : "Request failed."
      setError(message)
      setAgent("idle")
      setStage("idle")
      stopClock()
      runningRef.current = false
      setBusy(false)
    },
    [stopClock]
  )

  const runText = useCallback(
    async (text: string, sampleId?: string) => {
      if (runningRef.current || !text.trim()) return
      if (health && !health.ready) {
        setError("Index is warming / offline.")
        return
      }
      runningRef.current = true
      setBusy(true)
      setError(null)
      setResult(null)
      setActiveSample(sampleId ?? null)
      setQuery(text)
      startClock()
      setAgent("thinking")
      setStage("retrieve")
      try {
        const data = await askText({ query: text.trim(), mode })
        setStage("generate")
        finish(data)
      } catch (err) {
        fail(err)
      }
    },
    [fail, finish, health, mode, startClock]
  )

  const teardownMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    void audioCtxRef.current?.close()
    streamRef.current = null
    audioCtxRef.current = null
    recorderRef.current = null
    volumeRef.current = 0
    setMicOn(false)
  }, [])

  const stopMic = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === "inactive") return
    recorder.stop()
  }, [])

  const startMic = useCallback(async () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") return
    const currentHealth = healthRef.current
    if (currentHealth && !currentHealth.stt_configured) {
      setError("Speech-to-text is not configured. Type a question.")
      return
    }
    if (currentHealth && !currentHealth.ready) {
      setError("Index is warming / offline.")
      return
    }
    if (runningRef.current) return

    setError(null)
    setResult(null)
    setActiveSample(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : ""
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)
      chunksRef.current = []
      recorderRef.current = recorder
      startedAtRef.current = performance.now()

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (const n of data) sum += n
        volumeRef.current = Math.min(1, sum / data.length / 90)
        if (stream.active) requestAnimationFrame(tick)
      }
      tick()

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        const heldMs = performance.now() - startedAtRef.current
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        teardownMic()

        if (heldMs < 400 || blob.size < 200) {
          runningRef.current = false
          setBusy(false)
          setStage("idle")
          setAgent("idle")
          setError("Hold the well while you speak, then release.")
          return
        }

        runningRef.current = true
        setBusy(true)
        startClock()
        setAgent("thinking")
        setStage("transcribe")
        try {
          setStage("retrieve")
          const next = await askVoice({ file: blob, mode: modeRef.current })
          setStage("generate")
          finish(next)
        } catch (err) {
          fail(err)
        }
      }

      runningRef.current = true
      setBusy(true)
      setMicOn(true)
      setAgent("listening")
      setStage("listening")
      recorder.start(200)
    } catch {
      teardownMic()
      setError("Microphone blocked. Type a question instead.")
      runningRef.current = false
      setBusy(false)
    }
  }, [fail, finish, startClock, teardownMic])

  useEffect(() => {
    const typing = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      return !!el && ["INPUT", "TEXTAREA", "BUTTON"].includes(el.tagName)
    }
    const onDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || typing(event.target)) return
      event.preventDefault()
      void startMic()
    }
    const onUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || typing(event.target)) return
      event.preventDefault()
      stopMic()
    }
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
    }
  }, [startMic, stopMic])

  useEffect(() => {
    return () => {
      stopClock()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      void audioCtxRef.current?.close()
    }
  }, [stopClock])

  const retrieveMs = result?.retrieval_ms ?? null
  const generateMs = result ? timingMs(result.timings_ms, "generate") : null
  const guardMs = result
    ? timingMs(
        result.timings_ms,
        "input_guardrail",
        "retrieval_guardrail",
        "grounding_guardrail"
      )
    : null
  const refused = stage === "refused"
  const answered = stage === "answered"
  const ready = health?.ready !== false
  const sttOn = health?.stt_configured !== false

  const stageMs = (id: PipelineStage) => {
    if (!result) return null
    if (id === "retrieve") return retrieveMs
    if (id === "generate") return generateMs
    if (id === "guard") return guardMs
    return null
  }

  return (
    <section className="relative">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-[72vh] flex-col justify-between px-5 py-8 sm:px-10 lg:px-12 lg:py-10">
          <div className="flex items-end justify-between gap-6">
            <p className="max-w-[34ch] text-[1.7rem] leading-[1.15] tracking-[-0.03em] text-paper sm:text-[2.15rem]">
              Speak. Vaani answers only if the corpus can.
            </p>
            <StatusChip stage={stage} health={health} />
          </div>

          <div className="flex flex-col items-center py-10">
            <button
              type="button"
              onPointerDown={(event) => {
                if (event.button !== 0) return
                event.preventDefault()
                event.currentTarget.setPointerCapture(event.pointerId)
                if (recorderRef.current?.state === "recording") {
                  stopMic()
                  return
                }
                holdingRef.current = true
                startedAtRef.current = performance.now()
                void startMic()
              }}
              onPointerUp={() => {
                holdingRef.current = false
                if (
                  recorderRef.current?.state === "recording" &&
                  performance.now() - startedAtRef.current > 400
                ) {
                  stopMic()
                }
              }}
              onPointerCancel={() => {
                holdingRef.current = false
                if (recorderRef.current?.state === "recording") stopMic()
              }}
              disabled={(busy && !micOn) || !ready || !sttOn}
              className="group relative size-[min(58vw,280px)] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-register/80 disabled:opacity-40"
              aria-label={micOn ? "Release to send" : "Hold to speak"}
            >
              <Orb
                agentState={agent}
                getInputVolume={getVolume}
                className="size-full"
              />
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-paper/15" />
            </button>
            <div className="mt-6 w-full max-w-sm">
              <Waveform
                active={micOn || agent === "listening"}
                processing={agent === "thinking"}
                getVolume={getVolume}
              />
            </div>
            <p className="mt-4 text-center font-mono text-[11px] tracking-[0.18em] text-paper/55 uppercase">
              {!sttOn
                ? "Mic off — STT not configured"
                : !ready
                  ? "Index warming"
                  : micOn
                    ? "Listening — release or press again to send"
                    : busy
                      ? "On the record"
                      : "Hold the well to speak, or type"}
            </p>
            {error ? (
              <p className="mt-2 text-center text-sm text-register">{error}</p>
            ) : null}
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              void runText(query)
            }}
          >
            <div className="flex flex-wrap gap-2">
              {(["extractive", "generative", "auto"] as AskMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={cn(
                    "border border-rule px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-paper/55 uppercase",
                    "hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-register/70",
                    mode === item && "border-paper/50 text-paper"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={busy}
                placeholder="Ask MSMARCO-XI in English or Hindi"
                className="h-10 min-w-0 flex-1 border border-rule bg-transparent px-3 text-sm text-paper outline-none placeholder:text-paper/30 focus-visible:border-paper/40 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={busy || !ready || !query.trim()}
                className="h-10 border border-paper/40 px-4 font-mono text-[11px] tracking-[0.14em] text-paper uppercase disabled:opacity-40"
              >
                Ask
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void runText(item.query, item.id)}
                  disabled={busy || !ready}
                  className={cn(
                    "border border-rule px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-paper/70 uppercase transition-colors",
                    "hover:border-paper/40 hover:text-paper",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-register/70 disabled:opacity-40",
                    activeSample === item.id && "border-register text-register"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <aside className="border-t border-rule lg:border-t-0 lg:border-l">
          <div className="border-b border-rule px-5 py-4 sm:px-6">
            <p className="font-mono text-[11px] tracking-[0.16em] text-paper/50 uppercase">
              Live clock
            </p>
            <p className="mt-2 font-mono text-3xl tracking-[-0.04em] text-paper">
              {elapsed ? Math.round(elapsed) : 0}
              <span className="ml-1 text-sm text-paper/45">ms</span>
            </p>
            <p className="mt-1 text-sm text-paper/50">
              Retrieve budget 200ms. Speech and LLM sit outside it.
            </p>
          </div>

          <ol className="divide-y divide-rule">
            {pipelineLabels.map((item) => {
              const currentIndex = STAGE_ORDER.indexOf(stage)
              const itemIndex = STAGE_ORDER.indexOf(item.id)
              const done = currentIndex > itemIndex || answered || refused
              const now = stage === item.id
              const ms = stageMs(item.id)
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between px-5 py-3.5 sm:px-6",
                    now && "bg-register/10"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "size-1.5 rounded-full bg-paper/25",
                        now && "bg-register",
                        done && !now && "bg-paper"
                      )}
                    />
                    <span className="text-sm text-paper/80">{item.label}</span>
                  </span>
                  <span className="font-mono text-[12px] text-paper/45">
                    {ms != null && (done || now) ? Math.round(ms) + "ms" : "—"}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="border-t border-rule px-5 py-4 sm:px-6">
            <p className="font-mono text-[11px] tracking-[0.16em] text-paper/50 uppercase">
              Retrieve
            </p>
            <p
              className={cn(
                "mt-1 font-mono text-2xl tracking-[-0.04em]",
                retrieveMs != null && result?.retrieval_under_200ms
                  ? "text-paper"
                  : "text-paper/40"
              )}
            >
              {retrieveMs != null ? Math.round(retrieveMs) + "ms" : "—"}
            </p>
            <p className="mt-1 font-mono text-[11px] text-paper/40">
              {result
                ? result.retrieval_under_200ms
                  ? "Under 200ms"
                  : "Over budget"
                : "Awaiting query"}
              {result && result.generation_mode !== "refused"
                ? ` · ${result.generation_mode}`
                : ""}
            </p>
          </div>
        </aside>
      </div>

      <Transcript result={result} stage={stage} />
    </section>
  )
}

function StatusChip({
  stage,
  health,
}: {
  stage: PipelineStage
  health: Health | null
}) {
  const copy =
    health && !health.ready
      ? "Warming"
      : stage === "idle"
        ? health?.ok
          ? "Live"
          : "Closed"
        : stage === "answered"
          ? "Entered"
          : stage === "refused"
            ? "Struck"
            : "Open"

  return (
    <p
      className={cn(
        "shrink-0 font-mono text-[11px] tracking-[0.2em] uppercase",
        stage === "refused" || (health && !health.ready)
          ? "text-register"
          : "text-paper/50"
      )}
    >
      {copy}
    </p>
  )
}

function Transcript({
  result,
  stage,
}: {
  result: PipelineResponse | null
  stage: PipelineStage
}) {
  if (!result) {
    return (
      <div className="border-t border-rule px-5 py-8 sm:px-10 lg:px-12">
        <p className="font-mono text-[11px] tracking-[0.18em] text-paper/40 uppercase">
          Transcript
        </p>
        <p className="mt-4 max-w-[46ch] text-lg leading-8 text-paper/40">
          No line on the record. Speak, type, or pick a sample.
        </p>
      </div>
    )
  }

  const showAnswer = stage === "answered" || stage === "refused"
  const cites = result.citations ?? []
  const ruling = result.refused
    ? result.refuse_reason || "Struck. The index will not support this line."
    : result.grounded
      ? `Entered. Confidence ${result.confidence.toFixed(2)}. ${result.generation_mode}.`
      : "Returned, but grounding was weak."

  return (
    <div className="border-t border-rule">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="px-5 py-8 sm:px-10 lg:px-12">
          <p className="font-mono text-[11px] tracking-[0.18em] text-paper/40 uppercase">
            Transcript
            {result.detected_language ? ` · ${result.detected_language}` : ""}
          </p>
          <p className="mt-4 font-mono text-[13px] leading-7 text-paper/55">
            Q. {result.query}
          </p>
          {showAnswer ? (
            <p
              className={cn(
                "mt-6 max-w-[54ch] text-xl leading-8 tracking-[-0.02em]",
                result.refused ? "text-register" : "text-paper"
              )}
            >
              {result.answer}
            </p>
          ) : (
            <p className="mt-6 text-paper/35">Writing from exhibits…</p>
          )}
          <p className="mt-6 max-w-[52ch] text-sm leading-6 text-paper/50">
            {ruling}
          </p>
        </div>
        <div className="border-t border-rule lg:border-t-0 lg:border-l">
          <p className="border-b border-rule px-5 py-3 font-mono text-[11px] tracking-[0.16em] text-paper/40 uppercase sm:px-6">
            Exhibits
          </p>
          {cites.length && !result.refused ? (
            <ul>
              {cites.slice(0, 5).map((cite) => (
                <li
                  key={cite.chunk_id}
                  className="border-b border-rule px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <p className="flex items-center justify-between font-mono text-[11px] text-register">
                    <span className="truncate pr-3">{cite.chunk_id}</span>
                    <span>{cite.score.toFixed(2)}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-paper/40">
                    {cite.language}
                    {cite.strategy ? ` · ${cite.strategy}` : ""}
                    {cite.source ? ` · ${cite.source}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-paper/75">
                    {cite.parent_text || cite.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-paper/40 sm:px-6">
              {result.refused ? "No exhibit admitted." : "Waiting for retrieval."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
