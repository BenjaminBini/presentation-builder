// src/infrastructure/slides/converter.js
// Convert presentation templates to Google Slides API requests

import { slidesAPI, EMU } from './api.js';
import { THEMES, GRAY_PALETTE, TEMPLATE_COLOR_SETTINGS } from '../../config/themes.js';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert hex color to RGB object (0-1 range for Slides API)
 * @param {string} hex - Hex color (e.g., '#FC6D26')
 * @returns {Object} { red, green, blue } (0-1 range)
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { red: 0, green: 0, blue: 0 };
  return {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255
  };
}

/**
 * Get color value from theme/palette with fallback
 * @param {Object} project - Project with theme
 * @param {string} colorKey - Color key (e.g., 'accent-main', 'gray-400')
 * @param {string} [defaultColor] - Fallback color key
 * @returns {Object} RGB color object
 */
function getColor(project, colorKey, defaultColor = 'white') {
  const themeBase = project?.theme?.base || 'gitlab';
  const themeColors = THEMES[themeBase]?.colors || THEMES.gitlab.colors;
  const overrides = project?.theme?.overrides || {};

  // Check overrides first
  if (overrides[colorKey]) {
    return hexToRgb(overrides[colorKey]);
  }

  // Check theme colors
  if (themeColors[colorKey]) {
    return hexToRgb(themeColors[colorKey]);
  }

  // Check gray palette
  if (GRAY_PALETTE[colorKey]) {
    return hexToRgb(GRAY_PALETTE[colorKey]);
  }

  // If it's already a hex color, use it
  if (colorKey?.startsWith('#')) {
    return hexToRgb(colorKey);
  }

  // Fallback
  if (defaultColor !== colorKey) {
    return getColor(project, defaultColor);
  }

  return hexToRgb('#FFFFFF');
}

/**
 * Get slide-specific color from slide data or template defaults
 * @param {Object} project - Project
 * @param {Object} slide - Slide data
 * @param {string} colorKey - Color key (e.g., 'bgColor')
 * @returns {Object} RGB color object
 */
function getSlideColor(project, slide, colorKey) {
  // Check for slide-specific override
  if (slide.data?.colors?.[colorKey]) {
    return getColor(project, slide.data.colors[colorKey]);
  }

  // Get template default
  const templateSettings = TEMPLATE_COLOR_SETTINGS[slide.template];
  if (templateSettings) {
    const setting = templateSettings.find(s => s.key === colorKey);
    if (setting) {
      return getColor(project, setting.default);
    }
  }

  return getColor(project, 'white');
}

/**
 * Build text element requests (create text box + insert text + style)
 * @param {string} slideId - Slide ID
 * @param {string} text - Text content
 * @param {Object} position - { x, y, width, height } in EMU
 * @param {Object} style - Text style options
 * @returns {Array<Object>} Array of requests
 */
function buildTextElement(slideId, text, position, style = {}) {
  const elementId = slidesAPI.generateObjectId();
  const requests = [];

  // Create text box
  requests.push(slidesAPI.buildCreateTextBoxRequest(slideId, position, elementId));

  // Insert text
  if (text) {
    requests.push(slidesAPI.buildInsertTextRequest(elementId, text));

    // Apply text style
    const textStyle = {};
    if (style.fontSize) textStyle.fontSize = style.fontSize;
    if (style.fontFamily) textStyle.fontFamily = style.fontFamily;
    if (style.bold !== undefined) textStyle.bold = style.bold;
    if (style.italic !== undefined) textStyle.italic = style.italic;
    if (style.foregroundColor) textStyle.foregroundColor = style.foregroundColor;

    if (Object.keys(textStyle).length > 0) {
      requests.push(slidesAPI.buildUpdateTextStyleRequest(elementId, textStyle));
    }

    // Apply paragraph style
    const paraStyle = {};
    if (style.alignment) paraStyle.alignment = style.alignment;
    if (style.lineSpacing) paraStyle.lineSpacing = style.lineSpacing;
    if (style.bulletPreset) paraStyle.bulletPreset = style.bulletPreset;

    if (Object.keys(paraStyle).length > 0) {
      requests.push(slidesAPI.buildUpdateParagraphStyleRequest(elementId, paraStyle));
    }
  }

  return requests;
}

// ============================================================================
// TEMPLATE CONVERTERS
// ============================================================================

/**
 * Convert title slide
 */
