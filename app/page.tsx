import { Console } from "@/components/vaani/console"
import { Docket } from "@/components/vaani/docket"
import { Footer } from "@/components/vaani/footer"
import { Frame, RuleRow } from "@/components/vaani/frame"
import { Header } from "@/components/vaani/header"
import { IndexPlan } from "@/components/vaani/index-plan"
import { Latency } from "@/components/vaani/latency"

export default function Home() {
  return (
    <div className="min-h-dvh">
      <Frame>
        <Header />
        <RuleRow>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 font-mono text-[10px] tracking-[0.16em] text-paper/50 uppercase sm:px-10 lg:px-12">
            <span>HH Goa 2026</span>
            <span className="text-register">Task 2</span>
            <span>ai4bharat / MSMARCO-XI</span>
            <span>Voice → index → rule</span>
          </p>
        </RuleRow>
        <RuleRow>
          <div id="console">
            <Console />
          </div>
        </RuleRow>
        <RuleRow>
          <Latency />
        </RuleRow>
        <RuleRow>
          <IndexPlan />
        </RuleRow>
        <RuleRow>
          <Docket />
        </RuleRow>
        <RuleRow>
          <Footer />
        </RuleRow>
      </Frame>
    </div>
  )
}
