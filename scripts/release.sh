#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./release.sh v1.0.0"
  exit 1
fi

VERSION=$1
node scripts/bump.ts $VERSION

echo "Tag $VERSION created and pushed. GitHub Actions will now build and upload release artifacts."