function convertTitle(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.35,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH
    }, {
      fontSize: 48,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'CENTER'
    }));
  }

  // Subtitle
  if (data.subtitle) {
    const subtitleColor = getSlideColor(project, slide, 'subtitleColor');
    requests.push(...buildTextElement(slideId, data.subtitle, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.5,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.5
    }, {
      fontSize: 24,
      fontFamily: 'Inter',
      foregroundColor: subtitleColor,
      alignment: 'CENTER'
    }));
  }

  // Author
  if (data.author) {
    const authorColor = getSlideColor(project, slide, 'authorColor');
    requests.push(...buildTextElement(slideId, data.author, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.7,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.3
    }, {
      fontSize: 16,
      fontFamily: 'Inter',
      foregroundColor: authorColor,
      alignment: 'CENTER'
    }));
  }

  // Date
  if (data.date) {
    requests.push(...buildTextElement(slideId, data.date, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.78,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.3
    }, {
      fontSize: 14,
      fontFamily: 'Inter',
      foregroundColor: getColor(project, 'gray-500'),
      alignment: 'CENTER'
    }));
  }

  // Logo (if provided)
  if (data.logo) {
    try {
      requests.push(slidesAPI.buildCreateImageRequest(slideId, data.logo, {
        x: EMU.SLIDE_WIDTH / 2 - EMU.INCH,
        y: EMU.INCH * 0.5,
        width: EMU.INCH * 2,
        height: EMU.INCH * 0.8
      }));
    } catch (e) {
      console.warn('Could not add logo image:', e);
    }
  }

  return requests;
}

/**
 * Convert section slide
 */
function convertSection(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Section number (large watermark style)
  if (data.number) {
    const numberColor = getSlideColor(project, slide, 'numberColor');
    requests.push(...buildTextElement(slideId, data.number, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.15,
      width: EMU.SLIDE_WIDTH * 0.3,
      height: EMU.INCH * 1.5
    }, {
      fontSize: 96,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: { ...numberColor, red: Math.min(1, numberColor.red + 0.1) },
      alignment: 'START'
    }));
  }

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.45,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH
    }, {
      fontSize: 44,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Subtitle
  if (data.subtitle) {
    const subtitleColor = getSlideColor(project, slide, 'subtitleColor');
    requests.push(...buildTextElement(slideId, data.subtitle, {
      x: EMU.MARGIN,
      y: EMU.SLIDE_HEIGHT * 0.6,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.5
    }, {
      fontSize: 20,
      fontFamily: 'Inter',
      foregroundColor: subtitleColor,
      alignment: 'START'
    }));
  }

  return requests;
}

/**
 * Convert bullets slide
 */
function convertBullets(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2 - EMU.INCH * 1.5,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Tag badge
  if (data.tag && data.showTag !== false) {
    const tagColor = getSlideColor(project, slide, 'tagColor');
    requests.push(...buildTextElement(slideId, data.tag, {
      x: EMU.SLIDE_WIDTH - EMU.MARGIN - EMU.INCH * 1.5,
      y: EMU.MARGIN,
      width: EMU.INCH * 1.5,
      height: EMU.INCH * 0.4
    }, {
      fontSize: 12,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: tagColor,
      alignment: 'END'
    }));
  }

  // Bullet items
  if (data.items && data.items.length > 0) {
    const textColor = getSlideColor(project, slide, 'textColor');
    const items = data.items.map(item => {
      if (typeof item === 'object') return item.text || '';
      return item || '';
    });
    const bulletText = items.join('\n');

    const elementId = slidesAPI.generateObjectId();
    requests.push(slidesAPI.buildCreateTextBoxRequest(slideId, {
      x: EMU.MARGIN,
      y: EMU.MARGIN + EMU.INCH,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.SLIDE_HEIGHT - EMU.MARGIN * 2 - EMU.INCH
    }, elementId));

    requests.push(slidesAPI.buildInsertTextRequest(elementId, bulletText));

    requests.push(slidesAPI.buildUpdateTextStyleRequest(elementId, {
      fontSize: 20,
      fontFamily: 'Inter',
      foregroundColor: textColor
    }));

    requests.push(slidesAPI.buildUpdateParagraphStyleRequest(elementId, {
      bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
      lineSpacing: 150
    }));
  }

  return requests;
}

/**
 * Convert two-columns slide
 */
