// src/infrastructure/utils/svg-to-drawio.js
// SVG to Draw.io (mxGraph XML) converter

/**
 * Convert SVG content to Draw.io mxGraph XML format
 * Note: For proper edge connections, use SVG with embedded mxGraph XML
 * Plain SVG conversion creates unconnected shapes and lines
 * @param {string} svgContent - SVG markup string
 * @returns {string} mxGraph XML format compatible with Draw.io
 */
export function svgToDrawio(svgContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) {
    return createEmptyDiagram();
  }

  // Get SVG dimensions
  const viewBox = svg.getAttribute('viewBox');
  let width = parseFloat(svg.getAttribute('width')) || 800;
  let height = parseFloat(svg.getAttribute('height')) || 600;

  if (viewBox) {
    const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
    if (vbWidth && vbHeight) {
      width = vbWidth;
      height = vbHeight;
    }
  }

  const cells = [];
  let cellId = 2; // 0 and 1 are reserved for root cells

  // Process all SVG elements
  const elements = svg.querySelectorAll('rect, circle, ellipse, line, polyline, polygon, path, text');
  elements.forEach(element => {
    const cell = convertElement(element, cellId);
    if (cell) {
      cells.push(cell);
      cellId++;
    }
  });

  return buildMxGraphXml(cells, width, height);
}

/**
 * Convert a single SVG element to mxCell
 */
function convertElement(element, id) {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'rect':
      return convertRect(element, id);
    case 'circle':
      return convertCircle(element, id);
    case 'ellipse':
      return convertEllipse(element, id);
    case 'line':
      return convertLine(element, id);
    case 'polyline':
    case 'polygon':
      return convertPolyShape(element, id, tagName === 'polygon');
    case 'path':
      return convertPath(element, id);
    case 'text':
      return convertText(element, id);
    default:
      return null;
  }
}

/**
 * Convert SVG rect to mxCell
 */
