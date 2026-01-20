// src/app/sidebar.js
// Sidebar UI, tabs, and settings panel

import { get, set } from '../../core/state.js';
import { registerActions } from '../event-delegation.js';
import { TEMPLATES } from '../../config/templates.js';

// ============================================================================
// ACTION HANDLERS (for event delegation)
// ============================================================================

/**
 * Handle template selection via event delegation
 */
function handleSelectTemplate(_event, _element, params) {
  if (typeof window.selectTemplate === 'function') {
    window.selectTemplate(params.template);
  }
}

// Register sidebar actions
registerActions({
  'select-template': handleSelectTemplate
});

// ============================================================================
// TAB SWITCHING
// ============================================================================

export function switchSidebarTab(tab) {
    const previousTab = get('ui.currentSidebarTab') || 'slides';
    set('ui.currentSidebarTab', tab);

    const tabOrder = ['slides', 'settings'];
    const prevIndex = tabOrder.indexOf(previousTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > prevIndex ? 'slide-left' : 'slide-right';

    document.querySelectorAll('.sidebar-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    const sidebarContent = document.getElementById('sidebarContent');
    if (sidebarContent) sidebarContent.dataset.tab = tab;

    const slidesPanel = document.querySelector('.slides-panel');
    const settingsPanel = document.querySelector('.settings-panel');

    if (slidesPanel) {
        slidesPanel.classList.remove('slide-left', 'slide-right');
        if (tab === 'slides') {
            void slidesPanel.offsetWidth;
            slidesPanel.classList.add(direction);
        }
    }

    if (settingsPanel) {
        settingsPanel.classList.remove('slide-left', 'slide-right');
        if (tab === 'settings') {
            void settingsPanel.offsetWidth;
            settingsPanel.classList.add(direction);
        }
    }

    updateSidebarTabUnderline();

    if (tab === 'settings' && window.renderSettingsPanel) {
        window.renderSettingsPanel();
    }
}

export function updateSidebarTabUnderline() {
    const activeTab = document.querySelector('.sidebar-tab.active');
    const tabsContainer = document.querySelector('.sidebar-tabs');

    if (!activeTab || !tabsContainer) return;

    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;

    tabsContainer.style.setProperty('--underline-left', `${left}px`);
    tabsContainer.style.setProperty('--underline-width', `${width}px`);
}

export function renderSettingsPanel() {
    if (window.renderThemeSelector) window.renderThemeSelector();
    if (window.renderColorList) window.renderColorList();
    if (window.initThemeColorPickerEvents) window.initThemeColorPickerEvents();
}

export function initTemplateGrid() {
    const grid = document.getElementById('templateGrid');

    if (!grid) return;

    grid.innerHTML = Object.entries(TEMPLATES).map(([key, template]) => `
        <div class="template-option" data-template="${key}" data-action="select-template">
            <div class="template-option-icon">${template.icon}</div>
            <div class="template-option-name">${template.name}</div>
        </div>
    `).join('');
}
