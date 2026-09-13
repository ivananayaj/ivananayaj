export const CAPTURED_ON = "12 September 2026";
export const TEARDOWN_ON = "13 September 2026";

export const CURRENT_RIG = {
  deviceName: "Desktop-94",
  cpu: "AMD Ryzen 5 1400",
  cpuDetail: "Zen 1 · 4 cores / 8 threads · AM4 · Windows reports 3.80 GHz",
  cpuYear: 2017,
  ram: "16.0 GB",
  ramSpeed: "2133 MHz",
  gpu: "NVIDIA GeForce GTX 1050 Ti",
  gpuVram: "4 GB",
  gpuYear: 2016,
  storage: "932 GB HDD",
  storageModel: "WDC WD10EZEX-08WN4A0",
  storageUsed: "517 GB of 932 GB used",
  os: "Windows 10, 64-bit x64",
  osNote:
    "Windows 11 is blocked: the Ryzen 5 1400 is Zen 1, and Microsoft's supported list starts at Ryzen 2000 (Zen+). Windows 10 consumer support ended 14 Oct 2025; paid ESU cover ends 13 Oct 2026.",
  productId: "00325-80000-00000-AAOEM",
  deviceId: "77651BDC-1C9E-4925-8A45-8A915002AAE2",
} as const;

/**
 * Read off the teardown photos in public/rig/, not off Windows About.
 * `confidence: "read"` = the label is legible in a photo.
 * `confidence: "inferred"` = deduced from board silkscreen + rear I/O + slot count.
 */
export const CONFIRMED_PARTS = [
  {
    id: "psu",
    label: "Power supply",
    value: "Thermaltake Smart 600W",
    detail: "80 Plus White · non-modular · bottom-mounted · group-regulated budget unit, same age as the build",
    confidence: "read" as const,
    source: "psu.jpg — sticker legible",
  },
  {
    id: "motherboard",
    label: "Motherboard",
    value: "ASUS PRIME A320M-K",
    detail:
      "AM4 · micro-ATX · 2 DIMM slots (32 GB max) · 4x SATA 6Gb/s · 1x M.2 2280 PCIe 3.0 x4 · PCIe 3.0 x16",
    confidence: "inferred" as const,
    source:
      "board.jpg + rear.jpg — DIGI+ VRM / LANGuard / EZ Flash 3 silkscreen, 2 DIMM slots, VGA + HDMI + dual PS/2 rear I/O",
  },
  {
    id: "ramConfig",
    label: "RAM layout",
    value: "2 x 8 GB GeIL EVO Potenza (Ryzen Edition)",
    detail:
      "PC4-19200 = DDR4-2400 CL16-16-16-36 at 1.2 V · both slots filled, so dual-channel is already active · Windows reports 2133, meaning DOCP is switched off in BIOS",
    confidence: "read" as const,
    source: "ram.jpg — module label legible",
  },
  {
    id: "caseName",
    label: "Case",
    value: "Thermaltake ATX mid-tower",
    detail:
      "7 expansion slots · bottom PSU basement · 2x 120 mm top fans + front intake · empty 3.5\"/2.5\" bays · full-length GPU clearance",
    confidence: "read" as const,
    source: "overview.jpg, cages.jpg, rear.jpg",
  },
] as const;

/** The only thing still genuinely unknown after the teardown. */
export const STILL_UNKNOWN = ["monitor", "biosVersion"] as const;

