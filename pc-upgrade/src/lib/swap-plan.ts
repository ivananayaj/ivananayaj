/**
 * Swap plan — what can be changed one part at a time, and in what order.
 *
 * Everything here is derived from parts confirmed in the teardown photos
 * (see CONFIRMED_PARTS in rig-data.ts). The governing constraint is that this
 * is an ASUS PRIME A320M-K: AM4, micro-ATX, two DIMM slots, one M.2, PCIe 3.0.
 * Nothing in this file assumes a part that has not been seen.
 */

export type SwapStatus = "keep" | "swap" | "ceiling";

export type SwapEntry = {
  id: string;
  part: string;
  current: string;
  status: SwapStatus;
  /** The physical/electrical standard that decides what is interchangeable. */
  socket: string;
  /** Swappable without touching anything else? */
  standalone: boolean;
  fits: string[];
  doesNotFit: string[];
  cost: string;
  effect: string;
  /** Non-obvious compatibility trap for this specific board. */
  gotcha?: string;
};

/**
 * The interchangeability matrix.
 *
 * `standalone: true` means the part can be swapped on its own, tonight,
 * with every other component left in place. That is the whole point of the
 * question: five of the six rows below are standalone.
 */
export const SWAP_MATRIX: SwapEntry[] = [
  {
    id: "storage",
    part: "Boot drive",
    current: "WD Blue 1 TB 7200 rpm HDD",
    status: "swap",
    socket: "M.2 2280 (PCIe 3.0 x4) — plus 4 free SATA 6Gb/s ports",
    standalone: true,
    fits: [
      "Any M.2 2280 NVMe SSD — 1 TB or 2 TB. A Gen3 drive is the exact match; a Gen4/Gen5 drive works fine but runs at Gen3 speed.",
      "Any 2.5\" SATA SSD as a fallback — the case has empty bays and the PSU has spare SATA power leads.",
      "The existing HDD stays installed as a second drive. You are adding, not removing.",
    ],
    doesNotFit: [
      "M.2 22110 (too long for the standoff).",
      "Nothing else. This is the least constrained slot in the machine.",
    ],
    cost: "$100 – $150 for 1 TB",
    effect:
      "Boot, app launches, alt-tab, and — critically — pagefile access stop waiting on a moving arm. This is the single change that removes the freezing.",
    gotcha:
      "The M.2 slot sits under the graphics card on this board. Pull the GPU to reach it, then put it back. Ten extra minutes, no extra parts.",
  },
  {
    id: "ram",
    part: "Memory",
    current: "2 x 8 GB GeIL DDR4-2400 (running 2133)",
    status: "swap",
    socket: "DDR4 288-pin, 2 slots, 32 GB board maximum",
    standalone: true,
    fits: [
      "2 x 16 GB DDR4-3200 CL16 — still the correct part, but roughly triple its 2025 price. Reassess after the SSD lands.",
      "Any DDR4 UDIMM. Speed above 3200 is wasted: A320 will not clock the memory controller that high on Zen 1, and Zen 3 tops out around 3200 for a 1:1 fabric ratio anyway.",
    ],
    doesNotFit: [
      "DDR5 — wrong socket entirely, and the reason a new platform is a full rebuild rather than a swap.",
      "Adding sticks to what is already there. Both slots are full, so 32 GB means the GeIL pair comes out and gets sold or shelved.",
      "64 GB. The board will not address it.",
    ],
    cost: "$180 – $265 for 2 x 16 GB",
    effect:
      "Removes the reason Windows pages to disk in the first place. Three heavy apps stop competing for the last two gigabytes.",
    gotcha:
      "Free win before you spend anything: DOCP is currently off, so 2400-rated sticks are running at 2133. Turn it on in BIOS tonight.",
  },
  {
    id: "cpu",
    part: "Processor",
    current: "Ryzen 5 1400 (4C/8T, 65 W)",
    status: "swap",
    socket: "AM4 — same socket, same cooler, same mounting",
    standalone: true,
    fits: [
      "Ryzen 5 5600 — 6C/12T, 65 W. The value pick, and roughly double this chip in multi-threaded work.",
      "Ryzen 7 5700X — 8C/16T, 65 W. The pick if three-at-once is the actual daily workload.",
      "Ryzen 5 5500 / 5600G — cheaper, but the 5500 has half the L3 cache and no PCIe 4.0.",
    ],
    doesNotFit: [
      "Anything not AM4 — no Ryzen 7000/9000, no Intel. Different socket, different RAM, different board.",
      "105 W parts (5800X, 5900X, 5950X, 5700X3D). They will physically fit, but the A320M-K's small VRM is not built to feed them, and the chipset cannot overclock to recover the loss.",
    ],
    cost: "$125 – $200 (5600 new, 5700X new or used)",
    effect:
      "Six or eight modern cores instead of four old ones. This is what stops the third task from starving the first two once the disk is no longer the limit.",
    gotcha:
      "The one ordering rule in the whole plan: flash the BIOS to 5862 or newer BEFORE removing the 1400. A 2017 BIOS will not POST with a Zen 3 chip, and you need a working CPU in the socket to run the update. Do it out of order and the machine is a brick until you borrow an old CPU back.",
  },
  {
    id: "gpu",
    part: "Graphics card",
    current: "GTX 1050 Ti 4 GB (75 W, no PCIe cable)",
    status: "swap",
    socket: "PCIe 3.0 x16 — mechanically standard, electrically a generation behind",
    standalone: true,
    fits: [
      "Used RX 6700 XT / RTX 3060 12 GB ($200–300) — the value pick in this market, and PCIe 4.0 x16 so they lose nothing in a 3.0 slot.",
      "RX 9060 XT 16 GB (~$475) or RTX 5060 Ti 16 GB — fine cards, but poor value at shortage prices in a PCIe 3.0 board.",
      "Anything you already own or can get cheap. Given prices, keeping the 1050 Ti another year is a defensible choice.",
      "Physically: the case has full-length clearance and the 600 W PSU has the 6+2 PCIe cables. Neither is a constraint here.",
    ],
    doesNotFit: [
      "Anything over roughly 250 W. The Smart 600W is a nine-year-old group-regulated budget unit; treat 600 W on the label as maybe 450 W of trustworthy 2026 output.",
      "Intel Arc — its driver overhead leans on a fast CPU and Resizable BAR, which is exactly what this platform is short of.",
    ],
    cost: "~$475 new (9060 XT 16 GB), $200 – $300 used",
    effect:
      "Framerate, resolution, texture quality. Nothing else. It will not make the desktop feel faster and it will not stop the freezing.",
    gotcha:
      "PCIe 3.0 tax: modern mid-range cards (9060 XT, 5060 Ti) use a PCIe 5.0 x8 interface, which in this slot negotiates down to PCIe 3.0 x8 — about a quarter of their designed bandwidth. Buy the 16 GB version specifically; the penalty only bites hard when the card runs out of VRAM and starts swapping across that narrow link.",
  },
  {
    id: "psu",
    part: "Power supply",
    current: "Thermaltake Smart 600W, 80 Plus White",
    status: "keep",
    socket: "Standard ATX, non-modular",
    standalone: true,
    fits: [
      "Keep it for now. 600 W with 6+2 PCIe cables genuinely covers a 5700X plus a 9060 XT — that build peaks near 300 W.",
      "If you replace it later: any 650–750 W ATX 3.1 unit, 80 Plus Gold, from Corsair / Seasonic / MSI.",
    ],
    doesNotFit: ["SFX units — the case is a full ATX tower and expects an ATX supply."],
    cost: "$0 now · $90 – $130 when you do replace it",
    effect:
      "No performance change. This is a reliability line item, not a speed one.",
    gotcha:
      "The Smart series is group-regulated and this one has been running since 2017. It is fine for the plan above, but it is the part most likely to fail on its own schedule. Replace it if you ever go past a 250 W card — and replace it before the GPU, not after.",
  },
  {
    id: "board",
    part: "Motherboard + platform",
    current: "ASUS PRIME A320M-K (AM4, mATX)",
    status: "ceiling",
    socket: "AM4 / DDR4 / PCIe 3.0",
    standalone: false,
    fits: [
      "Nothing worth doing. A B450 or B550 board would add PCIe 4.0 and four DIMM slots, but it means pulling the CPU, RAM, cooler, and every cable — the labour of a full rebuild for a fraction of the gain.",
    ],
    doesNotFit: [
      "AM5 (Ryzen 7000/9000) — a different socket and DDR5. Board, CPU, and RAM all move together or none of them do.",
    ],
    cost: "$0 — or $600+ as the first step of a new machine",
    effect:
      "This is the wall the other four upgrades run into, three years from now. It is not a thing to buy today.",
    gotcha:
      "The three real ceilings: 32 GB RAM maximum, no CPU overclocking, and PCIe 3.0. None of them block the plan below. All of them are why this is a two-to-three-year bridge and not a 2030 machine.",
  },
];

