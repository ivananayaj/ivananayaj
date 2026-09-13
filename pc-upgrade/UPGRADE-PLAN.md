# Desktop-94 — upgrade plan

Worked out from the teardown photos in `public/rig/`, not from guesses. The app in
`src/` renders all of this interactively; this file is the same answer in plain text.

## What the photos settled

The original workspace listed five unknowns and said no shopping list was possible
until they were answered. Four of the five are legible in the photos:

| Part | Answer | How |
|---|---|---|
| Power supply | **Thermaltake Smart 600W**, 80 Plus White, non-modular | Sticker in `psu.jpg` |
| Motherboard | **ASUS PRIME A320M-K** (AM4, mATX) | `DIGI+ VRM` / `LANGuard` / `EZ Flash 3` silkscreen, 2 DIMM slots, VGA + HDMI + dual PS/2 rear I/O |
| RAM layout | **2 x 8 GB GeIL EVO Potenza**, DDR4-2400 CL16 | Module label in `ram.jpg` |
| Case | **Thermaltake ATX mid-tower**, 7 slots, full GPU clearance, empty drive bays | `overview.jpg`, `cages.jpg`, `rear.jpg` |

Still open: **monitor** (decides the GPU) and **BIOS version** (decides the CPU swap).
The board model is inferred rather than read, so confirm it in software before buying a CPU:

```powershell
Get-CimInstance Win32_BaseBoard | Format-List Manufacturer, Product
Get-CimInstance Win32_BIOS | Format-List SMBIOSBIOSVersion, ReleaseDate
```

This is a custom build, not an OEM prebuilt — which means standard parts and no proprietary
shapes to work around.

## Why it freezes on three tasks

1. Three apps open. This machine runs **Windows 10**, which idles nearer 3–4 GB — that buys a gigabyte, not a reprieve. A loaded browser + a game + Discord/OBS still clears 16 GB.
2. Out of RAM, Windows pages to disk. Normal, and invisible on the right disk.
3. **The pagefile is on a 7200 rpm platter.** That drive does ~100–150 random IOPS. An NVMe SSD does hundreds of thousands.
4. The foreground app blocks on a page sitting behind a physically moving arm. That multi-second stall is the freeze.
5. Only then does the CPU matter — four 2017 cores cause sluggishness, not hard stalls.

**The graphics card has nothing to do with it.** A 1050 Ti gives low framerates, not desktop
lock-ups. It is the upgrade most people buy first and the one that will not help here.

## What is interchangeable

Five of the six subsystems swap in isolation — one part, one evening, everything else untouched.

| Part | Verdict | Interface | Cost |
|---|---|---|---|
| Boot drive | Swap — **do this first** | M.2 2280 PCIe 3.0 x4, plus 4 free SATA ports | $100–150 |
| Memory | Swap — but defer | DDR4, **2 slots only, 32 GB max** | $180–265 |
| Processor | Swap | AM4 — same socket, same cooler | $125–200 |
| Graphics card | Swap — last, buy used | PCIe 3.0 x16 | $200–300 used |
| Power supply | **Keep** | Standard ATX | $0 now |
| Motherboard | **Ceiling — don't buy** | AM4 / DDR4 / PCIe 3.0 | — |

### Compatibility traps worth knowing

- **Only two DIMM slots.** 32 GB means replacing both GeIL sticks, not adding to them. 32 GB is the board's hard maximum.
- **BIOS before CPU.** Flash to 5862 or newer *while the Ryzen 1400 is still installed*. A 2017 BIOS will not POST with a Zen 3 chip, and you need a working CPU in the socket to run the update. Get this backwards and the machine is dead until you borrow the old CPU back.
- **65 W CPUs only.** The 5600 and 5700X are fine. The 5800X, 5900X and 5700X3D are 105 W parts — they fit physically, but the A320M-K's small VRM is not built to feed them and A320 cannot overclock to recover the loss.
- **PCIe 3.0 tax.** Modern mid-range cards (RX 9060 XT, RTX 5060 Ti) use a PCIe 5.0 x8 interface, which negotiates down to PCIe 3.0 x8 in this slot — about a quarter of designed bandwidth. If you buy new, get the **16 GB** version — the penalty only bites hard once the card runs out of VRAM and starts swapping across that narrow link. Better still, buy a used RX 6700 XT or RTX 3060 12 GB: both are PCIe 4.0 **x16**, so they lose nothing in this slot and cost half as much.
- **The M.2 slot is under the graphics card.** Pull the GPU to reach it, then put it back.
- **DDR4 does not move to AM5**, and neither does the Ryzen 1400. Board, CPU and RAM move together or not at all.