function convertTwoColumns(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Main title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  const columnWidth = (EMU.SLIDE_WIDTH - EMU.MARGIN * 3) / 2;
  const columnTop = EMU.MARGIN + EMU.INCH;
  const columnHeight = EMU.SLIDE_HEIGHT - columnTop - EMU.MARGIN;
  const columnTitleColor = getSlideColor(project, slide, 'columnTitleColor');
  const textColor = getSlideColor(project, slide, 'textColor');

  // Left column
  if (data.left) {
    // Column title
    if (data.left.title) {
      requests.push(...buildTextElement(slideId, data.left.title, {
        x: EMU.MARGIN,
        y: columnTop,
        width: columnWidth,
        height: EMU.INCH * 0.5
      }, {
        fontSize: 20,
        fontFamily: 'Inter',
        bold: true,
        foregroundColor: columnTitleColor,
        alignment: 'START'
      }));
    }

    // Column items
    if (data.left.items && data.left.items.length > 0) {
      const leftText = data.left.items.join('\n');
      const elementId = slidesAPI.generateObjectId();

      requests.push(slidesAPI.buildCreateTextBoxRequest(slideId, {
        x: EMU.MARGIN,
        y: columnTop + EMU.INCH * 0.6,
        width: columnWidth,
        height: columnHeight - EMU.INCH * 0.6
      }, elementId));

      requests.push(slidesAPI.buildInsertTextRequest(elementId, leftText));
      requests.push(slidesAPI.buildUpdateTextStyleRequest(elementId, {
        fontSize: 16,
        fontFamily: 'Inter',
        foregroundColor: textColor
      }));
      requests.push(slidesAPI.buildUpdateParagraphStyleRequest(elementId, {
        bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        lineSpacing: 140
      }));
    }
  }

  // Right column
  if (data.right) {
    const rightX = EMU.MARGIN * 2 + columnWidth;

    // Column title
    if (data.right.title) {
      requests.push(...buildTextElement(slideId, data.right.title, {
        x: rightX,
        y: columnTop,
        width: columnWidth,
        height: EMU.INCH * 0.5
      }, {
        fontSize: 20,
        fontFamily: 'Inter',
        bold: true,
        foregroundColor: columnTitleColor,
        alignment: 'START'
      }));
    }

    // Column items
    if (data.right.items && data.right.items.length > 0) {
      const rightText = data.right.items.join('\n');
      const elementId = slidesAPI.generateObjectId();

      requests.push(slidesAPI.buildCreateTextBoxRequest(slideId, {
        x: rightX,
        y: columnTop + EMU.INCH * 0.6,
        width: columnWidth,
        height: columnHeight - EMU.INCH * 0.6
      }, elementId));

      requests.push(slidesAPI.buildInsertTextRequest(elementId, rightText));
      requests.push(slidesAPI.buildUpdateTextStyleRequest(elementId, {
        fontSize: 16,
        fontFamily: 'Inter',
        foregroundColor: textColor
      }));
      requests.push(slidesAPI.buildUpdateParagraphStyleRequest(elementId, {
        bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        lineSpacing: 140
      }));
    }
  }

  return requests;
}

/**
 * Convert image-text slide
 */
function convertImageText(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  const contentTop = EMU.MARGIN + EMU.INCH;
  const contentHeight = EMU.SLIDE_HEIGHT - contentTop - EMU.MARGIN;
  const imageWidth = (EMU.SLIDE_WIDTH - EMU.MARGIN * 3) * 0.45;
  const textWidth = EMU.SLIDE_WIDTH - EMU.MARGIN * 3 - imageWidth;

  // Image
  if (data.image) {
    try {
      requests.push(slidesAPI.buildCreateImageRequest(slideId, data.image, {
        x: EMU.MARGIN,
        y: contentTop,
        width: imageWidth,
        height: contentHeight
      }));
    } catch (e) {
      console.warn('Could not add image:', e);
    }
  }

  // Text
  if (data.text) {
    const textColor = getSlideColor(project, slide, 'textColor');
    // Split text by newlines for paragraphs
    const paragraphs = data.text.split('\n').filter(p => p.trim());
    const textContent = paragraphs.join('\n\n');

    requests.push(...buildTextElement(slideId, textContent, {
      x: EMU.MARGIN * 2 + imageWidth,
      y: contentTop,
      width: textWidth,
      height: contentHeight
    }, {
      fontSize: 18,
      fontFamily: 'Inter',
      foregroundColor: textColor,
      alignment: 'START',
      lineSpacing: 140
    }));
  }

  return requests;
}

/**
 * Convert quote slide
 */
