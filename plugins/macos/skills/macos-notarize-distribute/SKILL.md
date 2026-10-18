---
name: macos-notarize-distribute
description: Sign with Developer ID, notarize with Apple, staple and package a macOS app as a DMG or ZIP for distribution outside the Mac App Store, using codesign and the asc CLI. Use when asked to notarize, staple, or ship a Mac app directly.
---

# Notarize and distribute a macOS app

Needs a "Developer ID Application" certificate and App Store Connect API credentials. Install the CLI with `brew install asc` (docs: https://asccli.sh) and authenticate with `asc auth login`.

## Steps
1. **Archive and export** with the Developer ID method: `xcodebuild archive -scheme App -archivePath build/App.xcarchive`, then `xcodebuild -exportArchive` with an ExportOptions.plist whose `method` is `developer-id`.
2. **Verify signing and hardened runtime**:
   - `codesign --verify --deep --strict --verbose=2 App.app`
   - `codesign -dvv App.app` should show `flags=0x10000(runtime)`.
3. **Package**: `ditto -c -k --keepParent App.app App.zip`, or build a DMG (`hdiutil create`, or a tool such as `create-dmg`) and sign it with `codesign`.
4. **Notarize**: `asc notarization submit --file ./App.zip --wait`. On failure read the log: `asc notarization log --id SUBMISSION_ID`.
5. **Staple** (an app or DMG, not a ZIP): `asc notarization staple --file ./App.dmg --confirm`.
6. **Validate as a user would**: `spctl --assess --type execute --verbose App.app` and `xcrun stapler validate App.dmg`.

## Frequent notarization failures
- Missing hardened runtime: set `ENABLE_HARDENED_RUNTIME = YES`.
- Unsigned nested binaries or frameworks: sign inner code first, then the bundle (avoid relying on `--deep` for signing).
- Missing secure timestamp: pass `--timestamp` to `codesign`.
- Disallowed entitlements such as `get-task-allow`: remove them from release builds.

## Rules
- Never expose certificate passwords or API private keys. Confirm before publishing a build to users.
