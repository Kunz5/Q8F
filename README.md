# Q8F

A cinematic, liquid-glass launcher for the Samsung Q8F QLED (QA55Q8FAAULXL, Tizen 10.0).
It runs as a signed Tizen web app installed through Developer Mode.

- Shuffled, endless background of 46 night-city and landscape videos and photos
- Custom glass icons for YouTube, JioHotstar, SonyLIV, Prime Video, Netflix, ZEE5, Tata Play Binge and Stingray Karaoke
- Remote-only navigation: home carousel, Apps grid, Settings
- Hand-offs to Samsung Search and Samsung Settings
- Settings remembered between launches: background mode, clock format, six clock fonts, glass quality, motion

## Layout

| Path | What |
|---|---|
| `app/` | The Tizen web app: `config.xml`, `index.html`, `css/`, `js/`, `media/` |
| `app/js/media.js` | The background library (file, type, caption) |
| `scripts/build.ps1` | Packages and signs `app/` into `dist/Q8F.wgt` |
| `scripts/deploy.ps1` | Installs `dist/Q8F.wgt` on the TV and opens it; `-Uninstall` removes it |
| `scripts/fetch-media.ps1` | Downloads the backgrounds listed in `CREDITS.md` into `app/media` |
| `scripts/smartthings-autostart.ps1` | Optional, unofficial SmartThings launch test (see docs) |
| `tools/tv-audit/` | Read-only TV inspection scripts over SDB |
| `docs/` | TV capability audit and startup test plan |
| `CREDITS.md` | Sources for every photo and video |

## Requirements

- Windows with Tizen Studio 6.1 CLI tools (`sdb.exe`, `tools\tizen-core\tz.exe`). The scripts
  look in `$env:TIZEN_STUDIO`, then `%USERPROFILE%\tizen-studio`, then `C:\tizen-studio`.
- A Samsung certificate profile (made in Certificate Manager) that includes the TV's DUID.
  The scripts use the profile name `tvlauncher`. Certificates are **not** in this repo.
- The TV in Developer Mode with this PC's IP as the Host PC IP

## Backgrounds

The photos and videos are **not** in this repository. They come from Unsplash and
Pexels, which allow free use but not redistribution, so `CREDITS.md` records what
each file is and a script fetches them from the source:

```powershell
.\scripts\fetch-media.ps1               # all 46 files into app\media
.\scripts\fetch-media.ps1 -PhotosOnly   # the 33 photos, no API key needed
```

The 33 photos download straight from Unsplash. The 13 videos need a free
[Pexels API key](https://www.pexels.com/api/), because Pexels publishes no direct
file URL; the script asks for one, or reads `$env:PEXELS_API_KEY`. Without a key
the app still runs on photos alone.

`CREDITS.md` is the source of truth — add a row there and it gets fetched.
`app/media/` is git-ignored, so fetched files are never committed.

## Build and install

```powershell
.\scripts\build.ps1          # -> dist\Q8F.wgt (signed)
.\scripts\deploy.ps1         # install on the TV and open Q8F
.\scripts\deploy.ps1 -Uninstall
```

Set the TV address with `-Tv 192.168.1.x:26101`, or once via `$env:Q8F_TV`.

## Known limits on this TV

- Samsung does not let third-party apps start at power-on or replace the Home button.
- Q8F comes back after the remote's standby (Samsung Instant On keeps the last app). It does not survive a full power cut.
- Exiting a streaming app returns to Samsung's home screen, not Q8F; pin Q8F first on the home row.
- Apps get one hardware video decoder, so backgrounds play through a single `<video>` element.
- Live backdrop blur over video is costly; "Balanced" glass is the default.

Personal project. Third-party names and simplified logo marks belong to their owners and are used only
to label shortcuts on the owner's own TV.
