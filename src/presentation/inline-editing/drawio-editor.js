// src/inline-editing/drawio-editor.js
// Draw.io integration and postMessage communication
// Converted to ES6 module - uses event-driven architecture

import { updateSlideData, getFieldValue } from './data-updates.js';

/**
 * Open Draw.io editor modal
 * @param {string} fieldKey - Field key to update
 * @param {number|null} fieldIndex - Array index if applicable
 */
export function openDrawioEditor(fieldKey, fieldIndex) {
  this.drawioEditorFieldKey = fieldKey;
  this.drawioEditorFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex, 10) : null;

  const currentValue = getFieldValue(fieldKey, this.drawioEditorFieldIndex, null) || '';
  const modal = document.getElementById('drawioEditorModal');
  const iframe = document.getElementById('drawioEditorFrame');

  if (!modal || !iframe) return;

  // draw.io embed URL with configuration (dark=0 forces light mode)
  const drawioUrl = 'https://embed.diagrams.net/?embed=1&spin=1&proto=json&ui=kennedy&dark=0';
  iframe.src = drawioUrl;

  // Remove any existing message handler to prevent duplicates
  if (window.drawioMessageHandler) {
    window.removeEventListener('message', window.drawioMessageHandler);
  }

  // Bind message handler to this instance
  const boundUpdateStatus = updateDrawioStatus.bind(this);
  const boundCloseEditor = closeDrawioEditor.bind(this);

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
      }), 'https://embed.diagrams.net');
    } else if (msg.event === 'save') {
      // Show saving status
      boundUpdateStatus('saving', 'Enregistrement...');
      // Request export as SVG with embedded XML for re-editing
      iframe.contentWindow.postMessage(JSON.stringify({
        action: 'export',
        format: 'xmlsvg',
        background: '#ffffff',
        spinKey: 'saving'
      }), 'https://embed.diagrams.net');
    } else if (msg.event === 'export') {
      // Save the SVG data - updateSlideData emits SLIDE_DATA_CHANGED for preview update
      updateSlideData(this.drawioEditorFieldKey, msg.data, this.drawioEditorFieldIndex, null);
      // Close the editor after saving
      boundCloseEditor();
    } else if (msg.event === 'exit') {
      boundCloseEditor();
    }
  };
  window.addEventListener('message', window.drawioMessageHandler);

  // Clear status and show modal
  updateDrawioStatus.call(this, '', '');
  modal.classList.add('active');
}

/**
 * Update Draw.io save status display
 * @param {string} state - Status state (saving, error, success)
 * @param {string} text - Status text to display
 */
export function updateDrawioStatus(state, text) {
  const status = document.getElementById('drawioSaveStatus');
  if (status) {
    status.textContent = text;
    status.className = 'drawio-save-status' + (state ? ' ' + state : '');
  }
}

/**
 * Close Draw.io editor modal
 */
export function closeDrawioEditor() {
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
  updateDrawioStatus.call(this, '', '');
  this.drawioEditorFieldKey = null;
  this.drawioEditorFieldIndex = null;
}
