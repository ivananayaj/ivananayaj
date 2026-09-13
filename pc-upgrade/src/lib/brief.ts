import {
  BOTTLENECKS,
  budgetBand,
  CAPTURED_ON,
  CONFIRMED_PARTS,
  CURRENT_RIG as R,
  PATHS,
  TEARDOWN_ON,
  USES,
  type IntentState,
} from "./rig-data";
import { FREEZE_CHAIN, POWER_BUDGET, STAGES, SWAP_MATRIX } from "./swap-plan";

function filled(value: string, fallback = "UNKNOWN — do not invent this") {
  const t = value.trim();
  return t.length > 0 ? t : fallback;
}

function usesLine(intent: IntentState) {
  if (intent.uses.length === 0) return "Not specified";
  return intent.uses
    .map((id) => USES.find((u) => u.id === id)?.label ?? id)
    .join(", ");
}

function pathName(id: IntentState["preferredPath"]) {
  if (id === "am4") return "AM4 last mile (rescue the current box)";
  if (id === "am5") return "New AM5 platform (the actual new PC)";
  return "Undecided — compare both, then recommend with reasons";
}

export function buildDossier(intent: IntentState) {
  const gaps = [
    ["Monitor", filled(intent.monitor)],
    ["BIOS version", filled(intent.biosVersion)],
    ["Motherboard (confirm inferred model)", filled(intent.motherboard, "PRIME A320M-K — inferred from photos, not yet confirmed in software")],
  ];

  const teardownLines = CONFIRMED_PARTS.map(
    (c) =>
      `- ${c.label}: ${c.value} (${c.confidence === "read" ? "read off the label" : "inferred — confirm"})\n  ${c.detail}`,
  ).join("\n");

  const swapLines = SWAP_MATRIX.map(
    (e) =>
      `### ${e.part} — ${e.status.toUpperCase()}${e.standalone ? " · swappable in isolation" : " · forces a chain reaction"}
Currently: ${e.current}
Interface: ${e.socket}
Cost: ${e.cost}
Drops in: ${e.fits.join(" | ")}
Will not work: ${e.doesNotFit.join(" | ")}
Effect: ${e.effect}${e.gotcha ? `\nGotcha: ${e.gotcha}` : ""}`,
  ).join("\n\n");

  const stageLines = STAGES.map(
    (st) =>
      `${st.n}. ${st.title} — ${st.costLabel}, ${st.time}\n   ${st.fixes}${
        st.requires.length ? `\n   PREREQUISITE: ${st.requires.join("; ")}` : ""
      }`,
  ).join("\n");

  const freezeLines = FREEZE_CHAIN.map(
    (f) => `${f.step}. ${f.cause} — ${f.detail}`,
  ).join("\n");

  const powerLines = POWER_BUDGET.rows
    .map((r) => `- ${r.part}: ${r.watts} W (${r.note})`)
    .join("\n");

  const bottleneckLines = BOTTLENECKS.map(
    (b, i) =>
      `${i + 1}. ${b.part} — ${b.severity.toUpperCase()} (${b.score}/100)\n   ${b.verdict}\n   First move: ${b.firstMove}`,
  ).join("\n\n");

  const pathBlocks = PATHS.map((p) => {
    const selected =
      intent.preferredPath === p.id ? " (CURRENT PREFERENCE)" : "";
    return `### ${p.name}${selected}
Spend: ${p.spend} · Horizon: ${p.years}
When this is the right call: ${p.when}

Steps:
${p.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Keep: ${p.keep.join("; ")}
Replace: ${p.replace.join("; ")}
Risk: ${p.risk}`;
  }).join("\n\n");

  const notes = intent.notes.trim()
    ? intent.notes.trim()
    : "(none yet)";
  const dump = intent.specDump.trim()
    ? intent.specDump.trim()
    : "(not pasted yet)";

  return `# Rig File — Desktop-94
Captured from Windows About on ${CAPTURED_ON}. This dossier is ground truth. Do not invent specs that are marked UNKNOWN. Prefer keeping money on GPU and storage. Flag uncertainty instead of filling gaps with guesses.

## Current system (verified)
- Device name: ${R.deviceName}
- CPU: ${R.cpu} — ${R.cpuDetail}. Released ${R.cpuYear} (Summit Ridge, AM4).
- RAM: ${R.ram} reported at ${R.ramSpeed}. Layout: ${filled(intent.ramConfig)}.
- GPU: ${R.gpu} (${R.gpuVram}), ${R.gpuYear} Pascal.
- Storage: ${R.storage} — ${R.storageModel}. ${R.storageUsed}. No SSD is listed.
- OS: ${R.os}. Product ID ${R.productId} (OEM key, likely not transferable).
- Device ID: ${R.deviceId}

## Confirmed by teardown photos on ${TEARDOWN_ON}
${teardownLines}

## Still unknown
${gaps.map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Why it freezes under 3 simultaneous tasks (the actual complaint)
${freezeLines}

Conclusion: the root cause is pagefile I/O on a 7200 rpm platter, not the GPU and not primarily the CPU.

## Interchangeability matrix — what swaps in isolation
${swapLines}

## Recommended purchase order
${stageLines}

## Power budget check
${powerLines}
- Total peak: ${POWER_BUDGET.total} W against roughly 450 W of derated capacity from the nine-year-old 600 W unit.
- Verdict: ${POWER_BUDGET.verdict}

## What this PC is for
- Uses: ${usesLine(intent)}
- Target resolution: ${intent.resolution}
- Budget ceiling: $${intent.budget} USD
- Budget reading: ${budgetBand(intent.budget)}
- Preferred path: ${pathName(intent.preferredPath)}

## Bottleneck order
${bottleneckLines}

## Two upgrade paths (September 2026)
${pathBlocks}

## Hard rules for any recommendation
1. The PSU is a known Thermaltake Smart 600W with 6+2 PCIe cables. Do not ask for it again; do derate it for age.
2. The board is an ASUS PRIME A320M-K unless the owner says otherwise. Two DIMM slots (32 GB max), one M.2 PCIe 3.0 x4, PCIe 3.0 x16, no CPU overclocking, Zen 3 only on BIOS 5862+.
3. An SSD is the first purchase on every path, because the stated complaint is freezing under multitasking and that is pagefile I/O on a platter drive.
4. The Windows OEM key on this machine should be treated as non-portable.
5. Size the GPU to the monitor, not to a flagship chart. A 1080p 60 Hz panel does not need a 9070 XT.
6. Give current street-price ranges, not MSRP. Label anything used vs new.
7. Only three facts are still open: monitor, BIOS version, and software confirmation of the board model. Ask for those and nothing else.
9. Do not recommend a GPU above ~250 W, a 105 W CPU (5800X/5900X/5700X3D), DDR5, or more than 32 GB of RAM. Each is incompatible with this board or its VRM.
10. Remember the PCIe 3.0 tax: a PCIe 5.0 x8 card negotiates down to 3.0 x8 in this slot. Prefer 16 GB VRAM models so the narrow link is not also carrying texture swaps.
8. No RGB tax, no 360 mm AIO on a 65 W chip, no 9800X3D feeding a leftover 1050 Ti.

## Owner notes
${notes}

## Raw spec dump (PowerShell / extra screenshots)
${dump}

## What a good answer looks like
- A decision: AM4 last mile vs new AM5, with a sentence on why.
- A parts list that fits $${intent.budget}, with a cheaper fallback and a "spend the extra here" note.
- A reuse list (what physically moves, what does not).
- A "buy this week / wait for these two facts" split.
- Compatibility caveats in plain language.
`;
}

