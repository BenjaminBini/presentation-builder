// app/sidebar.js
// Sidebar UI, tabs, and settings panel

window.switchSidebarTab = function(tab) {
    window.currentSidebarTab = tab;
    document.querySelectorAll('.sidebar-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('sidebarContent').dataset.tab = tab;
    if (tab === 'settings') {
        renderSettingsPanel();
    }
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
