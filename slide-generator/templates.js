// templates.js
// Shared template definitions and render functions

const { escapeHtml } = require('./utils');
const {
    renderTitle,
    renderSection,
    renderBullets,
    renderTwoColumns,
    renderImageText,
    renderQuote,
    renderStats,
    renderCode,
    renderCodeAnnotated,
    renderTimeline,
    renderComparison,
    renderMermaid,
    renderDrawio
} = require('./renderers');

/**
 * Template registry mapping template names to their render functions
 */
const templates = {
    'title': renderTitle,
    'section': renderSection,
    'bullets': renderBullets,
    'two-columns': renderTwoColumns,
    'image-text': renderImageText,
    'quote': renderQuote,
    'stats': renderStats,
    'code': renderCode,
    'code-annotated': renderCodeAnnotated,
    'timeline': renderTimeline,
    'comparison': renderComparison,
    'mermaid': renderMermaid,
    'drawio': renderDrawio
};

/**
 * Render a single slide based on its template and data
 * @param {Object} slideData - Slide configuration with template and data
 * @returns {string} Rendered HTML for the slide
 */
function renderSlide(slideData) {
    const { template, data } = slideData;
    if (templates[template]) {
        return templates[template](data);
    }
    return `<div class="slide"><p>Unknown template: ${escapeHtml(template)}</p></div>`;
}

/**
 * Generate HTML for all slides with wrapper divs
 * @param {Array} slides - Array of slide configurations
 * @returns {string} Complete slides HTML
 */
function generateSlidesHtml(slides) {
    return slides.map(slide => `<div class="slide-wrapper">${renderSlide(slide)}</div>`).join('\n');
}

module.exports = {
    templates,
    renderSlide,
    generateSlidesHtml
};
