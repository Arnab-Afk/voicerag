import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Frame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[1180px]", className)}>
      <Cross className="top-3 left-[-5px]" />
      <Cross className="top-3 right-[-5px]" />
      <Cross className="bottom-3 left-[-5px]" />
      <Cross className="right-[-5px] bottom-3" />
      <div className="border-x border-rule">{children}</div>
    </div>
  )
}

function Cross({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 size-[11px] text-paper/35",
        className
      )}
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
    </span>
  )
}

export function RuleRow({ children }: { children: ReactNode }) {
  return <div className="border-t border-rule">{children}</div>
}
