// src/inline-editing/image-picker.js
// Image selection UI and modal management

import { updateSlideData, getFieldValue } from './data-updates.js';

/**
 * Open image picker modal
 * @param {string} fieldKey - Field key to update
 * @param {number|null} fieldIndex - Array index if applicable
 */
export function openImagePicker(fieldKey, fieldIndex) {
  this.imagePickerFieldKey = fieldKey;
  this.imagePickerFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
  this.selectedImageData = null;

  // Get current image value
  const currentValue = getFieldValue(fieldKey, this.imagePickerFieldIndex, null);

  const modal = document.getElementById('imagePickerModal');
  if (modal) {
    // Reset modal state
    const urlInput = document.getElementById('imageUrlInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const sizeWarning = document.getElementById('imageSizeWarning');
    const altContainer = document.getElementById('imageAltContainer');
    const altInput = document.getElementById('imageAltInput');

    if (urlInput) {
      urlInput.value = currentValue || '';
    }
    if (sizeWarning) {
      sizeWarning.style.display = 'none';
    }

    // Show alt field only for 'image' field (image-text template)
    if (altContainer && altInput) {
      if (fieldKey === 'image') {
        altContainer.style.display = 'block';
        const currentAlt = getFieldValue('imageAlt', null, null);
        altInput.value = currentAlt || '';
      } else {
        altContainer.style.display = 'none';
        altInput.value = '';
      }
    }

    // Show preview if there's a current value
    if (currentValue) {
      this.selectedImageData = currentValue;
      showImagePreview.call(this, currentValue);
    } else if (previewContainer) {
      previewContainer.style.display = 'none';
    }

    // Reset to URL tab
    if (typeof window.switchImagePickerTab === 'function') {
      window.switchImagePickerTab('url');
    }

    modal.classList.add('active');
  }
}

/**
 * Close image picker modal
 */
export function closeImagePicker() {
  const modal = document.getElementById('imagePickerModal');
  if (modal) {
    modal.classList.remove('active');
  }

  // Reset state
  this.imagePickerFieldKey = null;
  this.imagePickerFieldIndex = null;
  this.selectedImageData = null;

  // Reset UI
  const urlInput = document.getElementById('imageUrlInput');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const sizeWarning = document.getElementById('imageSizeWarning');

  if (urlInput) urlInput.value = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (sizeWarning) sizeWarning.style.display = 'none';
}

/**
 * Show image preview in modal
 * @param {string} src - Image source URL or data URL
 */
export function showImagePreview(src) {
  const container = document.getElementById('imagePreviewContainer');
  const preview = document.getElementById('imagePreview');
  if (container && preview && src) {
    preview.src = src;
    preview.onload = () => {
      container.style.display = 'block';
    };
    preview.onerror = () => {
      container.style.display = 'none';
    };
  }
}

/**
 * Confirm image selection and update slide data
 */
export function confirmImageSelection() {
  const urlInput = document.getElementById('imageUrlInput');
  const altInput = document.getElementById('imageAltInput');
  const imageData = this.selectedImageData || (urlInput ? urlInput.value : null);

  if (imageData && this.imagePickerFieldKey) {
    updateSlideData(this.imagePickerFieldKey, imageData, this.imagePickerFieldIndex, null);

    // Also save imageAlt if this is the 'image' field
    if (this.imagePickerFieldKey === 'image' && altInput) {
      updateSlideData('imageAlt', altInput.value, null, null);
    }

    // Note: setHasUnsavedChanges is called by updateSlideData()
  }

  closeImagePicker.call(this);
}

/**
 * Clear image from slide data
 */
export function clearImage() {
  if (this.imagePickerFieldKey) {
    updateSlideData(this.imagePickerFieldKey, '', this.imagePickerFieldIndex, null);

    // Also clear imageAlt if this is the 'image' field
    if (this.imagePickerFieldKey === 'image') {
      updateSlideData('imageAlt', '', null, null);
    }

    // Note: setHasUnsavedChanges is called by updateSlideData()
  }
  closeImagePicker.call(this);
}
