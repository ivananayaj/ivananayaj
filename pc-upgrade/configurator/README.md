# Parts Bench — interactive configurator

Standalone single-file page. No build step, no dependencies to install:

    python3 -m http.server 8095 --directory configurator
    # then open http://127.0.0.1:8095/

Published copy: https://claude.ai/code/artifact/0498e4d0-0847-451e-9e4b-5e89265d6990

## What it does

Three views over one shared state — change a part anywhere and the photo callouts,
the 3D model and the rules engine all update together.

- **Board / Case** — the real teardown photos from `public/rig/`, with callouts placed
  on the actual slots and labelled with the board's own silkscreen designators
  (`DIMM_A1/B1`, `M.2_1`, `PCIEX16`, `ATX PSU`).
- **3D** — a rotatable block model of the build (Three.js r128 from cdnjs). The selected
  part lights copper. Degrades silently to nothing if the CDN is unreachable.
- **Slot rail** — a dropdown per slot, each with deliberately incompatible options
  included so the rules have something to catch.

## The motherboard slot

The board is a variable, not a constant: its capability record (`dimm`, `maxRam`, `m2`,
`m2gen`, `pcie`, `oc`, `vrm`, `zen1`, `ff`) drives every other slot's constraints. Swap the
board and the RAM ceiling, the PCIe generation, the M.2 count and the VRM verdict all move
with it.

Candidates are limited to boards that reuse what is already in the case — AM4 socket, DDR4,
ATX or mATX, one 24-pin plus one 8-pin EPS. Nothing here asks for a new PSU, cooler, case
or memory.

Three rules make this slot worth having:

1. **B550 and X570 do not support Zen 1.** Officially they start at Ryzen 3000, so pairing
   one with the installed Ryzen 5 1400 is a hard fail — the board forces a CPU purchase in
   the same order. B450 takes everything from the 1400 to a 5700X, which makes it the right
   answer for anyone who wants to swap the board now and the chip later.
2. **Four DIMM slots change the RAM math.** With four slots you keep the GeIL pair and add
   two more 8 GB sticks (~$115) instead of replacing both with a 2x16 kit (~$220). Mixed
   kits clock to the slower stick, but 32 GB at 2400 beats 16 GB at 3200 under load — and
   during a memory shortage that halving matters.
3. **PCIe 4.0 needs both halves.** Effective generation is `min(board, cpu)`. A B550 with a
   Ryzen 5 5500 is still PCIe 3.0, because the 5500 has no 4.0 support — the engine flags
   the board's headline feature as idle.

Two costs the spec sheets do not list are surfaced as warnings on every board change: it is
the only swap that is not standalone (everything comes out), and the OEM Windows licence is
tied to the board it first activated on.

## The rules engine

`evaluate()` in `index.html` is the whole thing. It distinguishes two different failures,
which is the point:

- **Won't fit** — a genuine incompatibility (DDR5, 64 GB over the board's ceiling,
  AM5 CPU, M.2 22110, a card past the supply's derated ceiling).
- **Bottleneck / Check** — it works, it's just a bad idea (the HDD, a 105 W chip on the
  A320 VRM, a PCIe 5.0 x8 card in a 3.0 slot, a modern GPU behind a Ryzen 1400).

It also computes peak draw against the PSU's *derated* capacity (the 2017 Thermaltake is
haircut 25%, a modern Gold unit only 5%), a freeze-risk score, running cost, and Windows 11
eligibility — which flips the moment the CPU stops being Zen 1.

## Editing

Parts live in the `P` object; slots and their photo coordinates in `SLOTS`. Hotspot
positions are percentages of the image, so they survive any re-encode of the photos.
Prices should track `src/lib/pricing.ts`.
