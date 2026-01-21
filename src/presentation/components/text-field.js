// src/presentation/components/text-field.js
// TextFieldComponent - Reusable auto-scaling WYSIWYG text area
//
// Usage:
// 1. Add data-text-field to the outer container
// 2. Add data-text-field-area to the scrollable area
// 3. Add data-text-field-content to the content that scales
//
// Example HTML:
// <div class="my-container" data-text-field>
//     <div class="my-scrollable-area" data-text-field-area>
//         <div class="text-field-content wysiwyg-editable"
//              data-text-field-content
//              data-editable="wysiwyg"
//              data-field-key="content">
//             ${content}
//         </div>
//     </div>
// </div>
//
// The component will:
// - Automatically scale down text to fit the container
// - Use CSS custom property --text-field-scale for font-size calculations
// - Apply binary search for optimal scale (handles non-linear text reflow)
//
// CSS: Include styles/components/text-field.css for default styling

const DEFAULT_OPTIONS = {
  minScale: 0.25,
  maxScale: 1,
  iterations: 5
};

/**
 * Adjust text field scale based on container size.
 * Uses binary search to find optimal scale since font scaling is non-linear.
 *
 * @param {HTMLElement} container - Element with data-text-field attribute, or a parent containing one
 * @param {Object} options - Configuration options
 * @param {number} options.minScale - Minimum scale factor (default: 0.25)
 * @param {number} options.maxScale - Maximum scale factor (default: 1)
 * @param {number} options.iterations - Binary search iterations for precision (default: 5)
 */
export function adjustTextFieldScale(container, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Find the text field container
  const textField = container?.matches?.('[data-text-field]')
    ? container
    : container?.querySelector('[data-text-field]');

  if (!textField) return;

  const fieldArea = textField.querySelector('[data-text-field-area]');
  const fieldContent = textField.querySelector('[data-text-field-content]');

  if (!fieldArea || !fieldContent) return;

  // Temporarily set overflow hidden for measurement
  fieldArea.style.overflow = 'hidden';

  const availableHeight = fieldArea.clientHeight;

  // Binary search for optimal scale
  let minScale = opts.minScale;
  let maxScale = opts.maxScale;
  let scale = opts.maxScale;

  // Check if we need to scale down at all
  textField.style.setProperty('--text-field-scale', String(opts.maxScale));
  void fieldContent.offsetHeight; // Force reflow

  if (fieldContent.scrollHeight <= availableHeight) {
    fieldArea.style.overflow = '';
    return; // No scaling needed
  }

  // Binary search for the right scale
  for (let i = 0; i < opts.iterations; i++) {
    scale = (minScale + maxScale) / 2;
    textField.style.setProperty('--text-field-scale', String(scale));
    void fieldContent.offsetHeight; // Force reflow

    if (fieldContent.scrollHeight > availableHeight) {
      maxScale = scale; // Need smaller scale
    } else {
      minScale = scale; // Can try larger scale
    }
  }

  // Use the smaller of the two bounds to ensure content fits
  textField.style.setProperty('--text-field-scale', String(minScale));

  // Remove overflow hidden after calculation
  fieldArea.style.overflow = '';
}

/**
 * Adjust all text fields within a parent element
 * @param {HTMLElement} parent - Parent element to search within
 * @param {Object} options - Options passed to adjustTextFieldScale
 */
export function adjustAllTextFields(parent, options = {}) {
  const textFields = parent?.querySelectorAll?.('[data-text-field]') || [];
  textFields.forEach(field => adjustTextFieldScale(field, options));
}

/**
 * Create a MutationObserver that auto-scales text field when content changes.
 *
 * @param {HTMLElement} container - Element with data-text-field attribute
 * @param {Object} options - Configuration options
 * @returns {Function} Cleanup function to disconnect observer
 */
export function observeTextFieldChanges(container, options = {}) {
  const textField = container?.matches?.('[data-text-field]')
    ? container
    : container?.querySelector('[data-text-field]');

  if (!textField) return () => {};

  const fieldContent = textField.querySelector('[data-text-field-content]');
  if (!fieldContent) return () => {};

  // Debounce scaling adjustments with RAF
  let rafId = null;
  const debouncedAdjust = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      adjustTextFieldScale(textField, options);
      rafId = null;
    });
  };

  // Observe content changes
  const observer = new MutationObserver(debouncedAdjust);
  observer.observe(fieldContent, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Initial adjustment
  debouncedAdjust();

  // Return cleanup function
  return () => {
    observer.disconnect();
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/**
 * TextFieldComponent class for object-oriented usage
 */
export class TextFieldComponent {
  constructor(container, options = {}) {
    this.container = container?.matches?.('[data-text-field]')
      ? container
      : container?.querySelector('[data-text-field]');
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cleanup = null;
  }

  /**
   * Manually trigger scale adjustment
   */
  adjust() {
    adjustTextFieldScale(this.container, this.options);
  }

  /**
   * Start observing content changes and auto-adjusting
   */
  startObserving() {
    if (this.cleanup) this.cleanup();
    this.cleanup = observeTextFieldChanges(this.container, this.options);
  }

  /**
   * Stop observing content changes
   */
  stopObserving() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    this.stopObserving();
    this.container = null;
  }
}
