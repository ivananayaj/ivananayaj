<#
    Desktop-94 Rig Report
    ---------------------
    Reads this machine's real hardware, checks it against the upgrade analysis,
    and prints a colour-coded verdict plus the purchase order.

    It also answers the two facts the written plan could not:
      - the BIOS version (does a Ryzen 5000 drop-in work?)
      - the monitor resolution and refresh rate (which graphics card is right?)

    Run it:
      Right-click Start -> Windows PowerShell, then:
          powershell -ExecutionPolicy Bypass -File .\rig-report.ps1

      Or from an old-style Command Prompt (cmd.exe):
          powershell -ExecutionPolicy Bypass -File rig-report.ps1

    Nothing is changed, installed, or sent anywhere. Every command is read-only.
    Run it as Administrator to also get the TPM and Secure Boot state.

    A copy of everything printed is saved next to the script as rig-report.txt,
    so you can paste it back for a second opinion.
#>

$ErrorActionPreference = 'SilentlyContinue'

# ---------------------------------------------------------------- plumbing --
$script:Lines = New-Object System.Collections.Generic.List[string]

function Say {
    param([string]$Text = '', [string]$Colour = 'Gray')
    Write-Host $Text -ForegroundColor $Colour
    $script:Lines.Add($Text)
}
function Rule   { param([string]$Title)
    Say ''
    Say ("== " + $Title + " " + ('=' * [Math]::Max(4, 62 - $Title.Length))) 'Cyan'
}
function Field  { param($Label, $Value, $Colour = 'White')
    Say ("  {0,-22} {1}" -f $Label, $Value) $Colour
}
function Good   { param($T) Say ("  [ OK ]   " + $T) 'Green'  }
function Warn   { param($T) Say ("  [ !! ]   " + $T) 'Yellow' }
function Bad    { param($T) Say ("  [FAIL]   " + $T) 'Red'    }
function Note   { param($T) Say ("           " + $T) 'DarkGray' }

