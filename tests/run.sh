#!/bin/bash
# Run the Arrow.js skill test harness
# Usage:
#   ./tests/run.sh                     # run all tests
#   ./tests/run.sh --pattern accordion # run one test
#   ./tests/run.sh --dry-run           # print prompts, skip claude

cd ~/Projects/arrow-lab
npx tsx tests/harness.ts "$@"
