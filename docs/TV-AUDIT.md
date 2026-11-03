# Samsung TV — Capability Audit

**Device:** Living room tv · QA55Q8FAAULXL (25_RSL_QTV_T10) · Tizen 10.0 · armv7 32-bit
**DUID:** *(redacted — identifies an individual set)* · **TV IP:** *(on the local network, port 26101)*
**Tools:** SDB 4.2.36 · Tizen CLI (tz) 10.3.9

## 1. Connection — works
`sdb devices` lists the TV as `device` state. `get-state`, `get-serialno`, `capability`,
`shell 0 getduid`, REST info at `http://<tv-ip>:8001/api/v2/` all respond.
Note: the first SDB call after the TV has been idle can stall; a retry succeeds.

## 2. What the developer interface allows (read-only, confirmed)
| Action | Works? | How |
|---|---|---|
| Device info | Yes | `capability`, REST `api/v2` |
| App listing | Yes | `shell 0 applist` → 528 apps |
| Device log | Yes | `dlog` |
| Port forward/reverse | Yes | `forward`, `reverse` |
| Install / launch / stop OUR signed app | Yes | `tz install` / `tz run` / `shell 0 kill` |
| Debug our app | Yes | `netcoredbg_support`, `pkgcmd_debugmode` enabled |

## 3. What retail firmware blocks (confirmed by testing)
| Blocked | Evidence |
|---|---|
| Interactive / arbitrary shell | `intershell_support:disabled`; `shell ls /`, `cat`, `id`, `uname`, `df`, `free` all return empty |
| Filesystem read outside app sandbox | `pull /etc/os-release` → "You cannot pull files from this path" |
| Root access | `sdbd_rootperm:disabled`, `rootonoff_support:disabled` |
| Storage / performance stats | `df`/`free` produce no output |
| Encryption control | `encryption_support:disabled` |
| Generic app command channel | `appcmd_support:disabled` |

The developer link is a **signed-app sandbox**: it can manage apps we build and sign,
but cannot read the system, run shell commands, or touch protected partitions.

## 4. Applications (528 total)
- **~28 store/user apps** — removable through official Settings (hold center button → Remove):
  YouTube, SonyLIV, ZEE5, Spotify, JioHotstar, Tata Play Binge, Lionsgate Play,
  Perplexity, Stingray Karaoke, FlexIt, and others.
- **~462 Samsung/Tizen system apps** — protected; not removable via Settings and not
  uninstallable over SDB (platform-signed). Includes the ad/promo/telemetry set below.

### Ad / promo / telemetry apps (protected — cannot be removed)
`adplatform.ADPlayer` · `com.samsung.tv.adplayer` · `com.samsung.tv.adagent-service` ·
`com.samsung.tv.coba.adagent` · `com.samsung.tv.targeted-ad-service` ·
`yL49PNFmjW.PromotionApp` (Samsung Promotion) · `yL49PNFmjW.service` (PromotionService) ·
`Samsung TV Plus` · `com.samsung.tizen.samsung-analytics` · Bixby suite · AICompanion · GamingHub.

These are the sources of most on-screen ads and sponsored tiles. Because they are
platform-protected, they can only be **neutralized** (settings + DNS blocking), not deleted,
without rooting.

## 5. Bottom line
- We can build, sign, install, launch, stop and debug our own Tizen apps. A custom
  launcher app is feasible.
- We cannot remove Samsung's ad/promo apps or replace the home screen through this
  interface. That needs the TV's own Settings plus network-level ad blocking.
- Root is disabled at the daemon level and is not pursued (see below).

## Reusable scripts (this folder)
`1-Test-Connection.ps1` · `2-Get-DeviceInfo.ps1` · `3-Get-Apps.ps1` ·
`4-Install-App.ps1` · `5-Launch-StopApp.ps1` · `6-Collect-Logs.ps1` ·
`7-Wait-AfterRestart.ps1` (shared helpers in `_env.ps1`).
