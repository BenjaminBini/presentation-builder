// src/templates/renderer.js
// Main template render dispatcher
import { getSlideColorStyles } from './theme.js';
import { renderTitleTemplate, renderSectionTemplate, renderBulletsTemplate, renderQuoteTemplate } from './components/basic.js';
import { renderTwoColumnsTemplate, renderImageTextTemplate, renderTextTemplate } from './components/layout.js';
import { renderCodeTemplate, renderCodeAnnotatedTemplate } from './components/code.js';
import { renderComparisonTemplate, renderMermaidTemplate, renderDrawioTemplate } from './components/comparison.js';
import { renderStatsTemplate, renderTimelineTemplate, renderAgendaTemplate } from './components/data.js';
import { escapeHtml } from '../../infrastructure/utils/html.js';

/**
 * Render a slide template
 * Main dispatcher function that delegates to specific template renderers
 */
export function renderTemplate(template, data) {
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

    case "text":
      return renderTextTemplate(data, colorStyles);

    default:
      return `<div class="slide-content" style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;">Template inconnu: ${escapeHtml(template)}</div>`;
  }
}
