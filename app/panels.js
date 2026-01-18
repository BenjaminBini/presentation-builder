// app/panels.js
// Sidebar and editor panel management, resize handling

window.initPanelStates = function() {
    // Restore from sessionStorage
    const savedSidebarCollapsed = sessionStorage.getItem('sidebarCollapsed');
    const savedEditorCollapsed = sessionStorage.getItem('editorCollapsed');
    const savedEditorHeight = sessionStorage.getItem('editorHeight');

    if (savedSidebarCollapsed === 'true') {
        window.sidebarCollapsed = true;
        document.querySelector('.app').classList.add('sidebar-collapsed');
        document.getElementById('sidebar').classList.add('collapsed');
    }

    if (savedEditorCollapsed === 'true') {
        window.editorCollapsed = true;
        document.getElementById('editorPanel').classList.add('collapsed');
    }

    if (savedEditorHeight) {
        window.editorHeight = parseInt(savedEditorHeight, 10);
    } else {
        window.editorHeight = 220; // Default height
    }

    if (!window.editorCollapsed) {
        document.getElementById('editorPanel').style.height = window.editorHeight + 'px';
    }

    // Render compact slide list
    window.renderCompactSlideList();

    // Initialize resize handle
    initEditorResize();
    
    // Initialize tab underlines
    setTimeout(() => {
        if (typeof window.updateSidebarTabUnderline === 'function') {
            window.updateSidebarTabUnderline();
        }
        if (typeof window.updateEditorTabUnderline === 'function') {
            window.updateEditorTabUnderline();
        }
    }, 100);
};

window.toggleSidebar = function() {
    window.sidebarCollapsed = !window.sidebarCollapsed;
    document.querySelector('.app').classList.toggle('sidebar-collapsed', window.sidebarCollapsed);
    document.getElementById('sidebar').classList.toggle('collapsed', window.sidebarCollapsed);
    sessionStorage.setItem('sidebarCollapsed', window.sidebarCollapsed);

    // Update preview scaling after layout change
    setTimeout(window.scalePreviewSlide, 250);
};

window.toggleEditorPanel = function() {
    window.editorCollapsed = !window.editorCollapsed;
    document.getElementById('editorPanel').classList.toggle('collapsed', window.editorCollapsed);
    sessionStorage.setItem('editorCollapsed', window.editorCollapsed);

    // Restore height when expanding
    if (!window.editorCollapsed && window.editorHeight) {
        document.getElementById('editorPanel').style.height = window.editorHeight + 'px';
    }

    // Update preview scaling after layout change
    setTimeout(window.scalePreviewSlide, 250);
};

function initEditorResize() {
    const handle = document.getElementById('editorResizeHandle');
    const panel = document.getElementById('editorPanel');
    const mainContent = document.querySelector('.main-content');

    if (!handle || !panel || !mainContent) return;

    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        window.isResizingEditor = true;
        handle.classList.add('resizing');
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';

        const startY = e.clientY;
        const startHeight = panel.offsetHeight;

        function onMouseMove(e) {
            if (!window.isResizingEditor) return;
            const deltaY = startY - e.clientY;
            const newHeight = Math.max(100, Math.min(startHeight + deltaY, mainContent.offsetHeight - 200));
            panel.style.height = newHeight + 'px';
            window.editorHeight = newHeight;
            window.scalePreviewSlide();
        }

        function onMouseUp() {
            window.isResizingEditor = false;
            handle.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Save to sessionStorage
            if (window.editorHeight) {
                sessionStorage.setItem('editorHeight', window.editorHeight);
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
