import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SECTIONS = [
  { id: "rig", label: "Rig" },
  { id: "gaps", label: "Gaps" },
  { id: "teardown", label: "Teardown" },
  { id: "freeze", label: "Freezing" },
  { id: "swap", label: "Swaps" },
  { id: "stages", label: "Order" },
  { id: "power", label: "Power" },
  { id: "windows", label: "Windows 11" },
  { id: "market", label: "Prices" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "intent", label: "Intent" },
  { id: "paths", label: "Paths" },
  { id: "brief", label: "Brief" },
  { id: "prompts", label: "Prompts" },
] as const;

export function SectionNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Dossier sections"
      className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl overflow-x-auto">
        <div className="flex w-max gap-1 px-4 py-2 md:px-8">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors duration-[var(--motion-quick)]",
                active === s.id
                  ? "bg-primary text-primary-fg"
                  : "text-muted-foreground hover:bg-elevated hover:text-foreground",
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 md:scroll-mt-24">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {kicker}
      </p>
      <h2 className="font-display mt-2 text-3xl text-foreground italic md:text-4xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