export const PROMPT_PACK: {
  id: string;
  name: string;
  blurb: string;
  extra: (intent: IntentState) => string;
}[] = [
  {
    id: "master",
    name: "Master brief",
    blurb: "Paste this first. It is the whole file.",
    extra: (intent) => buildDossier(intent),
  },
  {
    id: "decide",
    name: "Decide the path",
    blurb: "Force a single recommendation, AM4 or AM5.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: Choose exactly one path — AM4 last mile, or a new AM5 PC. Do not split the difference. Give:
1. The decision in one sentence.
2. Three facts from this dossier that drove it.
3. The two facts that would flip the decision.
4. A $${intent.budget} shopping order (what to buy 1st / 2nd / 3rd).
5. What I should photograph or paste next.`,
  },
  {
    id: "parts",
    name: "Parts list at this budget",
    blurb: "Concrete SKUs and a cheaper fallback.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: Build a parts list that totals at or under $${intent.budget} USD at September 2026 street prices.
- One recommended list and one list $200 cheaper.
- For each part: role, why this and not the next tier up, estimated price band, new vs used.
- Call out any part that cannot be chosen until motherboard or PSU is known.
- Assume US pricing. If a chip is out of stock, name the substitute, not a fantasy SKU.`,
  },
  {
    id: "compat",
    name: "I found the board and PSU",
    blurb: "Verify the inferred board before spending.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: Compatibility pass only. The board model below was INFERRED from teardown photos, not confirmed in software — treat it as a hypothesis to test.
Motherboard (inferred): ${filled(intent.motherboard, "ASUS PRIME A320M-K — from silkscreen + rear I/O")}
BIOS version on file: ${filled(intent.biosVersion, "(not filled — this gates the CPU swap)")}
PSU (confirmed): Thermaltake Smart 600W, 80 Plus White, non-modular, 2017
RAM (confirmed): 2 x 8 GB GeIL EVO Potenza, DDR4-2400 CL16, both slots filled
Case (confirmed): Thermaltake ATX mid-tower, 7 slots, full GPU clearance

Tell me:
1. Does the inferred board model match those rear-I/O details (VGA + HDMI, dual PS/2, 2 DIMM slots, 4 SATA, 1 M.2)? If a different ASUS A320M variant fits better, say which and what changes.
2. Exactly which BIOS version added Ryzen 5000 support for it, and the safe flashing procedure from an original 2017 BIOS.
3. Is the A320M-K VRM adequate for a 65 W 5700X sustained? Where is the honest line?
4. What GPU power budget is honest for a nine-year-old group-regulated 600 W unit?
5. How much real performance does PCIe 3.0 x16 cost on a PCIe 5.0 x8 card like the 9060 XT?`,
  },
  {
    id: "freeze",
    name: "Stop the freezing",
    blurb: "The actual complaint, isolated. Cheapest fix first.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: The machine locks up for seconds at a time when three applications are open at once. Framerate is a separate, lower-priority concern.

Diagnose ONLY the freezing, and rank fixes by responsiveness restored per dollar.
1. Name the root cause and the evidence for it in this dossier.
2. Say plainly which upgrades do NOT help with freezing, and why people buy them anyway.
3. Give the cheapest purchase that produces a noticeable change, with a price band.
4. Give the second purchase, and what specifically it fixes that the first one does not.
5. Include any free change (BIOS settings, pagefile placement, startup apps) before anything paid.
Do not recommend a graphics card in this answer unless you can justify it against the freezing specifically.`,
  },
  {
    id: "reuse",
    name: "What can I keep?",
    blurb: "Honest reuse vs wishful reuse.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: Make a keep / donate / recycle table for every current part.
Be strict. DDR4 does not move to AM5. The 1400 does not move to AM5. The OEM Windows key probably does not move. The WD Blue HDD can be archive storage. The 1050 Ti is a bench card, not a 2026 gaming card.
If staying AM4, say what is worth buying used. If going AM5, say what is worth selling first.`,
  },
  {
    id: "rules",
    name: "No-upsell shopper",
    blurb: "For when the other model starts adding RGB.",
    extra: (intent) => `${buildDossier(intent)}

---

Task: You are a skeptical parts advisor. Push back on anything that does not move FPS, boot time, or silence at this budget ($${intent.budget}).
Refuse: RGB, glass that needs extra fans to exist, 360 mm AIOs on low-TDP chips, 64 GB RAM for 1080p gaming, 4 TB SSDs before a GPU, X3D CPUs feeding a 1050 Ti, "future-proof" language.
Return a lean list, a "nice but skip" list, and the single upgrade that gives the most hours back this month (almost certainly the SSD).`,
  },
];
