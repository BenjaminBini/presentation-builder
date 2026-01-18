// app/sidebar.js
// Sidebar UI, tabs, and settings panel

window.switchSidebarTab = function(tab) {
    const previousTab = window.currentSidebarTab || 'slides';
    window.currentSidebarTab = tab;
    
    // Determine animation direction
    const tabOrder = ['slides', 'settings'];
    const prevIndex = tabOrder.indexOf(previousTab);
    const newIndex = tabOrder.indexOf(tab);
    const direction = newIndex > prevIndex ? 'slide-left' : 'slide-right';
    
    document.querySelectorAll('.sidebar-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('sidebarContent').dataset.tab = tab;
    
    // Apply animation to panels
    const slidesPanel = document.querySelector('.slides-panel');
    const settingsPanel = document.querySelector('.settings-panel');
    
    if (slidesPanel) {
        slidesPanel.classList.remove('slide-left', 'slide-right');
        if (tab === 'slides') {
            void slidesPanel.offsetWidth; // Trigger reflow
            slidesPanel.classList.add(direction);
        }
    }
    
    if (settingsPanel) {
        settingsPanel.classList.remove('slide-left', 'slide-right');
        if (tab === 'settings') {
            void settingsPanel.offsetWidth; // Trigger reflow
            settingsPanel.classList.add(direction);
        }
    }
    
    // Animate underline
    updateSidebarTabUnderline();
    
    if (tab === 'settings') {
        renderSettingsPanel();
    }
};

// Update sidebar tab underline position
window.updateSidebarTabUnderline = function() {
    const activeTab = document.querySelector('.sidebar-tab.active');
    const tabsContainer = document.querySelector('.sidebar-tabs');
    
    if (!activeTab || !tabsContainer) return;
    
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;
    
    tabsContainer.style.setProperty('--underline-left', `${left}px`);
    tabsContainer.style.setProperty('--underline-width', `${width}px`);
};

window.renderSettingsPanel = function() {
    window.renderThemeSelector();
    window.renderColorList();
};

window.initTemplateGrid = function() {
    const grid = document.getElementById('templateGrid');
    grid.innerHTML = Object.entries(TEMPLATES).map(([key, template]) => `
        <div class="template-option" data-template="${key}" onclick="selectTemplate('${key}')">
            <div class="template-option-icon">${template.icon}</div>
            <div class="template-option-name">${template.name}</div>
        </div>
    `).join('');
};
