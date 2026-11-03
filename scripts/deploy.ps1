# Installs dist\Q8F.wgt on the TV and opens it.
#   .\deploy.ps1                 install and launch
#   .\deploy.ps1 -Uninstall      remove Q8F from the TV
# TV address: pass -Tv, or set $env:Q8F_TV to avoid typing it each time.
param([string]$Tv = $(if ($env:Q8F_TV) { $env:Q8F_TV } else { '192.168.1.10:26101' }), [switch]$Uninstall)
. (Join-Path $PSScriptRoot '_tizen.ps1')
$root = Split-Path $PSScriptRoot -Parent

& $SDB connect $Tv | Out-Null
if ($Uninstall) { & $SDB -s $Tv uninstall Q8FHome001; return }

$wgt = Join-Path $root 'dist\Q8F.wgt'
if (-not (Test-Path $wgt)) { throw "Run build.ps1 first" }
# sdb install updates in place, keeping Q8F's saved settings; tz install uninstalls first.
$out = & $SDB -s $Tv install $wgt 2>&1
$out | Select-String 'install completed|fail|error' | ForEach-Object { $_.Line.Trim() }
if (-not ($out -match 'install completed')) { "sdb install failed; falling back to tz install"; & $TZ install -e $Tv -p $wgt }
& $TZ run -e $Tv -p Q8FHome001
