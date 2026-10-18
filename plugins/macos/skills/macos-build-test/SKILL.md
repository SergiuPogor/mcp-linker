---
name: macos-build-test
description: Build, run and test macOS apps and Swift packages from the command line with XcodeBuildMCP, xcodebuild and swift. Use when asked to build, launch, test or debug a macOS target, a Swift package, or a menu bar, AppKit or SwiftUI Mac app.
---

# Build and test macOS apps

Prefer the `XcodeBuildMCP` macOS tools from this plugin; use the CLI fallbacks below if it is unavailable.

## Build and run
- Discover: `xcodebuild -list -workspace App.xcworkspace` (or `-project`).
- Build: `xcodebuild -scheme App -destination 'platform=macOS' -derivedDataPath build/DerivedData build`
- Run: `open build/DerivedData/Build/Products/Debug/App.app`, or run the binary directly to see stdout.
- Logs: `log stream --predicate 'process == "App"' --level debug`

## Test
- App: `xcodebuild test -scheme App -destination 'platform=macOS' -resultBundlePath build/Test.xcresult`
- Swift package: `swift build` and `swift test` (add `--filter Name` for one test).
- Summarize failures: `xcrun xcresulttool get test-results summary --path build/Test.xcresult`

## macOS-specific gotchas
- App Sandbox: missing entitlements cause silent file or network failures; check the `.entitlements` file first.
- TCC permissions (Accessibility, Screen Recording, Full Disk Access) are granted per signed binary; rebuilding with a different signature can reset them.
- Ad hoc signed debug builds will not keep Keychain or TCC grants; set a development team.
- Menu bar apps: check `LSUIElement` in Info.plist before assuming the app failed to launch.

## Rules
- Do not hand-edit `project.pbxproj` unless there is no alternative.
- Keep build output in an ignored directory.
