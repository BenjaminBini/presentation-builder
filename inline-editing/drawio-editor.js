// inline-editing/drawio-editor.js
// Draw.io integration and postMessage communication
// Extends InlineEditor object from core.js

// ============================================================================
// DRAW.IO EDITOR
// ============================================================================

InlineEditor.openDrawioEditor = function(fieldKey, fieldIndex) {
    this.drawioEditorFieldKey = fieldKey;
    this.drawioEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;

    const currentValue = this.getFieldValue(fieldKey, this.drawioEditorFieldIndex, null) || '';
    const modal = document.getElementById('drawioEditorModal');
    const iframe = document.getElementById('drawioEditorFrame');

    if (!modal || !iframe) return;

    // draw.io embed URL with configuration (dark=0 forces light mode)
    const drawioUrl = 'https://embed.diagrams.net/?embed=1&spin=1&proto=json&ui=kennedy&dark=0';
    iframe.src = drawioUrl;

    // Listen for messages from draw.io
    window.drawioMessageHandler = (event) => {
        if (event.origin !== 'https://embed.diagrams.net') return;

        let msg;
        try {
            msg = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        if (msg.event === 'init') {
            // Send current diagram to editor
            let diagramData = '';
            if (currentValue && currentValue.startsWith('data:image/svg+xml;base64,')) {
                try {
                    // Properly decode base64 with UTF-8 support
                    const base64 = currentValue.substring('data:image/svg+xml;base64,'.length);
                    const binary = atob(base64);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    diagramData = new TextDecoder('utf-8').decode(bytes);
                } catch (e) {
                    console.warn('Failed to decode diagram data:', e);
                }
            }
            iframe.contentWindow.postMessage(JSON.stringify({
                action: 'load',
                xml: diagramData,
                autosave: 0
            }), '*');
        } else if (msg.event === 'save') {
            // Show saving status
            this.updateDrawioStatus('saving', 'Enregistrement...');
            // Request export as SVG with embedded XML for re-editing
            iframe.contentWindow.postMessage(JSON.stringify({
                action: 'export',
                format: 'xmlsvg',
                background: '#ffffff',
                spinKey: 'saving'
            }), '*');
        } else if (msg.event === 'export') {
            // Save the SVG data
            this.updateSlideData(this.drawioEditorFieldKey, msg.data, this.drawioEditorFieldIndex, null);
            updatePreview();
            // Close the editor after saving
            this.closeDrawioEditor();
        } else if (msg.event === 'exit') {
            this.closeDrawioEditor();
        }
    };
    window.addEventListener('message', window.drawioMessageHandler);

    // Clear status and show modal
    this.updateDrawioStatus('', '');
    modal.classList.add('active');
};

InlineEditor.updateDrawioStatus = function(state, text) {
    const status = document.getElementById('drawioSaveStatus');
    if (status) {
        status.textContent = text;
        status.className = 'drawio-save-status' + (state ? ' ' + state : '');
    }
};

InlineEditor.closeDrawioEditor = function() {
    const modal = document.getElementById('drawioEditorModal');
    const iframe = document.getElementById('drawioEditorFrame');

    if (window.drawioMessageHandler) {
        window.removeEventListener('message', window.drawioMessageHandler);
        window.drawioMessageHandler = null;
    }

    if (iframe) {
        iframe.src = '';
    }
    if (modal) {
        modal.classList.remove('active');
    }
    this.updateDrawioStatus('', '');
    this.drawioEditorFieldKey = null;
    this.drawioEditorFieldIndex = null;
};