## Market conditions — read this before the prices

Prices below are **as of 13 September 2026** and the market is abnormal. AI datacenter demand
has pulled DRAM and NAND capacity away from consumer parts:

| Part | Now | Pre-shortage | Change |
|---|---|---|---|
| 1 TB NVMe | $100–150 | $50–80 | +92% |
| 32 GB DDR4-3200 | $180–265 | $60–90 | **+197%** |
| Ryzen 5 5600 | $125–145 | $100–130 | +17% |
| RX 9060 XT 16 GB | $430–500 | $330–360 | +35% |
| Used RX 6700 XT / RTX 3060 12 GB | $200–300 | — | — |

Relief is not expected before late 2027.

### Proof — and what I could not verify

**Honest limitation first:** no live retail listing was opened while writing this. Newegg,
Amazon, Best Buy, Micro Center, eBay, PCPartPicker and every price-history site are blocked
by the network policy on the machine this was written on. The bands above are synthesised
from reporting and manufacturer pages, not observed on a store page.

**What holds up.** Multiple independent outlets report the same direction and rough
magnitude, and Corsair's own store lists a 32 GB DDR4-3200 kit at **$249.99** against a
$315.99 list — a manufacturer-direct figure, not a reseller markup, and consistent with the
$180–265 band.

**Live trackers — check these before you buy:**

