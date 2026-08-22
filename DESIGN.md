---
name: Vaani
description: Night deposition for a voice RAG console
colors:
  ink: "#070706"
  paper: "#f3eee4"
  rule: "rgb(243 238 228 / 12%)"
  register: "#e23b2b"
  paper-55: "rgb(243 238 228 / 55%)"
  orb-1: "#CADCFC"
  orb-2: "#A0B9D1"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 3.1rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  data:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  none: "0px"
spacing:
  frame: "72px"
  section-y: "80px"
  rule: "1px"
components:
  sample-line:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  live-clock:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.data}"
---

## Overview

Vaani is a night register. The page is a framed deposition: hairline rules, a vermilion margin, registration crosses, and a voice well. Retrieved passages are exhibits. Refusals are struck. Latency is a clock, not a marketing stat.

## Colors

Ink `#070706` is the field. Paper `#f3eee4` is type and rules. Register `#e23b2b` is the corpus wall, live state, and refusal. Orb colors stay in the ElevenLabs cool paper range so the well reads as a microphone, not a neon toy.

## Typography

Geist Sans carries speech and rulings. Geist Mono carries clocks, stamps, and source ids. Devanagari system faces lock the वाणी mark. No eyebrow labels. Headings carry their own weight.

## Layout

Max width 1180px, vertical rules at the column edge, a vermilion margin at 72px (56px tablet, 18px phone). Sections divide on 1px rules. The first viewport is the well plus the live clock rail, not a hero stack.

## Elevation & Depth

No drop shadows. Depth is overlap of rules, the orb’s volume, and the register mark.

## Shapes

Radius is zero. Circles exist only for the voice well.

## Components

The orb is the primary control. Sample lines are ruled chips. The latency table keeps empty em-dashes until harness numbers land in `lib/benchmarks.ts`. Guardrails are a stamped docket, not cards.

## Do's and Don'ts

Do keep answers inside exhibits or strike them. Do leave percentile cells empty until measured. Don’t invent P50/P70/P100. Don’t replace the red margin with a generic glow. Don’t drop a three-up icon-card row.
