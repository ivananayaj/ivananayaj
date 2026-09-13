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
    source: "Consumer NVMe pricing up ~115% against recent baselines (TrendForce / GamersNexus reporting, 2026)",
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
      "A 32 GB Corsair Vengeance LPX DDR4-3200 kit went from $71.99 to $262.99 inside six months (Tom's Hardware RAM price index, 2026)",
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
    source: "Retail listings around $135 (Newegg / retail survey, September 2026)",
    note: "Silicon escaped the memory crisis. AM4 CPU prices are close to where they have been for two years — the one genuinely fairly-priced upgrade on the list.",
  },
  {
    id: "cpu5700x",
    item: "Ryzen 7 5700X",
    low: 150,
    high: 200,
    asOf: PRICES_AS_OF,
    source: "Retail and used listings, September 2026",
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
      "Street price moved from ~$350 to ~$475; AMD raised RX 9000 MSRPs 7–16% in Q3 2026 (TechSpot / BigGo, 2026)",
    note: "At this price, in a PCIe 3.0 x16 slot, a new mid-range card is poor value. The used market is the better route.",
  },
  {
    id: "gpuUsed",
    item: "Used RX 6700 XT / RTX 3060 12 GB",
    low: 200,
    high: 300,
    asOf: PRICES_AS_OF,
    source: "Used market survey, September 2026",
    note: "Both are PCIe 4.0 x16 cards, so unlike the 9060 XT they lose nothing in a PCIe 3.0 slot. In this market that makes them the sensible buy rather than the compromise.",
  },
];

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
