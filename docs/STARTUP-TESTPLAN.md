# Q8F startup integration: findings and test plan

TV: Samsung QA55Q8FAAULXL, Tizen 10.0. Q8F 1.1, package `Q8FHome001`, installed in Developer Mode.

## Findings (Samsung developer documentation, read 1 Nov 2026)

| Question | Answer | Source |
|---|---|---|
| Documented auto-start at power-on for third-party apps? | None. No config.xml key, metadata or API. | Configuring Web Applications; Multitasking; Terminating Applications |
| Prelaunch (load in background at TV start)? | Documented as "not supported anymore since 2019 smart TV". | Prelaunching Applications |
| Default Home / Home-button replacement? | Not documented or supported for consumer TVs. The Home key always opens Samsung's Smart Hub. | No documentation offers it |
| Can a Developer Mode app take part in Autorun Last App? | Not documented either way. Must be tested on this TV. | Samsung support page describes the setting only |
| Lifecycle behaviours Q8F must follow | Multitasking (hide/resume via `visibilitychange`), exit confirmation on Return from the home page, no long-press Return registration. | Multitasking; Terminating Applications |

## What Q8F now does (documented features only)

- Pauses its background when hidden and resumes when shown (`visibilitychange`).
- Asks "Exit Q8F?" on Back from the home rail (Stay focused by default, Back = Stay).
- Remembers the page and focused app, so a cold launch reopens where you left off.
- Does not register long-press Return; does not touch system settings.

Not used: the SmartThings `custom.launchapp` script (`scripts/smartthings-autostart.ps1`). SmartThings staff
state that capability is undocumented, so it falls outside "documented only". It installs nothing unless run with `-Install`.

## Test plan (every step reversible)

Record before starting: Settings > All Settings > Advanced Features > Start Screen Option, the current state of
each switch. To revert, set them back. Q8F can be removed with `scripts\deploy.ps1 -Uninstall`.

| # | Test | Steps | Pass if |
|---|---|---|---|
| 1 | Autorun Last App, standby | Turn on Autorun Last App (Start with Smart Hub Home off). Open Q8F. Power off with the remote. Wait 30 s. Power on. | Q8F appears without pressing anything. |
| 2 | Autorun Last App, cold boot | With Q8F open, power off, unplug the TV for 60 s, plug in, power on. | Q8F appears. |
| 3 | Last app is not Q8F | Open YouTube from Q8F, power off from YouTube, power on. | Expected: YouTube reopens, not Q8F (documents the limit). |
| 4 | Standby resume state | Go to Apps page in Q8F, focus ZEE5, power off, power on (test 1 settings). | Q8F returns to the Apps page with ZEE5 focused. |
| 5 | Exit confirmation | On Q8F home, press Back until the rail opens, press Back again. | "Exit Q8F?" appears; Stay keeps Q8F open; Exit closes it. |
| 6 | Force exit | Long-press Back. | TV closes Q8F (system behaviour). |
| 7 | Home button | In Q8F press Home. Then pick Q8F from the home row. | Samsung home opens (expected, cannot be changed); Q8F reopens on the same page. |
| 8 | Exit an app launched from Q8F | Open Netflix from Q8F, exit Netflix with Back. | Record where you land (known so far: Samsung home). |

Record results in the table, then revert any settings you do not want to keep.

## Results on the Q8F

| # | Date | Result |
|---|---|---|
| 1 | 2 Nov 2026 | **Pass.** With Autorun Last App on, Q8F reopened after standby. A Developer Mode app does take part in Autorun Last App on this TV. |
| 2 | | Not yet run |
| 3–8 | | Not yet run |