function convertQuote(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Quote
  if (data.quote) {
    const quoteColor = getSlideColor(project, slide, 'quoteColor');
    requests.push(...buildTextElement(slideId, `"${data.quote}"`, {
      x: EMU.MARGIN_LARGE,
      y: EMU.SLIDE_HEIGHT * 0.2,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN_LARGE * 2,
      height: EMU.SLIDE_HEIGHT * 0.45
    }, {
      fontSize: 28,
      fontFamily: 'Inter',
      italic: true,
      foregroundColor: quoteColor,
      alignment: 'CENTER',
      lineSpacing: 150
    }));
  }

  // Author info
  const authorNameColor = getSlideColor(project, slide, 'authorNameColor');
  const authorTitleColor = getSlideColor(project, slide, 'authorTitleColor');

  if (data.authorName) {
    requests.push(...buildTextElement(slideId, data.authorName, {
      x: EMU.MARGIN_LARGE,
      y: EMU.SLIDE_HEIGHT * 0.7,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN_LARGE * 2,
      height: EMU.INCH * 0.4
    }, {
      fontSize: 18,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: authorNameColor,
      alignment: 'CENTER'
    }));
  }

  if (data.authorTitle) {
    requests.push(...buildTextElement(slideId, data.authorTitle, {
      x: EMU.MARGIN_LARGE,
      y: EMU.SLIDE_HEIGHT * 0.78,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN_LARGE * 2,
      height: EMU.INCH * 0.3
    }, {
      fontSize: 14,
      fontFamily: 'Inter',
      foregroundColor: authorTitleColor,
      alignment: 'CENTER'
    }));
  }

  // Author image
  if (data.authorImage) {
    try {
      requests.push(slidesAPI.buildCreateImageRequest(slideId, data.authorImage, {
        x: EMU.SLIDE_WIDTH / 2 - EMU.INCH * 0.4,
        y: EMU.SLIDE_HEIGHT * 0.85,
        width: EMU.INCH * 0.8,
        height: EMU.INCH * 0.8
      }));
    } catch (e) {
      console.warn('Could not add author image:', e);
    }
  }

  return requests;
}

/**
 * Convert stats slide
 */
function convertStats(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'CENTER'
    }));
  }

  // Stats
  if (data.stats && data.stats.length > 0) {
    const valueColor = getSlideColor(project, slide, 'valueColor');
    const labelColor = getSlideColor(project, slide, 'labelColor');
    const changeColor = getSlideColor(project, slide, 'changeColor');

    const statsCount = Math.min(data.stats.length, 4);
    const statWidth = (EMU.SLIDE_WIDTH - EMU.MARGIN * 2) / statsCount;
    const statTop = EMU.SLIDE_HEIGHT * 0.35;

    data.stats.slice(0, statsCount).forEach((stat, index) => {
      const x = EMU.MARGIN + statWidth * index;

      // Value
      if (stat.value) {
        requests.push(...buildTextElement(slideId, stat.value, {
          x,
          y: statTop,
          width: statWidth,
          height: EMU.INCH
        }, {
          fontSize: 56,
          fontFamily: 'Inter',
          bold: true,
          foregroundColor: valueColor,
          alignment: 'CENTER'
        }));
      }

      // Label
      if (stat.label) {
        requests.push(...buildTextElement(slideId, stat.label, {
          x,
          y: statTop + EMU.INCH * 1.2,
          width: statWidth,
          height: EMU.INCH * 0.5
        }, {
          fontSize: 16,
          fontFamily: 'Inter',
          foregroundColor: labelColor,
          alignment: 'CENTER'
        }));
      }

      // Change
      if (stat.change) {
        const isNegative = stat.change.startsWith('-');
        let changeTextColor = changeColor;
        if (isNegative) {
          changeTextColor = getColor(project, 'error');
        }

        requests.push(...buildTextElement(slideId, stat.change, {
          x,
          y: statTop + EMU.INCH * 1.7,
          width: statWidth,
          height: EMU.INCH * 0.3
        }, {
          fontSize: 14,
          fontFamily: 'Inter',
          bold: true,
          foregroundColor: changeTextColor,
          alignment: 'CENTER'
        }));
      }
    });
  }

  return requests;
}

/**
 * Convert code slide
 */
function convertCode(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 28,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  const codeTop = EMU.MARGIN + EMU.INCH;
  const codeHeight = EMU.SLIDE_HEIGHT - codeTop - EMU.MARGIN - (data.description ? EMU.INCH * 0.5 : 0);

  // Code window background
  const windowBgColor = getSlideColor(project, slide, 'windowBgColor');
  const bgId = slidesAPI.generateObjectId();
  requests.push(slidesAPI.buildCreateRectangleRequest(slideId, {
    x: EMU.MARGIN,
    y: codeTop,
    width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
    height: codeHeight
  }, bgId));
  requests.push(slidesAPI.buildUpdateShapePropertiesRequest(bgId, {
    fillColor: windowBgColor,
    outlineNone: true
  }));

  // Filename header
  if (data.filename) {
    requests.push(...buildTextElement(slideId, data.filename, {
      x: EMU.MARGIN + EMU.INCH * 0.2,
      y: codeTop + EMU.INCH * 0.1,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2 - EMU.INCH * 0.4,
      height: EMU.INCH * 0.3
    }, {
      fontSize: 12,
      fontFamily: 'Roboto Mono',
      foregroundColor: getColor(project, 'gray-400'),
      alignment: 'START'
    }));
  }

  // Code content
  if (data.code) {
    requests.push(...buildTextElement(slideId, data.code, {
      x: EMU.MARGIN + EMU.INCH * 0.2,
      y: codeTop + EMU.INCH * 0.5,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2 - EMU.INCH * 0.4,
      height: codeHeight - EMU.INCH * 0.6
    }, {
      fontSize: 14,
      fontFamily: 'Roboto Mono',
      foregroundColor: getColor(project, 'gray-100'),
      alignment: 'START',
      lineSpacing: 130
    }));
  }

  // Description
  if (data.description) {
    const descColor = getSlideColor(project, slide, 'descriptionColor');
    requests.push(...buildTextElement(slideId, data.description, {
      x: EMU.MARGIN,
      y: codeTop + codeHeight + EMU.INCH * 0.1,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.4
    }, {
      fontSize: 14,
      fontFamily: 'Inter',
      foregroundColor: descColor,
      alignment: 'START'
    }));
  }

  return requests;
}