import { band, bandLabel } from "./pricing";

export type Stage = {
  n: number;
  id: string;
  title: string;
  buy: string;
  cost: number;
  costLabel: string;
  time: string;
  difficulty: "trivial" | "easy" | "moderate";
  fixes: string;
  /** What must be true before this stage. Empty = do it whenever you like. */
  requires: string[];
  reversible: boolean;
};

/**
 * The order is not arbitrary and it is not the order most people buy in.
 * It is sorted by "responsiveness restored per dollar", because the stated
 * complaint is freezing under multitasking — not low framerate.
 */
export const STAGES: Stage[] = [
  {
    n: 0,
    id: "docp",
    title: "Turn on DOCP",
    buy: "Nothing",
    cost: 0,
    costLabel: "Free",
    time: "5 minutes",
    difficulty: "trivial",
    fixes:
      "Memory returns to its rated DDR4-2400 instead of the 2133 fallback. Worth more than it used to be, given what replacement memory now costs.",
    requires: [],
    reversible: true,
  },
  {
    n: 1,
    id: "ssd",
    title: "NVMe SSD, clone Windows onto it",
    buy: "1 TB M.2 2280 NVMe (Gen3 is the value pick — this board cannot use Gen4 speed)",
    cost: (band("ssd").low + band("ssd").high) / 2,
    costLabel: bandLabel("ssd"),
    time: "1 hour including the clone",
    difficulty: "moderate",
    fixes:
      "The freezing. When RAM fills up, Windows pages to disk — on a platter drive that stall is seconds long and locks the whole desktop. On NVMe it is imperceptible. Still the first buy, and still the best value on the list even after NVMe roughly doubled in price.",
    requires: [],
    reversible: true,
  },
  {
    n: 2,
    id: "cpu",
    title: "Ryzen 5 5600 — now second, not third",
    buy: "65 W Zen 3 chip — same AM4 socket, reuse the stock cooler",
    cost: (band("cpu5600").low + band("cpu5600").high) / 2,
    costLabel: bandLabel("cpu5600"),
    time: "45 minutes (BIOS flash + swap)",
    difficulty: "moderate",
    fixes:
      "Promoted above the RAM for two reasons. It is the only part that escaped the shortage and still costs what it should, and it is the one upgrade that makes this machine Windows 11 eligible — the Ryzen 1400 is why the installer refuses. Six modern cores also give the thread headroom that four 2017 cores cannot.",
    requires: ["BIOS flashed to 5862 or newer FIRST, while the Ryzen 1400 is still installed"],
    reversible: true,
  },
  {
    n: 3,
    id: "ram",
    title: "32 GB of RAM — defer this unless you are still hurting",
    buy: "2 x 16 GB DDR4-3200 CL16 (both GeIL sticks come out — only two slots)",
    cost: (band("ram").low + band("ram").high) / 2,
    costLabel: bandLabel("ram"),
    time: "10 minutes",
    difficulty: "easy",
    fixes:
      "Removes the paging rather than making it fast — technically the cleanest fix for the freezing. But DDR4 has roughly tripled, and once stage 1 has put the pagefile on NVMe, paging stops being painful. Reassess after the SSD is in. If it still stalls under three apps, buy it; if not, this is the one part genuinely worth waiting out.",
    requires: [],
    reversible: true,
  },
  {
    n: 4,
    id: "gpu",
    title: "Graphics card — last, and buy used",
    buy: "Used RX 6700 XT or RTX 3060 12 GB. A new 9060 XT 16 GB is ~$475 and PCIe 5.0 x8.",
    cost: (band("gpuUsed").low + band("gpuUsed").high) / 2,
    costLabel: bandLabel("gpuUsed"),
    time: "20 minutes",
    difficulty: "easy",
    fixes:
      "Framerate and resolution, nothing else — it still does nothing for the freezing. The used route is now the sensible one rather than the compromise: those cards are PCIe 4.0 x16, so unlike a new 9060 XT they lose nothing in this board's PCIe 3.0 slot, and they cost half as much.",
    requires: ["Monitor resolution and refresh rate identified — do not buy blind"],
    reversible: true,
  },
];

