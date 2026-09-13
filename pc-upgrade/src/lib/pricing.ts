/**
 * Prices, with provenance and an expiry date.
 *
 * The first version of this plan carried hardcoded prices with no source and
 * no date. They were pre-shortage baselines and were badly wrong by the time
 * anyone read them. Every figure here now carries `asOf` and `source`, and
 * MARKET explains the condition that makes them move.
 *
 * Re-check anything older than a month. In this market that is not paranoia.
 */

export const PRICES_AS_OF = "13 September 2026";

export const MARKET = {
  headline: "You are shopping in the worst memory market in a decade.",
  detail:
    "AI datacenter demand has pulled DRAM and NAND capacity away from consumer parts. Samsung, SK Hynix and Micron control over 95% of DRAM output and have shifted wafers to high-bandwidth memory, which carries far better margins than the DDR4 and GDDR in a desktop. The result: DDR4 has roughly tripled, NVMe has roughly doubled, and GPU prices have climbed because VRAM is the same squeezed supply.",
  timing:
    "Analysts do not expect relief before late 2027, and some point at 2028. Waiting for a price drop is not a strategy — but neither is buying the inflated parts you do not need yet.",
  consequence:
    "This reshuffles the plan. Memory has gone from the second-best value on the list to the worst, and a new AM5 build — which needs DDR5 at shortage prices — is now far harder to justify than it was a year ago. Keeping this platform is the right call by a wider margin than before.",
};

export type PriceBand = {
  id: string;
  item: string;
  low: number;
  high: number;
  /** Roughly what this cost before the shortage, for context. */
  wasLow?: number;
  wasHigh?: number;
  asOf: string;
  source: string;
  note?: string;
};

export const PRICE_BANDS: PriceBand[] = [
  {
    id: "ssd",
    item: "1 TB M.2 NVMe SSD",
    low: 100,
    high: 150,
    wasLow: 50,
    wasHigh: 80,
    asOf: PRICES_AS_OF,
    source: "GamersNexus, \"SSDs: WTF?\" — gamersnexus.net/features/ssds-wtf. Consumer NVMe up ~115% against recent baselines.",
    note: "Premium drives run $140–180. A 1 TB Gen3 drive is the value pick here — this board cannot use Gen4 speed anyway.",
  },
  {
    id: "ram",
    item: "32 GB (2 x 16) DDR4-3200",
    low: 180,
    high: 265,
    wasLow: 60,
    wasHigh: 90,
    asOf: PRICES_AS_OF,
    source:
      "Tom's Hardware RAM price index 2026. Corsair's own store currently lists this kit at $249.99 against a $315.99 list price.",
    note: "The single most inflated part in this plan. DDR4 is hit harder than DDR5 because buyers priced out of DDR5 fell back onto it, and production is winding down.",
  },
  {
    id: "cpu5600",
    item: "Ryzen 5 5600",
    low: 125,
    high: 145,
    wasLow: 100,
    wasHigh: 130,
    asOf: PRICES_AS_OF,
    source: "Retail listings around $135. NOT independently verified — retail domains are blocked from this machine.",
    note: "Silicon escaped the memory crisis. AM4 CPU prices are close to where they have been for two years — the one genuinely fairly-priced upgrade on the list.",
  },
  {
    id: "cpu5700x",
    item: "Ryzen 7 5700X",
    low: 150,
    high: 200,
    asOf: PRICES_AS_OF,
    source: "Retail and used listings. NOT independently verified — check PCPartPicker.",
    note: "Check the used market. AM4 is a mature platform and 5700X chips come out of upgraded systems regularly.",
  },
  {
    id: "gpu9060",
    item: "RX 9060 XT 16 GB",
    low: 430,
    high: 500,
    wasLow: 330,
    wasHigh: 360,
    asOf: PRICES_AS_OF,
    source:
      "TechSpot GPU pricing Q3 2026 — techspot.com/article/3167-gpu-pricing-q3-2026. Street price moved ~$350 to ~$475; AMD raised RX 9000 MSRPs 7–16%.",
    note: "At this price, in a PCIe 3.0 x16 slot, a new mid-range card is poor value. The used market is the better route.",
  },
  {
    id: "gpuUsed",
    item: "Used RX 6700 XT / RTX 3060 12 GB",
    low: 200,
    high: 300,
    asOf: PRICES_AS_OF,
    source: "Used market survey. NOT independently verified — eBay is blocked from this machine; check completed listings yourself.",
    note: "Both are PCIe 4.0 x16 cards, so unlike the 9060 XT they lose nothing in a PCIe 3.0 slot. In this market that makes them the sensible buy rather than the compromise.",
  },
];

/**
 * Where these numbers came from, and — just as important — what could not be
 * checked. Every retail and price-tracker domain is blocked by this machine's
 * network policy, so NO live listing was opened while writing this. The bands
 * above are synthesised from reporting and manufacturer pages. Treat them as
 * directional and confirm against a live tracker before spending.
 */