/**
 * Convert code-annotated slide
 */
function convertCodeAnnotated(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 28,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  const contentTop = EMU.MARGIN + EMU.INCH;
  const contentHeight = EMU.SLIDE_HEIGHT - contentTop - EMU.MARGIN;
  const codeWidth = (EMU.SLIDE_WIDTH - EMU.MARGIN * 3) * 0.55;
  const annotationWidth = EMU.SLIDE_WIDTH - EMU.MARGIN * 3 - codeWidth;

  // Code window background
  const windowBgColor = getSlideColor(project, slide, 'windowBgColor');
  const bgId = slidesAPI.generateObjectId();
  requests.push(slidesAPI.buildCreateRectangleRequest(slideId, {
    x: EMU.MARGIN,
    y: contentTop,
    width: codeWidth,
    height: contentHeight
  }, bgId));
  requests.push(slidesAPI.buildUpdateShapePropertiesRequest(bgId, {
    fillColor: windowBgColor,
    outlineNone: true
  }));

  // Code content
  if (data.code) {
    const codeLines = data.code.split('\n');
    const startLine = data.startLine || 1;
    const numberedCode = codeLines.map((line, i) => `${startLine + i}  ${line}`).join('\n');

    requests.push(...buildTextElement(slideId, numberedCode, {
      x: EMU.MARGIN + EMU.INCH * 0.15,
      y: contentTop + EMU.INCH * 0.15,
      width: codeWidth - EMU.INCH * 0.3,
      height: contentHeight - EMU.INCH * 0.3
    }, {
      fontSize: 12,
      fontFamily: 'Roboto Mono',
      foregroundColor: getColor(project, 'gray-100'),
      alignment: 'START',
      lineSpacing: 125
    }));
  }

  // Annotations
  if (data.annotations && data.annotations.length > 0) {
    const annotationBgColor = getSlideColor(project, slide, 'annotationBgColor');
    const annotationTextColor = getSlideColor(project, slide, 'annotationTextColor');
    const annotationX = EMU.MARGIN * 2 + codeWidth;
    const annotationSpacing = contentHeight / Math.max(data.annotations.length, 1);

    data.annotations.forEach((annotation, index) => {
      const y = contentTop + annotationSpacing * index + EMU.INCH * 0.2;

      // Annotation background
      const annBgId = slidesAPI.generateObjectId();
      requests.push(slidesAPI.buildCreateRectangleRequest(slideId, {
        x: annotationX,
        y,
        width: annotationWidth,
        height: annotationSpacing - EMU.INCH * 0.3
      }, annBgId));
      requests.push(slidesAPI.buildUpdateShapePropertiesRequest(annBgId, {
        fillColor: annotationBgColor,
        outlineNone: true
      }));

      // Annotation text
      const annotationContent = annotation.title
        ? `${annotation.title}\n${annotation.text || ''}`
        : annotation.text || '';

      requests.push(...buildTextElement(slideId, annotationContent, {
        x: annotationX + EMU.INCH * 0.15,
        y: y + EMU.INCH * 0.1,
        width: annotationWidth - EMU.INCH * 0.3,
        height: annotationSpacing - EMU.INCH * 0.5
      }, {
        fontSize: 12,
        fontFamily: 'Inter',
        foregroundColor: annotationTextColor,
        alignment: 'START'
      }));
    });
  }

  return requests;
}

/**
 * Convert timeline slide
 */
