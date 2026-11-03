# Locates a Tizen Studio installation without hard-coding a user name.
# Dot-source this:  . (Join-Path $PSScriptRoot '_tizen.ps1')
#
# Order of search:
#   1. $env:TIZEN_STUDIO                 (set this to override)
#   2. %USERPROFILE%\tizen-studio        (default for a per-user install)
#   3. C:\tizen-studio                   (default for a system-wide install)

function Get-TizenRoot {
    $candidates = @()
    if ($env:TIZEN_STUDIO) { $candidates += $env:TIZEN_STUDIO }
    if ($env:USERPROFILE)  { $candidates += (Join-Path $env:USERPROFILE 'tizen-studio') }
    $candidates += 'C:\tizen-studio'

    foreach ($c in $candidates) {
        if ($c -and (Test-Path (Join-Path $c 'tools\sdb.exe'))) { return $c }
    }
    throw ("Tizen Studio not found. Looked in:`n  " + ($candidates -join "`n  ") +
           "`nSet `$env:TIZEN_STUDIO to the install folder and try again.")
}

$TizenRoot = Get-TizenRoot
$SDB = Join-Path $TizenRoot 'tools\sdb.exe'
$TZ  = Join-Path $TizenRoot 'tools\tizen-core\tz.exe'
