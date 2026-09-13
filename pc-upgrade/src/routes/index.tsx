import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { BriefPanel, PromptsPanel } from "@/components/document";
import { SECTIONS, SectionNav } from "@/components/nav";
import {
  DiagnosisPanel,
  GapsPanel,
  IntentPanel,
  PathsPanel,
  RigPanel,
} from "@/components/panels";
import {
  FreezePanel,
  PowerPanel,
  StagesPanel,
  SwapMatrixPanel,
  TeardownPanel,
} from "@/components/swap-panels";
import { Button } from "@/components/ui/button";
import { buildDossier } from "@/lib/brief";
import { CAPTURED_ON, CURRENT_RIG, UNKNOWN_SLOTS } from "@/lib/rig-data";
import { hydrateRig, useIntent, useRig } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [active, setActive] = useState("rig");
  const [ready, setReady] = useState(false);
  const intent = useIntent();
  const reset = useRig((s) => s.reset);
  const dossier = buildDossier(intent);

  useEffect(() => {
    hydrateRig();
    setReady(true);
  }, []);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ready]);

  const missing = UNKNOWN_SLOTS.filter(
    (slot) => !(intent[slot.id as keyof typeof intent] as string)?.trim(),
  ).length;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Rig File
            </p>
            <p className="text-xs text-subtle">Captured {CAPTURED_ON}</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm text-ring">{CURRENT_RIG.deviceName}</p>
              <h1 className="font-display mt-2 text-5xl leading-[1.05] italic md:text-7xl">
                It is the hard drive.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Ryzen 5 1400, GTX 1050 Ti, 16 GB at 2133, and a 1 TB spinning disk in an
                ASUS A320M-K. The teardown photos closed four of the five unknowns, so this
                is no longer a shopping guess: every part below swaps in on its own, in a
                deliberate order, starting with an $80 SSD that fixes the freezing.
              </p>
            </div>
            <div className="flex min-w-52 flex-col gap-3 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="size-4" />
                Working file
              </div>
              <p className="text-sm">
                <span className="tabular-nums text-foreground">{missing}</span>
                <span className="text-muted-foreground">
                  {" "}
                  of {UNKNOWN_SLOTS.length} hardware gaps still open
                </span>
              </p>
              <CopyButton text={dossier} label="Copy brief" variant="default" size="default" />
            </div>
          </div>
        </div>
      </header>

      <SectionNav active={active} />

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-12 md:px-8 md:py-16">
        <RigPanel />
        <GapsPanel />
        <TeardownPanel />
        <FreezePanel />
        <SwapMatrixPanel />
        <StagesPanel />
        <PowerPanel />
        <DiagnosisPanel />
        <IntentPanel />
        <PathsPanel />
        <BriefPanel />
        <PromptsPanel />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-sm text-muted-foreground">
            Desktop-94 · Rig File · facts first, shopping second.
          </p>
          <Button type="button" variant="ghost" onClick={() => reset()}>
            Reset notes
          </Button>
        </div>
      </footer>
    </div>
  );
}
