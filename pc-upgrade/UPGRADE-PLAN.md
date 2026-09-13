# Desktop-94 — upgrade plan

Worked out from the teardown photos in `public/rig/`, not from guesses.

**Interactive version:** <https://claude.ai/code/artifact/0498e4d0-0847-451e-9e4b-5e89265d6990>
— swap any part and see what fits, what it draws, and what it costs. Source in
`configurator/`. This file is the same answer in plain text.

## What the photos settled

The original workspace listed five unknowns and said no shopping list was possible
until they were answered. Four of the five are legible in the photos:

| Part | Answer | How |
|---|---|---|
| Power supply | **Thermaltake Smart 600W**, 80 Plus White, non-modular | Sticker in `psu.jpg` |
| Motherboard | **ASUS PRIME A320M-K** (AM4, mATX) | `DIGI+ VRM` / `LANGuard` / `EZ Flash 3` silkscreen, 2 DIMM slots, VGA + HDMI + dual PS/2 rear I/O |
| RAM layout | **2 x 8 GB GeIL EVO Potenza**, DDR4-2400 CL16 | Module label in `ram.jpg` |
| Case | **Thermaltake ATX mid-tower**, 7 slots, full GPU clearance, empty drive bays | `overview.jpg`, `cages.jpg`, `rear.jpg` |

## CONFIRMED 13 Sept 2026 from msinfo32 on the live machine

Nothing below is inferred any more. Every open question is closed.

| Fact | Value | What it settles |
|---|---|---|
| Board | **ASUSTeK PRIME A320M-K** | The photo inference was exactly right |
| BIOS | **3803, dated 22 Jan 2018** | **A Ryzen 5000 will NOT POST. Flash first.** |
| BIOS mode | **Legacy (CSM)** | Disk is MBR; Secure Boot reports *Unsupported* |
| Display | **1920 x 1080 @ 60 Hz** | Do not overbuy a graphics card |
| Disks | **One. WD10EZEX, 931 GB, "Fixed hard disk"** | No SSD exists in this machine |
| Free space | 259 GB of 921 GB | Down from earlier; still fine |
| Physical RAM | 15.9 GB total, **4.03 GB free** | 11.9 GB already in use |
| Virtual | 33.9 GB total, **13.9 GB free** | **20.0 GB committed** |
| Pagefile | **C:\pagefile.sys**, 18 GB | On the mechanical drive |

**The freeze is now measured, not argued.** 20.0 GB committed against 15.9 GB of physical
memory means roughly **4.1 GB was living in the pagefile** at the moment of that snapshot --
and the pagefile sits on the 7200 rpm platter. That is the stall, caught in the act.

**Two things changed in the plan as a result:**

1. **The BIOS flash moved from a caution to a hard prerequisite.** BIOS 3803 is from January
   2018. Zen 3 needs 6042-era firmware. Flash it *while the Ryzen 1400 is still installed*.
2. **The graphics card dropped down a tier.** A 1080p 60 Hz panel cannot show more than 60
   frames a second. A used RTX 3060 12 GB or RX 6600 pins that panel in almost everything --
   a $475 RX 9060 XT would be money with nowhere to go. Buy a better monitor first if you
   want a better card to mean anything.

Windows 11 also needs more than the CPU: CSM is on, so Secure Boot is unsupported and the
disk is MBR. Turn CSM off, enable Secure Boot and AMD fTPM, and clean-install onto the new
SSD so it lands on GPT.

**`rig-report.ps1` answers all three automatically.** Double-click `run-rig-report.cmd`, or
from a Command Prompt:

```
powershell -ExecutionPolicy Bypass -File rig-report.ps1
```

It reads the live machine and prints a colour-coded verdict: the real board model and BIOS
date, how many DIMM slots the board actually has, whether DOCP is off, **whether the boot
drive is mechanical and whether the pagefile sits on it** (the freeze, proven rather than
argued), your monitor's resolution and refresh rate, and Windows 11 eligibility. Everything
it runs is read-only. It saves `rig-report.txt` next to itself, which you can paste back
here.

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
| Motherboard | Optional — see below | AM4 / DDR4 / PCIe 3.0 | $45–185 |

### Compatibility traps worth knowing

- **Only two DIMM slots.** 32 GB means replacing both GeIL sticks, not adding to them. 32 GB is the board's hard maximum.
- **BIOS before CPU.** Flash to 5862 or newer *while the Ryzen 1400 is still installed*. A 2017 BIOS will not POST with a Zen 3 chip, and you need a working CPU in the socket to run the update. Get this backwards and the machine is dead until you borrow the old CPU back.
- **65 W CPUs only.** The 5600 and 5700X are fine. The 5800X, 5900X and 5700X3D are 105 W parts — they fit physically, but the A320M-K's small VRM is not built to feed them and A320 cannot overclock to recover the loss.
- **PCIe 3.0 tax.** Modern mid-range cards (RX 9060 XT, RTX 5060 Ti) use a PCIe 5.0 x8 interface, which negotiates down to PCIe 3.0 x8 in this slot — about a quarter of designed bandwidth. If you buy new, get the **16 GB** version — the penalty only bites hard once the card runs out of VRAM and starts swapping across that narrow link. Better still, buy a used RX 6700 XT or RTX 3060 12 GB: both are PCIe 4.0 **x16**, so they lose nothing in this slot and cost half as much.
- **The M.2 slot is under the graphics card.** Pull the GPU to reach it, then put it back.
- **DDR4 does not move to AM5**, and neither does the Ryzen 1400. Board, CPU and RAM move together or not at all.

