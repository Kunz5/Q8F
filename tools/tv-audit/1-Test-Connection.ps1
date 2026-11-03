# Check whether the TV is reachable and connected over SDB. Read-only.
. "$PSScriptRoot\_env.ps1"
Assert-Tools

Write-Host "Pinging $TV_IP ..." -NoNewline
if (Test-Connection -ComputerName $TV_IP -Count 1 -Quiet) { Write-Host " reachable" } else { Write-Host " NO PING (TV off or different IP?)"; return }

$devices = Invoke-Sdb @('devices')
if ($devices -notmatch [regex]::Escape($TV)) {
    Write-Host "Not in device list; connecting ..."
    Invoke-Sdb @('connect', $TV) | Write-Host
    $devices = Invoke-Sdb @('devices')
}
Write-Host $devices
Write-Host "State: $(Invoke-Sdb @('get-state'))"
