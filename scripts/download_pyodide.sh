#!/usr/bin/env bash
set -euo pipefail

INDEX_URL="https://cdn.jsdelivr.net/pyodide/v0.24.1/full"
FILES=(pyodide.js pyodide.wasm pyodide_py.tar packages.json)

for f in "${FILES[@]}"; do
  echo "Downloading $f..."
  curl -L --fail "$INDEX_URL/$f" -o "$f"
done

echo "All files downloaded."
