#!/bin/bash
#
# git-commit-both.sh
# Stages and commits changes in both root and specs/ directories using git -C
# to avoid directory changes and prevent repeated approval prompts.
#
# Usage:
#   scripts/git-commit-both.sh <commit-message> [extra-git-flags]
#   scripts/git-commit-both.sh [rootDir] [specsDir] <commit-message> [extra-git-flags]
#
# Examples:
#   scripts/git-commit-both.sh "T006"
#   scripts/git-commit-both.sh "T006, T007, T008"
#   scripts/git-commit-both.sh "T006" --no-verify
#   scripts/git-commit-both.sh . specs "T006"
#
# Exit codes:
#   0 - Success (at least one commit made or nothing to commit)
#   1 - Error during git operations

set -e  # Exit on error
set -u  # Exit on undefined variable

# Default directories
DEFAULT_ROOT="."
DEFAULT_SPECS="specs"

# Parse arguments
if [ $# -lt 1 ]; then
  echo "Error: commit message required" >&2
  echo "Usage: $0 <commit-message> [extra-git-flags]" >&2
  echo "   or: $0 [rootDir] [specsDir] <commit-message> [extra-git-flags]" >&2
  exit 1
fi

# Determine if first two args are directories
if [ $# -ge 3 ] && [ -d "$1" ] && [ -d "$2" ]; then
  ROOT_DIR="$1"
  SPECS_DIR="$2"
  shift 2
else
  ROOT_DIR="$DEFAULT_ROOT"
  SPECS_DIR="$DEFAULT_SPECS"
fi

COMMIT_MSG="$1"
shift

# Extra flags (e.g., --no-verify)
EXTRA_FLAGS=("$@")

# Function to commit if there are changes
commit_if_changes() {
  local dir="$1"
  local msg="$2"
  shift 2
  local flags=("$@")

  # Stage all changes
  git -C "$dir" add -A

  # Check if there are staged changes
  if git -C "$dir" diff --cached --quiet; then
    echo "[SKIP] No changes to commit in $dir"
    return 0
  fi

  # Commit with message and any extra flags
  if [ ${#flags[@]} -gt 0 ]; then
    if git -C "$dir" commit -m "$msg" "${flags[@]}"; then
      echo "[OK] Committed in $dir: $msg"
      return 0
    else
      echo "Error: Failed to commit in $dir" >&2
      return 1
    fi
  else
    if git -C "$dir" commit -m "$msg"; then
      echo "[OK] Committed in $dir: $msg"
      return 0
    else
      echo "Error: Failed to commit in $dir" >&2
      return 1
    fi
  fi
}

# Commit in root directory
if [ ${#EXTRA_FLAGS[@]} -gt 0 ]; then
  commit_if_changes "$ROOT_DIR" "$COMMIT_MSG" "${EXTRA_FLAGS[@]}"
else
  commit_if_changes "$ROOT_DIR" "$COMMIT_MSG"
fi
ROOT_STATUS=$?

# Commit in specs directory
if [ ${#EXTRA_FLAGS[@]} -gt 0 ]; then
  commit_if_changes "$SPECS_DIR" "$COMMIT_MSG" "${EXTRA_FLAGS[@]}"
else
  commit_if_changes "$SPECS_DIR" "$COMMIT_MSG"
fi
SPECS_STATUS=$?

# Exit with error if either commit failed
if [ $ROOT_STATUS -ne 0 ] || [ $SPECS_STATUS -ne 0 ]; then
  exit 1
fi

exit 0
