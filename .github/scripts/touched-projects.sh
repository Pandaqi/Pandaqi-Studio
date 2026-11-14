#!/usr/bin/env bash
# Reads changed file paths (one per line) on stdin and prints one audit filter per touched project.
#
#   git diff --name-only origin/main...HEAD | .github/scripts/touched-projects.sh
#
# Output: one `--filter` value per line (`/chiptales/bet/noble-flood/`), or the single word `ALL` when
# shared code changed (the libraries, layouts, config or the harness itself), which no project filter
# can cover. Empty output means nothing that a page is built from changed.
set -euo pipefail

print_project_for() {
    local rest="$1"
    local dir
    dir=$(dirname "$rest")
    # a page path ends in game/, board/ or rules/; the project is everything above that
    dir=$(printf '%s' "$dir" | sed -E 's#/(game|board|rules)(/.*)?$##')
    [ "$dir" = "." ] && return 0
    printf '/%s/\n' "$dir"
}

while IFS= read -r file; do
    [ -n "$file" ] || continue
    case "$file" in
        pandaqi-studio/content/*)
            print_project_for "${file#pandaqi-studio/content/}"
            ;;
        pandaqi-studio/themes/pandaqi/assets/games/*)
            print_project_for "${file#pandaqi-studio/themes/pandaqi/assets/games/}"
            ;;
        pandaqi-studio/themes/*|pandaqi-studio/config.toml|pandaqi-studio/audit/*)
            printf 'ALL\n'
            ;;
        *)
            # docs, scripts outside the site, the dev copy: nothing to audit
            ;;
    esac
done | awk '!seen[$0]++' | sort