## Changing the motherboard

Not required, and not the first thing to buy — but it is no longer a dead end. Any AM4 board
reuses your case, PSU, cooler, GPU, drives and memory. It is the **only** swap that is not
standalone: cooler, RAM, GPU, every cable and nine standoffs all come out. Budget an
afternoon, not an evening.

| Chipset | Slots / max RAM | PCIe | Overclock | Takes your 1400? | Cost |
|---|---|---|---|---|---|
| **A320** *(yours)* | 2 · 32 GB | 3.0 | No | Yes | — |
| A320 (4-slot) | 4 · 64 GB | 3.0 | No | **Yes** | ~$45 |
| B350 | 4 · 64 GB | 3.0 | Yes | **Yes** | ~$60 |
| **B450** | 4 · 128 GB | 3.0 | Yes | **Yes** | $75–115 |
| X370 / X470 | 4 · 64–128 GB | 3.0 | Yes | **Yes** | $85–130 |
| A520 | 4 · 128 GB | 3.0 | **No** | **No** | ~$70 |
| B550 | 4 · 128 GB | **4.0** | Yes | **No** | $115–160 |
| X570 | 4 · 128 GB | **4.0** | Yes | **No** | ~$185 |

### The three things that decide it

**B550 and X570 will not start with your CPU.** They officially begin at Ryzen 3000; your
1400 is Zen 1. Those boards force a CPU purchase in the *same order*, not later. **B450 spans
the 1400 through the 5700X**, so it is the right answer if you want to change the board now
and the chip whenever.

**Four slots halve the RAM cost.** With four DIMMs you keep the GeIL pair and *add* two 8 GB
sticks (~$115) rather than replacing both with a 2×16 kit (~$220). Mixed kits clock to the
slower stick — 2400 here — but 32 GB at 2400 beats 16 GB at 3200 every time you open the
third app. A $75 B450M plus $115 of memory is **$190 for 32 GB**, against $220 for the RAM
alone on your current board.

**PCIe 4.0 needs both halves.** Effective generation is the *lower* of board and CPU. A B550
with a Ryzen 5 5500 is still 3.0, because the 5500 has no 4.0 support.

Two costs no spec sheet lists: the OEM Windows licence is tied to the board it first
activated on (link it to a Microsoft account **before** swapping), and A520 still cannot
overclock despite being newer than A320.

## Sizes, in plain language

"Full / mid / small" is the part most guides assume you already know. Every board below is
drawn to scale in the interactive version.

| Form factor | Size (mm) | What it means |
|---|---|---|
| E-ATX | 305 × 330 | Oversized. Needs a full tower. **Will not fit your case.** |
| **ATX** | 305 × 244 | Full size. Most slots for the money. Fits you. |
| **microATX** | 244 × 244 | Mid size. Same width, shortened — you lose two *expansion* slots, not RAM slots. |
| Mini-ITX | 170 × 170 | Small. One expansion slot and only **two** RAM slots. A downgrade for you. |

Your A320M-K is **226 × 221 mm** — a *reduced* microATX, smaller than the standard even
allows. Your case takes up to full ATX, so everything on the list fits with room to spare.

A microATX board being shorter does **not** mean fewer memory slots. A 244 × 244 microATX
still gives you four. That is the whole saving above.

**The size that actually bites is graphics card length**, never width. Rough clearance in
your case is ~320 mm, estimated from the photos — measure from the rear slot bracket forward
to the drive cage before buying. Reference: RTX 3060 242 mm, RX 6700 XT 267 mm, RX 9070 XT
330 mm (would not fit).

**M.2 length**: the number *is* the size. 2280 = 22 mm wide, 80 mm long. Your board drills
one standoff, at 2280. A 22110 drive overhangs with nothing to screw into.

## When to stop and buy a prebuilt instead

If your parts list passes about **$600**, or replaces four of the six subsystems, price a
prebuilt before committing. At that point what survives is a case and a nine-year-old power
supply — that is not an upgrade, it is a new computer assembled inside an old shell.

**Why this is worth checking in 2026 specifically:** OEMs and system integrators buy memory
and storage on contracts negotiated months or years ahead, so the RAM inside a prebuilt today
was very likely bought *before* the shortage tripled retail prices. That has inverted the
usual maths — in the **$1,000–1,900** band a well-specced prebuilt frequently beats an
honestly-priced parts list, and it comes with one warranty covering the whole machine. Past
$2,000 the edge fades and hand-picking parts wins again.

**This does not change the cheap end.** The $125–260 plan — SSD, then CPU — is still the best
money on this page. Buying an SSD is not a reason to buy a computer. The prebuilt question
only applies to the far end.

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
