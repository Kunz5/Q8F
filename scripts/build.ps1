# Packages Q8F/app into a signed .wgt using the active "tvlauncher" certificate profile.
#   .\build.ps1            -> Q8F\dist\Q8F.wgt
param([string]$Profile = 'tvlauncher')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '_tizen.ps1')
$root = Split-Path $PSScriptRoot -Parent
$app = Join-Path $root 'app'
$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null

# Short temp path: the signer and Windows dislike very long paths
$tmp = Join-Path $env:TEMP 'q8fbuild'
New-Item -ItemType Directory -Force $tmp | Out-Null
$unsigned = Join-Path $tmp 'Q8F-unsigned.wgt'
$zip = Join-Path $tmp 'Q8F-unsigned.zip'
if (Test-Path $zip) { Remove-Item $zip }
Compress-Archive -Path (Join-Path $app '*') -DestinationPath $zip
Copy-Item $zip $unsigned -Force

$out = Join-Path $dist 'Q8F.wgt'
& $TZ pack -t wgt -s $Profile -b $unsigned -o $out
if ($LASTEXITCODE -ne 0) { throw "Signing failed ($LASTEXITCODE)" }
"Built {0} ({1:N1} MB)" -f $out, ((Get-Item $out).Length / 1MB)
