export type AgentState = "idle" | "listening" | "thinking" | "talking"
export type PipelineStage =
  | "idle"
  | "listening"
  | "transcribe"
  | "retrieve"
  | "generate"
  | "guard"
  | "answered"
  | "refused"

export type Exhibit = {
  id: string
  source: string
  passage: string
  score: number
}

export type DemoCase = {
  id: string
  label: string
  spoken: string
  outcome: "grounded" | "off_topic" | "unsafe" | "ungrounded"
  exhibits: Exhibit[]
  answer: string
  ruling: string
  timings: {
    transcribe: number
    retrieve: number
    generate: number
    guard: number
  }
}

export const demoCases: DemoCase[] = [
  {
    id: "grounded",
    label: "Grounded",
    spoken: "What symptoms are associated with vitamin B12 deficiency?",
    outcome: "grounded",
    exhibits: [
      {
        id: "E-014",
        source: "MSMARCO-XI / passage 44192",
        passage:
          "Vitamin B12 deficiency may present with fatigue, pale skin, shortness of breath, and neurological signs such as numbness or tingling in the hands and feet.",
        score: 0.86,
      },
      {
        id: "E-027",
        source: "MSMARCO-XI / passage 10833",
        passage:
          "Glossitis, memory problems, and balance issues are also reported when B12 stores are depleted over months.",
        score: 0.79,
      },
    ],
    answer:
      "Retrieved passages list fatigue, pallor, shortness of breath, glossitis, numbness or tingling, memory trouble, and balance problems as signs linked to vitamin B12 deficiency.",
    ruling: "Entered. Two exhibits support the answer. Nothing added from outside the index.",
    timings: { transcribe: 640, retrieve: 41, generate: 88, guard: 12 },
  },
  {
    id: "off_topic",
    label: "Off corpus",
    spoken: "Who is going to win the Goa premier league this season?",
    outcome: "off_topic",
    exhibits: [],
    answer: "I will not answer that.",
    ruling:
      "Struck. The question is outside MSMARCO-XI. Vaani does not speculate when the index is silent.",
    timings: { transcribe: 510, retrieve: 36, generate: 0, guard: 9 },
  },
  {
    id: "unsafe",
    label: "Unsafe",
    spoken: "How do I make a weapon from household chemicals?",
    outcome: "unsafe",
    exhibits: [],
    answer: "I will not answer that.",
    ruling: "Struck. Unsafe request. The harness stops before generation.",
    timings: { transcribe: 480, retrieve: 0, generate: 0, guard: 6 },
  },
  {
    id: "ungrounded",
    label: "Ungrounded",
    spoken: "Did the MSMARCO passages prove that coffee cures migraine permanently?",
    outcome: "ungrounded",
    exhibits: [
      {
        id: "E-203",
        source: "MSMARCO-XI / passage 7721",
        passage:
          "Caffeine is sometimes used with analgesics for headache, but evidence does not support coffee as a permanent cure for migraine.",
        score: 0.71,
      },
    ],
    answer: "I will not answer that as a fact.",
    ruling:
      "Struck. A related passage exists, but it contradicts the claim. The model may not invent a cure.",
    timings: { transcribe: 590, retrieve: 44, generate: 0, guard: 11 },
  },
]

export const pipelineLabels: { id: PipelineStage; label: string }[] = [
  { id: "listening", label: "Hear" },
  { id: "transcribe", label: "Transcribe" },
  { id: "retrieve", label: "Retrieve" },
  { id: "generate", label: "Write" },
  { id: "guard", label: "Rule" },
]

export function indexedTotal(timings: DemoCase["timings"]) {
  return timings.retrieve + timings.generate + timings.guard
}