/** The causal chain behind "it freezes when I do three things at once". */
export const FREEZE_CHAIN = [
  {
    step: 1,
    cause: "Three apps open",
    detail:
      "This machine runs Windows 10, which idles nearer 3–4 GB than 11's 4–6. That buys you a gigabyte, not a reprieve — a loaded browser, a game, and a Discord or OBS on top still clears 16 GB.",
    part: "16 GB RAM",
  },
  {
    step: 2,
    cause: "Windows starts paging",
    detail:
      "Out of physical memory, Windows moves inactive pages to the pagefile on disk. This is normal and invisible — on the right disk.",
    part: "Windows memory manager",
  },
  {
    step: 3,
    cause: "The pagefile lives on a 7200 rpm platter",
    detail:
      "That drive services roughly 100–150 random operations per second. An NVMe SSD does hundreds of thousands. The gap is not a percentage, it is three orders of magnitude.",
    part: "WD Blue HDD",
  },
  {
    step: 4,
    cause: "Everything stops",
    detail:
      "The foreground app blocks waiting on a page that is behind a physically moving arm. That multi-second lock-up is what you are describing as the freeze.",
    part: "The symptom",
  },
  {
    step: 5,
    cause: "Only then does the CPU matter",
    detail:
      "Four cores with 2017 IPC do run out of threads under three real workloads — but that shows up as sluggishness, not as a hard stall. Fixing the CPU first would leave the freezing exactly where it is.",
    part: "Ryzen 5 1400",
  },
];