function convertTimeline(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'CENTER'
    }));
  }

  // Timeline steps
  if (data.steps && data.steps.length > 0) {
    const iconColor = getSlideColor(project, slide, 'iconColor');
    const stepTitleColor = getSlideColor(project, slide, 'stepTitleColor');
    const stepDescColor = getSlideColor(project, slide, 'stepDescColor');

    const stepsCount = data.steps.length;
    const stepWidth = (EMU.SLIDE_WIDTH - EMU.MARGIN * 2) / stepsCount;
    const timelineY = EMU.SLIDE_HEIGHT * 0.45;

    // Connecting line
    const lineId = slidesAPI.generateObjectId();
    requests.push(slidesAPI.buildCreateLineRequest(slideId,
      { x: EMU.MARGIN + stepWidth * 0.5, y: timelineY },
      { x: EMU.SLIDE_WIDTH - EMU.MARGIN - stepWidth * 0.5, y: timelineY },
      lineId
    ));
    requests.push(slidesAPI.buildUpdateLinePropertiesRequest(lineId, {
      weight: 2,
      lineFill: getColor(project, 'gray-300')
    }));

    data.steps.forEach((step, index) => {
      const x = EMU.MARGIN + stepWidth * index;
      const centerX = x + stepWidth / 2;

      // Circle/icon background
      const circleId = slidesAPI.generateObjectId();
      const circleSize = EMU.INCH * 0.6;
      requests.push({
        createShape: {
          objectId: circleId,
          shapeType: 'ELLIPSE',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: circleSize, unit: 'EMU' },
              height: { magnitude: circleSize, unit: 'EMU' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: centerX - circleSize / 2,
              translateY: timelineY - circleSize / 2,
              unit: 'EMU'
            }
          }
        }
      });
      requests.push(slidesAPI.buildUpdateShapePropertiesRequest(circleId, {
        fillColor: iconColor,
        outlineNone: true
      }));

      // Icon/number
      if (step.icon) {
        requests.push(...buildTextElement(slideId, step.icon, {
          x: centerX - EMU.INCH * 0.3,
          y: timelineY - EMU.INCH * 0.2,
          width: EMU.INCH * 0.6,
          height: EMU.INCH * 0.4
        }, {
          fontSize: 18,
          fontFamily: 'Inter',
          bold: true,
          foregroundColor: { red: 1, green: 1, blue: 1 },
          alignment: 'CENTER'
        }));
      }

      // Step title
      if (step.title) {
        requests.push(...buildTextElement(slideId, step.title, {
          x,
          y: timelineY + EMU.INCH * 0.5,
          width: stepWidth,
          height: EMU.INCH * 0.4
        }, {
          fontSize: 16,
          fontFamily: 'Inter',
          bold: true,
          foregroundColor: stepTitleColor,
          alignment: 'CENTER'
        }));
      }

      // Step description
      if (step.description) {
        requests.push(...buildTextElement(slideId, step.description, {
          x,
          y: timelineY + EMU.INCH * 0.9,
          width: stepWidth,
          height: EMU.INCH * 0.6
        }, {
          fontSize: 12,
          fontFamily: 'Inter',
          foregroundColor: stepDescColor,
          alignment: 'CENTER'
        }));
      }
    });
  }

  return requests;
}

/**
 * Convert comparison/table slide
 */
function convertComparison(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Table
  if (data.columns && data.rows) {
    const cols = data.columns.length;
    const rows = data.rows.length + 1; // +1 for header
    const tableTop = EMU.MARGIN + EMU.INCH;
    const tableHeight = EMU.SLIDE_HEIGHT - tableTop - EMU.MARGIN;
    const tableWidth = EMU.SLIDE_WIDTH - EMU.MARGIN * 2;

    const tableId = slidesAPI.generateObjectId();
    requests.push(slidesAPI.buildCreateTableRequest(slideId, rows, cols, {
      x: EMU.MARGIN,
      y: tableTop,
      width: tableWidth,
      height: tableHeight
    }, tableId));

    // Header row
    const headerBgColor = getSlideColor(project, slide, 'headerBgColor');

    data.columns.forEach((col, colIndex) => {
      requests.push(slidesAPI.buildInsertTableTextRequest(tableId, 0, colIndex, col));
      requests.push(slidesAPI.buildUpdateTableCellPropertiesRequest(tableId, 0, colIndex, {
        backgroundColor: headerBgColor
      }));
    });

    // Data rows
    const highlightCol = data.highlightColumn ? data.highlightColumn - 1 : -1;
    const highlightColor = getSlideColor(project, slide, 'highlightColor');

    data.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        let cellText = cell;
        // Handle boolean values
        if (cell === true || cell === 'true') {
          cellText = '✓';
        } else if (cell === false || cell === 'false') {
          cellText = '✗';
        }

        requests.push(slidesAPI.buildInsertTableTextRequest(tableId, rowIndex + 1, colIndex, String(cellText)));

        // Highlight column
        if (colIndex === highlightCol) {
          requests.push(slidesAPI.buildUpdateTableCellPropertiesRequest(tableId, rowIndex + 1, colIndex, {
            backgroundColor: { ...highlightColor, red: highlightColor.red * 0.2, green: highlightColor.green * 0.2, blue: highlightColor.blue * 0.2 }
          }));
        }
      });
    });
  }

  return requests;
}

