#!/bin/bash
# Update LOC history data from git commits on main branch

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML_FILE="$SCRIPT_DIR/index.html"
DATA_FILE="$SCRIPT_DIR/.data.tmp"

# Get commits from main branch (oldest first)
commits=$(git log main --reverse --format="%h|%ad|%s" --date=short)

# Build JavaScript data array
{
    echo "        const data = ["
    first=true

    while IFS='|' read -r hash date msg; do
        # Escape quotes and backslashes in message
        msg=$(echo "$msg" | sed 's/\\/\\\\/g; s/"/\\"/g')

        # Get stats for this commit
        stats=$(git show "$hash" --numstat --format="" 2>/dev/null || echo "")

        # Initialize counters
        js_a=0; js_d=0
        html_a=0; html_d=0
        css_a=0; css_d=0
        json_a=0; json_d=0
        yaml_a=0; yaml_d=0
        md_a=0; md_d=0
        sh_a=0; sh_d=0
        dot_a=0; dot_d=0

        # Parse stats
        while IFS=$'\t' read -r added deleted file; do
            [[ "$added" == "-" ]] && continue
            [[ -z "$file" ]] && continue

            case "$file" in
                *.js|*.mjs|*.cjs|*.jsx|*.ts|*.tsx)
                    js_a=$((js_a + added)); js_d=$((js_d + deleted)) ;;
                *.html|*.htm)
                    html_a=$((html_a + added)); html_d=$((html_d + deleted)) ;;
                *.css|*.scss|*.sass|*.less)
                    css_a=$((css_a + added)); css_d=$((css_d + deleted)) ;;
                *.json)
                    json_a=$((json_a + added)); json_d=$((json_d + deleted)) ;;
                *.yml|*.yaml)
                    yaml_a=$((yaml_a + added)); yaml_d=$((yaml_d + deleted)) ;;
                *.md|*.markdown)
                    md_a=$((md_a + added)); md_d=$((md_d + deleted)) ;;
                *.sh|*.bash)
                    sh_a=$((sh_a + added)); sh_d=$((sh_d + deleted)) ;;
                .gitignore|.editorconfig|.npmrc|.nvmrc|.prettierrc|.eslintrc|.dockerignore)
                    dot_a=$((dot_a + added)); dot_d=$((dot_d + deleted)) ;;
            esac
        done <<< "$stats"

        # Add comma for previous line
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi

        # Print entry (no trailing newline)
        printf '            { hash: "%s", date: "%s", js: {a:%d,d:%d}, html: {a:%d,d:%d}, css: {a:%d,d:%d}, json: {a:%d,d:%d}, yaml: {a:%d,d:%d}, md: {a:%d,d:%d}, sh: {a:%d,d:%d}, dot: {a:%d,d:%d}, msg: "%s" }' \
            "$hash" "$date" "$js_a" "$js_d" "$html_a" "$html_d" "$css_a" "$css_d" "$json_a" "$json_d" "$yaml_a" "$yaml_d" "$md_a" "$md_d" "$sh_a" "$sh_d" "$dot_a" "$dot_d" "$msg"

    done <<< "$commits"

    echo ""
    echo "        ];"
} > "$DATA_FILE"

# Replace data section in HTML using sed
# Get line number of "const data = ["
start_line=$(grep -n "^        const data = \[" "$HTML_FILE" | cut -d: -f1)
# Get line number of "];" after the data
end_line=$(tail -n +$start_line "$HTML_FILE" | grep -n "^        \];" | head -1 | cut -d: -f1)
end_line=$((start_line + end_line - 1))

# Build new file
{
    head -n $((start_line - 1)) "$HTML_FILE"
    cat "$DATA_FILE"
    tail -n +$((end_line + 1)) "$HTML_FILE"
} > "$HTML_FILE.tmp"

mv "$HTML_FILE.tmp" "$HTML_FILE"
rm -f "$DATA_FILE"

count=$(echo "$commits" | wc -l | tr -d ' ')
echo "Updated $HTML_FILE with $count commits from main branch"
