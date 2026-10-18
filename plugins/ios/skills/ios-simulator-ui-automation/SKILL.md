---
name: ios-simulator-ui-automation
description: Drive a booted iOS Simulator like a user with the axe CLI (describe-ui, tap, swipe, type, screenshot, record-video) to verify UI flows, reproduce bugs and capture screenshots. Use when asked to tap, scroll, type into, screenshot or smoke-test a running iOS app.
---

# Drive the iOS Simulator with axe

`axe` talks to a booted simulator through HID and the accessibility APIs. Install: `brew install cameroncooke/axe/axe`. Every command needs `--udid <UDID>`; get it from `axe list-simulators` or `xcrun simctl list devices booted`.

## Core loop
1. **Read the screen**: `axe describe-ui --udid $UDID` returns the real element tree (labels, identifiers, frames). Read coordinates from it; never guess pixels from a screenshot.
2. **Act**: prefer selectors over coordinates because they survive layout changes.
   - `axe tap --label "Sign In" --udid $UDID` (also `--id`, `--value`, `--element-type Button`)
   - `axe tap -x 200 -y 400 --udid $UDID` when no accessibility label exists
   - `axe type "hello@example.com" --udid $UDID` after focusing a text field
   - `axe swipe` from one point to another to scroll (see `axe swipe --help` for the flags)
   - `axe button`, `axe gesture` (presets), `axe key`, `axe key-combo` for hardware buttons and keyboards
3. **Observe**: `axe describe-ui` again, plus `axe screenshot --udid $UDID` (writes a PNG; see `axe screenshot --help` for the output option).
4. **Repeat** until the flow is verified.

Use `--wait-timeout` on `tap` when a screen is still animating. `axe <subcommand> --help` is the source of truth for flags.

## Batch a sequence
`axe batch` runs ordered steps in one HID session, which is faster and more reliable than many separate calls. See `axe batch --help` for the step syntax.

## Recording
`axe record-video --udid $UDID` records the display to MP4 (see `--help` for output and stopping). Useful as evidence for a bug report or PR.

## Tips
- Add `accessibilityIdentifier` values to the views you automate; it makes `--id` selectors stable.
- If `describe-ui` returns nothing, confirm the simulator is booted and the app is in the foreground.
- The `ios-simulator` MCP server in this plugin exposes similar tap, swipe, type and screenshot tools when a shell is not available.