export const SOURCES = [
  {
    id: "ram-index",
    label: "Tom's Hardware — RAM price index 2026 (live tracker)",
    url: "https://www.tomshardware.com/pc-components/ram/ram-price-index-2026-lowest-price-on-ddr5-and-ddr4-memory-of-all-capacities",
    kind: "tracker" as const,
    covers: "DDR4 and DDR5, all capacities. The single best link for checking the RAM figure.",
  },
  {
    id: "ssd-index",
    label: "Tom's Hardware — SSD price tracker (live)",
    url: "https://www.tomshardware.com/news/lowest-ssd-prices",
    kind: "tracker" as const,
    covers: "Lowest price on every M.2 SSD from Samsung, WD, Crucial and others.",
  },
  {
    id: "ram-history",
    label: "rampricehistory.com — 1 TB NVMe and DDR4 history",
    url: "https://rampricehistory.com/ssd/us/1tb-nvme",
    kind: "tracker" as const,
    covers: "Charted history rather than a single snapshot, which is what you want in a volatile market.",
  },
  {
    id: "corsair-direct",
    label: "Corsair — Vengeance LPX 32 GB DDR4-3200 C16 product page",
    url: "https://www.corsair.com/us/en/p/memory/cmk32gx4m2e3200c16/vengeancea-lpx-32gb-2-x-16gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m2e3200c16",
    kind: "manufacturer" as const,
    covers:
      "Manufacturer-direct pricing for the exact class of kit this plan recommends — the strongest single data point available, since it is not a reseller markup.",
  },
  {
    id: "ddr4-surge",
    label: "TechPowerUp — DDR4 prices skyrocketing amid DRAM shortage",
    url: "https://www.techpowerup.com/345717/ddr4-prices-skyrocketing-amid-dram-shortage-crunch",
    kind: "reporting" as const,
    covers: "Why DDR4 specifically is hit harder than DDR5.",
  },
  {
    id: "nand",
    label: "GamersNexus — SSDs: WTF?",
    url: "https://gamersnexus.net/features/ssds-wtf",
    kind: "reporting" as const,
    covers: "NAND supply and consumer SSD pricing.",
  },
  {
    id: "gpu-q3",
    label: "TechSpot — GPU pricing, Q3 2026",
    url: "https://www.techspot.com/article/3167-gpu-pricing-q3-2026/",
    kind: "reporting" as const,
    covers: "The RX 9060 XT 16 GB move from roughly $350 to roughly $475.",
  },
  {
    id: "gpu-tom",
    label: "Tom's Hardware — why GPU prices keep surging in 2026",
    url: "https://www.tomshardware.com/pc-components/gpus/gpu-prices-for-current-gen-nvidia-and-amd-price-increases-why-have-the-prices-not-dropped-and-can-you-still-buy-a-cheap-gpu",
    kind: "reporting" as const,
    covers: "VRAM cost as the driver behind current-gen card pricing.",
  },
  {
    id: "pcpartpicker",
    label: "PCPartPicker — build a parts list for this exact machine",
    url: "https://pcpartpicker.com/",
    kind: "tracker" as const,
    covers:
      "The right final check. It aggregates live retailer pricing and will flag AM4 compatibility as you add parts.",
  },
];

/**
 * Honest limitation, recorded next to the numbers rather than buried.
 */
export const VERIFICATION_NOTE = {
  checked:
    "Multiple independent outlets report the same direction and rough magnitude: DDR4 up roughly 3x, NVMe up roughly 2x, GPUs up on VRAM cost. Corsair's own store lists a 32 GB DDR4-3200 kit at $249.99 against a $315.99 list, which is consistent with the band above.",
  notChecked:
    "No live retail listing was opened. Newegg, Amazon, Best Buy, Micro Center, eBay, PCPartPicker and every price-history site are blocked by this machine's network policy. The bands are therefore synthesised, not observed.",
  watchOut:
    "Search results surface old deal posts with no visible date — a $61 Corsair 32 GB kit and a $64.99 1 TB Samsung drive both turn up, and both are almost certainly pre-shortage listings from 2024–2025. If a price looks like the old world, check its date before believing it.",
  advice:
    "Before buying anything, put the part into PCPartPicker and compare against the two Tom's Hardware trackers. Five minutes, and it beats any figure in this file.",
};

export function band(id: string): PriceBand {
  const found = PRICE_BANDS.find((p) => p.id === id);
  if (!found) throw new Error(`No price band for "${id}"`);
  return found;
}

export function bandLabel(id: string): string {
  const p = band(id);
  return `$${p.low} – $${p.high}`;
}

/** Percentage increase against the pre-shortage baseline, when one is recorded. */
export function inflation(p: PriceBand): number | null {
  if (p.wasLow === undefined || p.wasHigh === undefined) return null;
  const now = (p.low + p.high) / 2;
  const then = (p.wasLow + p.wasHigh) / 2;
  return Math.round(((now - then) / then) * 100);
}