export const UNKNOWN_SLOTS = [
  {
    id: "monitor",
    label: "Monitor",
    why: "The last real unknown. Resolution and refresh rate set the GPU you actually need. A 1080p 60 Hz panel does not need a 9070 XT, and buying one anyway is money that should have gone to RAM.",
    how: "Windows Settings \u2192 System \u2192 Display \u2192 Advanced display. Note resolution AND refresh rate.",
  },
  {
    id: "biosVersion",
    label: "BIOS version",
    why: "Decides whether the Ryzen 5000 drop-in works. ASUS shipped Zen 3 support to A320 boards in a late BIOS \u2014 an original 2017 BIOS will not POST with a 5600.",
    how: "PowerShell: Get-CimInstance Win32_BIOS | Format-List SMBIOSBIOSVersion, ReleaseDate \u2014 you want 5862 or newer.",
  },
  {
    id: "motherboard",
    label: "Motherboard (confirm the guess)",
    why: "Read as PRIME A320M-K from the silkscreen and rear I/O. Everything about the CPU path depends on it being right, so confirm it in software before buying.",
    how: "PowerShell: Get-CimInstance Win32_BaseBoard | Format-List Manufacturer, Product",
  },
] as const;

export const BOTTLENECKS = [
  {
    id: "storage",
    part: "WD Blue 1 TB HDD",
    era: "2012 design \u00b7 7200 rpm SATA",
    score: 98,
    severity: "critical" as const,
    verdict:
      "This is the freeze. A 7200 rpm platter does roughly 100\u2013150 random IOPS; an SSD does tens of thousands. The moment Windows needs to page \u2014 which is the moment you open the third app \u2014 the whole desktop waits on a physical arm moving across a disk. 517 GB used on a 932 GB drive also means the slow outer-to-inner tracks are in play.",
    firstMove:
      "1 TB NVMe in the board's M.2 slot. Clone Windows onto it, keep the HDD as the archive drive. Nothing else you buy will change the feel of this machine as much.",
  },
  {
    id: "ram",
    part: "16 GB DDR4-2400 running at 2133",
    era: "2 x 8 GB GeIL, dual-channel",
    score: 88,
    severity: "severe" as const,
    verdict:
      "Capacity is the real problem, not speed. Windows 10 idles around 3\u20134 GB. A browser with a real tab load, a game, and a Discord or OBS on top clears 16 GB, and everything past that goes to the pagefile on the spinning disk. That is the second half of the freeze. Separately, DOCP is off \u2014 you paid for 2400 and are running 2133.",
    firstMove:
      "Free first: enable DOCP in BIOS tonight. Then 2 x 16 GB DDR4-3200. Note the board has only two slots, so this is a replacement, not an addition \u2014 the GeIL sticks come out.",
  },
  {
    id: "cpu",
    part: "Ryzen 5 1400",
    era: "2017 Zen 1 \u00b7 4C/8T \u00b7 65 W",
    score: 76,
    severity: "severe" as const,
    verdict:
      "Four cores with 2017 IPC and a 2-CCX split that adds latency whenever a thread hops between core groups. Fine for one task. With three, there is simply nothing left to schedule. Stock is 3.2/3.4 GHz \u2014 Windows reporting 3.80 GHz is a reporting quirk, not a hidden 8-core.",
    firstMove:
      "Update BIOS first, while the 1400 is still in the socket. Then a 65 W Ryzen 5 5600 or Ryzen 7 5700X drops straight into the same board, same cooler, same RAM.",
  },
  {
    id: "gpu",
    part: "GTX 1050 Ti 4 GB",
    era: "2016 Pascal \u00b7 75 W, no PCIe cable",
    score: 90,
    severity: "critical" as const,
    verdict:
      "4 GB of VRAM will not hold modern textures, and this card is why current games either refuse to launch or crawl. But be clear about what it is NOT: the GPU has nothing to do with the freezing. It caps your framerate, not your responsiveness. Buying it first fixes the wrong complaint.",
    firstMove:
      "Fourth in line, and only after the monitor is identified. The 600 W PSU and the case can both take a modern card \u2014 the PCIe 3.0 x16 slot is the real ceiling.",
  },
  {
    id: "platform",
    part: "ASUS PRIME A320M-K + Thermaltake Smart 600W",
    era: "2017 budget AM4",
    score: 58,
    severity: "moderate" as const,
    verdict:
      "Much better news than the unknowns suggested. The 600 W PSU has the headroom and the PCIe cables for a mid-range card, and the board takes a Zen 3 drop-in on a late BIOS. The genuine limits: A320 cannot overclock the CPU, only two DIMM slots means a hard 32 GB ceiling, and PCIe 3.0 x16 will slightly throttle any modern PCIe 5.0 x8 card.",
    firstMove:
      "Nothing to buy here. This platform is worth keeping for another two to three years \u2014 spend the money on the four parts above instead.",
  },
] as const;

