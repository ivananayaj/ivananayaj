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
    cost: "$60 – $95 for 1 TB",
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
      "2 x 16 GB DDR4-3200 CL16 — the correct buy, and the board's ceiling.",
      "Any DDR4 UDIMM. Speed above 3200 is wasted: A320 will not clock the memory controller that high on Zen 1, and Zen 3 tops out around 3200 for a 1:1 fabric ratio anyway.",
    ],
    doesNotFit: [
      "DDR5 — wrong socket entirely, and the reason a new platform is a full rebuild rather than a swap.",
      "Adding sticks to what is already there. Both slots are full, so 32 GB means the GeIL pair comes out and gets sold or shelved.",
      "64 GB. The board will not address it.",
    ],
    cost: "$70 – $95 for 2 x 16 GB",
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
    cost: "$85 – $150 (5600 new, 5700X new or used)",
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
      "RX 9060 XT 16 GB (~$350) — the value pick if the monitor turns out to be 1440p.",
      "RTX 5060 / 5060 Ti 16 GB — same tier, better if you want NVENC for recording.",
      "Used RX 6700 XT / RTX 3060 12 GB — the cheap route, and both are PCIe 4.0 x16 so they lose nothing in a 3.0 slot.",
      "Physically: the case has full-length clearance and the 600 W PSU has the 6+2 PCIe cables. Neither is a constraint here.",
    ],
    doesNotFit: [
      "Anything over roughly 250 W. The Smart 600W is a nine-year-old group-regulated budget unit; treat 600 W on the label as maybe 450 W of trustworthy 2026 output.",
      "Intel Arc — its driver overhead leans on a fast CPU and Resizable BAR, which is exactly what this platform is short of.",
    ],
    cost: "$250 – $380 new, $180 – $250 used",
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
    cost: "$0 now · $80 – $110 when you do replace it",
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
      "Memory returns to its rated DDR4-2400 instead of the 2133 fallback. Small, but you already own it.",
    requires: [],
    reversible: true,
  },
  {
    n: 1,
    id: "ssd",
    title: "NVMe SSD, clone Windows onto it",
    buy: "1 TB M.2 2280 NVMe (Gen3 or Gen4 — both run at Gen3 here)",
    cost: 80,
    costLabel: "$60 – $95",
    time: "1 hour including the clone",
    difficulty: "moderate",
    fixes:
      "The freezing. When RAM fills up, Windows pages to disk — on a platter drive that stall is seconds long and locks the whole desktop. On NVMe it is imperceptible. Boot and app launches come along for free.",
    requires: [],
    reversible: true,
  },
  {
    n: 2,
    id: "ram",
    title: "32 GB of RAM",
    buy: "2 x 16 GB DDR4-3200 CL16 (both GeIL sticks come out — only two slots)",
    cost: 85,
    costLabel: "$70 – $95",
    time: "10 minutes",
    difficulty: "easy",
    fixes:
      "Removes the paging entirely rather than making it fast. Three heavy apps stop fighting over the last 2 GB. Stage 1 makes the symptom survivable; this one deletes the cause.",
    requires: [],
    reversible: true,
  },
  {
    n: 3,
    id: "cpu",
    title: "Ryzen 5 5600 or Ryzen 7 5700X",
    buy: "65 W Zen 3 chip — same AM4 socket, reuse the stock cooler",
    cost: 120,
    costLabel: "$85 – $150",
    time: "45 minutes (BIOS flash + swap)",
    difficulty: "moderate",
    fixes:
      "Thread headroom. With disk and memory sorted, four 2017 cores become the limit — a browser, a game, and a recorder need more than the 1400 has to give.",
    requires: ["BIOS flashed to 5862 or newer FIRST, while the Ryzen 1400 is still installed"],
    reversible: true,
  },
  {
    n: 4,
    id: "gpu",
    title: "Graphics card — last, and only after checking the monitor",
    buy: "RX 9060 XT 16 GB, RTX 5060 Ti 16 GB, or a used RX 6700 XT",
    cost: 320,
    costLabel: "$250 – $380",
    time: "20 minutes",
    difficulty: "easy",
    fixes:
      "Framerate and resolution. Deliberately last: this is the expensive part, and it does nothing for the problem you actually described.",
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
      "Windows 11 idles at 4–6 GB. A loaded browser, a game, and a Discord or OBS on top will clear 16 GB.",
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
