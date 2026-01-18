// inline-editing/image-picker.js
// Image selection UI and modal management
// Extends InlineEditor object from core.js

// ============================================================================
// IMAGE PICKER
// ============================================================================

InlineEditor.openImagePicker = function(fieldKey, fieldIndex) {
    this.imagePickerFieldKey = fieldKey;
    this.imagePickerFieldIndex = fieldIndex !== undefined ? parseInt(fieldIndex) : null;
    this.selectedImageData = null;

    // Get current image value
    const currentValue = this.getFieldValue(fieldKey, this.imagePickerFieldIndex, null);

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
                const currentAlt = this.getFieldValue('imageAlt', null, null);
                altInput.value = currentAlt || '';
            } else {
                altContainer.style.display = 'none';
                altInput.value = '';
            }
        }

        // Show preview if there's a current value
        if (currentValue) {
            this.selectedImageData = currentValue;
            this.showImagePreview(currentValue);
        } else if (previewContainer) {
            previewContainer.style.display = 'none';
        }

        // Reset to URL tab
        switchImagePickerTab('url');

        modal.classList.add('active');
    }
};

InlineEditor.closeImagePicker = function() {
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
};

InlineEditor.showImagePreview = function(src) {
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
};

InlineEditor.confirmImageSelection = function() {
    const urlInput = document.getElementById('imageUrlInput');
    const altInput = document.getElementById('imageAltInput');
    const imageData = this.selectedImageData || (urlInput ? urlInput.value : null);

    if (imageData && this.imagePickerFieldKey) {
        this.updateSlideData(this.imagePickerFieldKey, imageData, this.imagePickerFieldIndex, null);

        // Also save imageAlt if this is the 'image' field
        if (this.imagePickerFieldKey === 'image' && altInput) {
            this.updateSlideData('imageAlt', altInput.value, null, null);
        }

        updatePreview();
        markAsChanged();
        showToast('Image mise à jour');
    }

    this.closeImagePicker();
};

InlineEditor.clearImage = function() {
    if (this.imagePickerFieldKey) {
        this.updateSlideData(this.imagePickerFieldKey, '', this.imagePickerFieldIndex, null);

        // Also clear imageAlt if this is the 'image' field
        if (this.imagePickerFieldKey === 'image') {
            this.updateSlideData('imageAlt', '', null, null);
        }

        updatePreview();
        markAsChanged();
        showToast('Image supprimée');
    }
    this.closeImagePicker();
};