export const USES = [
  { id: "browse", label: "Everyday / office" },
  { id: "game1080", label: "1080p gaming" },
  { id: "game1440", label: "1440p gaming" },
  { id: "game4k", label: "4K gaming" },
  { id: "stream", label: "Stream / record" },
  { id: "create", label: "Photo / video" },
  { id: "ai", label: "Local AI" },
  { id: "emulate", label: "Emulation" },
] as const;

export const RESOLUTIONS = [
  { id: "unknown", label: "Not sure" },
  { id: "1080p", label: "1080p" },
  { id: "1440p", label: "1440p" },
  { id: "4k", label: "4K" },
] as const;

export const PATHS = [
  {
    id: "am4",
    name: "AM4 last mile",
    kicker: "Rescue the box you already have — now the clear favourite",
    spend: "$125 (fixes the freezing) — $260 (plus a supported OS) — ~$800 (everything)",
    years: "2\u20133 years of useful life",
    when:
      "The teardown made this the default answer. The A320M-K takes a Zen 3 drop-in on a late BIOS, the 600 W supply has the cables and the headroom, and the case has room for a full-length card. Nothing needs replacing to unblock anything else.",
    steps: [
      "Free: enable DOCP in BIOS. The RAM is rated 2400 and running 2133.",
      "1 TB NVMe in the M.2 slot, clone Windows across, keep the HDD for archive. This is the fix for the freezing.",
      "2 x 16 GB DDR4-3200. Only two slots, so the GeIL pair comes out \u2014 this is a replacement, not an addition.",
      "Flash BIOS to 5862+ while the 1400 is still in the socket, THEN drop in a 65 W Ryzen 5 5600 or Ryzen 7 5700X.",
      "GPU last, sized to whatever the monitor turns out to be. RX 9060 XT 16 GB or RTX 5060 Ti 16 GB.",
    ],
    keep: [
      "Case \u2014 full ATX, seven slots, full GPU clearance",
      "Thermaltake Smart 600W \u2014 enough for a 5700X plus a 9060 XT",
      "ASUS PRIME A320M-K \u2014 no reason to touch it",
      "Stock AMD cooler \u2014 fine for any 65 W Zen 3 chip",
      "WD Blue HDD \u2014 demoted to archive storage",
    ],
    replace: ["Boot drive (add NVMe)", "RAM (2x8 out, 2x16 in)", "CPU after the BIOS flash", "GPU last"],
    risk:
      "Real but bounded: 32 GB is the hard memory ceiling, A320 cannot overclock, and PCIe 3.0 x16 costs a few percent on a modern PCIe 5.0 x8 card. The 2017 power supply is the part most likely to simply die of old age. This is a genuine two-to-three-year bridge, not a 2030 machine.",
  },
  {
    id: "am5",
    name: "New AM5 platform",
    kicker: "Only worth it if 1440p high-refresh is the goal",
    spend: "$1,600\u2013$2,500 at September 2026 prices",
    years: "AM5 supported through 2029",
    when:
      "Harder to justify than ever. The teardown already made this the weaker option; the memory shortage then pushed DDR5 and GPU prices up hard, so a build that cost $1,000\u2013$1,800 a year ago now runs $1,600\u2013$2,500. Choose it only if you want sustained 1440p high-refresh or need more than 32 GB of RAM. For fixing the freezing it is more than ten times the price of the answer.",
    steps: [
      "CPU: Ryzen 5 9600X or 7600. Skip X3D unless the GPU is already 9070-class.",
      "Board: B850 or B650 with Wi-Fi, four DIMM slots, two M.2, BIOS flashback.",
      "RAM: 32 GB (2x16) DDR5-6000 CL30 EXPO \u2014 still the sweet spot, but entry-level 32 GB DDR5 kits now clear $300 on their own.",
      "GPU sized to the monitor: RX 9060 XT 16 GB or RTX 5060 Ti 16 GB for 1080p/1440p; RX 9070 XT if the budget stretches.",
      "1\u20132 TB Gen4 NVMe and a 650\u2013750 W ATX 3.1 supply. The Thermaltake does not come along.",
    ],
    keep: [
      "The Thermaltake case \u2014 it is a standard ATX tower and takes an AM5 board directly",
      "The WD Blue HDD as archive storage",
      "Any NVMe you buy for the AM4 plan first \u2014 it moves over unchanged",
    ],
    replace: ["CPU, board, RAM, PSU. DDR4 and the Ryzen 1400 do not move to AM5 under any circumstances."],
    risk:
      "The OEM Windows key (Product ID ends AAOEM) will not move cleanly to a new board. Note the sequencing advantage: the SSD from stage 1 of the AM4 plan carries over to AM5 intact, so starting cheap costs you nothing if you later change your mind.",
  },
] as const;