function convertRect(rect, id) {
  const x = parseFloat(rect.getAttribute('x')) || 0;
  const y = parseFloat(rect.getAttribute('y')) || 0;
  const width = parseFloat(rect.getAttribute('width')) || 100;
  const height = parseFloat(rect.getAttribute('height')) || 60;
  const rx = parseFloat(rect.getAttribute('rx')) || 0;

  const style = extractStyle(rect);
  let mxStyle = 'rounded=' + (rx > 0 ? '1' : '0') + ';whiteSpace=wrap;html=1;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'vertex',
    geometry: { x, y, width, height },
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG circle to mxCell
 */
function convertCircle(circle, id) {
  const cx = parseFloat(circle.getAttribute('cx')) || 0;
  const cy = parseFloat(circle.getAttribute('cy')) || 0;
  const r = parseFloat(circle.getAttribute('r')) || 50;

  const style = extractStyle(circle);
  let mxStyle = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'vertex',
    geometry: { x: cx - r, y: cy - r, width: r * 2, height: r * 2 },
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG ellipse to mxCell
 */
function convertEllipse(ellipse, id) {
  const cx = parseFloat(ellipse.getAttribute('cx')) || 0;
  const cy = parseFloat(ellipse.getAttribute('cy')) || 0;
  const rx = parseFloat(ellipse.getAttribute('rx')) || 50;
  const ry = parseFloat(ellipse.getAttribute('ry')) || 30;

  const style = extractStyle(ellipse);
  let mxStyle = 'ellipse;whiteSpace=wrap;html=1;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'vertex',
    geometry: { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 },
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG line to mxCell edge
 */
function convertLine(line, id) {
  const x1 = parseFloat(line.getAttribute('x1')) || 0;
  const y1 = parseFloat(line.getAttribute('y1')) || 0;
  const x2 = parseFloat(line.getAttribute('x2')) || 100;
  const y2 = parseFloat(line.getAttribute('y2')) || 100;

  const style = extractStyle(line);
  let mxStyle = 'endArrow=none;html=1;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'edge',
    geometry: { x: 0, y: 0, width: 0, height: 0 },
    sourcePoint: { x: x1, y: y1 },
    targetPoint: { x: x2, y: y2 },
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG polyline/polygon to mxCell
 */
function convertPolyShape(element, id, closed) {
  const points = element.getAttribute('points') || '';
  const pointPairs = points.trim().split(/\s+/).map(p => {
    const [x, y] = p.split(',').map(parseFloat);
    return { x: x || 0, y: y || 0 };
  });

  if (pointPairs.length < 2) return null;

  // Get bounding box
  const xs = pointPairs.map(p => p.x);
  const ys = pointPairs.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  const style = extractStyle(element);
  let mxStyle = closed ? 'shape=polygon;' : 'shape=polyline;';
  mxStyle += 'whiteSpace=wrap;html=1;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'vertex',
    geometry: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG path to mxCell (simplified - treats as generic shape)
 */
function convertPath(path, id) {
  const d = path.getAttribute('d') || '';

  // Parse path to get bounding box (simplified)
  const bbox = getPathBoundingBox(d);

  const style = extractStyle(path);
  let mxStyle = 'rounded=0;whiteSpace=wrap;html=1;';
  mxStyle += styleToMxStyle(style);

  return {
    id,
    type: 'vertex',
    geometry: bbox,
    style: mxStyle,
    value: ''
  };
}

/**
 * Convert SVG text to mxCell
 */
function convertText(text, id) {
  const x = parseFloat(text.getAttribute('x')) || 0;
  const y = parseFloat(text.getAttribute('y')) || 0;
  const content = text.textContent || '';

  const style = extractStyle(text);
  let mxStyle = 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;';

  const fontSize = style.fontSize || '14';
  const fontColor = style.fill || '#000000';
  mxStyle += `fontColor=${fontColor};fontSize=${parseInt(fontSize)};`;

  return {
    id,
    type: 'vertex',
    geometry: { x: x - 50, y: y - 15, width: 100, height: 30 },
    style: mxStyle,
    value: content
  };
}

/**
 * Extract style attributes from SVG element
 */
function extractStyle(element) {
  const style = {};

  // Get fill
  const fill = element.getAttribute('fill') || getComputedStyle(element, 'fill');
  if (fill && fill !== 'none') {
    style.fill = normalizeColor(fill);
  }

  // Get stroke
  const stroke = element.getAttribute('stroke') || getComputedStyle(element, 'stroke');
  if (stroke && stroke !== 'none') {
    style.stroke = normalizeColor(stroke);
  }

  // Get stroke-width
  const strokeWidth = element.getAttribute('stroke-width') || getComputedStyle(element, 'stroke-width');
  if (strokeWidth) {
    style.strokeWidth = parseFloat(strokeWidth) || 1;
  }

  // Get opacity
  const opacity = element.getAttribute('opacity') || element.getAttribute('fill-opacity');
  if (opacity) {
    style.opacity = parseFloat(opacity);
  }

  // Get font-size for text
  const fontSize = element.getAttribute('font-size');
  if (fontSize) {
    style.fontSize = fontSize;
  }

  return style;
}

/**
 * Get computed style from inline style attribute
 */
function getComputedStyle(element, property) {
  const styleAttr = element.getAttribute('style');
  if (!styleAttr) return null;

  const styles = styleAttr.split(';');
  for (const s of styles) {
    const [prop, val] = s.split(':').map(x => x.trim());
    if (prop === property) return val;
  }
  return null;
}

/**
 * Convert extracted style to mxGraph style string
 */
function styleToMxStyle(style) {
  let mxStyle = '';

  if (style.fill) {
    mxStyle += `fillColor=${style.fill};`;
  } else {
    mxStyle += 'fillColor=none;';
  }

  if (style.stroke) {
    mxStyle += `strokeColor=${style.stroke};`;
  }

  if (style.strokeWidth) {
    mxStyle += `strokeWidth=${style.strokeWidth};`;
  }

  if (style.opacity !== undefined) {
    mxStyle += `opacity=${Math.round(style.opacity * 100)};`;
  }

  return mxStyle;
}

/**
 * Normalize color to hex format
 */
function normalizeColor(color) {
  if (!color || color === 'none' || color === 'transparent') {
    return 'none';
  }

  // Already hex
  if (color.startsWith('#')) {
    return color;
  }

  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Named colors (basic mapping)
  const namedColors = {
    red: '#FF0000', blue: '#0000FF', green: '#008000', yellow: '#FFFF00',
    black: '#000000', white: '#FFFFFF', gray: '#808080', grey: '#808080',
    orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', cyan: '#00FFFF',
    navy: '#000080', teal: '#008080', maroon: '#800000', lime: '#00FF00'
  };

  return namedColors[color.toLowerCase()] || color;
}

/**
 * Get approximate bounding box from SVG path
 */
function getPathBoundingBox(d) {
  // Extract all numeric coordinates from path
  const numbers = d.match(/-?\d+\.?\d*/g);
  if (!numbers || numbers.length < 2) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  const coords = numbers.map(parseFloat);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Simplified: treat pairs as x,y coordinates
  for (let i = 0; i < coords.length - 1; i += 2) {
    const x = coords[i];
    const y = coords[i + 1];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!isFinite(minX)) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 10),
    height: Math.max(maxY - minY, 10)
  };
}

/**
 * Build the final mxGraph XML document wrapped in mxfile for Draw.io compatibility
 */
function buildMxGraphXml(cells, width, height) {
  // Build the inner mxGraphModel
  let graphModel = `<mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}">`;
  graphModel += '<root>';
  graphModel += '<mxCell id="0"/>';
  graphModel += '<mxCell id="1" parent="0"/>';

  for (const cell of cells) {
    if (cell.type === 'edge') {
      graphModel += `<mxCell id="${cell.id}" value="${escapeXml(cell.value)}" style="${cell.style}" edge="1" parent="1">`;
      graphModel += `<mxGeometry relative="1" as="geometry">`;
      graphModel += `<mxPoint x="${cell.sourcePoint.x}" y="${cell.sourcePoint.y}" as="sourcePoint"/>`;
      graphModel += `<mxPoint x="${cell.targetPoint.x}" y="${cell.targetPoint.y}" as="targetPoint"/>`;
      graphModel += `</mxGeometry>`;
      graphModel += `</mxCell>`;
    } else {
      graphModel += `<mxCell id="${cell.id}" value="${escapeXml(cell.value)}" style="${cell.style}" vertex="1" parent="1">`;
      graphModel += `<mxGeometry x="${cell.geometry.x}" y="${cell.geometry.y}" width="${cell.geometry.width}" height="${cell.geometry.height}" as="geometry"/>`;
      graphModel += `</mxCell>`;
    }
  }

  graphModel += '</root>';
  graphModel += '</mxGraphModel>';

  // Wrap in mxfile format for Draw.io compatibility
  const xml = `<mxfile host="embed.diagrams.net" modified="${new Date().toISOString()}" agent="SVG Converter" version="1.0">
<diagram name="Page-1" id="converted-svg">
${graphModel}
</diagram>
</mxfile>`;

  return xml;
}

/**
 * Create an empty diagram
 */
function createEmptyDiagram() {
  return buildMxGraphXml([], 800, 600);
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get a sample SVG diagram with embedded mxGraph XML for Draw.io
 * This SVG contains the visual representation AND the connection metadata
 * @returns {string} Sample SVG content with embedded Draw.io data
 */
export function getSampleSvgDiagram() {
  // mxGraph XML with proper node connections
  const mxGraphXml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="SVG Sample" version="1.0">
    <diagram name="Page-1" id="sample">
      <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="600" pageHeight="400">
        <root>
          <mxCell id="0"/>
          <mxCell id="1" parent="0"/>
          <mxCell id="node1" value="Start" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#4285F4;strokeColor=#2563EB;fontColor=#ffffff;fontSize=14;" vertex="1" parent="1">
            <mxGeometry x="200" y="20" width="200" height="60" as="geometry"/>
          </mxCell>
          <mxCell id="node2" value="Process" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FBBC04;strokeColor=#D97706;fontColor=#333333;fontSize=14;" vertex="1" parent="1">
            <mxGeometry x="200" y="120" width="200" height="60" as="geometry"/>
          </mxCell>
          <mxCell id="node3" value="Option A" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#34A853;strokeColor=#16A34A;fontColor=#ffffff;fontSize=14;" vertex="1" parent="1">
            <mxGeometry x="50" y="240" width="150" height="60" as="geometry"/>
          </mxCell>
          <mxCell id="node4" value="Option B" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#EA4335;strokeColor=#DC2626;fontColor=#ffffff;fontSize=14;" vertex="1" parent="1">
            <mxGeometry x="400" y="240" width="150" height="60" as="geometry"/>
          </mxCell>
          <mxCell id="node5" value="End" style="ellipse;whiteSpace=wrap;html=1;fillColor=#9333EA;strokeColor=#7C3AED;fontColor=#ffffff;fontSize=14;" vertex="1" parent="1">
            <mxGeometry x="275" y="335" width="50" height="50" as="geometry"/>
          </mxCell>
          <mxCell id="edge1" style="endArrow=classic;html=1;strokeColor=#6B7280;strokeWidth=2;" edge="1" parent="1" source="node1" target="node2">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
          <mxCell id="edge2" style="endArrow=classic;html=1;strokeColor=#6B7280;strokeWidth=2;" edge="1" parent="1" source="node2" target="node3">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
          <mxCell id="edge3" style="endArrow=classic;html=1;strokeColor=#6B7280;strokeWidth=2;" edge="1" parent="1" source="node2" target="node4">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
          <mxCell id="edge4" style="endArrow=classic;html=1;strokeColor=#6B7280;strokeWidth=2;" edge="1" parent="1" source="node3" target="node5">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
          <mxCell id="edge5" style="endArrow=classic;html=1;strokeColor=#6B7280;strokeWidth=2;" edge="1" parent="1" source="node4" target="node5">
            <mxGeometry relative="1" as="geometry"/>
          </mxCell>
        </root>
      </mxGraphModel>
    </diagram>
  </mxfile>`;

  // Encode mxGraph XML for embedding in SVG
  const encodedXml = encodeURIComponent(mxGraphXml);

  // SVG with visual representation AND embedded mxGraph data
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <style>
      .node-text { font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
    </style>
  </defs>
  <!-- Embedded Draw.io data for re-editing -->
  <content style="display:none">${encodedXml}</content>

  <!-- Visual representation -->
  <!-- Node 1: Start (blue) -->
  <rect x="200" y="20" width="200" height="60" fill="#4285F4" stroke="#2563EB" stroke-width="2" rx="8"/>
  <text x="300" y="50" class="node-text" fill="white">Start</text>

  <!-- Node 2: Process (yellow) -->
  <rect x="200" y="120" width="200" height="60" fill="#FBBC04" stroke="#D97706" stroke-width="2" rx="8"/>
  <text x="300" y="150" class="node-text" fill="#333">Process</text>

  <!-- Node 3: Option A (green) -->
  <rect x="50" y="240" width="150" height="60" fill="#34A853" stroke="#16A34A" stroke-width="2" rx="8"/>
  <text x="125" y="270" class="node-text" fill="white">Option A</text>

  <!-- Node 4: Option B (red) -->
  <rect x="400" y="240" width="150" height="60" fill="#EA4335" stroke="#DC2626" stroke-width="2" rx="8"/>
  <text x="475" y="270" class="node-text" fill="white">Option B</text>

  <!-- Node 5: End (purple circle) -->
  <circle cx="300" cy="360" r="25" fill="#9333EA" stroke="#7C3AED" stroke-width="2"/>
  <text x="300" y="360" class="node-text" fill="white">End</text>

  <!-- Edges with arrows -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280"/>
    </marker>
  </defs>

  <!-- Edge 1: Start -> Process -->
  <line x1="300" y1="80" x2="300" y2="118" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Edge 2: Process -> Option A -->
  <line x1="200" y1="165" x2="135" y2="238" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Edge 3: Process -> Option B -->
  <line x1="400" y1="165" x2="465" y2="238" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Edge 4: Option A -> End -->
  <line x1="150" y1="300" x2="280" y2="345" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>

  <!-- Edge 5: Option B -> End -->
  <line x1="450" y1="300" x2="320" y2="345" stroke="#6B7280" stroke-width="2" marker-end="url(#arrowhead)"/>
</svg>`;
}

/**
 * Check if content is SVG
 * @param {string} content - Content to check
 * @returns {boolean} True if content is SVG
 */
export function isSvgContent(content) {
  if (!content) return false;

  // Check for base64 SVG data URI
  if (content.startsWith('data:image/svg+xml;base64,')) {
    return true;
  }

  // Check for raw SVG markup
  const trimmed = content.trim();
  return trimmed.startsWith('<svg') || trimmed.startsWith('<?xml');
}

/**
 * Decode SVG from base64 data URI
 * @param {string} dataUri - Base64 data URI
 * @returns {string} Decoded SVG content
 */
export function decodeSvgDataUri(dataUri) {
  if (!dataUri.startsWith('data:image/svg+xml;base64,')) {
    return dataUri;
  }

  try {
    const base64 = dataUri.substring('data:image/svg+xml;base64,'.length);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.warn('Failed to decode SVG data URI:', e);
    return '';
  }
}

/**
 * Extract embedded mxGraph XML from SVG content
 * Draw.io embeds mxGraph data in SVG for re-editing
 * @param {string} svgContent - SVG content that may contain embedded mxGraph XML
 * @returns {string|null} Extracted mxGraph XML or null if not found
 */
export function extractMxGraphFromSvg(svgContent) {
  if (!svgContent) return null;

  // Method 1: Check for <content> element with encoded mxGraph data
  const contentMatch = svgContent.match(/<content[^>]*>([^<]+)<\/content>/);
  if (contentMatch) {
    try {
      const decoded = decodeURIComponent(contentMatch[1]);
      if (decoded.includes('<mxfile') || decoded.includes('<mxGraphModel')) {
        return decoded;
      }
    } catch (e) {
      // Continue to other methods
    }
  }

  // Method 2: Check for mxfile/mxGraphModel directly in SVG (Draw.io native export)
  if (svgContent.includes('<mxfile') || svgContent.includes('<mxGraphModel')) {
    // Extract the mxfile or mxGraphModel portion
    const mxfileMatch = svgContent.match(/<mxfile[\s\S]*?<\/mxfile>/);
    if (mxfileMatch) return mxfileMatch[0];

    const mxModelMatch = svgContent.match(/<mxGraphModel[\s\S]*?<\/mxGraphModel>/);
    if (mxModelMatch) return mxModelMatch[0];
  }

  // Method 3: Check for Draw.io's standard embedding in SVG (base64 in a comment or data attribute)
  const diagramDataMatch = svgContent.match(/<!--\s*mxGraph:\s*([A-Za-z0-9+/=]+)\s*-->/);
  if (diagramDataMatch) {
    try {
      return atob(diagramDataMatch[1]);
    } catch (e) {
      // Invalid base64
    }
  }

  return null;
}
