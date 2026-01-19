// src/app/panels.js
// Sidebar and editor panel management, resize handling - ES6 module version

import { get, set } from '../core/state.js';

// Helper functions to get/set UI state
const getSidebarCollapsed = () => get('ui.sidebarCollapsed');
const setSidebarCollapsed = (value) => set('ui.sidebarCollapsed', value);
const getEditorCollapsed = () => get('ui.editorCollapsed');
const setEditorCollapsed = (value) => set('ui.editorCollapsed', value);
const getEditorHeight = () => get('ui.editorHeight');
const setEditorHeight = (value) => set('ui.editorHeight', value);
const getIsResizingEditor = () => get('ui.isResizingEditor');
const setIsResizingEditor = (value) => set('ui.isResizingEditor', value);

export function initPanelStates() {
    // Restore from sessionStorage
    const savedSidebarCollapsed = sessionStorage.getItem('sidebarCollapsed');
    const savedEditorCollapsed = sessionStorage.getItem('editorCollapsed');
    const savedEditorHeight = sessionStorage.getItem('editorHeight');

    if (savedSidebarCollapsed === 'true') {
        setSidebarCollapsed(true);
        const app = document.querySelector('.app');
        const sidebar = document.getElementById('sidebar');
        if (app) app.classList.add('sidebar-collapsed');
        if (sidebar) sidebar.classList.add('collapsed');
    }

    if (savedEditorCollapsed === 'true') {
        setEditorCollapsed(true);
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) editorPanel.classList.add('collapsed');
    }

    if (savedEditorHeight) {
        setEditorHeight(parseInt(savedEditorHeight, 10));
    } else {
        setEditorHeight(300); // Default height
    }

    if (!getEditorCollapsed()) {
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) editorPanel.style.height = getEditorHeight() + 'px';
    }

    // Render compact slide list
    if (window.renderCompactSlideList) window.renderCompactSlideList();

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
}

export function toggleSidebar() {
    const newCollapsed = !getSidebarCollapsed();
    setSidebarCollapsed(newCollapsed);
    const app = document.querySelector('.app');
    const sidebar = document.getElementById('sidebar');

    if (app) app.classList.toggle('sidebar-collapsed', newCollapsed);
    if (sidebar) sidebar.classList.toggle('collapsed', newCollapsed);
    sessionStorage.setItem('sidebarCollapsed', newCollapsed);

    // Update preview scaling after layout change
    setTimeout(() => {
        if (window.scalePreviewSlide) window.scalePreviewSlide();
    }, 250);
}

export function toggleEditorPanel() {
    const newCollapsed = !getEditorCollapsed();
    setEditorCollapsed(newCollapsed);
    const editorPanel = document.getElementById('editorPanel');

    if (editorPanel) editorPanel.classList.toggle('collapsed', newCollapsed);
    sessionStorage.setItem('editorCollapsed', newCollapsed);

    // Restore height when expanding
    const currentHeight = getEditorHeight();
    if (!newCollapsed && currentHeight) {
        if (editorPanel) editorPanel.style.height = currentHeight + 'px';
    }

    // Update preview scaling after layout change
    setTimeout(() => {
        if (window.scalePreviewSlide) window.scalePreviewSlide();
    }, 250);
}

function initEditorResize() {
    const handle = document.getElementById('editorResizeHandle');
    const panel = document.getElementById('editorPanel');
    const mainContent = document.querySelector('.main-content');

    if (!handle || !panel || !mainContent) return;

    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        setIsResizingEditor(true);
        handle.classList.add('resizing');
        panel.classList.add('resizing');
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';

        const startY = e.clientY;
        const startHeight = panel.offsetHeight;

        function onMouseMove(e) {
            if (!getIsResizingEditor()) return;
            const deltaY = startY - e.clientY;
            // Max height is 50% of main content area
            const maxHeight = Math.floor(mainContent.offsetHeight * 0.5);
            const newHeight = Math.max(100, Math.min(startHeight + deltaY, maxHeight));
            panel.style.height = newHeight + 'px';
            setEditorHeight(newHeight);
            if (window.scalePreviewSlide) window.scalePreviewSlide();
        }

        function onMouseUp() {
            setIsResizingEditor(false);
            handle.classList.remove('resizing');
            panel.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Save to sessionStorage
            const finalHeight = getEditorHeight();
            if (finalHeight) {
                sessionStorage.setItem('editorHeight', finalHeight);
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
