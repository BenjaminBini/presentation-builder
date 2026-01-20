#!/bin/bash

# Code Review Fix Sessions Launcher
# Generated: 2026-01-20
# Launches Claude Code sessions to fix issues from CODE_REVIEW_2026-01-20.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
AUTO_APPROVE="${AUTO_APPROVE:-false}"  # Set to true for fully automated mode

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Prompts
PROMPT_1="Fix critical security and bug issues in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md first for context.

**Issues to fix:**

1. **SEC-001: XSS in renderer.js:61**
   - File: src/templates/renderer.js
   - The default case interpolates template without escaping
   - Fix: Use escapeHtml(template) - import from utils/html.js

2. **BUG-002: Array corruption in store.js:145-163**
   - File: src/core/state/store.js
   - The set() method uses object spread on arrays, corrupting them
   - Fix: Check Array.isArray() and use [...array] for arrays

3. **BUG-001: Race condition in sync.js:66-172**
   - File: src/drive/sync.js
   - pendingSync overwrites previous pending changes
   - Fix: Implement a queue array instead of single pendingSync value

4. **BUG-003: Infinite loop in sync.js:167**
   - File: src/drive/sync.js
   - Object reference comparison causes infinite re-queuing
   - Fix: Compare by project.id instead of object reference

After fixing, verify no syntax errors and all fixes work correctly."

PROMPT_2="Fix authentication and sync bugs in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **BUG-004: Token refresh race condition in auth.js:263-279**
   - File: src/drive/auth.js
   - Concurrent ensureValidToken() calls corrupt callback chain
   - Fix: Implement promise-based mutex pattern with _refreshPromise property

2. **BUG-007: Undefined reference in sync.js:227-235**
   - File: src/drive/sync.js
   - Direct references to global functions cause ReferenceError
   - Fix: Import functions properly or use window.functionName with proper guards

3. **SEC-002: Token storage (informational)**
   - File: src/drive/auth.js:113-116
   - Document why sessionStorage is used and security implications

After fixing, test auth flow doesn't hang on concurrent requests."

PROMPT_3="Fix inline editing bugs in the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **BUG-005: Memory leak in core.js:66-104**
   - File: src/inline-editing/core.js
   - Event listeners accumulate on repeated init/destroy cycles
   - Fix: Move bound handler creation inside the initialization check

2. **BUG-006: Null check after access in list-table-manager.js:28-35**
   - File: src/inline-editing/list-table-manager.js
   - Fix: Check before accessing: if (!target || target[key] === undefined) return;

3. **SEC-005: Prototype pollution in data-updates.js:32-44**
   - File: src/inline-editing/data-updates.js
   - Fix: Add validation to reject __proto__, constructor, prototype keys

After fixing, verify inline editing works correctly."

PROMPT_4="Apply security hardening to the presentation-builder codebase.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**Issues to fix:**

1. **SEC-003: postMessage wildcard origin in drawio-editor.js:63,72**
   - File: src/inline-editing/drawio-editor.js
   - Replace '*' with 'https://embed.diagrams.net' for all postMessage calls

2. **SEC-004: JSON import validation in import-export.js:36-46**
   - File: src/projects/import-export.js
   - Add comprehensive validation: max file size, array lengths, string lengths

3. **LOW-002: SVG data URL handling in html.js**
   - File: src/utils/html.js
   - Add comment documenting SVG security model

After fixing, test Draw.io integration and JSON import still work."

PROMPT_5="Verify and complete file splitting for CLAUDE.md 500-line compliance. Execute without stopping.

**COMP-001: Files must be under 500 lines**

**STEP 1: Check current line counts**
Run: wc -l src/projects/manager.js src/app/theme.js

**STEP 2: If manager.js > 500 lines, split it**
- Create src/projects/modals.js if it doesn't exist
- Move these functions to modals.js:
  - openProjectModal, closeProjectModal
  - openSaveProjectModal, closeSaveProjectModal
  - saveProjectWithName, validateSaveProjectName
  - renderProjectList, loadProject, deleteProject
- Add proper imports/exports
- Update manager.js to import and re-export from modals.js

