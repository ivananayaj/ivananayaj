# Flashing the BIOS — ASUS PRIME A320M-K

Your board runs **BIOS 3803, dated 22 January 2018**. This walks through replacing it.

**Time:** about 20 minutes. **Cost:** nothing. **Needed:** a USB stick.

---

## What the BIOS actually is

It is a small program on a chip on the motherboard. It runs before Windows exists — it wakes
the board up, identifies the CPU and memory, and hands control to the drive.

The chip is rewritable, and ASUS publishes new versions. "Flashing" means writing a new one.

## What it does for you

**1. It is the only way your board will run a newer CPU — and it is not optional.**

Your BIOS is from January 2018. The Ryzen 5000 chips launched in **November 2020**, nearly
three years later. A 2018 BIOS contains no microcode for a processor that did not exist when
it was written, so the board looks at the chip, does not recognise it, and refuses to start.

No beep, no display, no error. Just a machine that does not turn on.

So the sequence is: **flash first, swap second.** Getting that backwards is the single way
this goes wrong, and the reason is circular — you need a *working* CPU installed to run the
update, and the moment you fit the new chip you no longer have one.

**2. Other things you get, free, on the way:**

- **Eight years of fixes.** Memory compatibility, USB dropouts, boot reliability. Your board
  has had roughly two dozen releases since yours.
- **Spectre and Meltdown microcode.** January 2018 was *during* that disclosure. Your BIOS
  predates most of the CPU-level mitigations.
- **AMD fTPM**, which Windows 11 requires and older firmware handles badly.
- **A later fix specifically for fTPM stuttering** in Windows, which arrived in 6042.

## What it does NOT do

It will not make the machine faster on its own. Nothing here fixes the freezing — that is the
hard drive. This is a prerequisite for the CPU upgrade, not an upgrade in itself.

---

## Check this first — it takes 30 seconds and it matters

Go to the [ASUS PRIME A320M-K CPU support list](https://www.asus.com/supportonly/prime%20a320m-k/helpdesk_cpu/)
and confirm **two** things on the newest BIOS:

1. **The Ryzen 5 5600 is listed** — that is what you are flashing *for*.
2. **The Ryzen 5 1400 is still listed** — that is what has to boot *after* the flash.

Point 2 is the one people skip. Late BIOS releases on 300-series boards dropped support for
some older chips to free up ROM space. ASUS dropped **Bristol Ridge** — the old A-series and
Athlon X4 APUs — which is a *different family* from your Summit Ridge Ryzen 1400, so it should
be fine. But I could not open the ASUS site to verify it for your exact board, so check the
list yourself. If the 1400 is not on it, stop and ask.

---

## The procedure

### 1. Get the file

From the [ASUS PRIME A320M-K download page](https://www.asus.com/supportonly/prime%20a320m-k/helpdesk_bios/),
download the **latest** BIOS. You do not need to step through intermediate versions.

It arrives as a ZIP. Extract it — inside is a `.CAP` file, and often a small `BIOSRenamer`
tool. Run the renamer if present; it gives the file the exact name the board expects.

### 2. Prepare the USB stick

Any stick, 1 GB or larger. Format it **FAT32** — not exFAT, not NTFS. The BIOS cannot read
those. Right-click the drive → Format → File system: FAT32.

Put the `.CAP` file in the **root** of the stick, not in a folder.

### 3. Write down your current settings

Boot into BIOS and photograph any screen you have changed. A flash resets everything to
defaults, including boot order. Your machine is in **Legacy/CSM mode**, and it needs to stay
that way until you reinstall Windows — otherwise it will not find your current drive.

### 4. Flash it

1. Restart and press **Delete** repeatedly as the ASUS logo appears.
2. Press **F7** for Advanced Mode.
3. Go to the **Tool** tab → **ASUS EZ Flash 3 Utility**.
   *(Your board has this — I can see "EZ Flash 3" printed on the PCB in your photos.)*
4. Choose **via Storage Device**, pick your USB stick, select the `.CAP` file.
5. Confirm. It verifies the file, then writes.

**Then leave it alone.** Two to three minutes. It will reboot once or twice on its own.

> **Do not** switch off, unplug, or press reset during the write. That is the one action that
> genuinely bricks the board. If you have had power cuts recently, plug the machine into a UPS
> or wait for a calm evening. This is the entire risk of the operation, and it is avoidable.

### 5. Afterwards

Enter BIOS again and set:

- **Boot order** back to your drive
- **CSM: still enabled** for now — your Windows install is MBR and needs it
- **DOCP: Enabled** — free speed, your memory is rated 2400 and running 2133

Boot into Windows and confirm with:

```powershell
Get-CimInstance Win32_BIOS | Format-List SMBIOSBIOSVersion, ReleaseDate
```

It should no longer say 3803.

### 6. Only now, swap the CPU

With the new BIOS in place the board recognises Zen 3, and the Ryzen 5600 drops into the same
socket using the same cooler.

---

## Risk, honestly

Modern EZ Flash is reliable. The realistic failure is a power cut mid-write, which is why the
warning above is the only one that matters.

Your board does **not** have USB BIOS Flashback — the feature that recovers a board with no
working CPU — so there is no safety net if you flash *after* fitting the new chip. That is why
the order is not negotiable.

If it does fail to POST afterwards: clear CMOS. Power off, unplug, move the `CLRTC` jumper on
the board for ten seconds (or pull the coin cell for a minute), put it back, power on. That
resets firmware settings and recovers most bad-setting situations.

---

## If you would rather not

Fair. It is the one step in this plan with a non-zero chance of a dead board.

Skipping it means skipping the CPU upgrade — the 1400 stays, and Windows 11 stays blocked. But
**the SSD still works, and the SSD is the actual fix for the freezing.** You can do that alone,
today, with no firmware risk at all, and get the large majority of the benefit.