/**
 * Convert mermaid slide (render as placeholder text since we can't easily render Mermaid to image)
 */
function convertMermaid(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Description
  if (data.description) {
    const descColor = getSlideColor(project, slide, 'descriptionColor');
    requests.push(...buildTextElement(slideId, data.description, {
      x: EMU.MARGIN,
      y: EMU.MARGIN + EMU.INCH * 0.7,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.4
    }, {
      fontSize: 16,
      fontFamily: 'Inter',
      foregroundColor: descColor,
      alignment: 'START'
    }));
  }

  // Mermaid diagram - show as code block (diagram can't be rendered server-side easily)
  if (data.diagram) {
    const contentTop = EMU.MARGIN + EMU.INCH * 1.2;
    const contentHeight = EMU.SLIDE_HEIGHT - contentTop - EMU.MARGIN;

    // Code background
    const bgId = slidesAPI.generateObjectId();
    requests.push(slidesAPI.buildCreateRectangleRequest(slideId, {
      x: EMU.MARGIN,
      y: contentTop,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: contentHeight
    }, bgId));
    requests.push(slidesAPI.buildUpdateShapePropertiesRequest(bgId, {
      fillColor: getColor(project, 'gray-900'),
      outlineNone: true
    }));

    // Diagram code
    requests.push(...buildTextElement(slideId, `[Mermaid Diagram]\n\n${data.diagram}`, {
      x: EMU.MARGIN + EMU.INCH * 0.2,
      y: contentTop + EMU.INCH * 0.2,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2 - EMU.INCH * 0.4,
      height: contentHeight - EMU.INCH * 0.4
    }, {
      fontSize: 14,
      fontFamily: 'Roboto Mono',
      foregroundColor: getColor(project, 'gray-300'),
      alignment: 'START',
      lineSpacing: 130
    }));
  }

  return requests;
}

/**
 * Convert agenda slide
 */
function convertAgenda(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Agenda items
  if (data.items && data.items.length > 0) {
    const numberColor = getSlideColor(project, slide, 'numberColor');
    const itemColor = getSlideColor(project, slide, 'itemColor');
    const durationColor = getSlideColor(project, slide, 'durationColor');

    const itemTop = EMU.MARGIN + EMU.INCH;
    const itemHeight = (EMU.SLIDE_HEIGHT - itemTop - EMU.MARGIN) / Math.max(data.items.length, 1);

    data.items.forEach((item, index) => {
      const y = itemTop + itemHeight * index;

      // Number
      requests.push(...buildTextElement(slideId, String(index + 1).padStart(2, '0'), {
        x: EMU.MARGIN,
        y,
        width: EMU.INCH * 0.6,
        height: itemHeight * 0.8
      }, {
        fontSize: 24,
        fontFamily: 'Inter',
        bold: true,
        foregroundColor: numberColor,
        alignment: 'START'
      }));

      // Topic
      const topic = typeof item === 'object' ? item.topic : item;
      if (topic) {
        requests.push(...buildTextElement(slideId, topic, {
          x: EMU.MARGIN + EMU.INCH * 0.8,
          y,
          width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2 - EMU.INCH * 2,
          height: itemHeight * 0.8
        }, {
          fontSize: 20,
          fontFamily: 'Inter',
          foregroundColor: itemColor,
          alignment: 'START'
        }));
      }

      // Duration
      const duration = typeof item === 'object' ? item.duration : null;
      if (duration) {
        requests.push(...buildTextElement(slideId, duration, {
          x: EMU.SLIDE_WIDTH - EMU.MARGIN - EMU.INCH,
          y,
          width: EMU.INCH,
          height: itemHeight * 0.8
        }, {
          fontSize: 14,
          fontFamily: 'Inter',
          foregroundColor: durationColor,
          alignment: 'END'
        }));
      }
    });
  }

  return requests;
}

/**
 * Convert drawio slide (placeholder - can't render draw.io XML to image)
 */
function convertDrawio(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Placeholder for Draw.io diagram
  requests.push(...buildTextElement(slideId, '[Draw.io Diagram - Export from original editor]', {
    x: EMU.MARGIN,
    y: EMU.SLIDE_HEIGHT * 0.4,
    width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
    height: EMU.INCH
  }, {
    fontSize: 20,
    fontFamily: 'Inter',
    foregroundColor: getColor(project, 'gray-500'),
    alignment: 'CENTER'
  }));

  return requests;
}