**STEP 3: If theme.js > 500 lines, split it**
- Create src/app/color-picker.js if it doesn't exist
- Move these functions to color-picker.js:
  - hsvToRgb, rgbToHsv, hexToRgb, rgbToHex
  - drawColorSpectrum, initColorSpectrum
  - updateFromSpectrum, updateFromHue
  - validateAndApplyHex, renderThemeColorDropdown
  - toggleThemeColorPicker and related handlers
  - All color picker state variables
- Add proper imports/exports
- Update theme.js to import and re-export from color-picker.js

**STEP 4: Verify final line counts**
Run: wc -l src/projects/manager.js src/app/theme.js
Both must be under 500 lines.

If files are already under 500 lines, report success and skip splitting."

PROMPT_6="Fix file organization to comply with CLAUDE.md rules.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**COMP-002: Working files in root folder**

1. Move demo-all-templates.json to examples/demo-all-templates.json
2. Move presentation-data.json to examples/presentation-data.json
3. Move remove.sh to scripts/remove.sh
4. Create directories if needed: mkdir -p examples scripts
5. Update any references in code

After moving, verify the app still loads sample data correctly."

PROMPT_7="Refactor to eliminate window global anti-pattern in presentation-builder. Execute ALL phases without stopping.

Read docs/CODE_REVIEW_2026-01-20.md for context.

**ARCH-001: Eliminate window.* globals - EXECUTE ALL STEPS**

**PHASE 1: Replace config constants (do this first)**
Files using window.TEMPLATES or window.THEMES:
- Add: import { TEMPLATES } from '../config/templates.js';
- Add: import { THEMES } from '../config/themes.js';
- Replace all window.TEMPLATES with TEMPLATES
- Replace all window.THEMES with THEMES

**PHASE 2: Replace state access**
Files using window.currentProject or window.getProject:
- Add: import { getProject } from '../core/state/index.js';
- Replace window.currentProject with getProject()
- Replace window.getProject?.() with getProject()

**PHASE 3: Create and use UI refresh utility**
1. Create src/app/ui-refresh.js:
   import { emit, EventTypes } from '../core/events/index.js';
   export function refreshUI() { emit(EventTypes.UI_REFRESH_REQUESTED); }
   export function refreshSlideList() { emit(EventTypes.SLIDE_LIST_CHANGED); }
   export function refreshEditor() { emit(EventTypes.EDITOR_REFRESH_REQUESTED); }
   export function refreshPreview() { emit(EventTypes.PREVIEW_REFRESH_REQUESTED); }

2. In files with window.renderSlideList, window.renderEditor, window.updatePreview:
   - Import from ui-refresh.js
   - Replace window.renderSlideList?.() with refreshSlideList()
   - Replace window.renderEditor?.() with refreshEditor()
   - Replace window.updatePreview?.() with refreshPreview()

**PHASE 4: Replace remaining function calls**
For window.markAsChanged:
- Import: import { markAsChanged } from '../core/state/actions.js';
- Replace window.markAsChanged?.() with markAsChanged()

For window.closeModal:
- Import from appropriate module or keep with guard if truly global

**PHASE 5: Clean up main.js exports**
- Remove unnecessary window.* assignments from main.js
- Keep only those needed for HTML onclick handlers

Execute all phases. Do not stop to ask. Fix all occurrences systematically file by file."

PROMPT_8="Remove duplicate code in the presentation-builder codebase. Execute ALL steps without stopping.

**ARCH-002: Fix duplicate THEME_COLOR_KEYS**

1. In src/app/theme.js around line 73:
   - DELETE the local THEME_COLOR_KEYS array definition
   - ADD at top: import { THEME_COLOR_KEYS } from '../services/theme-service.js';
   - Keep the single source in theme-service.js

**ARCH-003: Fix duplicate project creation functions**

1. In src/main.js around line 179:
   - DELETE the local createEmptyProject() function
   - ADD at top imports: import { createEmptyProject } from './services/project-service.js';
   - Update window.createEmptyProject assignment to use imported function

