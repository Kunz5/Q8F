# Wait for the TV to come back after a restart, then reconnect SDB. Read-only.
#   .\7-Wait-AfterRestart.ps1 -TimeoutSec 180
param([int]$TimeoutSec = 180)
. "$PSScriptRoot\_env.ps1"
Assert-Tools

$deadline = (Get-Date).AddSeconds($TimeoutSec)
Write-Host "Waiting up to $TimeoutSec s for $TV_IP ..."
while ((Get-Date) -lt $deadline) {
    if (Test-Connection -ComputerName $TV_IP -Count 1 -Quiet) {
        # Developer port must also accept a connection before SDB can attach.
        $sock = [Net.Sockets.TcpClient]::new()
        try { $null = $sock.ConnectAsync($TV_IP, $TV_PORT).Wait(2000) } catch {}
        if ($sock.Connected) {
            $sock.Close()
            Invoke-Sdb @('connect', $TV) | Write-Host
            Invoke-Sdb @('devices') | Write-Host
            Write-Host "Reconnected."
            return
        }
        $sock.Close()
    }
    Start-Sleep -Seconds 4
}
Write-Host "Timed out; TV not reachable yet."
