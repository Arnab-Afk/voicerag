# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hackathon judges and demo-video viewers for HH Goa 2026 Task 2. They have minutes, not a relationship. They need to see a working voice path, understand the retrieval story, and believe latency and guardrails were designed — not claimed.

## Product Purpose

Vaani is a voice-enabled Retrieval-Augmented Generation console. A person speaks a question; the pipeline transcribes it, retrieves from the provided MSMARCO-XI corpus, and returns an answer only when that answer is grounded in retrieved context. Success for this surface: a judge can run the demo end-to-end and read how chunking, retrieval, harness, and guardrails work without leaving the page.

## Positioning

Spoken questions are answered only from MSMARCO-XI, with the retrieval and timing story visible in the same frame as the voice. A neighboring chatbot can talk; it cannot truthfully say it stays inside this corpus, under a 200ms retrieval-to-output budget, with refusal when the context does not support an answer.

## Operating Context

- Task: HH Goa 2026 Shortlisting Task 2 — Voice-Enabled RAG Model
- Pipeline: Voice input → Speech-to-text → Chunking/Retrieval → Answer generation
- Dataset: [ai4bharat/MSMARCO-XI](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI)
- STT: ElevenLabs or Sarvam (one will be wired; frontend ships first)
- Judged constraints: multi-strategy chunking, <200ms through retrieval-to-output, P50/P70/P100 across many queries, harnessed orchestration, guardrails
- Submission: GitHub, live link, two videos, `#RAGInGoa`
- Deadline: 22 August 2026, 11:59 PM

## Capabilities and Constraints

- Frontend-first: this surface is the console and proof panel; the live model/harness will be wired next.
- Latency percentiles are not measured yet. The analytics UI must exist and stay honest: empty or labeled awaiting harness numbers until the user supplies them. Do not invent P50/P70/P100 claims.
- Voice agent UI must be usable for a demo (mic, agent states, transcript, pipeline stages) even before production STT.
- Guardrails must be shown as product behavior: off-topic, unsafe, and ungrounded queries refuse rather than guess.
- Latency target applies to chunking + vector retrieval through final output (<200ms), not necessarily speech-to-text.

## Brand Commitments

- Name: **Vaani** (वाणी) — voice, speech. Spoken questions, then grounded citation.
- Visual pins from the builder: dark theme; ElevenLabs UI as the voice-agent reference (orb / agent states); current margin-line / construction-rule framing; latency and benchmarking visible on the first surface.
- Hashtag when promoting: `#RAGInGoa`

## Evidence on Hand

- Task brief and dataset URL only.
- No measured latency runs, no production transcripts, no customer quotes, no team photos.
- Benchmark figures, retrieved passages, and live answers must be labeled synthetic or awaiting measurement until the user supplies them.

## Product Principles

1. Grounded or silent — refuse when the corpus does not support the answer.
2. Timing is shown, not advertised — the clock sits next to the voice.
3. Judges should understand the pipeline in one viewport.
4. Placeholders stay labeled until real harness numbers arrive.
5. Voice is the input; citation is the output.
