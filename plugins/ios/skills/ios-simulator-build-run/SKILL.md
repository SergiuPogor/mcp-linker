---
name: ios-simulator-build-run
description: Build an iOS app and run it on the Simulator, then read build errors, logs and screenshots. Use when asked to build, run, launch, test or debug an iOS/iPadOS app, or when xcodebuild fails.
---

# Build and run on the iOS Simulator

Prefer the `XcodeBuildMCP` tools from this plugin; fall back to `xcodebuild` and `xcrun simctl` when the MCP server is unavailable.

## Workflow
1. **Discover**: find the `.xcworkspace` / `.xcodeproj` (prefer the workspace when both exist), then list schemes and available simulators. CLI fallback:
   - `xcodebuild -list -workspace App.xcworkspace`
   - `xcrun simctl list devices available`
2. **Pick a destination**: choose one simulator and reuse it for the whole session. Boot it if needed (`xcrun simctl boot <UDID>`).
3. **Build**: with the MCP server use its simulator build tools. CLI fallback:
   ```
   xcodebuild -workspace App.xcworkspace -scheme App \
     -destination 'platform=iOS Simulator,id=<UDID>' \
     -derivedDataPath build/DerivedData build
   ```
4. **Install and launch**: use the MCP build-and-run tool, or
   `xcrun simctl install <UDID> <path/to/App.app>` then `xcrun simctl launch <UDID> <bundle-id>`.
5. **Verify**: take a screenshot (`xcrun simctl io <UDID> screenshot out.png`) and capture logs
   (`xcrun simctl spawn <UDID> log stream --predicate 'subsystem == "<bundle-id>"'`).
   To interact with the running app, switch to the `ios-simulator-ui-automation` skill.

## Reading failures
- Read the first `error:` line, not the last; later errors are usually cascades.
- Filter raw output with `grep -E "error:|warning:|\*\* BUILD"`, or pipe through `xcbeautify` if installed.
- "No such module": resolve packages (`xcodebuild -resolvePackageDependencies`) and rebuild for the same destination.
- Signing errors on a simulator build: add `CODE_SIGNING_ALLOWED=NO`. For device or archive signing see `ios-signing-troubleshooting`.
- Stale state: delete the derived data folder you passed with `-derivedDataPath` before blaming the code.

## Tests
`xcodebuild test -workspace ... -scheme ... -destination 'platform=iOS Simulator,id=<UDID>' -resultBundlePath build/Test.xcresult`
then inspect failures with `xcrun xcresulttool get test-results summary --path build/Test.xcresult`.

## Rules
- Never hand-edit `project.pbxproj` unless there is no alternative; prefer Xcode, XcodeGen or Tuist configuration.
- Keep derived data inside the repo's ignored build directory so runs stay reproducible.
