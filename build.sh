#!/bin/sh

# Exit on first error
set -e

# Create build directories
mkdir -p build

echo "🔧 Building for (ESM)..."
npx esbuild ts-layout.ts \
  --bundle \
  --format=esm \
  --outfile=build/ts-layout.esm.js

echo "🔧 Building (CJS)..."
npx esbuild ts-layout.ts \
  --bundle \
  --format=cjs \
  --outfile=build/ts-layout.cjs.js

echo "✅ Build complete!"
