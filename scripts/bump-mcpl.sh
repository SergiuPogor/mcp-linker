#!/usr/bin/env bash
# Bumps the mcpl CLI version (crate and npm packages), commits, and tags
# mcpl-vX.Y.Z. Push the tag to run the mcpl release workflow.
#   scripts/bump-mcpl.sh 0.2.0 && git push origin HEAD mcpl-v0.2.0
set -euo pipefail

VERSION="${1:?usage: scripts/bump-mcpl.sh <X.Y.Z>}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "error: version must be X.Y.Z" >&2; exit 1; }
cd "$(dirname "$0")/.."
git diff --quiet --exit-code || { echo "error: commit or stash your changes first" >&2; exit 1; }

# awk, not `sed 0,/re/`: that range form is GNU-only and silently does nothing on macOS.
manifest=src-tauri/crates/mcpl/Cargo.toml
awk -v ver="$VERSION" '!done && /^version = "/ { sub(/^version = ".*"/, "version = \"" ver "\""); done = 1 } { print }' \
  "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"
(cd src-tauri && cargo update -p mcpl --quiet)
node scripts/npm-version.cjs "$VERSION"

git add "$manifest" src-tauri/Cargo.lock npm
git commit -m "chore: release mcpl ${VERSION}"
git tag "mcpl-v${VERSION}"
echo "Tagged mcpl-v${VERSION}. Push with: git push origin HEAD mcpl-v${VERSION}"
