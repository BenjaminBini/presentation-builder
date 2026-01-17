// templates/renderer.js
// Main template render dispatcher
// Requires: templates/theme.js (getSlideColorStyles)
// Requires: templates/components/basic.js (renderTitleTemplate, renderSectionTemplate, renderBulletsTemplate, renderQuoteTemplate)
// Requires: templates/components/layout.js (renderTwoColumnsTemplate, renderImageTextTemplate)
// Requires: templates/components/code.js (renderCodeTemplate, renderCodeAnnotatedTemplate)
// Requires: templates/components/comparison.js (renderComparisonTemplate, renderMermaidTemplate, renderDrawioTemplate)
// Requires: templates/components/data.js (renderStatsTemplate, renderTimelineTemplate, renderAgendaTemplate)

/**
 * Render a slide template
 * Main dispatcher function that delegates to specific template renderers
 */
function renderTemplate(template, data) {
  const colorStyles = getSlideColorStyles(template, data.colors);

  switch (template) {
    case "title":
      return renderTitleTemplate(data, colorStyles);

    case "section":
      return renderSectionTemplate(data, colorStyles);

    case "bullets":
      return renderBulletsTemplate(data, colorStyles);

    case "two-columns":
      return renderTwoColumnsTemplate(data, colorStyles);

    case "image-text":
      return renderImageTextTemplate(data, colorStyles);

    case "quote":
      return renderQuoteTemplate(data, colorStyles);

    case "stats":
      return renderStatsTemplate(data, colorStyles);

    case "code":
      return renderCodeTemplate(data, colorStyles);

    case "code-annotated":
      return renderCodeAnnotatedTemplate(data, colorStyles);

    case "timeline":
      return renderTimelineTemplate(data, colorStyles);

    case "comparison":
      return renderComparisonTemplate(data, colorStyles);

    case "mermaid":
      return renderMermaidTemplate(data, colorStyles);

    case "agenda":
      return renderAgendaTemplate(data, colorStyles);

    case "drawio":
      return renderDrawioTemplate(data, colorStyles);

    default:
      return `<div class="slide-content" style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;">Template inconnu: ${template}</div>`;
  }
}
