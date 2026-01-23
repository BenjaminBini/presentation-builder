// src/infrastructure/slides/api.js
// Google Slides API wrapper for creating and modifying presentations (server-based)

import { driveAuth } from '../drive/auth.js';

// EMU (English Metric Units) constants
// 1 inch = 914400 EMU, 1 point = 12700 EMU
export const EMU = {
  INCH: 914400,
  POINT: 12700,
  // Standard 16:9 slide dimensions (10" x 5.625")
  SLIDE_WIDTH: 9144000,
  SLIDE_HEIGHT: 5143500,
  // Common margins
  MARGIN: 457200, // 0.5 inch
  MARGIN_LARGE: 685800, // 0.75 inch
};

/**
 * SlidesAPI - Google Slides API wrapper (via server proxy)
 */
class SlidesAPI {
  /**
   * Create a new blank presentation
   * @param {string} title - Presentation title
   * @returns {Promise<Object>} Created presentation metadata
   */
  async createPresentation(title) {
    await driveAuth.ensureValidToken();

    const response = await fetch('/api/slides/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title || 'Sans titre'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create presentation');
    }

    return await response.json();
  }

  /**
   * Get presentation details
   * @param {string} presentationId - Presentation ID
   * @returns {Promise<Object>} Presentation metadata
   */
  async getPresentation(presentationId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/slides/presentations/${presentationId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get presentation');
    }

    return await response.json();
  }

  /**
   * Execute a batch update on a presentation
   * @param {string} presentationId - Presentation ID
   * @param {Array<Object>} requests - Array of update requests
   * @returns {Promise<Object>} Batch update response
   */
  async batchUpdate(presentationId, requests) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/slides/presentations/${presentationId}/batchUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to batch update presentation');
    }

    return await response.json();
  }

  /**
   * Generate a unique object ID for elements
   * @returns {string} Unique ID
   */
  generateObjectId() {
    return 'obj_' + Math.random().toString(36).substring(2, 11);
  }

  // ============================================================================
  // REQUEST BUILDERS - Generate request objects for batch updates
  // ============================================================================

  /**
   * Build request to create a new blank slide
   * @param {string} [slideId] - Optional slide ID
   * @param {number} [insertionIndex] - Optional position to insert
   * @returns {Object} Create slide request
   */
  buildCreateSlideRequest(slideId, insertionIndex) {
    const request = {
      createSlide: {
        objectId: slideId || this.generateObjectId(),
        slideLayoutReference: {
          predefinedLayout: 'BLANK'
        }
      }
    };

    if (insertionIndex !== undefined) {
      request.createSlide.insertionIndex = insertionIndex;
    }

    return request;
  }

  /**
   * Build request to create a text box
   * @param {string} slideId - Slide ID to add text box to
   * @param {Object} position - { x, y, width, height } in EMU
   * @param {string} [elementId] - Optional element ID
   * @returns {Object} Create shape request
   */
  buildCreateTextBoxRequest(slideId, position, elementId) {
    return {
      createShape: {
        objectId: elementId || this.generateObjectId(),
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: position.width, unit: 'EMU' },
            height: { magnitude: position.height, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: position.x,
            translateY: position.y,
            unit: 'EMU'
          }
        }
      }
    };
  }

  /**
   * Build request to insert text into a text box
   * @param {string} elementId - Element ID
   * @param {string} text - Text to insert
   * @param {number} [insertionIndex] - Character index to insert at (0 for start)
   * @returns {Object} Insert text request
   */
  buildInsertTextRequest(elementId, text, insertionIndex = 0) {
    return {
      insertText: {
        objectId: elementId,
        text: text,
        insertionIndex
      }
    };
  }

  /**
   * Build request to update text style
   * @param {string} elementId - Element ID
   * @param {Object} style - Style properties
   * @param {Object} range - Text range { startIndex, endIndex } or 'ALL'
   * @returns {Object} Update text style request
   */
  buildUpdateTextStyleRequest(elementId, style, range = 'ALL') {
    const request = {
      updateTextStyle: {
        objectId: elementId,
        style: {},
        fields: ''
      }
    };

    // Build style object and fields string
    const fields = [];

    if (style.fontSize) {
      request.updateTextStyle.style.fontSize = {
        magnitude: style.fontSize,
        unit: 'PT'
      };
      fields.push('fontSize');
    }

    if (style.fontFamily) {
      request.updateTextStyle.style.fontFamily = style.fontFamily;
      fields.push('fontFamily');
    }

    if (style.bold !== undefined) {
      request.updateTextStyle.style.bold = style.bold;
      fields.push('bold');
    }

    if (style.italic !== undefined) {
      request.updateTextStyle.style.italic = style.italic;
      fields.push('italic');
    }

    if (style.foregroundColor) {
      request.updateTextStyle.style.foregroundColor = {
        opaqueColor: {
          rgbColor: style.foregroundColor
        }
      };
      fields.push('foregroundColor');
    }

    request.updateTextStyle.fields = fields.join(',');

    if (range === 'ALL') {
      request.updateTextStyle.textRange = { type: 'ALL' };
    } else {
      request.updateTextStyle.textRange = {
        type: 'FIXED_RANGE',
        startIndex: range.startIndex,
        endIndex: range.endIndex
      };
    }

    return request;
  }

  /**
   * Build request to update paragraph style
   * @param {string} elementId - Element ID
   * @param {Object} style - Paragraph style properties
   * @param {Object} range - Text range or 'ALL'
   * @returns {Object} Update paragraph style request
   */
  buildUpdateParagraphStyleRequest(elementId, style, range = 'ALL') {
    const request = {
      updateParagraphStyle: {
        objectId: elementId,
        style: {},
        fields: ''
      }
    };

    const fields = [];

    if (style.alignment) {
      request.updateParagraphStyle.style.alignment = style.alignment;
      fields.push('alignment');
    }

    if (style.lineSpacing) {
      request.updateParagraphStyle.style.lineSpacing = style.lineSpacing;
      fields.push('lineSpacing');
    }

    if (style.spaceAbove) {
      request.updateParagraphStyle.style.spaceAbove = {
        magnitude: style.spaceAbove,
        unit: 'PT'
      };
      fields.push('spaceAbove');
    }

    if (style.spaceBelow) {
      request.updateParagraphStyle.style.spaceBelow = {
        magnitude: style.spaceBelow,
        unit: 'PT'
      };
      fields.push('spaceBelow');
    }

    if (style.bulletPreset) {
      request.updateParagraphStyle.style.bulletPreset = style.bulletPreset;
      fields.push('bulletPreset');
    }

    if (style.indentStart) {
      request.updateParagraphStyle.style.indentStart = {
        magnitude: style.indentStart,
        unit: 'PT'
      };
      fields.push('indentStart');
    }

    if (style.indentFirstLine) {
      request.updateParagraphStyle.style.indentFirstLine = {
        magnitude: style.indentFirstLine,
        unit: 'PT'
      };
      fields.push('indentFirstLine');
    }

    request.updateParagraphStyle.fields = fields.join(',');

    if (range === 'ALL') {
      request.updateParagraphStyle.textRange = { type: 'ALL' };
    } else {
      request.updateParagraphStyle.textRange = {
        type: 'FIXED_RANGE',
        startIndex: range.startIndex,
        endIndex: range.endIndex
      };
    }

    return request;
  }

  /**
   * Build request to create a rectangle shape
   * @param {string} slideId - Slide ID
   * @param {Object} position - { x, y, width, height } in EMU
   * @param {string} [elementId] - Optional element ID
   * @returns {Object} Create shape request
   */
  buildCreateRectangleRequest(slideId, position, elementId) {
    return {
      createShape: {
        objectId: elementId || this.generateObjectId(),
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: position.width, unit: 'EMU' },
            height: { magnitude: position.height, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: position.x,
            translateY: position.y,
            unit: 'EMU'
          }
        }
      }
    };
  }

  /**
   * Build request to update shape properties (fill color, outline, etc.)
   * @param {string} elementId - Element ID
   * @param {Object} properties - Shape properties
   * @returns {Object} Update shape properties request
   */
  buildUpdateShapePropertiesRequest(elementId, properties) {
    const request = {
      updateShapeProperties: {
        objectId: elementId,
        shapeProperties: {},
        fields: ''
      }
    };

    const fields = [];

    if (properties.fillColor) {
      request.updateShapeProperties.shapeProperties.shapeBackgroundFill = {
        solidFill: {
          color: {
            rgbColor: properties.fillColor
          }
        }
      };
      fields.push('shapeBackgroundFill.solidFill.color');
    }

    if (properties.outline) {
      request.updateShapeProperties.shapeProperties.outline = properties.outline;
      fields.push('outline');
    }

    if (properties.outlineNone) {
      request.updateShapeProperties.shapeProperties.outline = {
        propertyState: 'NOT_RENDERED'
      };
      fields.push('outline');
    }

    request.updateShapeProperties.fields = fields.join(',');

    return request;
  }

  /**
   * Build request to create an image
   * @param {string} slideId - Slide ID
   * @param {string} imageUrl - URL of the image
   * @param {Object} position - { x, y, width, height } in EMU
   * @param {string} [elementId] - Optional element ID
   * @returns {Object} Create image request
   */
  buildCreateImageRequest(slideId, imageUrl, position, elementId) {
    return {
      createImage: {
        objectId: elementId || this.generateObjectId(),
        url: imageUrl,
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: position.width, unit: 'EMU' },
            height: { magnitude: position.height, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: position.x,
            translateY: position.y,
            unit: 'EMU'
          }
        }
      }
    };
  }

  /**
   * Build request to create a table
   * @param {string} slideId - Slide ID
   * @param {number} rows - Number of rows
   * @param {number} columns - Number of columns
   * @param {Object} position - { x, y, width, height } in EMU
   * @param {string} [elementId] - Optional element ID
   * @returns {Object} Create table request
   */
  buildCreateTableRequest(slideId, rows, columns, position, elementId) {
    return {
      createTable: {
        objectId: elementId || this.generateObjectId(),
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: position.width, unit: 'EMU' },
            height: { magnitude: position.height, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: position.x,
            translateY: position.y,
            unit: 'EMU'
          }
        },
        rows,
        columns
      }
    };
  }

  /**
   * Build request to insert text into a table cell
   * @param {string} tableId - Table element ID
   * @param {number} rowIndex - Row index (0-based)
   * @param {number} columnIndex - Column index (0-based)
   * @param {string} text - Text to insert
   * @returns {Object} Insert text request
   */
  buildInsertTableTextRequest(tableId, rowIndex, columnIndex, text) {
    return {
      insertText: {
        objectId: tableId,
        cellLocation: {
          rowIndex,
          columnIndex
        },
        text,
        insertionIndex: 0
      }
    };
  }

  /**
   * Build request to update table cell properties
   * @param {string} tableId - Table element ID
   * @param {number} rowIndex - Row index
   * @param {number} columnIndex - Column index
   * @param {Object} properties - Cell properties
   * @returns {Object} Update table cell properties request
   */
  buildUpdateTableCellPropertiesRequest(tableId, rowIndex, columnIndex, properties) {
    const request = {
      updateTableCellProperties: {
        objectId: tableId,
        tableRange: {
          location: { rowIndex, columnIndex },
          rowSpan: 1,
          columnSpan: 1
        },
        tableCellProperties: {},
        fields: ''
      }
    };

    const fields = [];

    if (properties.backgroundColor) {
      request.updateTableCellProperties.tableCellProperties.tableCellBackgroundFill = {
        solidFill: {
          color: {
            rgbColor: properties.backgroundColor
          }
        }
      };
      fields.push('tableCellBackgroundFill.solidFill.color');
    }

    request.updateTableCellProperties.fields = fields.join(',');

    return request;
  }

  /**
   * Build request to create a line
   * @param {string} slideId - Slide ID
   * @param {Object} startPoint - { x, y } in EMU
   * @param {Object} endPoint - { x, y } in EMU
   * @param {string} [elementId] - Optional element ID
   * @returns {Object} Create line request
   */
  buildCreateLineRequest(slideId, startPoint, endPoint, elementId) {
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);

    return {
      createLine: {
        objectId: elementId || this.generateObjectId(),
        lineCategory: 'STRAIGHT',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: width || 1, unit: 'EMU' },
            height: { magnitude: height || 1, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: x,
            translateY: y,
            unit: 'EMU'
          }
        }
      }
    };
  }

  /**
   * Build request to update line properties
   * @param {string} elementId - Element ID
   * @param {Object} properties - Line properties
   * @returns {Object} Update line properties request
   */
  buildUpdateLinePropertiesRequest(elementId, properties) {
    const request = {
      updateLineProperties: {
        objectId: elementId,
        lineProperties: {},
        fields: ''
      }
    };

    const fields = [];

    if (properties.weight) {
      request.updateLineProperties.lineProperties.weight = {
        magnitude: properties.weight,
        unit: 'PT'
      };
      fields.push('weight');
    }

    if (properties.lineFill) {
      request.updateLineProperties.lineProperties.lineFill = {
        solidFill: {
          color: {
            rgbColor: properties.lineFill
          }
        }
      };
      fields.push('lineFill.solidFill.color');
    }

    request.updateLineProperties.fields = fields.join(',');

    return request;
  }

  /**
   * Build request to delete the first slide (used after creating presentation)
   * @param {string} slideId - Slide ID to delete
   * @returns {Object} Delete object request
   */
  buildDeleteSlideRequest(slideId) {
    return {
      deleteObject: {
        objectId: slideId
      }
    };
  }

  /**
   * Build request to set slide background color
   * @param {string} slideId - Slide ID
   * @param {Object} color - RGB color { red, green, blue } (0-1)
   * @returns {Object} Update page properties request
   */
  buildSetSlideBackgroundRequest(slideId, color) {
    return {
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: color
              }
            }
          }
        },
        fields: 'pageBackgroundFill.solidFill.color'
      }
    };
  }

  /**
   * Move file to a specific folder in Drive
   * @param {string} fileId - File ID to move
   * @param {string} folderId - Target folder ID
   * @returns {Promise<void>}
   */
  async moveToFolder(fileId, folderId) {
    await driveAuth.ensureValidToken();

    const response = await fetch(`/api/drive/files/${fileId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to move file');
    }
  }
}

// Create singleton instance
const slidesAPIInstance = new SlidesAPI();

export { slidesAPIInstance as slidesAPI, SlidesAPI };
export default slidesAPIInstance;
