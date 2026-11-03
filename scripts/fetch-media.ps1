<#
.SYNOPSIS
  Downloads the background videos and photos listed in CREDITS.md into app/media.

.DESCRIPTION
  The media is not kept in this repository. The files come from Pexels and
  Unsplash, whose licences allow free use but not redistribution, so CREDITS.md
  records what each file is and this script fetches it from the source.

  CREDITS.md is the single source of truth: add a row there and it is fetched.

  Photos come straight from images.unsplash.com and need nothing.
  Videos need a free Pexels API key, because Pexels publishes no direct file
  URL. Get one at https://www.pexels.com/api/ (takes a minute, no payment).
  Pass it with -PexelsKey, set $env:PEXELS_API_KEY, or let the script ask.

.EXAMPLE
  .\fetch-media.ps1                    # photos, then videos if a key is given
  .\fetch-media.ps1 -PhotosOnly        # skip the videos and the key entirely
  .\fetch-media.ps1 -Force             # re-download files already present
#>
param(
    [string]$PexelsKey = $env:PEXELS_API_KEY,
    [switch]$PhotosOnly,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$root    = Split-Path $PSScriptRoot -Parent
$credits = Join-Path $root 'CREDITS.md'
$outDir  = Join-Path $root 'app\media'
if (-not (Test-Path $credits)) { throw "CREDITS.md not found at $credits" }
New-Item -ItemType Directory -Force $outDir | Out-Null

$text   = Get-Content $credits -Raw
$videos = [regex]::Matches($text, '(?m)^\|\s*([\w.\-]+\.mp4)\s*\|\s*(\d+)')
$photos = [regex]::Matches($text, '(?m)^\|\s*([\w.\-]+\.jpg)\s*\|\s*(photo-[\w\-]+)')
"CREDITS.md lists {0} videos and {1} photos." -f $videos.Count, $photos.Count

$ok = 0; $skipped = 0; $failed = @()

function Save-File {
    param([string]$Url, [string]$Name, [hashtable]$Headers)
    $dest = Join-Path $outDir $Name
    if ((Test-Path $dest) -and -not $Force) {
        Write-Host ("  skip  {0} (already here)" -f $Name); $script:skipped++; return
    }
    try {
        $p = @{ Uri = $Url; OutFile = $dest; UseBasicParsing = $true; TimeoutSec = 120 }
        if ($Headers) { $p.Headers = $Headers }
        Invoke-WebRequest @p
        $mb = (Get-Item $dest).Length / 1MB
        Write-Host ("  got   {0} ({1:N1} MB)" -f $Name, $mb)
        $script:ok++
    } catch {
        Write-Host ("  FAIL  {0} - {1}" -f $Name, $_.Exception.Message) -ForegroundColor Yellow
        if (Test-Path $dest) { Remove-Item $dest -Force }   # no half files
        $script:failed += $Name
    }
}

# ---- photos -------------------------------------------------------------
"`nPhotos (Unsplash):"
foreach ($m in $photos) {
    $name = $m.Groups[1].Value; $id = $m.Groups[2].Value
    Save-File "https://images.unsplash.com/$id`?auto=format&fit=crop&w=1920&q=80" $name $null
}

# ---- videos -------------------------------------------------------------
if ($PhotosOnly) {
    "`nVideos: skipped (-PhotosOnly)."
} else {
    if (-not $PexelsKey) {
        "`nVideos need a free Pexels API key - https://www.pexels.com/api/"
        $secure = Read-Host 'Pexels API key (blank to skip videos)' -AsSecureString
        $PexelsKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
                     [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    }
    if (-not $PexelsKey) {
        "Videos skipped - no key given. The app runs on photos alone."
    } else {
        "`nVideos (Pexels):"
        $H = @{ Authorization = $PexelsKey }
        foreach ($m in $videos) {
            $name = $m.Groups[1].Value; $id = $m.Groups[2].Value
            $dest = Join-Path $outDir $name
            if ((Test-Path $dest) -and -not $Force) {
                Write-Host ("  skip  {0} (already here)" -f $name); $skipped++; continue
            }
            try {
                $info = Invoke-RestMethod "https://api.pexels.com/videos/videos/$id" -Headers $H -TimeoutSec 60
                # Largest H.264 file no taller than 1080, which is what the TV wants.
                $pick = $info.video_files |
                        Where-Object { $_.height -le 1080 -and $_.file_type -eq 'video/mp4' } |
                        Sort-Object height -Descending | Select-Object -First 1
                if (-not $pick) { $pick = $info.video_files | Sort-Object height | Select-Object -First 1 }
                if (-not $pick) { throw "no downloadable file listed for video $id" }
                Save-File $pick.link $name $null
            } catch {
                Write-Host ("  FAIL  {0} (id {1}) - {2}" -f $name, $id, $_.Exception.Message) -ForegroundColor Yellow
                $failed += $name
            }
        }
    }
}

# ---- summary ------------------------------------------------------------
"`n{0} downloaded, {1} already present, {2} failed." -f $ok, $skipped, $failed.Count
if ($failed.Count) {
    "Failed: " + ($failed -join ', ')
    "A source may have been withdrawn. Check its page, then edit CREDITS.md and media.js together."
    exit 1
}
"Media is in app\media. It is git-ignored and is never committed."
