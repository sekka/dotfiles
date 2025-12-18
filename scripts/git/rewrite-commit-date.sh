#!/usr/bin/env bash
#
# Rewrites the Author Date and/or Committer Date of a specific commit using git-filter-branch.
# WARNING: This script rewrites Git history. Use with caution.
#
# Usage:
#   rewrite-commit-date [--committer-date-now] <COMMIT_HASH> "NEW_DATE"
#
# Options:
#   --committer-date-now  Use the current time as the committer date, and set only the author date to NEW_DATE.
#
# By default, both Author Date and Committer Date are rewritten to NEW_DATE.
#

set -euo pipefail

# --- Pre-flight Checks ---
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Your working directory is not clean. Please commit or stash your changes." >&2
  exit 1
fi

# --- Argument Parsing & Env Filter Setup ---
usage() {
    echo "Usage: $(basename "$0") [--committer-date-now] <COMMIT_HASH> <\"NEW_DATE\">" >&2
    echo "" >&2
    echo "Examples:" >&2
    echo "  # Set both author and committer date to a specific time" >&2
    echo "  $(basename "$0") 1a2b3c4d \"2024-01-01 10:30:00\"" >&2
    echo "" >&2
    echo "  # Set only author date, committer date becomes now" >&2
    echo "  $(basename "$0") --committer-date-now 1a2b3c4d \"2024-01-01 10:30:00\"" >&2
    exit 1
}


ENV_FILTER=""
TARGET_COMMIT=""
NEW_DATE=""

if [[ "$1" == "--committer-date-now" ]]; then
    if [[ "$#" -ne 3 ]]; then
        usage
    fi
    TARGET_COMMIT=$(git rev-parse "$2")
    NEW_DATE="$3"
    NEW_COMMITTER_DATE=$(date -R)
    ENV_FILTER="
if [ \"\$GIT_COMMIT\" = \"${TARGET_COMMIT}\" ]; then
    export GIT_AUTHOR_DATE='${NEW_DATE}';
    export GIT_COMMITTER_DATE='${NEW_COMMITTER_DATE}';
fi
"
else
    if [[ "$#" -ne 2 ]]; then
        usage
    fi
    TARGET_COMMIT=$(git rev-parse "$1")
    NEW_DATE="$2"
    ENV_FILTER="
if [ \"\$GIT_COMMIT\" = \"${TARGET_COMMIT}\" ]; then
    export GIT_AUTHOR_DATE='${NEW_DATE}';
    export GIT_COMMITTER_DATE='${NEW_DATE}';
fi
"
fi

# --- Main Logic ---

echo "⚠️ WARNING: HISTORY REWRITING with 'git filter-branch'"
echo "This will rewrite history for all branches and tags."
echo "This operation is destructive. It is STRONGLY recommended to back up your repository first."
echo -n "Are you sure you want to proceed? (y/N): "
read -r -n 1
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Execute filter-branch.
# --force is needed because Git may complain about existing backup refs.
# --all rewrites all branches and tags to ensure consistency.
git filter-branch --force --env-filter "${ENV_FILTER}" --tag-name-filter cat -- --all

echo
echo "✅ 'git filter-branch' finished."
echo "Your commit history has been rewritten."
echo "Please verify the changes with 'git log'."
echo
echo "If everything is correct, you can clean up the backup Git created by running:"
echo "git for-each-ref --format='%(refname)' refs/original/ | xargs -n 1 git update-ref -d"
