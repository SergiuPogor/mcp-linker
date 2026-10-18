---
name: ios-testflight-release
description: Archive an iOS app, upload it to TestFlight and submit it to the App Store using the asc (App Store Connect) CLI, with a pre-release checklist. Use when asked to ship, release, upload a build, distribute a beta, or submit to App Review.
---

# TestFlight and App Store release

Uses the [`asc`](https://asccli.sh) CLI (`brew install asc`). For deeper per-task recipes, install its skill pack: `npx skills add rorkai/app-store-connect-cli-skills` (or `asc install-skills`).

## 0. Auth (once)
Create an App Store Connect API key (Users and Access, Integrations), then run
`asc auth login --key-id KEY_ID --issuer-id ISSUER_ID --private-key /path/AuthKey_KEYID.p8` and verify with `asc auth doctor`. Never commit the `.p8` file or paste its contents into chat.

## 1. Pre-flight checklist
- Version (`CFBundleShortVersionString`) is new; build number (`CFBundleVersion`) is higher than every uploaded build.
- Release scheme builds cleanly and tests pass (see `ios-simulator-build-run`).
- Privacy manifest, required usage-description strings, and export-compliance answer (`ITSAppUsesNonExemptEncryption`) are present.
- Bundle ID, capabilities and signing are valid (see `ios-signing-troubleshooting`).
- App icon (1024 px, no alpha), screenshots, description, privacy policy URL and review notes are ready.

## 2. Build and upload
- Find the app: `asc apps list --output table`.
- Archive, export and upload in one flow: `asc publish testflight --help` lists the local-build flags (`--archive-path`, `--export-options`, `--group`, `--wait`). Or go stepwise with `asc xcode archive` and `asc xcode export`, then upload the IPA.
- Wait for processing: use `--wait`, or check `asc builds --help` for listing builds.

## 3. Distribute the beta
Add the processed build to a group: `asc builds add-groups --build-id BUILD_ID --group GROUP_ID`. Write test notes with `asc builds test-notes create --build-id BUILD_ID --locale en-US --whats-new "..."`.

## 4. App Store submission
Use `asc status --app APP_ID` for the release dashboard and `asc versions --help` for version, metadata and submission commands. If validation blocks or App Review rejects, read the message, fix the cause, then resubmit; do not retry blindly.

## Rules
- Confirm with the user before any command that submits for review, releases to customers or deletes data.
- Use `--output json` when parsing results and prefer IDs over names.
