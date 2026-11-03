# Launch or stop an app by package id. Intended for OUR OWN app.
#   .\5-Launch-StopApp.ps1 -PackageId ABCdef1234 -Action launch
#   .\5-Launch-StopApp.ps1 -PackageId ABCdef1234 -Action stop
param(
    [Parameter(Mandatory)][string]$PackageId,
    [ValidateSet('launch','stop')][string]$Action = 'launch'
)
. "$PSScriptRoot\_env.ps1"
Assert-Tools

if ($Action -eq 'launch') {
    Write-Host "Launching $PackageId ..."
    & $TZ run -e $TV -p $PackageId
    Write-Host "Exit code: $LASTEXITCODE"
} else {
    # The retail developer interface exposes app control through `shell 0 <verb>`.
    Write-Host "Stopping $PackageId ..."
    Invoke-Sdb @('shell', '0', 'kill', $PackageId) | Write-Host
}
