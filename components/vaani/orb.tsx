"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type { AgentState } from "@/lib/demo-session"

const DEFAULT_COLORS: [string, string] = ["#CADCFC", "#A0B9D1"]

type OrbProps = {
  agentState?: AgentState
  className?: string
  colors?: [string, string]
  getInputVolume?: () => number
}

const STATE_CODE: Record<AgentState, number> = {
  idle: 0,
  listening: 1,
  thinking: 2,
  talking: 3,
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uState;
uniform float uVol;
uniform vec3 uC1;
uniform vec3 uC2;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float a = atan(p.y, p.x);

  float listen = smoothstep(0.0, 1.0, abs(uState - 1.0) < 0.5 ? 1.0 : 0.0);
  float think = smoothstep(0.0, 1.0, abs(uState - 2.0) < 0.5 ? 1.0 : 0.0);
  float talk = smoothstep(0.0, 1.0, abs(uState - 3.0) < 0.5 ? 1.0 : 0.0);

  float warp = 0.045 + uVol * 0.12 + listen * 0.04 + talk * 0.07;
  float n1 = noise(vec2(a * 1.6, uTime * 0.35)) - 0.5;
  float n2 = noise(vec2(a * 3.1 + 2.0, uTime * 0.55 + 4.0)) - 0.5;
  float d = r + (n1 * 0.55 + n2 * 0.35) * warp;

  float core = smoothstep(0.86, 0.18, d);
  float mist = smoothstep(1.05, 0.42, d) * 0.45;
  float rim = smoothstep(0.92, 0.70, d) * smoothstep(0.48, 0.82, d);

  float pulse = 0.5 + 0.5 * sin(uTime * mix(1.1, 3.4, talk + listen));
  vec3 ink = mix(uC1, uC2, 0.5 + 0.5 * sin(a * 2.0 + uTime * 0.6));
  ink = mix(ink, vec3(0.98, 0.96, 0.92), rim * 0.55);
  ink += talk * pulse * 0.08;
  ink = mix(ink, vec3(0.89, 0.23, 0.17), think * 0.12);

  float alpha = clamp(core + mist, 0.0, 1.0);
  alpha *= smoothstep(1.18, 0.96, r);
  gl_FragColor = vec4(ink, alpha);
}
`

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "")
  const n = Number.parseInt(v, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function Orb({
  agentState = "idle",
  className,
  colors = DEFAULT_COLORS,
  getInputVolume,
}: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(agentState)
  const volumeRef = useRef(getInputVolume)

  stateRef.current = agentState
  volumeRef.current = getInputVolume

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()
    if (!program) return
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )
    const loc = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, "uTime")
    const uState = gl.getUniformLocation(program, "uState")
    const uVol = gl.getUniformLocation(program, "uVol")
    const uC1 = gl.getUniformLocation(program, "uC1")
    const uC2 = gl.getUniformLocation(program, "uC2")
    const c1 = hexToRgb(colors[0])
    const c2 = hexToRgb(colors[1])

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    let raf = 0
    const start = performance.now()
    let currentVol = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = canvas.clientWidth
      canvas.width = size * dpr
      canvas.height = size * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const draw = (now: number) => {
      const target = volumeRef.current?.() ?? 0
      currentVol += (target - currentVol) * 0.18
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform1f(uState, STATE_CODE[stateRef.current])
      gl.uniform1f(uVol, currentVol)
      gl.uniform3f(uC1, c1[0], c1[1], c1[2])
      gl.uniform3f(uC2, c2[0], c2[1], c2[2])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      gl.deleteProgram(program)
    }
  }, [colors])

  return (
    <canvas
      ref={canvasRef}
      className={cn("size-full", className)}
      aria-hidden
    />
  )
}