/** Peak draw, so the 600 W verdict is arithmetic instead of a vibe. */
export const POWER_BUDGET = {
  headroomNote:
    "A nine-year-old group-regulated unit should be derated. Treat the 600 W label as roughly 450 W of dependable 2026 output — the plan below still fits inside it with room to spare.",
  rows: [
    { part: "Ryzen 7 5700X", watts: 76, note: "65 W TDP, ~76 W peak package power" },
    { part: "RX 9060 XT 16 GB", watts: 160, note: "AMD rates it at 150–182 W board power" },
    { part: "Motherboard + RAM", watts: 40, note: "A320M-K with two DIMMs" },
    { part: "NVMe + HDD + fans", watts: 25, note: "Drives spin, the four case fans barely register" },
  ],
  total: 301,
  verdict:
    "About 300 W peak against 450 W of derated capacity. The Thermaltake stays, and the money goes to the parts that change how the machine feels.",
};

export function totalCost(stages: Stage[] = STAGES) {
  return stages.reduce((sum, s) => sum + s.cost, 0);
}

/** Which stages fit a given budget, walking the list in priority order. */
export function stagesWithinBudget(budget: number, stages: Stage[] = STAGES) {
  let spent = 0;
  const affordable: Stage[] = [];
  const deferred: Stage[] = [];
  for (const stage of stages) {
    if (spent + stage.cost <= budget) {
      affordable.push(stage);
      spent += stage.cost;
    } else {
      deferred.push(stage);
    }
  }
  return { affordable, deferred, spent };
}

