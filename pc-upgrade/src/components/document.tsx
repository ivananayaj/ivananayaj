import { Download } from "lucide-react";
import { CopyButton, copyText } from "@/components/copy-button";
import { Section } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { buildDossier, PROMPT_PACK } from "@/lib/brief";
import { useIntent } from "@/lib/store";

function downloadMarkdown(text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desktop-94-rig-file.md";
  a.click();
  URL.revokeObjectURL(url);
}

export function BriefPanel() {
  const intent = useIntent();
  const dossier = buildDossier(intent);

  return (
    <Section id="brief" kicker="06 — One file" title="The document you take to Claude and ChatGPT.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        This is the same text every prompt in the pack starts from. Copy it, download it, or keep
        editing Gaps and Intent — it rewrites in place.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <CopyButton text={dossier} label="Copy entire brief" variant="default" size="default" />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            downloadMarkdown(dossier);
          }}
        >
          <Download />
          Download .md
        </Button>
      </div>
      <article className="mt-6 rounded-xl bg-paper p-6 text-ink shadow-[var(--shadow-border)] md:p-10">
        <p className="text-xs tracking-[0.2em] text-ink/55 uppercase">Rig File · Desktop-94</p>
        <h3 className="font-display mt-3 text-3xl italic">Upgrade dossier</h3>
        <pre className="mt-6 overflow-x-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/90">
          {dossier}
        </pre>
      </article>
    </Section>
  );
}

export function PromptsPanel() {
  const intent = useIntent();

  return (
    <Section id="prompts" kicker="07 — Working method" title="Six prompts. Same facts. Different jobs.">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Each button copies a full prompt with the current dossier baked in. Use the master brief
        once, then the specialist prompts when you are deciding, shopping, or checking a part you
        just found.
      </p>
      <div className="mt-6 grid gap-3">
        {PROMPT_PACK.map((p, i) => {
          const text = p.extra(intent);
          return (
            <article
              key={p.id}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs tabular-nums text-subtle">0{i + 1}</p>
                  <h3 className="mt-1 text-base font-medium">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                </div>
                <CopyButton text={text} label="Copy prompt" />
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Preview
                </summary>
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-elevated p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {text}
                </pre>
              </details>
            </article>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl bg-surface p-5 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-border)]">
        <p>
          Suggested rhythm: paste the master brief into a new Claude or ChatGPT thread. Pin it.
          Then send Decide the path. After you photograph the board and PSU, send I found the
          board and PSU. Finish with Parts list at this budget. The no-upsell prompt is there
          for when the other model starts adding glass and RGB.
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const all = PROMPT_PACK.map(
                (p, i) => `## ${i + 1}. ${p.name}\n\n${p.extra(intent)}`,
              ).join("\n\n---\n\n");
              void copyText(all, "All six prompts copied");
            }}
          >
            Copy all six prompts
          </Button>
        </div>
      </div>
    </Section>
  );
}