2. In src/projects/manager.js around line 127:
   - Modify createNewProject() to use project-service.js:
   - ADD: import { createEmptyProject, createNewProject as createProjectFromService } from '../services/project-service.js';
   - Replace internal project creation logic with call to createProjectFromService()
   - Keep only the UI confirmation logic in manager.js

**ARCH-006: Fix core layer importing UI functions**

1. In src/core/state.js:
   - REMOVE re-exports of: showUnsavedAlert, hideUnsavedAlert, dismissUnsavedAlert, updateSaveButtonState
   - These should NOT be exported from core layer

2. Find all files importing these from core/state.js:
   - grep -r \"showUnsavedAlert\\|hideUnsavedAlert\\|dismissUnsavedAlert\\|updateSaveButtonState\" src/ --include=\"*.js\"
   - Update each to import from '../app/state-ui.js' instead

**VERIFICATION:**
Run these to confirm no duplicates:
- grep -r 'THEME_COLOR_KEYS.*=' src/ --include='*.js' | grep -v import
- grep -r 'function createEmptyProject' src/ --include='*.js'

Execute all steps. Do not stop to ask."

PROMPT_9="Make the app layer consistently use the service layer. Execute ALL steps without stopping.

**ARCH-004: App layer must use services instead of direct state mutation**

**FILE 1: src/app/slides/management.js**

1. Update imports at top:
   import { addSlide, deleteSlide, duplicateSlide, moveSlide } from '../../services/slide-service.js';

2. In addSlideToPresentation() around line 29-33:
   - REMOVE: currentProject.slides.splice(insertIndex, 0, newSlide);
   - REMOVE: setSelectedSlideIndex(insertIndex);
   - REPLACE WITH: addSlide(template, defaultData, insertIndex);
   - The service handles state and events

3. In deleteSlideFromPresentation() around line 47-49:
   - REMOVE: currentProject.slides.splice(index, 1);
   - REMOVE: the selectedSlideIndex adjustment
   - REPLACE WITH: deleteSlide(index);

4. In duplicateCurrentSlide() around line 60-62:
   - REMOVE: const copy = JSON.parse(...); currentProject.slides.splice(...)
   - REPLACE WITH: duplicateSlide(index);

5. In handleDrop() around line 103-104:
   - REMOVE: const [removed] = currentProject.slides.splice(draggedIndex, 1);
   - REMOVE: currentProject.slides.splice(targetIndex, 0, removed);
   - REPLACE WITH: moveSlide(draggedIndex, targetIndex);

6. Remove redundant markAsChanged() calls - services handle this

**FILE 2: src/app/theme.js**

1. Update imports:
   import { setThemeColor, applyTheme, getThemeColorValue } from '../services/theme-service.js';

2. Replace direct theme mutations with service calls:
   - Use setThemeColor(colorKey, hexValue) instead of direct override assignment
   - Use applyTheme(themeName) instead of direct theme switching

**FILE 3: src/projects/manager.js**

1. Verify it uses project-service.js for:
   - createEmptyProject() - should import from service
   - Project save/load - can stay in manager for now (storage concerns)

**VERIFICATION:**
After changes, grep should find NO direct .splice() on slides:
grep -n 'slides.splice' src/app/slides/management.js

Execute all steps. Do not stop to ask."

# Session descriptions
declare -a DESCRIPTIONS=(
    "Critical Security & Bugs (SEC-001, BUG-001, BUG-002, BUG-003)"
    "Drive Auth & Sync (BUG-004, BUG-007, SEC-002)"
    "Inline Editing Bugs (BUG-005, BUG-006, SEC-005)"
    "Security Hardening (SEC-003, SEC-004, LOW-002)"
    "Split Large Files (COMP-001)"
    "File Organization (COMP-002)"
    "Window Globals - LARGE (ARCH-001)"
    "Consolidate Duplicates (ARCH-002, ARCH-003, ARCH-006)"
    "Service Layer (ARCH-004)"
)

# Get prompt by number
get_prompt() {
    case $1 in
        1) echo "$PROMPT_1" ;;
        2) echo "$PROMPT_2" ;;
        3) echo "$PROMPT_3" ;;
        4) echo "$PROMPT_4" ;;
        5) echo "$PROMPT_5" ;;
        6) echo "$PROMPT_6" ;;
        7) echo "$PROMPT_7" ;;
        8) echo "$PROMPT_8" ;;
        9) echo "$PROMPT_9" ;;
    esac
}

