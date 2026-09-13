import {
  ArrowRight,
  Check,
  CircleAlert,
  Lock,
  Plug,
  RefreshCw,
  Snowflake,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/nav";
import {
  FREEZE_CHAIN,
  POWER_BUDGET,
  STAGES,
  SWAP_MATRIX,
  stagesWithinBudget,
  totalCost,
  type SwapStatus,
} from "@/lib/swap-plan";
import { CONFIRMED_PARTS } from "@/lib/rig-data";
import { useRig } from "@/lib/store";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  SwapStatus,
  { label: string; tone: "ok" | "warn" | "danger" | "default"; icon: typeof Check }
> = {
  keep: { label: "Keep", tone: "ok", icon: Check },
  swap: { label: "Swappable on its own", tone: "warn", icon: RefreshCw },
  ceiling: { label: "Ceiling — don't buy", tone: "default", icon: Lock },
};

/** 03 — What the teardown photos settled. */
export function TeardownPanel() {
  return (
    <Section
      id="teardown"
      kicker="03 — Teardown"
      title="Four of the five unknowns are answered."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The photos in the case did what the Windows About page could not. The board, the
        power supply, the memory layout, and the case are all now known quantities — which
        turns every recommendation below from a guess into arithmetic.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CONFIRMED_PARTS.map((part) => (
          <article
            key={part.id}
            className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {part.label}
              </p>
              <Badge tone={part.confidence === "read" ? "ok" : "warn"}>
                {part.confidence === "read" ? "Read off the label" : "Inferred — confirm"}
              </Badge>
            </div>
            <p className="mt-3 text-lg font-medium text-foreground">{part.value}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{part.detail}</p>
            <p className="mt-3 text-xs text-subtle">{part.source}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** 04 — Why it freezes. The actual question. */
export function FreezePanel() {
  return (
    <Section
      id="freeze"
      kicker="04 — The freezing"
      title="It is the hard drive, not the graphics card."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The lock-ups under three simultaneous tasks are one specific failure, and it has a
        chain of causes worth following, because the obvious fix is the wrong one.
      </p>

      <ol className="mt-6 flex flex-col gap-2">
        {FREEZE_CHAIN.map((link) => (
          <li
            key={link.step}
            className={cn(
              "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
              link.step === 3 && "ring-1 ring-danger/40",
            )}
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                  link.step === 3
                    ? "bg-danger/20 text-danger"
                    : "bg-elevated text-muted-foreground",
                )}
              >
                {link.step}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-medium">{link.cause}</h3>
                  {link.step === 3 && (
                    <Badge tone="danger">
                      <Snowflake className="mr-1 size-3" />
                      Root cause
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {link.detail}
                </p>
                <p className="mt-2 text-xs text-subtle">{link.part}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-2 text-warn">
          <CircleAlert className="size-4" />
          <p className="text-sm font-medium">The trap</p>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A new graphics card is the upgrade everybody reaches for first, and it is the one
          part on the list that does nothing for this problem. A 1050 Ti gives you low
          framerates. It does not give you multi-second desktop stalls. Buy the $80 SSD
          before the $350 card and the machine will feel more improved, for a quarter of the
          money.
        </p>
      </div>
    </Section>
  );
}

/** 05 — The interchangeability matrix. */
export function SwapMatrixPanel() {
  const standalone = SWAP_MATRIX.filter((e) => e.standalone).length;
  return (
    <Section
      id="swap"
      kicker="05 — Interchangeable parts"
      title="What comes out on its own, and what drags the rest with it."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {standalone} of the {SWAP_MATRIX.length} subsystems below can be changed in
        isolation, on any evening, with everything else left in the case. Only the
        motherboard forces a chain reaction — and it is the one thing not worth buying.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {SWAP_MATRIX.map((entry) => {
          const meta = STATUS_META[entry.status];
          const Icon = meta.icon;
          return (
            <article
              key={entry.id}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-medium">{entry.part}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.current}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={meta.tone}>
                    <Icon className="mr-1 size-3" />
                    {meta.label}
                  </Badge>
                  <Badge tone="default">{entry.cost}</Badge>
                </div>
              </div>

              <p className="mt-3 flex items-center gap-2 text-xs text-subtle">
                <Plug className="size-3.5 shrink-0" />
                {entry.socket}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium tracking-wide text-ok uppercase">
                    Drops in
                  </p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {entry.fits.map((f) => (
                      <li key={f} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                        <Check className="mt-1 size-3.5 shrink-0 text-ok" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide text-danger uppercase">
                    Will not work
                  </p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {entry.doesNotFit.map((f) => (
                      <li key={f} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-1 size-3.5 shrink-0 text-center text-danger">×</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed">
                <span className="text-muted-foreground">What changes: </span>
                {entry.effect}
              </p>

              {entry.gotcha && (
                <p className="mt-3 flex gap-2 rounded-lg bg-elevated p-3 text-sm leading-relaxed text-muted-foreground">
                  <Wrench className="mt-0.5 size-3.5 shrink-0 text-warn" />
                  <span>{entry.gotcha}</span>
                </p>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/** 06 — Sequenced, budget-aware stages. */
export function StagesPanel() {
  const budget = useRig((s) => s.budget);
  const { affordable, deferred, spent } = stagesWithinBudget(budget);
  const full = totalCost();

  return (
    <Section
      id="stages"
      kicker="06 — Order of operations"
      title="Four purchases, any weekend you like."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Sorted by responsiveness restored per dollar, not by excitement. Every stage is a
        finished upgrade on its own — stop after any one of them and the machine is better
        than it was. The whole run is{" "}
        <span className="tabular-nums text-foreground">${full}</span>, which is roughly a
        third of what replacing this PC would cost.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {STAGES.map((stage) => {
          const inBudget = affordable.some((s) => s.id === stage.id);
          return (
            <article
              key={stage.id}
              className={cn(
                "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
                !inBudget && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-xs tabular-nums text-muted-foreground">
                    {stage.n}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium">{stage.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stage.buy}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={inBudget ? "ok" : "default"}>{stage.costLabel}</Badge>
                  <Badge tone="default">{stage.time}</Badge>
                </div>
              </div>

              <p className="mt-3 pl-11 text-sm leading-relaxed text-muted-foreground">
                {stage.fixes}
              </p>

              {stage.requires.length > 0 && (
                <div className="mt-3 ml-11 flex flex-col gap-1.5">
                  {stage.requires.map((r) => (
                    <p
                      key={r}
                      className="flex gap-2 rounded-lg bg-danger/10 p-3 text-sm leading-relaxed text-foreground"
                    >
                      <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-danger" />
                      <span>
                        <span className="text-danger">Do this first: </span>
                        {r}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            At your <span className="tabular-nums text-foreground">${budget}</span> budget
            slider
          </p>
          <Badge tone="ok">
            <span className="tabular-nums">${spent}</span>
            <span className="ml-1">of ${full} covered</span>
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {deferred.length === 0 ? (
            <>
              The full plan fits, with{" "}
              <span className="tabular-nums text-foreground">${budget - spent}</span> left
              over. Put the remainder toward the 16 GB version of whichever card you pick, or
              toward replacing the nine-year-old power supply.
            </>
          ) : (
            <>
              Covers stages{" "}
              <span className="text-foreground">
                {affordable.map((s) => s.n).join(", ")}
              </span>
              . Deferred:{" "}
              <span className="text-foreground">
                {deferred.map((s) => s.title).join("; ")}
              </span>
              . That is a good place to stop — the deferred items are the expensive ones and
              the least connected to the freezing.
            </>
          )}
        </p>
      </div>
    </Section>
  );
}

/** 07 — Power arithmetic, so the PSU verdict is checkable. */
export function PowerPanel() {
  return (
    <Section id="power" kicker="07 — Power budget" title="Does the 600 W hold? Yes.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {POWER_BUDGET.headroomNote}
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted-foreground">Part</th>
              <th className="px-5 py-3 text-right font-medium text-muted-foreground">Peak</th>
              <th className="px-5 py-3 font-medium text-muted-foreground">Note</th>
            </tr>
          </thead>
          <tbody>
            {POWER_BUDGET.rows.map((row) => (
              <tr key={row.part} className="border-b border-border last:border-none">
                <td className="px-5 py-3">{row.part}</td>
                <td className="px-5 py-3 text-right tabular-nums">{row.watts} W</td>
                <td className="px-5 py-3 text-muted-foreground">{row.note}</td>
              </tr>
            ))}
            <tr className="bg-elevated">
              <td className="px-5 py-3 font-medium">Total under full load</td>
              <td className="px-5 py-3 text-right font-medium tabular-nums">
                {POWER_BUDGET.total} W
              </td>
              <td className="px-5 py-3 text-muted-foreground">vs ~450 W derated capacity</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 flex max-w-3xl gap-2 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-ok" />
        <span>{POWER_BUDGET.verdict}</span>
      </p>
    </Section>
  );
}
