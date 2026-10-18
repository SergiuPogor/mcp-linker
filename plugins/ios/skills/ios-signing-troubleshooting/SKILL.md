---
name: ios-signing-troubleshooting
description: Diagnose iOS code signing, provisioning profile, entitlement and certificate errors from Xcode or xcodebuild. Use when a build, archive or export fails with signing errors, "No profiles found", "Provisioning profile doesn't include", or keychain problems.
---

# iOS signing troubleshooting

Work from evidence: capture the exact error text, then match it to a cause below.

## Inspect the current state
- Identities: `security find-identity -v -p codesigning`
- Installed profiles: `ls ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/` (older Xcode: `~/Library/MobileDevice/Provisioning Profiles/`)
- Decode a profile: `security cms -D -i file.mobileprovision` (check `TeamIdentifier`, `application-identifier`, `ExpirationDate`, `ProvisionedDevices`, entitlements)
- Signature of a built app: `codesign -dvv --entitlements - App.app`
- Project settings: `xcodebuild -showBuildSettings -scheme App | grep -E "CODE_SIGN|PROVISIONING|DEVELOPMENT_TEAM|PRODUCT_BUNDLE_IDENTIFIER"`

## Common errors
| Symptom | Likely cause and fix |
| --- | --- |
| "No profiles for 'com.x.y' were found" | Bundle ID not registered, or automatic signing is off. Enable automatic signing with the right team, or create the bundle ID and profile. |
| "Provisioning profile doesn't include signing certificate" | Profile was made with a different certificate. Regenerate it, or install the matching certificate with its private key. |
| "doesn't include the currently selected device" | Development profile lacks the device UDID. Register the device and regenerate. |
| "Entitlements not permitted" / capability mismatch | A capability in the entitlements file is not enabled on the App ID. Enable it, then regenerate the profile. |
| "No signing certificate found" | Missing identity or private key in the keychain. Import the `.p12` or create a new certificate. |
| `errSecInternalComponent` in CI | Keychain is locked. Run `security unlock-keychain`, then `security set-key-partition-list -S apple-tool:,apple: -s -k <pw> <keychain>`. |
| Expired certificate or profile | Check dates; renew and regenerate. |

## Fix with asc (optional)
`asc bundle-ids`, `asc certificates`, `asc profiles` and `asc devices` manage signing assets through the App Store Connect API (see `--help`; the asc skill pack has a signing-setup recipe).

## Rules
- Prefer Xcode automatic signing for development; use manual signing only for CI or when required.
- Never print or commit private keys, `.p12` files or passwords. Confirm before revoking certificates, which breaks other machines.