# Print header
print_header() {
    local mode_text
    if [ "$AUTO_APPROVE" = "true" ]; then
        mode_text="${GREEN}AUTO-APPROVE ON${NC} (fully automated)"
    else
        mode_text="${YELLOW}INTERACTIVE${NC} (will prompt for approvals)"
    fi

    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}     ${GREEN}Code Review Fix Sessions Launcher${NC}                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}     Generated from CODE_REVIEW_2026-01-20.md              ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Mode: $mode_text"
    echo ""
}

# Print menu
print_menu() {
    echo -e "${YELLOW}Available fix sessions:${NC}"
    echo ""
    echo -e "  ${RED}[CRITICAL]${NC}"
    echo -e "    ${GREEN}1${NC}) ${DESCRIPTIONS[0]}"
    echo ""
    echo -e "  ${YELLOW}[HIGH]${NC}"
    echo -e "    ${GREEN}2${NC}) ${DESCRIPTIONS[1]}"
    echo -e "    ${GREEN}3${NC}) ${DESCRIPTIONS[2]}"
    echo -e "    ${GREEN}4${NC}) ${DESCRIPTIONS[3]}"
    echo ""
    echo -e "  ${BLUE}[MEDIUM - Compliance]${NC}"
    echo -e "    ${GREEN}5${NC}) ${DESCRIPTIONS[4]}"
    echo -e "    ${GREEN}6${NC}) ${DESCRIPTIONS[5]}"
    echo ""
    echo -e "  ${BLUE}[MEDIUM - Architecture]${NC}"
    echo -e "    ${GREEN}7${NC}) ${DESCRIPTIONS[6]}"
    echo -e "    ${GREEN}8${NC}) ${DESCRIPTIONS[7]}"
    echo -e "    ${GREEN}9${NC}) ${DESCRIPTIONS[8]}"
    echo ""
    echo -e "  ${CYAN}[BATCH]${NC}"
    echo -e "    ${GREEN}a${NC}) Run ALL sessions sequentially (1-9)"
    echo -e "    ${GREEN}c${NC}) Run CRITICAL only (1)"
    echo -e "    ${GREEN}h${NC}) Run HIGH priority (1-4)"
    echo -e "    ${GREEN}m${NC}) Run MEDIUM priority (5-9)"
    echo ""
    echo -e "  ${CYAN}[OPTIONS]${NC}"
    if [ "$AUTO_APPROVE" = "true" ]; then
        echo -e "    ${GREEN}t${NC}) Toggle mode (currently: AUTO-APPROVE)"
    else
        echo -e "    ${GREEN}t${NC}) Toggle mode (currently: INTERACTIVE)"
    fi
    echo -e "    ${GREEN}x${NC}) Test (quick sanity check)"
    echo -e "    ${GREEN}q${NC}) Quit"
    echo ""
}

# Launch a single session
launch_session() {
    local num=$1
    local desc="${DESCRIPTIONS[$((num-1))]}"
    local prompt=$(get_prompt $num)

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Launching Session $num:${NC} $desc"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    cd "$PROJECT_DIR"

    # Launch Claude with streaming output and auto-exit
    # Using -p for print mode (exits after completion) with unbuffered output via script
    if [ "$AUTO_APPROVE" = "true" ]; then
        # Fully automated - no permission prompts, streams output
        script -q /dev/null claude --dangerously-skip-permissions -p "$prompt"
    else
        # Interactive - will prompt for tool approvals, streams output
        script -q /dev/null claude -p "$prompt"
    fi

    echo ""
    echo -e "${GREEN}Session $num completed.${NC}"
    echo ""
}

