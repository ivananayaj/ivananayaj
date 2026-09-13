import { AlertTriangle, Cpu, HardDrive, MemoryStick, Monitor, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Section } from "@/components/nav";
import {
  BOTTLENECKS,
  CURRENT_RIG as R,
  PATHS,
  RESOLUTIONS,
  SPEC_SCRIPT,
  UNKNOWN_SLOTS,
  USES,
  budgetBand,
  type PathId,
} from "@/lib/rig-data";
import { useRig } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: Cpu, label: "Processor", value: R.cpu, hint: R.cpuDetail },
  { icon: MemoryStick, label: "Memory", value: R.ram, hint: `${R.ramSpeed} · layout unknown` },
  { icon: Monitor, label: "Graphics", value: R.gpu, hint: `${R.gpuVram} · ${R.gpuYear} Pascal` },
  { icon: HardDrive, label: "Storage", value: R.storage, hint: `${R.storageModel} · ${R.storageUsed}` },
];

const TONE = {
  critical: "danger",
  severe: "warn",
  moderate: "warn",
  blocker: "danger",
} as const;

export function RigPanel() {
  return (
    <Section id="rig" kicker="01 — Ground truth" title="What Windows actually reported.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Pulled from the About page on {R.deviceName}. This is the only verified hardware.
        Everything else in this file is either a diagnosis or a question still waiting on you.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {STATS.map((s) => (
          <article
            key={s.label}
            className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-4" />
              <p className="text-xs font-medium tracking-wide uppercase">{s.label}</p>
            </div>
            <p className="mt-3 text-lg font-medium text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.hint}</p>
          </article>
        ))}
      </div>
      <dl className="mt-4 grid gap-x-8 gap-y-2 rounded-xl bg-surface px-5 py-4 text-sm shadow-[var(--shadow-border)] sm:grid-cols-2">
        <div className="flex justify-between gap-4 border-b border-border py-2 sm:border-none sm:py-0">
          <dt className="text-muted-foreground">Device</dt>
          <dd className="tabular-nums">{R.deviceName}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border py-2 sm:border-none sm:py-0">
          <dt className="text-muted-foreground">System</dt>
          <dd>{R.os}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-border py-2 sm:border-none sm:py-0">
          <dt className="text-muted-foreground">Product ID</dt>
          <dd className="tabular-nums">{R.productId}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2 sm:py-0">
          <dt className="text-muted-foreground">OEM key</dt>
          <dd>Likely not transferable</dd>
        </div>
      </dl>
    </Section>
  );
}

type GapField = "motherboard" | "biosVersion" | "monitor";

const GAP_PLACEHOLDER: Record<GapField, string> = {
  motherboard: "ASUSTeK COMPUTER INC. / PRIME A320M-K",
  biosVersion: "e.g. 5862, dated 2021-11",
  monitor: "e.g. 24-inch 1080p 60 Hz",
};

