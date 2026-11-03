# Gather device information. Read-only.
. "$PSScriptRoot\_env.ps1"
Assert-Tools

Write-Host "=== SDB capability ==="
Invoke-Sdb @('capability') | Write-Host

Write-Host "`n=== REST device info ==="
try {
    $info = (Invoke-WebRequest "http://$TV_IP`:8001/api/v2/" -UseBasicParsing -TimeoutSec 6).Content | ConvertFrom-Json
    $info.device | Select-Object name, modelName, model, OS, resolution,
        networkType, developerMode, developerIP, PowerState, wifiMac | Format-List
} catch {
    Write-Host "REST info unavailable: $($_.Exception.Message)"
}
