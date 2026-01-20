#!/usr/bin/env bash
set -euo pipefail

pnpm test:coverage
pnpm build
pnpm publish
