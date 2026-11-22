#!/usr/bin/env bash
# Runs this repo's GitHub Actions workflows locally with `act` on Colima's Docker (no GitHub minutes).
# Usage: scripts/ci-local.sh [event=pull_request] [extra act args…]   e.g. scripts/ci-local.sh pull_request -j verify
set -euo pipefail
cd "$(dirname "$0")/.."

command -v act >/dev/null || { echo "act missing: brew install act" >&2; exit 1; }
command -v colima >/dev/null || { echo "colima missing: brew install colima" >&2; exit 1; }

# Docker endpoint: $CI_DOCKER_HOST if set, else the first answering socket of a running Colima profile,
# CI profiles (*-ci) first. Never starts or restarts a VM: other projects' containers live there.
alive() { DOCKER_HOST="$1" docker info >/dev/null 2>&1; }
pick_docker_host() {
  if [ -n "${CI_DOCKER_HOST:-}" ]; then alive "$CI_DOCKER_HOST" && { echo "$CI_DOCKER_HOST"; return; }; fi
  local root="${COLIMA_HOME:-$HOME/.colima}" profiles socket
  profiles=$(colima list 2>/dev/null | awk 'NR>1 && $2=="Running" {print $1}' | sort -t- -k2 -r)
  for profile in $(echo "$profiles" | grep -- '-ci$'; echo "$profiles" | grep -v -- '-ci$'); do
    for socket in "$root/$profile/docker.sock" "$root/docker.sock" "$root/wf-docker.sock"; do
      [ -S "$socket" ] && alive "unix://$socket" && { echo "unix://$socket"; return; }
    done
  done
  return 1
}
DOCKER_HOST=$(pick_docker_host) || { echo "No answering Colima Docker socket (colima list; set CI_DOCKER_HOST)" >&2; exit 1; }
export DOCKER_HOST
echo "── docker: ${DOCKER_HOST}"
image="catthehacker/ubuntu:act-latest"
docker image inspect "$image" >/dev/null 2>&1 || docker pull --platform linux/arm64 "$image"
event="${1:-pull_request}"
[ $# -gt 0 ] && shift

# Native arm64 runner image on Apple Silicon (Node, npm, git preinstalled), reused between runs.
# Only CI workflows: release/deploy workflows need real secrets and must never run from a laptop.
# Jobs run one at a time: parallel matrix jobs race on act's shared action cache (~/.cache/act).
# Every workflow runs even if one fails; the exit code reports the overall result.
status=0
for workflow in .github/workflows/ci.yml .github/workflows/security-clean-verification.yml; do
  [ -f "$workflow" ] || continue
  echo "── act ${event} · ${workflow}"
  act "$event" \
    --concurrent-jobs 1 \
    --workflows "$workflow" \
    --platform "ubuntu-latest=${image}" \
    --container-architecture linux/arm64 \
    --pull=false \
    --rm \
    "$@" || status=1
done
echo "── local CI: $([ $status -eq 0 ] && echo PASS || echo FAIL)"
exit $status