- [Tom's Hardware RAM price index 2026](https://www.tomshardware.com/pc-components/ram/ram-price-index-2026-lowest-price-on-ddr5-and-ddr4-memory-of-all-capacities) — DDR4/DDR5, all capacities
- [Tom's Hardware SSD price tracker](https://www.tomshardware.com/news/lowest-ssd-prices) — lowest price on every M.2 drive
- [rampricehistory.com — 1 TB NVMe](https://rampricehistory.com/ssd/us/1tb-nvme) — charted history, not a snapshot
- [PCPartPicker](https://pcpartpicker.com/) — the right final check; aggregates live retail and flags AM4 compatibility as you add parts
- [Corsair Vengeance LPX 32 GB DDR4-3200 C16](https://www.corsair.com/us/en/p/memory/cmk32gx4m2e3200c16/vengeancea-lpx-32gb-2-x-16gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m2e3200c16) — manufacturer direct

**Reporting behind the shortage:**

- [TechPowerUp — DDR4 prices skyrocketing amid DRAM shortage](https://www.techpowerup.com/345717/ddr4-prices-skyrocketing-amid-dram-shortage-crunch)
- [GamersNexus — SSDs: WTF?](https://gamersnexus.net/features/ssds-wtf)
- [TechSpot — GPU pricing, Q3 2026](https://www.techspot.com/article/3167-gpu-pricing-q3-2026/)
- [Tom's Hardware — why GPU prices keep surging](https://www.tomshardware.com/pc-components/gpus/gpu-prices-for-current-gen-nvidia-and-amd-price-increases-why-have-the-prices-not-dropped-and-can-you-still-buy-a-cheap-gpu)

**Watch for stale listings.** Search turns up a $61 Corsair 32 GB kit and a $64.99 1 TB
Samsung drive with no visible date. Both are almost certainly pre-shortage posts from
2024–2025. If a price looks like the old world, check its date before believing it.

**This reshuffles the plan.** Memory went from the second-best value to the worst. Silicon
escaped the crisis, so the CPU is now the fairly-priced upgrade. And a new AM5 build — which
needs DDR5 at shortage prices — is far harder to justify than a year ago, so keeping this
platform wins by a wider margin than before.

## Order of purchase

Sorted by responsiveness restored per dollar, at current prices.

| # | Do | Cost | Fixes |
|---|---|---|---|
| 0 | **Enable DOCP in BIOS** | Free | RAM is rated 2400 and running 2133. Worth more now that replacement memory is absurd. |
| 1 | **1 TB NVMe SSD**, clone Windows across | $100–150 | The freezing. Still the best value on the list even after doubling. |
| 2 | **Ryzen 5 5600** | $125–145 | Thread headroom **and** Windows 11 eligibility. BIOS flash first. |
| 3 | **2 x 16 GB DDR4-3200** — *defer* | $180–265 | Reassess after the SSD. If it no longer stalls, wait this one out. |
| 4 | **GPU — buy used** | $200–300 | Framerate only. Used 6700 XT / 3060 12 GB are PCIe 4.0 x16, so they lose nothing here. |

Stages 0–1 cost about **$125** and address the stated complaint.
Stages 0–2 cost about **$260** and also get you onto a supported OS.

### Why RAM dropped from second to third

It is technically the cleanest fix — it removes the paging rather than making paging fast.
But it has tripled in price, and once the pagefile lives on NVMe, paging stops hurting.
Buy the SSD, use the machine for a week, and only buy memory if it still stalls. This is the
one part genuinely worth waiting out.

## Windows 11

The machine reports "not supported" for exactly one reason: **the Ryzen 5 1400 is Zen 1**, and
Microsoft's supported AMD list starts at Ryzen 2000 (Zen+). No BIOS setting fixes that.

| Requirement | Status | Action |
|---|---|---|
| Supported CPU | **Blocked** | Stage 2 fixes it — the 5600 and 5700X are both on the list |
| TPM 2.0 | Fixable | BIOS → Advanced → AMD fTPM → "AMD CPU fTPM" (no chip needed; the CPU provides it) |
| UEFI Secure Boot | Fixable | BIOS → Boot → disable CSM, then Secure Boot → Windows UEFI mode |
| GPT system disk | Fixable | Automatic if you clean-install on the new SSD; otherwise `mbr2gpt` |
| 4 GB RAM / 64 GB storage | Met | Never the problem |

**Timing matters:** Windows 10 free support ended 14 October 2025, and consumer Extended
Security Updates end **13 October 2026** — about a month out. After that, no security patches.

**The bypass:** Rufus can build Windows 11 media with the CPU/TPM/Secure Boot checks stripped,
and it works. But Microsoft reserves the right to withhold updates from unsupported installs,
and you would be putting a heavier OS on the weakest part in the machine. Since you want the
CPU anyway for the multitasking, the bypass is the fallback, not the plan.

**Sequencing tip:** if you are buying the SSD and CPU together, do the BIOS flash and CPU swap
first, then clean-install Windows 11 directly onto the new SSD. That installs Windows once
instead of cloning Windows 10 and upgrading it later.

## Power budget

| Part | Peak |
|---|---|
| Ryzen 7 5700X | 76 W |
| RX 9060 XT 16 GB | 160 W |
| Board + RAM | 40 W |
| Drives + fans | 25 W |
| **Total** | **301 W** |

A nine-year-old group-regulated unit should be derated — treat the 600 W label as roughly
450 W of dependable output. 300 W peak fits with room to spare, so the Thermaltake stays.
Replace it if you ever go past a 250 W card, and replace it *before* the GPU, not after.

## The honest limits

32 GB RAM ceiling, no CPU overclocking, PCIe 3.0. None of them block the plan above; all of
them are why this is a two-to-three-year bridge rather than a 2030 machine. The upside is
that an SSD bought today carries over intact if you do eventually move to AM5 — starting
cheap costs nothing if you later change your mind.
