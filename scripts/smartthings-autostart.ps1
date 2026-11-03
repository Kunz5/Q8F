# Starts Q8F when the TV turns on, using a SmartThings rule (runs in Samsung's cloud).
#
#   .\smartthings-autostart.ps1 -Test      launch Q8F once through SmartThings (try this first)
#   .\smartthings-autostart.ps1 -Install   create the rule: TV turns on -> wait -> open Q8F
#   .\smartthings-autostart.ps1 -Remove    delete the rule
#
# Needs a SmartThings personal access token from https://account.smartthings.com/tokens with
# scopes: Devices (list, see, control), Locations (see), Rules (see, manage).
# The token is typed in at the prompt, used for this run only, and never saved.
param([switch]$Test, [switch]$Install, [switch]$Remove,
      [string]$AppId = 'Q8FHome001.Q8F', [int]$DelaySeconds = 8, [string]$TvName = '')
$ErrorActionPreference = 'Stop'
$RuleName = 'Q8F: open on TV power-on'

$secure = Read-Host 'SmartThings token' -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
$H = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
$API = 'https://api.smartthings.com/v1'

# Find the TV: the device that supports custom.launchapp (optionally matching -TvName)
$devices = (Invoke-RestMethod "$API/devices" -Headers $H).items
$tvs = $devices | Where-Object {
  ($_.components | ForEach-Object { $_.capabilities.id }) -contains 'custom.launchapp' -and
  (-not $TvName -or $_.label -like "*$TvName*")
}
if (-not $tvs) { throw 'No TV with app-launch support found in this SmartThings account.' }
$tv = @($tvs)[0]
"TV: $($tv.label)  ($($tv.deviceId))"

$launch = @{ component = 'main'; capability = 'custom.launchapp'; command = 'launchApp' }

if ($Test) {
  $body = @{ commands = @($launch + @{ arguments = @($AppId) }) } | ConvertTo-Json -Depth 6
  $r = Invoke-RestMethod "$API/devices/$($tv.deviceId)/commands" -Method Post -Headers $H -Body $body
  "Sent. SmartThings replied: $($r.results.status -join ', ')"
  'If Q8F opened on the TV, run again with -Install.'
  return
}

$existing = (Invoke-RestMethod "$API/rules?locationId=$($tv.locationId)" -Headers $H).items | Where-Object { $_.name -eq $RuleName }
if ($Remove) {
  foreach ($r in $existing) { Invoke-RestMethod "$API/rules/$($r.id)?locationId=$($tv.locationId)" -Method Delete -Headers $H | Out-Null; "Removed rule $($r.id)" }
  if (-not $existing) { 'No Q8F rule found.' }
  return
}

if ($Install) {
  foreach ($r in $existing) { Invoke-RestMethod "$API/rules/$($r.id)?locationId=$($tv.locationId)" -Method Delete -Headers $H | Out-Null }
  # When the TV's power switch changes to "on": wait for it to boot, then open Q8F
  $rule = @{
    name = $RuleName
    actions = @(@{
      if = @{
        equals = @{
          left = @{ device = @{ devices = @($tv.deviceId); component = 'main'; capability = 'switch'; attribute = 'switch' } }
          right = @{ string = 'on' }
        }
        changesOnly = $true
        then = @(
          @{ sleep = @{ duration = @{ value = @{ integer = $DelaySeconds }; unit = 'Second' } } },
          @{ command = @{ devices = @($tv.deviceId); commands = @($launch + @{ arguments = @(@{ string = $AppId }) }) } }
        )
      }
    })
  } | ConvertTo-Json -Depth 20
  $r = Invoke-RestMethod "$API/rules?locationId=$($tv.locationId)" -Method Post -Headers $H -Body $rule
  "Installed rule '$($r.name)' ($($r.id)). Turn the TV off and on to try it."
  return
}
'Choose -Test, -Install or -Remove.'