/**
 * Windows 11 eligibility.
 *
 * The machine reports "not supported" because of the CPU and nothing else.
 * Microsoft's supported AMD list begins at Ryzen 2000 (Zen+); the Ryzen 5 1400
 * is Zen 1. Every other requirement this board can satisfy from the BIOS.
 */
export type EligibilityRow = {
  requirement: string;
  status: "blocked" | "fixable" | "met";
  detail: string;
  action: string;
};

export const WIN11_ELIGIBILITY: EligibilityRow[] = [
  {
    requirement: "Supported CPU",
    status: "blocked",
    detail:
      "Ryzen 5 1400 is Zen 1. Microsoft's AMD list starts at Ryzen 2000 (Zen+), so this is the one requirement no BIOS setting can satisfy.",
    action:
      "Stage 2 of the plan already fixes it. A Ryzen 5 5600 or 7 5700X is on the supported list.",
  },
  {
    requirement: "TPM 2.0",
    status: "fixable",
    detail:
      "The A320M-K has no TPM chip, but every Ryzen CPU carries firmware TPM. It ships disabled.",
    action: "BIOS → Advanced → AMD fTPM configuration → set to 'AMD CPU fTPM'.",
  },
  {
    requirement: "UEFI Secure Boot",
    status: "fixable",
    detail:
      "Supported by this board. A 2017 build was very likely installed in CSM/legacy mode, which keeps it switched off.",
    action: "BIOS → Boot → CSM disabled, then Secure Boot → Windows UEFI mode.",
  },
  {
    requirement: "GPT system disk",
    status: "fixable",
    detail:
      "Secure Boot needs a GPT disk. A 2017 install on a 1 TB drive is often MBR.",
    action:
      "Moot if you clean-install onto the new SSD — it will be GPT automatically. Otherwise run mbr2gpt.",
  },
  {
    requirement: "4 GB RAM / 64 GB storage",
    status: "met",
    detail: "16 GB and a 1 TB drive. Never the problem.",
    action: "Nothing.",
  },
];

export const OS_TIMELINE = {
  headline: "Windows 10 ran out of free support on 14 October 2025.",
  esuEnds: "13 October 2026",
  detail:
    "Consumer Extended Security Updates cover the gap, and that programme ends 13 October 2026 — roughly a month out. After that the machine stops receiving security patches entirely.",
  verdict:
    "This does not change what to buy, but it does change the order. The CPU swap was fourth on the list as a performance upgrade; it is also the only thing standing between this machine and a supported OS.",
};

/**
 * Installing Windows 11 on unsupported hardware is possible via the well-known
 * registry bypass. It is a real option and worth stating plainly, along with
 * the reason it is the second-best one here.
 */
export const BYPASS_NOTE = {
  possible: true,
  summary:
    "You can force Windows 11 onto the 1400 today — Rufus will build installation media with the CPU, TPM and Secure Boot checks stripped out, and it works.",
  cost: "Free",
  catch:
    "Microsoft reserves the right to withhold updates from unsupported installs, and you would be running a heavier OS on the weakest part in the machine. Since a ~$135 CPU makes the problem disappear properly — and you want that CPU anyway for the multitasking — the bypass is the fallback, not the plan.",
};