# Launch multiple sessions
launch_sessions() {
    local sessions=("$@")
    local total=${#sessions[@]}
    local current=0

    for num in "${sessions[@]}"; do
        ((current++))
        echo ""
        echo -e "${YELLOW}[$current/$total] Starting session $num...${NC}"
        launch_session $num

        if [ $current -lt $total ]; then
            echo ""
            echo -e "${YELLOW}Press Enter to continue to next session, or 'q' to quit...${NC}"
            read -r input
            if [ "$input" = "q" ]; then
                echo -e "${RED}Batch cancelled.${NC}"
                return
            fi
        fi
    done

    echo ""
    echo -e "${GREEN}All sessions completed!${NC}"
}

# Interactive mode
interactive_mode() {
    while true; do
        print_header
        print_menu

        echo -ne "${CYAN}Select option: ${NC}"
        read -r choice

        case $choice in
            [1-9])
                launch_session $choice
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            a|A)
                launch_sessions 1 2 3 4 5 6 7 8 9
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            c|C)
                launch_sessions 1
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            h|H)
                launch_sessions 1 2 3 4
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            m|M)
                launch_sessions 5 6 7 8 9
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            t|T)
                if [ "$AUTO_APPROVE" = "true" ]; then
                    AUTO_APPROVE="false"
                    echo -e "${YELLOW}Switched to INTERACTIVE mode${NC}"
                else
                    AUTO_APPROVE="true"
                    echo -e "${GREEN}Switched to AUTO-APPROVE mode${NC}"
                fi
                sleep 1
                ;;
            x|X)
                # Test mode - quick sanity check
                echo ""
                echo -e "${CYAN}Running test session...${NC}"
                cd "$PROJECT_DIR"
                local test_prompt='Say "Test successful! Script is working." and nothing else.'
                if [ "$AUTO_APPROVE" = "true" ]; then
                    script -q /dev/null claude --dangerously-skip-permissions -p "$test_prompt"
                else
                    script -q /dev/null claude -p "$test_prompt"
                fi
                echo ""
                echo -e "${GREEN}Test completed.${NC}"
                echo -e "${YELLOW}Press Enter to return to menu...${NC}"
                read -r
                ;;
            q|Q)
                echo ""
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                sleep 1
                ;;
        esac
    done
}

# Direct launch mode
direct_mode() {
    local num=$1

    if [[ "$num" =~ ^[1-9]$ ]]; then
        launch_session $num
    elif [ "$num" = "all" ]; then
        launch_sessions 1 2 3 4 5 6 7 8 9
    elif [ "$num" = "critical" ]; then
        launch_sessions 1
    elif [ "$num" = "high" ]; then
        launch_sessions 1 2 3 4
    elif [ "$num" = "medium" ]; then
        launch_sessions 5 6 7 8 9
    elif [ "$num" = "test" ]; then
        echo -e "${CYAN}Running test session...${NC}"
        cd "$PROJECT_DIR"
        local test_prompt='Say "Test successful! Script is working." and nothing else.'
        if [ "$AUTO_APPROVE" = "true" ]; then
            script -q /dev/null claude --dangerously-skip-permissions -p "$test_prompt"
        else
            script -q /dev/null claude -p "$test_prompt"
        fi
        echo -e "${GREEN}Test completed.${NC}"
    else
        echo -e "${RED}Invalid argument: $num${NC}"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  1-9       Launch specific session"
        echo "  all       Launch all sessions"
        echo "  critical  Launch critical sessions (1)"
        echo "  high      Launch high priority sessions (1-4)"
        echo "  medium    Launch medium priority sessions (5-9)"
        echo "  test      Quick sanity check"
        echo "  (none)    Interactive mode"
        echo ""
        echo "Environment:"
        echo "  AUTO_APPROVE=true   Skip all permission prompts (fully automated)"
        echo ""
        echo "Examples:"
        echo "  $0 test                   # Quick sanity check"
        echo "  $0 1                      # Run session 1 interactively"
        echo "  AUTO_APPROVE=true $0 1    # Run session 1 fully automated"
        echo "  AUTO_APPROVE=true $0 all  # Run all sessions automated"
        exit 1
    fi
}

# Main
main() {
    # Check if claude command exists
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}Error: 'claude' command not found.${NC}"
        echo "Please install Claude Code CLI first."
        exit 1
    fi

    if [ $# -eq 0 ]; then
        interactive_mode
    else
        direct_mode "$1"
    fi
}

main "$@"
