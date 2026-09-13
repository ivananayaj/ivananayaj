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

Fourteen boards across A320, B350, X370, B450, X470, A520, B550, X570, plus an E-ATX board
and an AM5 board that exist specifically to demonstrate the two failure kinds.

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

## The prebuilt check

Past $600, or four replaced subsystems, or a board swap plus three others, a card appears
arguing the user should price a prebuilt first. It computes what actually survives the build
rather than asserting it, and it makes a specific, current argument: OEMs buy memory and
storage on contracts negotiated months ahead, so a prebuilt's RAM was very likely bought
before the shortage tripled retail prices. Through 2026 that inverts the usual maths in the
$1,000-1,900 band.

It deliberately does not overreach: the card closes by saying the $125-260 end of the plan is
still the best money on the page and this only concerns the far end.

## Size view

Everything is drawn in real millimetres — the SVG `viewBox` is in mm, so the rectangles are
the parts. Four blocks, all redrawn on any change:

1. **Board footprint** — the current board and the selected one overlaid, sharing the rear
   I/O corner (which is how they actually mount), inside the case's ATX maximum. The prose
   below computes the real delta in mm and cm².
2. **Form factors to scale** — E-ATX / ATX / microATX / Mini-ITX side by side with
   plain-language descriptions, because "full / mid / small" is the part most guides assume
   you already know. The point it makes: a bigger board buys slots, not speed.
3. **Card length vs case clearance** — every GPU in the catalog as a bar against a dashed
   clearance line. This is the only size that actually bites, and length is what runs out.
4. **M.2 lengths** — 2242 / 2260 / 2280 / 22110, showing why the number *is* the size.

Reference dimensions: A320M-K 226x221 (a reduced microATX), microATX 244x244, ATX 305x244,
E-ATX 305x330, Mini-ITX 170x170. Case GPU clearance is estimated at ~320 mm from the
teardown photos and is labelled as an estimate everywhere it appears — the page tells the
reader to measure rather than trusting it.

Bar scales reserve room for their right-hand labels, so nothing clips at 390 px.

## Mobile

The two-column layout stacks on narrow screens, which put the stage off-screen while you
worked the rail below it — changes happened where you could not see them. A fixed bottom bar
now carries the live verdict, cost, draw and freeze score at all times, pulses on every
change, and its "See it" button jumps to the stage. Selecting the board slot switches the
stage to the Size view, since that is where a board change is actually visible.

Note when testing locally: the publish pipeline injects a viewport meta tag and
`python3 -m http.server` does not, so a local phone-width test lays out at 980 px and the
media queries never fire. Inject the tag in the test harness.

## The rules engine

`evaluate()` in `index.html` is the whole thing. Every finding is
`{sev, kind, parts[], head, body}`, and **kind** is what makes the output readable:

| kind | Means | Chip |
|---|---|---|
| `size` | Physically will not go in the case | Won't fit |
| `pair` | Two parts cannot work together | Incompatible |
| `perf` | Fits and works, but is the bottleneck | Bottleneck / Weak |
| `os`   | Windows 11 eligibility | — |
| `info` | Worth knowing | Fits / Check |

`parts[]` names the components involved, so a finding renders as `BOARD x CPU` rather than
leaving the reader to work out which two things clash. Findings are grouped under headings
by kind, and a **banner at the top of the parts panel** repeats the first blocking one — the
earlier version buried the reason below the fold, so a size failure read as a parts failure
while you scrolled.

Worked examples: an E-ATX board is `size` (330 mm against 244 mm of tray, nothing else is
wrong); a B550 with the Ryzen 1400 is `pair`; the HDD is `perf`.

It also computes peak draw against the PSU's *derated* capacity (the 2017 Thermaltake is
haircut 25%, a modern Gold unit only 5%), a freeze-risk score, running cost, and Windows 11
eligibility — which flips the moment the CPU stops being Zen 1.

## Editing

Parts live in the `P` object; slots and their photo coordinates in `SLOTS`. Hotspot
positions are percentages of the image, so they survive any re-encode of the photos.
Prices should track `src/lib/pricing.ts`.
