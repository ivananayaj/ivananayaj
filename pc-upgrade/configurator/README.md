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
