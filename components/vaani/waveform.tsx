"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type WaveformProps = {
  active?: boolean
  processing?: boolean
  className?: string
  getVolume?: () => number
}

export function Waveform({
  active = false,
  processing = false,
  className,
  getVolume,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let t = 0
    const bars: number[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = wrap.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const draw = () => {
      const { width, height } = wrap.getBoundingClientRect()
      const step = 4
      const count = Math.max(8, Math.floor(width / step))
      t += processing ? 0.045 : active ? 0.08 : 0.02
      const live = getVolume?.() ?? 0

      if (bars.length !== count) {
        bars.length = count
        bars.fill(0.08)
      }

      for (let i = 0; i < count; i++) {
        const mid = Math.abs(i - count / 2) / (count / 2)
        const wave =
          Math.sin(t * 2.2 + i * 0.18) * 0.18 +
          Math.cos(t * 1.1 - i * 0.09) * 0.1
        const target = active
          ? Math.max(0.06, (0.16 + live * 0.72 + wave) * (1 - mid * 0.35))
          : processing
            ? Math.max(0.05, (0.2 + wave) * (1 - mid * 0.4))
            : 0.06
        bars[i] += (target - bars[i]) * 0.22
      }

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = "rgba(244, 239, 228, 0.82)"
      for (let i = 0; i < count; i++) {
        const h = Math.max(2, bars[i] * height * 0.92)
        const x = i * step
        const y = (height - h) / 2
        ctx.globalAlpha = 0.35 + bars[i] * 0.65
        ctx.fillRect(x, y, 2, h)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [active, processing, getVolume])

  return (
    <div
      ref={wrapRef}
      className={cn("relative h-10 w-full", className)}
      role="img"
      aria-label={
        active ? "Live microphone" : processing ? "Processing speech" : "Idle waveform"
      }
    >
      <canvas ref={canvasRef} className="block size-full" aria-hidden />
    </div>
  )
}