function Is-Admin {
    try {
        $id = [Security.Principal.WindowsIdentity]::GetCurrent()
        return (New-Object Security.Principal.WindowsPrincipal $id).IsInRole(
            [Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch { return $false }
}

Clear-Host
Say ''
Say '  DESKTOP-94 RIG REPORT' 'White'
Say ('  Generated ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')) 'DarkGray'
if (-not (Is-Admin)) {
    Say '  Not running as Administrator - TPM and Secure Boot will be skipped.' 'DarkGray'
}

# ------------------------------------------------------------------- board --
Rule 'MOTHERBOARD AND BIOS'
$mb   = Get-CimInstance Win32_BaseBoard
$bios = Get-CimInstance Win32_BIOS

Field 'Manufacturer' $mb.Manufacturer
Field 'Model'        $mb.Product
Field 'BIOS version' $bios.SMBIOSBIOSVersion
$biosDate = $null
if ($bios.ReleaseDate) {
    $biosDate = [Management.ManagementDateTimeConverter]::ToDateTime($bios.ReleaseDate)
    Field 'BIOS date' $biosDate.ToString('yyyy-MM-dd')
}

if ($mb.Product -match 'A320') {
    Good "Board confirmed as A320 class - matches what the photos suggested."
} else {
    Warn "Board reads '$($mb.Product)'. The plan assumed an ASUS PRIME A320M-K."
    Note "Everything about DIMM slots and PCIe below still comes from THIS machine, so it stays correct."
}

# Zen 3 readiness. ASUS A320M-K needed BIOS 5862+; other vendors differ, so
# fall back to judging by date, which is the reliable signal.
if ($biosDate) {
    if ($biosDate -lt (Get-Date '2021-01-01')) {
        Bad "BIOS predates Ryzen 5000 support. A 5600 will NOT POST until you flash it."
        Note "Flash it while the current CPU is still installed. Out of order = dead machine."
    } else {
        Good "BIOS is from $($biosDate.Year) - new enough to be a Ryzen 5000 candidate."
        Note "Still check the vendor CPU support list for your exact board before buying."
    }
}

# --------------------------------------------------------------------- cpu --
Rule 'PROCESSOR'
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$cpuName = if ($cpu.Name) { $cpu.Name.Trim() } else { 'unknown' }
Field 'Model'   $cpuName
Field 'Cores'   ("{0} cores / {1} threads" -f $cpu.NumberOfCores, $cpu.NumberOfLogicalProcessors)
Field 'Base clock' ("{0} MHz reported" -f $cpu.MaxClockSpeed)

$zen1 = $cpuName -match 'Ryzen \d (1[0-9]{3}|2[0-9]{2}GE?)\b'
if ($zen1) {
    Bad "First-generation Ryzen. This is why Windows 11 refuses to install."
    Note "Microsoft's supported AMD list starts at Ryzen 2000. No BIOS setting changes that."
    Warn "With 4 cores of 2017 IPC, three simultaneous tasks have nothing left to schedule."
} else {
    Good "Not first-gen Ryzen - this CPU is a Windows 11 candidate."
}

# ------------------------------------------------------------------ memory --
Rule 'MEMORY'
$arr    = Get-CimInstance Win32_PhysicalMemoryArray | Select-Object -First 1
$sticks = @(Get-CimInstance Win32_PhysicalMemory)
$totalGB = 0
foreach ($s in $sticks) { $totalGB += [math]::Round($s.Capacity / 1GB) }

Field 'Installed' ("{0} GB across {1} stick(s)" -f $totalGB, $sticks.Count)
if ($arr) {
    Field 'Slots on board' $arr.MemoryDevices
    if ($arr.MaxCapacity -gt 0) {
        Field 'Board maximum' ("{0} GB (as firmware reports it)" -f [math]::Round($arr.MaxCapacity / 1MB))
        Note 'Firmware often over-reports this. Trust the vendor spec page over this number.'
    }
}
Say ''
foreach ($s in $sticks) {
    $gb = [math]::Round($s.Capacity / 1GB)
    $cfg = $s.ConfiguredClockSpeed
    if (-not $cfg) { $cfg = $s.Speed }
    Say ("    {0,-10} {1,3} GB  rated {2} / running {3} MHz  {4}" -f `
         $s.DeviceLocator, $gb, $s.Speed, $cfg, $s.PartNumber) 'Gray'
}
Say ''

if ($arr -and $arr.MemoryDevices -le 2) {
    Warn "Only $($arr.MemoryDevices) DIMM slots. More memory means REPLACING sticks, not adding."
    Note "A four-slot board would let you keep these and add two more - roughly half the cost."
} elseif ($arr) {
    Good "$($arr.MemoryDevices) DIMM slots, $($sticks.Count) filled - you can ADD memory instead of replacing it."
}

$rated   = 0
$running = 0
if ($sticks.Count -gt 0) {
$rated   = ($sticks | Measure-Object -Property Speed -Maximum).Maximum
$running = ($sticks | ForEach-Object { if ($_.ConfiguredClockSpeed) { $_.ConfiguredClockSpeed } else { $_.Speed } } |
            Measure-Object -Maximum).Maximum
}
if ($rated -gt 0 -and $rated -gt $running) {
    Warn "Memory is rated $rated MHz but running at $running MHz. DOCP/XMP is switched OFF."
    Note "Free fix: enable DOCP in BIOS. Five minutes, no money, and you already paid for the speed."
} else {
    Good "Memory is running at its rated speed."
}
if ($totalGB -le 16) {
    Warn "$totalGB GB is the reason Windows starts paging once three apps are open."
}

# ----------------------------------------------------------------- storage --
Rule 'STORAGE - THE FREEZE SUSPECT'
$sysDrive = $env:SystemDrive.TrimEnd(':')
$bootIsHDD = $false

$phys = @(Get-PhysicalDisk)
if ($phys.Count -gt 0) {
    foreach ($d in $phys) {
        $size = [math]::Round($d.Size / 1GB)
        $media = $d.MediaType
        if (-not $media -or $media -eq 'Unspecified') { $media = 'Unknown' }
        $col = 'Gray'; if ($media -eq 'HDD') { $col = 'Red' }
        Say ("    {0,-34} {1,5} GB   {2}" -f $d.FriendlyName, $size, $media) $col
    }
} else {
    foreach ($d in @(Get-CimInstance Win32_DiskDrive)) {
        Say ("    {0,-34} {1,5} GB" -f $d.Model, [math]::Round($d.Size / 1GB)) 'Gray'
    }
    Note 'Media type unavailable on this system - check whether the boot drive spins.'
}
Say ''

# Which disk holds Windows, and is it spinning?
try {
    $part = Get-Partition -DriveLetter $sysDrive
    $disk = Get-Disk -Number $part.DiskNumber
    $pd   = Get-PhysicalDisk | Where-Object { [string]$_.DeviceId -eq [string]$disk.Number }
    Field 'Windows is on' ("Disk {0} - {1}" -f $disk.Number, $disk.FriendlyName)
    Field 'Partition style' $disk.PartitionStyle
    if ($pd -and $pd.MediaType -eq 'HDD') {
        $bootIsHDD = $true
        Bad "Windows boots from a MECHANICAL HARD DRIVE. This is the freeze."
        Note "A 7200 rpm platter serves ~100-150 random operations per second."
        Note "An NVMe SSD serves hundreds of thousands. That gap IS the multi-second stall."
    } elseif ($pd) {
        Good "Windows is on $($pd.MediaType) - the boot drive is not your bottleneck."
    }
    if ($disk.PartitionStyle -eq 'MBR') {
        Warn "System disk is MBR. Windows 11 needs GPT + Secure Boot."
        Note "A clean install on a new SSD sorts this automatically."
    }
} catch { Note 'Could not resolve which physical disk holds Windows.' }

# The pagefile is the actual mechanism of the freeze - locate it.
$pf = @(Get-CimInstance Win32_PageFileUsage)
if ($pf.Count -gt 0) {
    foreach ($p in $pf) {
        Field 'Pagefile' ("{0}  ({1} MB in use of {2} MB peak)" -f $p.Name, $p.CurrentUsage, $p.PeakUsage)
    }
    if ($bootIsHDD) {
        Bad "The pagefile lives on the mechanical drive. That is the exact stall mechanism."
    }
} else {
    Note 'Pagefile is system-managed; no explicit entry reported.'
}

$free = Get-PSDrive -Name $sysDrive
if ($free -and $free.Free -ne $null) {
    $freeGB = [math]::Round($free.Free / 1GB)
    $usedGB = 0
    if ($free.Used -ne $null) { $usedGB = [math]::Round($free.Used / 1GB) }
    Field 'System drive' ("{0} GB used, {1} GB free" -f $usedGB, $freeGB)
    if ($freeGB -lt 60) { Warn "Under 60 GB free. A full drive makes paging slower still." }
}

# ---------------------------------------------------------- graphics + panel --
Rule 'GRAPHICS AND DISPLAY'
foreach ($g in @(Get-CimInstance Win32_VideoController)) {
    if (-not $g.Name) { continue }
    Field 'Adapter' $g.Name
    if ($g.AdapterRAM -gt 0) {
        Field '  VRAM reported' ("{0} GB" -f [math]::Round($g.AdapterRAM / 1GB))
        Note 'Windows under-reports VRAM above 4 GB - trust the model name, not this number.'
    }
    Field '  Driver' $g.DriverVersion
    if ($g.CurrentHorizontalResolution) {
        $res = "{0} x {1} @ {2} Hz" -f $g.CurrentHorizontalResolution,
                                       $g.CurrentVerticalResolution,
                                       $g.CurrentRefreshRate
        Field '  Display now' $res
        Say ''
        Say '  >> THIS ANSWERS THE OPEN QUESTION: which graphics card is right.' 'White'
        if ($g.CurrentVerticalResolution -le 1080 -and $g.CurrentRefreshRate -le 75) {
            Good "1080p at $($g.CurrentRefreshRate) Hz. Do NOT overbuy."
            Note 'A used RTX 3060 12 GB or RX 6700 XT saturates this panel. Anything more is wasted.'
        } elseif ($g.CurrentVerticalResolution -le 1080) {
            Good "1080p high-refresh ($($g.CurrentRefreshRate) Hz) - the CPU matters more than the GPU here."
        } elseif ($g.CurrentVerticalResolution -le 1440) {
            Good "1440p - a used 6700 XT or an RX 9060 XT 16 GB is the sensible band."
        } else {
            Warn '4K panel. Honestly out of reach for this platform without heavy spending.'
        }
    }
}

# ------------------------------------------------------------ os + win 11 --
Rule 'OPERATING SYSTEM'
$os = Get-CimInstance Win32_OperatingSystem
Field 'Version' ("{0} (build {1})" -f $os.Caption, $os.BuildNumber)
Field 'Architecture' $os.OSArchitecture
Field 'Memory in use' ("{0} GB of {1} GB" -f `
    [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 1),
    [math]::Round($os.TotalVisibleMemorySize / 1MB, 1))

if ($os.Caption -match 'Windows 10') {
    Warn 'Windows 10 left free support on 14 October 2025.'
    Note 'Consumer Extended Security Updates ended 13 October 2026.'
}

if (Is-Admin) {
    try {
        $tpm = Get-Tpm
        if ($tpm.TpmPresent -and $tpm.TpmReady) { Good 'TPM present and ready.' }
        elseif ($tpm.TpmPresent) { Warn 'TPM present but not ready - enable AMD fTPM in BIOS.' }
        else { Warn 'No TPM active. BIOS -> Advanced -> AMD fTPM -> "AMD CPU fTPM".' }
    } catch { Note 'TPM state unavailable.' }
    try {
        if (Confirm-SecureBootUEFI) { Good 'Secure Boot is on.' }
        else { Warn 'Secure Boot is off. BIOS -> disable CSM, then enable Secure Boot.' }
    } catch { Note 'Secure Boot unavailable (legacy BIOS mode, or not supported).' }
} else {
    Note 'Re-run as Administrator to include TPM and Secure Boot state.'
}

if ($zen1) {
    Bad 'Windows 11: BLOCKED, and only the CPU changes that.'
} else {
    Good 'Windows 11: the CPU is eligible.'
}

# ------------------------------------------------------------------- plan --
Rule 'WHAT TO DO, IN ORDER'
Say ''
$n = 0
if ($rated -gt $running) {
    $n++; Say ("  {0}. Enable DOCP in BIOS" -f $n) 'Green'
    Say  ("     FREE. Memory returns to $rated MHz from $running MHz.") 'DarkGray'
}
if ($bootIsHDD) {
    $n++; Say ("  {0}. 1 TB M.2 NVMe SSD, clone Windows onto it" -f $n) 'Green'
    Say  ('     $100-150. This is the fix for the freezing. Keep the HDD for storage.') 'DarkGray'
}
if ($zen1) {
    $n++; Say ("  {0}. Ryzen 5 5600 (flash the BIOS FIRST)" -f $n) 'Green'
    Say  ('     $125-145. Thread headroom AND it unlocks Windows 11.') 'DarkGray'
}
if ($totalGB -le 16) {
    $n++; Say ("  {0}. 32 GB of memory - but reassess after the SSD" -f $n) 'Yellow'
    Say  ('     $180-265. DDR4 has roughly tripled. Once paging is on NVMe it may not hurt.') 'DarkGray'
}
$n++; Say ("  {0}. Graphics card - LAST, and buy used" -f $n) 'Yellow'
Say  ('     $200-300. Framerate only. It does nothing for the freezing.') 'DarkGray'

Say ''
Say '  Full reasoning, and an interactive parts bench:' 'DarkGray'
Say '  https://claude.ai/code/artifact/0498e4d0-0847-451e-9e4b-5e89265d6990' 'Cyan'

# ------------------------------------------------------------------- save --
$dir = $null
if ($PSScriptRoot) { $dir = $PSScriptRoot }
elseif ($MyInvocation.MyCommand.Path) { $dir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $dir) { $dir = (Get-Location).Path }
$out = Join-Path $dir 'rig-report.txt'
try {
    $script:Lines | Out-File -FilePath $out -Encoding UTF8
    Say ''
    Say ("  Saved to $out") 'DarkGray'
    Say '  Paste that file back into the chat for a second opinion.' 'DarkGray'
} catch { }
Say ''
