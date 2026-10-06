#!/usr/bin/env bash
# Renders the remaining Part 1 episodes, then joins all five into out/part1.mp4.
#
# Progress is appended to out/render.log as each episode finishes, so a long
# unattended run can be checked without waiting for the whole thing: Remotion
# only writes an episode's MP4 at the very end of that episode.
set -euo pipefail
cd "$(dirname "$0")/.."

LOG=out/render.log
: > "$LOG"

say() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

say "start — $# episode(s) to render"

for id in "$@"; do
  started=$(date +%s)
  say "rendering $id"
  npx remotion render "$id" "out/$id.mp4" --concurrency=4 --log=error
  secs=$(( $(date +%s) - started ))
  say "done $id in $((secs / 60))m$((secs % 60))s"
done

say "joining"
node scripts/concat.mjs out/part1.mp4 >>"$LOG" 2>&1
say "wrote out/part1.mp4"
