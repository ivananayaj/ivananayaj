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

1. Three apps open. Windows 11 idles at 4–6 GB; a loaded browser + a game + Discord/OBS clears 16 GB.
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
| Boot drive | Swap — **do this first** | M.2 2280 PCIe 3.0 x4, plus 4 free SATA ports | $60–95 |
| Memory | Swap | DDR4, **2 slots only, 32 GB max** | $70–95 |
| Processor | Swap | AM4 — same socket, same cooler | $85–150 |
| Graphics card | Swap — last | PCIe 3.0 x16 | $250–380 |
| Power supply | **Keep** | Standard ATX | $0 now |
| Motherboard | **Ceiling — don't buy** | AM4 / DDR4 / PCIe 3.0 | — |

### Compatibility traps worth knowing

- **Only two DIMM slots.** 32 GB means replacing both GeIL sticks, not adding to them. 32 GB is the board's hard maximum.
- **BIOS before CPU.** Flash to 5862 or newer *while the Ryzen 1400 is still installed*. A 2017 BIOS will not POST with a Zen 3 chip, and you need a working CPU in the socket to run the update. Get this backwards and the machine is dead until you borrow the old CPU back.
- **65 W CPUs only.** The 5600 and 5700X are fine. The 5800X, 5900X and 5700X3D are 105 W parts — they fit physically, but the A320M-K's small VRM is not built to feed them and A320 cannot overclock to recover the loss.
- **PCIe 3.0 tax.** Modern mid-range cards (RX 9060 XT, RTX 5060 Ti) use a PCIe 5.0 x8 interface, which negotiates down to PCIe 3.0 x8 in this slot — about a quarter of designed bandwidth. Buy the **16 GB** version; the penalty only bites hard when the card runs out of VRAM and starts swapping across that narrow link.
- **The M.2 slot is under the graphics card.** Pull the GPU to reach it, then put it back.
- **DDR4 does not move to AM5**, and neither does the Ryzen 1400. Board, CPU and RAM move together or not at all.

## Order of purchase

Sorted by responsiveness restored per dollar. Every stage is complete on its own.

| # | Do | Cost | Fixes |
|---|---|---|---|
| 0 | **Enable DOCP in BIOS** | Free | RAM is rated 2400 and running 2133. Five minutes, already paid for. |
| 1 | **1 TB NVMe SSD**, clone Windows across | $60–95 | The freezing. Keep the HDD as archive. |
| 2 | **2 x 16 GB DDR4-3200** | $70–95 | Removes the paging instead of making it fast. |
| 3 | **Ryzen 5 5600 or Ryzen 7 5700X** | $85–150 | Thread headroom. BIOS flash first. |
| 4 | **GPU**, after identifying the monitor | $250–380 | Framerate only. |

Stages 0–2 total roughly **$150** and address the stated complaint completely.
The full run is **$605**, about a third of what replacing the machine costs.

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
