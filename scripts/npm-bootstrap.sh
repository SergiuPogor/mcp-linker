#!/usr/bin/env bash
# One-time bootstrap for the mcpl npm packages: publishes them by hand from a
# GitHub release, then registers the trusted publisher on each so later tags
# publish from CI over OIDC (no token). Needs `gh`, `npm login`, and 2FA.
#   scripts/npm-bootstrap.sh 0.1.0            # publish + bind
#   scripts/npm-bootstrap.sh 0.1.0 --dry-run  # download and pack only
set -euo pipefail

VERSION="${1:?usage: scripts/npm-bootstrap.sh <X.Y.Z> [--dry-run]}"
DRY="${2:-}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "error: version must be X.Y.Z" >&2; exit 1; }
cd "$(dirname "$0")/.."

REPO=milisp/mcp-linker
WORKFLOW=mcpl-release.yml
TAG="mcpl-v$VERSION"
# npm platform dir -> Rust target, as in the build matrix of $WORKFLOW
PLATFORMS=(
  "darwin-arm64 aarch64-apple-darwin"
  "darwin-x64 x86_64-apple-darwin"
  "linux-x64 x86_64-unknown-linux-musl"
  "linux-arm64 aarch64-unknown-linux-musl"
  "win32-x64 x86_64-pc-windows-msvc"
  "win32-arm64 aarch64-pc-windows-msvc"
)

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

for entry in "${PLATFORMS[@]}"; do
  read -r plat target <<< "$entry"
  name="mcpl-$VERSION-$target"
  bin=mcpl
  ext=tar.gz
  if [[ "$plat" == win32-* ]]; then bin=mcpl.exe; ext=zip; fi
  gh release download "$TAG" --repo "$REPO" --pattern "$name.$ext" --dir "$work"
  if [[ "$ext" == zip ]]; then unzip -q "$work/$name.$ext" -d "$work"; else tar xzf "$work/$name.$ext" -C "$work"; fi
  cp "$work/$name/$bin" "npm/platforms/$plat/$bin"
  chmod +x "npm/platforms/$plat/$bin"
done

node scripts/npm-version.cjs "$VERSION"

if [[ "$DRY" == "--dry-run" ]]; then
  for dir in npm/platforms/*/ npm/mcpl/; do (cd "$dir" && npm publish --access public --dry-run); done
  exit 0
fi

# Platform packages first: mcpl depends on them.
# Skips versions already on the registry, so a failed run can be re-run.
for dir in npm/platforms/*/ npm/mcpl/; do
  pkg="$(node -p "require('./$dir/package.json').name")"
  if npm view "$pkg@$VERSION" version >/dev/null 2>&1; then
    echo "skip $pkg@$VERSION: already published"
    continue
  fi
  (cd "$dir" && npm publish --access public)
done

# Not --env: the workflow's npm-publish job has no environment.
for dir in npm/platforms/*/ npm/mcpl/; do
  pkg="$(node -p "require('./$dir/package.json').name")"
  npm trust github "$pkg" --file "$WORKFLOW" --repo "$REPO" -y
done

# The binaries are build output, not source.
git status --short npm
