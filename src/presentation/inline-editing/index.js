// src/inline-editing/index.js
// Main entry point for inline editing module
// Exports InlineEditor class instance with all methods mixed in

import { inlineEditor, InlineEditor } from './core.js';
import {
  startTextEdit,
  endTextEdit,
  handleKeydown,
  handlePaste,
  handleDocumentClick,
  handleBlur,
  changeItemIndentation
} from './text-editor.js';
import { updateSlideData, getFieldValue } from './data-updates.js';
import { getEditableElements, focusNextEditable, focusPreviousEditable } from './navigation.js';
import {
  openImagePicker,
  closeImagePicker,
  showImagePreview,
  confirmImageSelection,
  clearImage
} from './image-picker.js';
import {
  openCodeEditor,
  closeCodeEditor,
  confirmCodeEdit
} from './code-editor.js';
import {
  openDrawioEditor,
  closeDrawioEditor,
  updateDrawioStatus
} from './drawio-editor.js';
import {
  deleteAnnotation,
  addAnnotation,
  handleAnnotationMouseDown,
  handleAnnotationMouseMove,
  handleAnnotationMouseUp,
  cancelAnnotationSelection,
  updateAnnotationSelectionHighlight,
  clearAnnotationSelectionHighlight
} from './annotations.js';
import {
  deleteListItem,
  addListItem,
  moveListItem,
  addTableColumn,
  deleteTableColumn,
  addTableRow,
  deleteTableRow
} from './list-table-manager.js';

// Mix all methods into the InlineEditor instance
Object.assign(InlineEditor.prototype, {
  // Text editing
  startTextEdit,
  endTextEdit,
  handleKeydown,
  handlePaste,
  handleDocumentClick,
  handleBlur,
  changeItemIndentation,

  // Data updates
  updateSlideData,
  getFieldValue,

  // Navigation
  getEditableElements,
  focusNextEditable,
  focusPreviousEditable,

  // Image picker
  openImagePicker,
  closeImagePicker,
  showImagePreview,
  confirmImageSelection,
  clearImage,

  // Code editor
  openCodeEditor,
  closeCodeEditor,
  confirmCodeEdit,

  // Draw.io editor
  openDrawioEditor,
  closeDrawioEditor,
  updateDrawioStatus,

  // Annotations
  deleteAnnotation,
  addAnnotation,
  handleAnnotationMouseDown,
  handleAnnotationMouseMove,
  handleAnnotationMouseUp,
  cancelAnnotationSelection,
  updateAnnotationSelectionHighlight,
  clearAnnotationSelectionHighlight,

  // List and table management
  deleteListItem,
  addListItem,
  moveListItem,
  addTableColumn,
  deleteTableColumn,
  addTableRow,
  deleteTableRow
});

// Initialize HTML adapters for global onclick handlers
import './html-adapters.js';

// Export singleton instance as default
export default inlineEditor;

// Export named exports
export { inlineEditor, InlineEditor };

// Export individual functions for granular imports
export {
  startTextEdit,
  endTextEdit,
  handleKeydown,
  handlePaste,
  handleDocumentClick,
  handleBlur,
  changeItemIndentation,
  updateSlideData,
  getFieldValue,
  getEditableElements,
  focusNextEditable,
  focusPreviousEditable,
  openImagePicker,
  closeImagePicker,
  showImagePreview,
  confirmImageSelection,
  clearImage,
  openCodeEditor,
  closeCodeEditor,
  confirmCodeEdit,
  openDrawioEditor,
  closeDrawioEditor,
  updateDrawioStatus,
  deleteAnnotation,
  addAnnotation,
  handleAnnotationMouseDown,
  handleAnnotationMouseMove,
  handleAnnotationMouseUp,
  cancelAnnotationSelection,
  updateAnnotationSelectionHighlight,
  clearAnnotationSelectionHighlight,
  deleteListItem,
  addListItem,
  moveListItem,
  addTableColumn,
  deleteTableColumn,
  addTableRow,
  deleteTableRow
};