/**
 * Convert text slide (rich text)
 */
function convertText(project, slide, slideId) {
  const data = slide.data || {};
  const requests = [];

  // Background
  const bgColor = getSlideColor(project, slide, 'bgColor');
  requests.push(slidesAPI.buildSetSlideBackgroundRequest(slideId, bgColor));

  // Title
  if (data.title) {
    const titleColor = getSlideColor(project, slide, 'titleColor');
    requests.push(...buildTextElement(slideId, data.title, {
      x: EMU.MARGIN,
      y: EMU.MARGIN,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.INCH * 0.6
    }, {
      fontSize: 32,
      fontFamily: 'Inter',
      bold: true,
      foregroundColor: titleColor,
      alignment: 'START'
    }));
  }

  // Content (strip HTML tags for plain text)
  if (data.content) {
    const textColor = getSlideColor(project, slide, 'textColor');
    // Strip HTML tags and convert to plain text
    const plainText = data.content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    requests.push(...buildTextElement(slideId, plainText, {
      x: EMU.MARGIN,
      y: EMU.MARGIN + EMU.INCH,
      width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
      height: EMU.SLIDE_HEIGHT - EMU.MARGIN * 2 - EMU.INCH
    }, {
      fontSize: 18,
      fontFamily: 'Inter',
      foregroundColor: textColor,
      alignment: 'START',
      lineSpacing: 150
    }));
  }

  return requests;
}

// ============================================================================
// MAIN CONVERTER
// ============================================================================

/**
 * Map of template types to converter functions
 */
const CONVERTERS = {
  title: convertTitle,
  section: convertSection,
  bullets: convertBullets,
  'two-columns': convertTwoColumns,
  'image-text': convertImageText,
  quote: convertQuote,
  stats: convertStats,
  code: convertCode,
  'code-annotated': convertCodeAnnotated,
  timeline: convertTimeline,
  comparison: convertComparison,
  mermaid: convertMermaid,
  agenda: convertAgenda,
  drawio: convertDrawio,
  text: convertText
};

/**
 * Convert a single slide to Google Slides API requests
 * @param {Object} project - Full project
 * @param {Object} slide - Slide to convert
 * @param {string} slideId - Google Slides slide ID
 * @returns {Array<Object>} Array of API requests
 */
export function convertSlide(project, slide, slideId) {
  const converter = CONVERTERS[slide.template];
  if (converter) {
    return converter(project, slide, slideId);
  }

  // Fallback: show template name
  return buildTextElement(slideId, `[Unsupported template: ${slide.template}]`, {
    x: EMU.MARGIN,
    y: EMU.SLIDE_HEIGHT * 0.4,
    width: EMU.SLIDE_WIDTH - EMU.MARGIN * 2,
    height: EMU.INCH
  }, {
    fontSize: 24,
    fontFamily: 'Inter',
    foregroundColor: hexToRgb('#888888'),
    alignment: 'CENTER'
  });
}

/**
 * Convert entire presentation to Google Slides
 * @param {Object} project - Project to convert
 * @returns {Promise<Object>} Created presentation with URL
 */
export async function convertPresentation(project) {
  // Create blank presentation
  const presentation = await slidesAPI.createPresentation(project.name || 'Sans titre');
  const presentationId = presentation.presentationId;

  // Get the default first slide ID (to delete later)
  const defaultSlideId = presentation.slides?.[0]?.objectId;

  const allRequests = [];
  const slideIds = [];

  // Create slides and collect content requests
  for (let i = 0; i < project.slides.length; i++) {
    const slideId = slidesAPI.generateObjectId();
    slideIds.push(slideId);

    // Create slide
    allRequests.push(slidesAPI.buildCreateSlideRequest(slideId, i));
  }

  // Execute slide creation first
  if (allRequests.length > 0) {
    await slidesAPI.batchUpdate(presentationId, allRequests);
  }

  // Now add content to each slide
  for (let i = 0; i < project.slides.length; i++) {
    const slide = project.slides[i];
    const slideId = slideIds[i];
    const contentRequests = convertSlide(project, slide, slideId);

    if (contentRequests.length > 0) {
      try {
        await slidesAPI.batchUpdate(presentationId, contentRequests);
      } catch (e) {
        console.warn(`Error adding content to slide ${i + 1}:`, e);
      }
    }
  }

  // Delete the default blank slide if we created our own slides
  if (defaultSlideId && slideIds.length > 0) {
    try {
      await slidesAPI.batchUpdate(presentationId, [
        slidesAPI.buildDeleteSlideRequest(defaultSlideId)
      ]);
    } catch (e) {
      console.warn('Could not delete default slide:', e);
    }
  }

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`
  };
}

export default convertPresentation;
