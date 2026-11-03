# List applications visible to the developer interface. Read-only.
. "$PSScriptRoot\_env.ps1"
Assert-Tools

$raw = Invoke-Sdb @('shell', '0', 'applist') -TimeoutSec 20
$rows = foreach ($line in ($raw -split "`n")) {
    if ($line -match "'([^']*)'\s+'([^']+)'") {
        [pscustomobject]@{
            Name  = $Matches[1]
            AppId = $Matches[2]
            Kind  = if ($Matches[2] -match '^[A-Za-z0-9]{10}\.') { 'store' }
                    elseif ($Matches[2] -match '^(com\.samsung|org\.tizen|samsung)') { 'samsung/tizen' }
                    else { 'other' }
        }
    }
}
Write-Host "Total apps: $($rows.Count)"
$rows | Group-Object Kind | ForEach-Object { Write-Host ("  {0,-14} {1}" -f $_.Name, $_.Count) }
$csv = Join-Path $PSScriptRoot 'apps.csv'
$rows | Sort-Object Kind, Name | Export-Csv $csv -NoTypeInformation
Write-Host "Full list written to $csv"
