# Collect a device log snapshot to a timestamped file. Read-only.
#   .\6-Collect-Logs.ps1 -Seconds 15
param([int]$Seconds = 15)
. "$PSScriptRoot\_env.ps1"
Assert-Tools

$out = Join-Path $PSScriptRoot ("dlog_{0:yyyyMMdd_HHmmss}.txt" -f (Get-Date))
Write-Host "Capturing dlog for $Seconds s -> $out"
$p = Start-Process -FilePath $SDB -ArgumentList @('-s', $TV, 'dlog', '-v', 'time') `
        -RedirectStandardOutput $out -NoNewWindow -PassThru
Start-Sleep -Seconds $Seconds
if (-not $p.HasExited) { $p.Kill() }
Write-Host "Captured $((Get-Item $out).Length) bytes."