export function GapsPanel() {
  const specDump = useRig((s) => s.specDump);
  const setField = useRig((s) => s.setField);
  const values = useRig(
    useShallow((s) => ({
      motherboard: s.motherboard,
      biosVersion: s.biosVersion,
      monitor: s.monitor,
    })),
  );

  return (
    <Section
      id="gaps"
      kicker="02 — Still missing"
      title="Three facts left, and only one of them costs money."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The teardown photos answered the board, the power supply, the memory layout, and the
        case. What remains is the monitor — which decides the graphics card — and the BIOS
        version, which decides whether the processor swap works at all.
      </p>
      <div className="mt-6 grid gap-4">
        {UNKNOWN_SLOTS.map((slot) => (
          <article
            key={slot.id}
            className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-medium">{slot.label}</h3>
              <Badge tone={values[slot.id as GapField]?.trim() ? "ok" : "danger"}>
                {values[slot.id as GapField]?.trim() ? "Logged" : "Needed"}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{slot.why}</p>
            <p className="mt-2 text-xs text-subtle">{slot.how}</p>
            <div className="mt-4">
              <Label htmlFor={slot.id} className="sr-only">
                {slot.label}
              </Label>
              <Input
                id={slot.id}
                value={values[slot.id as GapField] ?? ""}
                placeholder={GAP_PLACEHOLDER[slot.id as GapField]}
                onChange={(e) => setField(slot.id as GapField, e.target.value)}
              />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-medium">PowerShell spec dump</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Run this on Desktop-94, then paste the output. It is the fastest way to name the board and RAM.
            </p>
          </div>
          <CopyButton text={SPEC_SCRIPT} label="Copy script" />
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-elevated p-4 text-xs leading-relaxed text-muted-foreground">
          {SPEC_SCRIPT}
        </pre>
        <Label htmlFor="specDump" className="mt-4 block">
          Paste output here
        </Label>
        <Textarea
          id="specDump"
          className="mt-2 min-h-36"
          value={specDump}
          placeholder="Paste the PowerShell output or extra notes from screenshots."
          onChange={(e) => setField("specDump", e.target.value)}
        />
      </div>
    </Section>
  );
}

export function DiagnosisPanel() {
  return (
    <Section id="diagnosis" kicker="03 — Order of pain" title="What is actually holding this PC back.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Ranked by how much they cost you today, not by how exciting they are to replace. The spinning
        disk is the first purchase on every path.
      </p>
      <ol className="mt-6 grid gap-3">
        {BOTTLENECKS.map((b, i) => (
          <li
            key={b.id}
            className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs tabular-nums text-subtle">0{i + 1}</span>
              <h3 className="text-base font-medium">{b.part}</h3>
              <Badge tone={TONE[b.severity]}>{b.severity}</Badge>
            </div>
            <p className="mt-1 text-xs text-subtle">{b.era}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className={cn(
                  "h-full rounded-full",
                  b.score >= 85 ? "bg-danger" : b.score >= 65 ? "bg-warn" : "bg-ok",
                )}
                style={{ width: `${b.score}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.verdict}</p>
            <p className="mt-2 text-sm text-foreground">
              <span className="text-muted-foreground">First move · </span>
              {b.firstMove}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function IntentPanel() {
  const uses = useRig((s) => s.uses);
  const resolution = useRig((s) => s.resolution);
  const budget = useRig((s) => s.budget);
  const notes = useRig((s) => s.notes);
  const toggleUse = useRig((s) => s.toggleUse);
  const setBudget = useRig((s) => s.setBudget);
  const setResolution = useRig((s) => s.setResolution);
  const setField = useRig((s) => s.setField);

  return (
    <Section id="intent" kicker="04 — What you want" title="Budget, screen, and how you actually use it.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This is the other half of the brief. A $400 rescue and a $1,600 AM5 box are both valid — they
        are not the same project.
      </p>
      <div className="mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <Label>Uses</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {USES.map((u) => {
            const on = uses.includes(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleUse(u.id)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm transition-colors duration-[var(--motion-quick)]",
                  on
                    ? "bg-primary text-primary-fg"
                    : "bg-elevated text-muted-foreground hover:text-foreground",
                )}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Label>Target resolution</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setResolution(r.id)}
                className={cn(
                  "h-11 rounded-md text-sm transition-colors duration-[var(--motion-quick)]",
                  resolution === r.id
                    ? "bg-primary text-primary-fg"
                    : "bg-elevated text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="budget">Budget ceiling</Label>
            <p className="font-display text-2xl italic tabular-nums">${budget}</p>
          </div>
          <input
            id="budget"
            type="range"
            min={300}
            max={2500}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-6 w-full accent-primary"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{budgetBand(budget)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <Label htmlFor="notes">Notes from earlier conversations</Label>
        <Textarea
          id="notes"
          className="mt-2 min-h-32"
          value={notes}
          placeholder="Games you play, whether this is a family PC, how loud it can be, used-parts comfort, anything already decided."
          onChange={(e) => setField("notes", e.target.value)}
        />
      </div>
    </Section>
  );
}

export function PathsPanel() {
  const preferredPath = useRig((s) => s.preferredPath);
  const setPath = useRig((s) => s.setPath);

  return (
    <Section id="paths" kicker="05 — Two honest options" title="Rescue the AM4 box, or start a new platform.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Pick a preference. The brief will tell Claude and ChatGPT which one you are leaning toward.
        You can leave it undecided.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["undecided", "Still deciding"],
            ["am4", "Lean AM4 last mile"],
            ["am5", "Lean new AM5"],
          ] as [PathId, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPath(id)}
            className={cn(
              "h-11 rounded-full px-4 text-sm transition-colors duration-[var(--motion-quick)]",
              preferredPath === id
                ? "bg-primary text-primary-fg"
                : "bg-elevated text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {PATHS.map((p) => {
          const selected = preferredPath === p.id;
          return (
            <article
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
                selected && "ring-1 ring-ring",
              )}
            >
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{p.kicker}</p>
              <h3 className="font-display mt-2 text-2xl italic">{p.name}</h3>
              <p className="mt-2 text-sm text-foreground">
                {p.spend} · {p.years}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.when}</p>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed">
                {p.steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="tabular-nums text-subtle">0{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 grid gap-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Keep · </span>
                  {p.keep.join(" · ")}
                </p>
                <p>
                  <span className="text-muted-foreground">Replace · </span>
                  {p.replace.join(" · ")}
                </p>
                <p className="flex gap-2 text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
                  {p.risk}
                </p>
              </div>
              <Button
                className="mt-5"
                variant={selected ? "default" : "outline"}
                onClick={() => setPath(p.id)}
              >
                {selected ? "Preferred path" : `Prefer ${p.name}`}
              </Button>
            </article>
          );
        })}
      </div>
      <div className="mt-4 flex gap-3 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]">
        <Puzzle className="mt-0.5 size-4 shrink-0 text-ring" />
        <p>
          If the board is an A320 that never got a 5000-series BIOS, or the PSU is a 300 W OEM brick,
          Path A collapses and you are building AM5 whether the budget is ready or not. That is why
          Gaps comes before shopping.
        </p>
      </div>
    </Section>
  );
}
