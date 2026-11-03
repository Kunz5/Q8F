# Shared environment for Samsung TV developer scripts.
# Dot-source this from the other scripts:  . "$PSScriptRoot\_env.ps1"

. (Join-Path $PSScriptRoot '..\..\scripts\_tizen.ps1')

# TV address on your own network. Set $env:Q8F_TV_IP, or edit the example below.
$TV_IP   = if ($env:Q8F_TV_IP) { $env:Q8F_TV_IP } else { '192.168.1.10' }
$TV_PORT = 26101
$TV      = "$TV_IP`:$TV_PORT"

function Assert-Tools {
    foreach ($t in @($SDB, $TZ)) {
        if (-not (Test-Path $t)) { throw "Tool not found: $t" }
    }
}

# Run an sdb sub-command against the TV, returning its text output.
# Kills the call after $TimeoutSec so a locked-down command can't hang the script.
function Invoke-Sdb {
    param([string[]]$SdbArgs, [int]$TimeoutSec = 15)
    $psi = [Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $SDB
    $psi.Arguments = (@('-s', $TV) + $SdbArgs) -join ' '
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow  = $true
    $p = [Diagnostics.Process]::Start($psi)
    if (-not $p.WaitForExit($TimeoutSec * 1000)) { $p.Kill(); return "[timeout after ${TimeoutSec}s]" }
    ($p.StandardOutput.ReadToEnd() + $p.StandardError.ReadToEnd()).Trim()
}
