# Install one of OUR OWN signed .wgt packages onto the TV.
# Writes only this app; installs nothing it is not given on the command line.
#   .\4-Install-App.ps1 -Wgt "C:\path\to\myapp.wgt"
param([Parameter(Mandatory)][string]$Wgt)
. "$PSScriptRoot\_env.ps1"
Assert-Tools
if (-not (Test-Path $Wgt)) { throw "Package not found: $Wgt" }

Write-Host "Installing $Wgt -> $TV"
# tz install pushes and installs the package via the developer interface.
& $TZ install -e $TV -p $Wgt
Write-Host "Exit code: $LASTEXITCODE"
