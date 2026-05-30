#!/usr/bin/env sh
# Remove Cursor attribution lines from git commit messages.
set -e

file=$1
[ -n "$file" ] && [ -f "$file" ] || exit 0

grep -viE \
  'cursoragent@cursor\.com|@cursor\.com>|^co-authored-by:[[:space:]]*cursor|^made-with:[[:space:]]*cursor|^made-by:[[:space:]]*cursor' \
  "$file" > "$file.tmp" || true

mv "$file.tmp" "$file"