export const SPEC_SCRIPT = `# Desktop-94 spec dump — run in PowerShell, paste the output into Rig File
Write-Output "=== BASEBOARD ==="
Get-CimInstance Win32_BaseBoard | Format-List Manufacturer, Product, Version
Write-Output "=== BIOS ==="
Get-CimInstance Win32_BIOS | Format-List Manufacturer, SMBIOSBIOSVersion, ReleaseDate
Write-Output "=== CPU ==="
Get-CimInstance Win32_Processor | Format-List Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed
Write-Output "=== RAM MODULES ==="
Get-CimInstance Win32_PhysicalMemory | Select-Object BankLabel, Manufacturer, PartNumber, @{N='GB';E={[math]::Round($_.Capacity/1GB,1)}}, Speed, ConfiguredClockSpeed | Format-Table -AutoSize
Write-Output "=== GPU ==="
Get-CimInstance Win32_VideoController | Format-List Name, DriverVersion
Write-Output "=== STORAGE ==="
Get-CimInstance Win32_DiskDrive | Select-Object Model, InterfaceType, @{N='GB';E={[math]::Round($_.Size/1GB,0)}} | Format-Table -AutoSize
Write-Output "=== MOTHERBOARD (WMI) ==="
Get-CimInstance Win32_ComputerSystem | Format-List Manufacturer, Model
`;

export type UseId = (typeof USES)[number]["id"];
export type ResolutionId = (typeof RESOLUTIONS)[number]["id"];
export type PathId = "am4" | "am5" | "undecided";

export type IntentState = {
  uses: UseId[];
  resolution: ResolutionId;
  budget: number;
  preferredPath: PathId;
  motherboard: string;
  biosVersion: string;
  psu: string;
  ramConfig: string;
  caseName: string;
  monitor: string;
  notes: string;
  specDump: string;
};

export const DEFAULT_INTENT: IntentState = {
  uses: ["browse", "game1080"],
  resolution: "unknown",
  budget: 1200,
  preferredPath: "undecided",
  motherboard: "",
  biosVersion: "",
  psu: "",
  ramConfig: "",
  caseName: "",
  monitor: "",
  notes: "",
  specDump: "",
};

export function budgetBand(budget: number) {
  if (budget < 500) return "Rescue only — SSD and a used GPU if the PSU allows.";
  if (budget < 900) return "AM4 last mile is the honest ceiling. AM5 would be starved.";
  if (budget < 1400) return "AM5 1080p / entry 1440p. Spend the GPU first.";
  if (budget < 2000) return "AM5 1440p with headroom. 9060 XT 16 GB / 5060 Ti 16 GB / 9070 class.";
  return "High 1440p or entry 4K. 9070 XT or 5070-class, still no reason to overbuy the CPU.";
}
