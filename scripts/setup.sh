#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node $(cat .nvmrc) and rerun this script."
  exit 1
fi

EXPECTED_NODE="$(cat .nvmrc)"
CURRENT_NODE="$(node -v | sed 's/^v//')"

if [[ "$CURRENT_NODE" != "$EXPECTED_NODE" ]]; then
  echo "Expected Node.js $EXPECTED_NODE but found $CURRENT_NODE."
  echo "Tip: run 'nvm use' before continuing."
fi

echo "Installing workspace dependencies..."
npm install

if [[ ! -f apps/web/.env.local && -f apps/web/.env.local.example ]]; then
  cp apps/web/.env.local.example apps/web/.env.local
  echo "Created apps/web/.env.local from the example file."
fi

echo
echo "Setup complete."
echo "Next steps:"
echo "  1. Update apps/web/.env.local with your Supabase values."
echo "  2. Run npm run dev"
