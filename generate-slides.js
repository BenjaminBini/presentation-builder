#!/usr/bin/env node

/**
 * Slide Generator - GitLab Style
 *
 * Usage: node generate-slides.js [input.json] [output.html]
 *
 * If no arguments provided:
 *   - Input: presentation-data.json
 *   - Output: presentation.html
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const inputFile = process.argv[2] || 'presentation-data.json';
const outputFile = process.argv[3] || 'presentation.html';

// Read presentation data
let presentationData;
try {
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    presentationData = JSON.parse(jsonContent);
    console.log(`✓ Loaded: ${inputFile}`);
} catch (error) {
    console.error(`✗ Error reading ${inputFile}:`, error.message);
    process.exit(1);
}

// Escape HTML helper
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// GitLab Logo SVG
function getGitLabLogo(size = 80) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M190 362.42L253.31 167.69H126.69L190 362.42Z" fill="#E24329"/>
            <path d="M190 362.42L126.69 167.69H20.28L190 362.42Z" fill="#FC6D26"/>
            <path d="M20.28 167.69L2.53 222.23C0.91 227.22 2.69 232.67 6.97 235.78L190 362.42L20.28 167.69Z" fill="#FCA326"/>
            <path d="M20.28 167.69H126.69L80.89 26.87C78.95 21.01 70.74 21.01 68.8 26.87L20.28 167.69Z" fill="#E24329"/>
            <path d="M190 362.42L253.31 167.69H359.72L190 362.42Z" fill="#FC6D26"/>
            <path d="M359.72 167.69L377.47 222.23C379.09 227.22 377.31 232.67 373.03 235.78L190 362.42L359.72 167.69Z" fill="#FCA326"/>
            <path d="M359.72 167.69H253.31L299.11 26.87C301.05 21.01 309.26 21.01 311.2 26.87L359.72 167.69Z" fill="#E24329"/>
        </svg>
    `;
}

// Template renderers
const templates = {
    title: (data) => `
        <div class="slide template-title">
            ${data.logo ? `<img src="${data.logo}" alt="Logo" class="logo">` : getGitLabLogo(80)}
            <h1>${escapeHtml(data.title)}</h1>
            ${data.subtitle ? `<div class="subtitle">${escapeHtml(data.subtitle)}</div>` : ''}
            ${data.author ? `<div class="author">${escapeHtml(data.author)}</div>` : ''}
            ${data.date ? `<div class="date">${escapeHtml(data.date)}</div>` : ''}
        </div>
    `,

    section: (data) => `
        <div class="slide template-section">
            <span class="section-number">${escapeHtml(data.number) || ''}</span>
            <h2>${escapeHtml(data.title)}</h2>
            ${data.subtitle ? `<div class="section-subtitle">${escapeHtml(data.subtitle)}</div>` : ''}
        </div>
    `,

    bullets: (data) => {
        const showTag = data.showTag !== false;
        const renderItem = (item) => {
            const isObject = typeof item === 'object';
            const text = isObject ? item.text : item;
            const level = isObject ? (item.level || 0) : 0;
            return `<li${level > 0 ? ` data-level="${level}"` : ''}>${escapeHtml(text)}</li>`;
        };
        return `
        <div class="slide template-bullets">
            <div class="header-bar">
                <h2>${escapeHtml(data.title)}</h2>
                ${showTag && data.tag ? `<span class="slide-tag">${escapeHtml(data.tag)}</span>` : ''}
            </div>
            <div class="content">
                <ul>
                    ${data.items.map(renderItem).join('\n                    ')}
                </ul>
            </div>
        </div>
    `;
    },

    'two-columns': (data) => {
        const renderColumn = (col) => {
            let content = col.title ? `<h3>${escapeHtml(col.title)}</h3>` : '';
            if (col.text) {
                content += `<p>${escapeHtml(col.text)}</p>`;
            }
            if (col.items) {
                content += '<ul>' + col.items.map(item => `<li>${escapeHtml(item)}</li>`).join('') + '</ul>';
            }
            return `<div class="column">${content}</div>`;
        };

        return `
        <div class="slide template-two-columns">
            <h2>${escapeHtml(data.title)}</h2>
            <div class="columns">
                ${renderColumn(data.left)}
                ${renderColumn(data.right)}
            </div>
        </div>
        `;
    },

    'image-text': (data) => {
        const imageContent = data.image
            ? `<img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.imageAlt || '')}">`
            : `<div class="image-placeholder">📷</div>`;

        const paragraphs = Array.isArray(data.text)
            ? data.text.map(p => `<p>${escapeHtml(p)}</p>`).join('\n                ')
            : `<p>${escapeHtml(data.text)}</p>`;

        return `
        <div class="slide template-image-text">
            <div class="image-container">${imageContent}</div>
            <div class="text-container">
                <h2>${escapeHtml(data.title)}</h2>
                ${paragraphs}
            </div>
        </div>
        `;
    },

    quote: (data) => {
        const initials = data.authorName
            ? data.authorName.split(' ').map(n => n[0]).join('').substring(0, 2)
            : '??';

        return `
        <div class="slide template-quote">
            <div class="quote-content">
                <blockquote>${escapeHtml(data.quote)}</blockquote>
                <div class="author">
                    ${data.authorImage
                        ? `<img src="${escapeHtml(data.authorImage)}" class="author-avatar">`
                        : `<div class="author-avatar">${escapeHtml(initials)}</div>`}
                    <div class="author-info">
                        <div class="author-name">${escapeHtml(data.authorName) || 'Unknown'}</div>
                        <div class="author-title">${escapeHtml(data.authorTitle) || ''}</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    stats: (data) => {
        const statsHtml = data.stats.map(stat => {
            const changeClass = stat.change?.startsWith('+') ? 'positive' :
                               stat.change?.startsWith('-') ? 'negative' : '';
            return `
                <div class="stat-card">
                    <div class="stat-value">${escapeHtml(stat.value)}</div>
                    <div class="stat-label">${escapeHtml(stat.label)}</div>
                    ${stat.change ? `<div class="stat-change ${changeClass}">${escapeHtml(stat.change)}</div>` : ''}
                </div>
            `;
        }).join('');

        return `
        <div class="slide template-stats">
            <h2>${escapeHtml(data.title)}</h2>
            <div class="stats-grid">${statsHtml}</div>
        </div>
        `;
    },

    code: (data) => `
        <div class="slide template-code">
            <h2>${escapeHtml(data.title)}</h2>
            <div class="code-container">
                <div class="code-header">
                    <span class="code-dot red"></span>
                    <span class="code-dot yellow"></span>
                    <span class="code-dot green"></span>
                    <span class="code-filename">${escapeHtml(data.filename) || 'code.js'}</span>
                </div>
                <pre><code>${escapeHtml(data.code)}</code></pre>
            </div>
            ${data.description ? `<p class="code-description">${escapeHtml(data.description)}</p>` : ''}
        </div>
    `,

    'code-annotated': (data) => {
        const lines = data.code.split('\n');
        const lineHeight = 28; // pixels per line
        const codeStartOffset = 52; // header height + padding
        const startLineNum = data.startLine || 1; // offset for line numbering
        const hasCodeBefore = startLineNum > 1; // show ellipsis at start
        const hasCodeAfter = data.notEndOfFile === true; // show ellipsis at end

        // Get highlighted line numbers (support single line or range)
        const highlightedLines = new Set();
        (data.annotations || []).forEach(ann => {
            const startLine = ann.line;
            const endLine = ann.lineTo || ann.line; // lineTo is optional, defaults to line
            for (let i = startLine; i <= endLine; i++) {
                highlightedLines.add(i);
            }
        });

        // Build ellipsis line for truncated code indicator
        const ellipsisLine = `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`;

        // Build line-numbered code
        const codeLines = lines.map((line, i) => {
            const lineNum = startLineNum + i;
            const isHighlighted = highlightedLines.has(lineNum);
            return `<div class="code-line${isHighlighted ? ' highlighted' : ''}"><span class="line-number">${lineNum}</span><span class="line-content">${escapeHtml(line) || ' '}</span></div>`;
        }).join('\n');

        // Combine with ellipsis indicators
        const allCodeLines = [
            hasCodeBefore ? ellipsisLine : '',
            codeLines,
            hasCodeAfter ? ellipsisLine : ''
        ].filter(Boolean).join('\n');

        // Calculate annotation offset (add 1 line if there's ellipsis at start)
        const annotationOffset = hasCodeBefore ? lineHeight : 0;

        // Build annotations with arrows
        const annotationsHtml = (data.annotations || []).map(ann => {
            const startLine = ann.line;
            const endLine = ann.lineTo || ann.line;
            const midLine = (startLine + endLine) / 2;
            // Convert displayed line number to index (relative to startLineNum)
            const lineIndex = midLine - startLineNum;
            const topPosition = codeStartOffset + annotationOffset + (lineIndex * lineHeight);
            return `
                <div class="annotation" style="top: ${topPosition}px;">
                    <div class="annotation-arrow"></div>
                    <div class="annotation-content">
                        ${ann.title ? `<div class="annotation-title">${escapeHtml(ann.title)}</div>` : ''}
                        <div class="annotation-text">${escapeHtml(ann.text)}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
        <div class="slide template-code-annotated">
            <h2>${escapeHtml(data.title)}</h2>
            <div class="code-annotated-container">
                <div class="code-panel">
                    <div class="code-container">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename">${escapeHtml(data.filename) || 'code.js'}</span>
                        </div>
                        <div class="code-body">
                            ${allCodeLines}
                        </div>
                    </div>
                </div>
                <div class="annotations-panel">
                    ${annotationsHtml}
                </div>
            </div>
        </div>
        `;
    },

    timeline: (data) => {
        const stepCount = data.steps.length;
        const stepsHtml = data.steps.map((step, i) => `
            <div class="timeline-item">
                <div class="timeline-icon">${escapeHtml(step.icon) || (i + 1)}</div>
                <div class="timeline-title">${escapeHtml(step.title)}</div>
                <div class="timeline-desc">${escapeHtml(step.description) || ''}</div>
            </div>
        `).join('');

        return `
        <div class="slide template-timeline">
            <h2>${escapeHtml(data.title)}</h2>
            <div class="timeline-wrapper">
                <div class="timeline-line" style="left: calc(50% / ${stepCount || 1}); right: calc(50% / ${stepCount || 1});"></div>
                <div class="timeline">${stepsHtml}</div>
            </div>
        </div>
        `;
    },

    comparison: (data) => {
        const highlightIdx = data.highlightColumn ? parseInt(data.highlightColumn) - 1 : -1;
        const headersHtml = data.columns.map((col, i) =>
            `<th class="${i === highlightIdx ? 'highlight-col' : ''}">${escapeHtml(col)}</th>`
        ).join('');

        const rowsHtml = data.rows.map(row => {
            const cells = row.map((cell, i) => {
                let content = cell;
                if (cell === true || cell === 'true') content = '<span class="check">✓</span>';
                else if (cell === false || cell === 'false') content = '<span class="cross">✗</span>';
                else content = escapeHtml(String(cell));
                return `<td class="${i === highlightIdx ? 'highlight-col' : ''}">${content}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('\n                    ');

        return `
        <div class="slide template-comparison">
            <h2>${escapeHtml(data.title)}</h2>
            <table>
                <thead><tr>${headersHtml}</tr></thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
        `;
    },

    mermaid: (data) => `
        <div class="slide template-mermaid">
            <h2>${escapeHtml(data.title)}</h2>
            ${data.description ? `<p class="mermaid-description">${escapeHtml(data.description)}</p>` : ''}
            <div class="mermaid-container">
                <pre class="mermaid">${escapeHtml(data.diagram)}</pre>
            </div>
        </div>
    `,

    drawio: (data) => {
        const placeholderSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="8" height="6" rx="1"/><rect x="14" y="2" width="8" height="6" rx="1"/><rect x="8" y="16" width="8" height="6" rx="1"/><path d="M6 8v4h6M18 8v4h-6M12 12v4"/></svg>';
        return `
        <div class="slide template-drawio">
            <h2>${escapeHtml(data.title)}</h2>
            ${data.description ? `<p class="drawio-description">${escapeHtml(data.description)}</p>` : ''}
            <div class="drawio-container">
                ${data.diagram ? `<img class="drawio-svg" src="${escapeHtml(data.diagram)}" alt="Diagram">` : `<div class="drawio-placeholder">${placeholderSvg}<p>Aucun diagramme</p></div>`}
            </div>
        </div>
    `;
    }
};

// Render a single slide
function renderSlide(slideData) {
    const { template, data } = slideData;
    if (templates[template]) {
        return templates[template](data);
    }
    return `<div class="slide"><p>Unknown template: ${escapeHtml(template)}</p></div>`;
}

// Generate all slides HTML
function generateSlidesHtml(slides) {
    return slides.map(slide => `<div class="slide-wrapper">${renderSlide(slide)}</div>`).join('\n');
}

// CSS Styles
const CSS_STYLES = `
        :root {
            --gl-orange: #FC6D26;
            --gl-orange-dark: #E24329;
            --gl-orange-light: #FCA326;
            --gl-dark: #171321;
            --gl-gray-900: #1F1A24;
            --gl-gray-800: #2E2A35;
            --gl-gray-700: #3F3A47;
            --gl-gray-600: #525059;
            --gl-gray-500: #737278;
            --gl-gray-400: #9A99A0;
            --gl-gray-300: #BFBFC3;
            --gl-gray-200: #DCDCDE;
            --gl-gray-100: #ECECEF;
            --gl-gray-50: #FAFAFA;
            --gl-white: #FFFFFF;
            --gl-purple: #6B4FBB;
            --gl-purple-light: #9475DB;
            --gl-blue: #1F75CB;
            --gl-blue-light: #428FDC;
            --gl-green: #108548;
            --gl-green-light: #2DA160;
            --gl-red: #DD2B0E;
            --gl-yellow: #F5D423;
            --gl-gradient-primary: linear-gradient(135deg, #FC6D26 0%, #E24329 50%, #FCA326 100%);
            --gl-gradient-dark: linear-gradient(135deg, #171321 0%, #2E2A35 100%);
            --gl-gradient-purple: linear-gradient(135deg, #6B4FBB 0%, #9475DB 100%);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #E8E6E3;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .presentation-container {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #E8E6E3;
            padding: 60px 20px;
            gap: 60px;
        }

        .slide-wrapper {
            width: 100%;
            max-width: 1280px;
            aspect-ratio: 16 / 9;
            position: relative;
            flex-shrink: 0;
        }

        .slide {
            width: 1280px;
            height: 720px;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border-radius: 12px;
            transform-origin: top left;
        }

        /* Template: Title */
        .template-title {
            background: var(--gl-gradient-dark);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 60px;
        }
        .template-title::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -30%;
            width: 800px;
            height: 800px;
            background: var(--gl-gradient-primary);
            border-radius: 50%;
            opacity: 0.1;
            filter: blur(100px);
        }
        .template-title .logo { width: 80px; height: 80px; margin-bottom: 40px; }
        .template-title h1 {
            font-size: 56px;
            font-weight: 800;
            color: var(--gl-white);
            margin-bottom: 20px;
            line-height: 1.1;
            max-width: 900px;
        }
        .template-title .subtitle {
            font-size: 24px;
            font-weight: 400;
            color: var(--gl-gray-300);
            margin-bottom: 40px;
        }
        .template-title .author { font-size: 18px; color: var(--gl-orange); font-weight: 500; }
        .template-title .date { font-size: 16px; color: var(--gl-gray-500); margin-top: 10px; }

        /* Template: Section */
        .template-section {
            background: var(--gl-gradient-primary);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 80px;
        }
        .template-section::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 400px;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            transform: translate(30%, 30%);
        }
        .template-section .section-number {
            font-size: 120px;
            font-weight: 800;
            color: rgba(255,255,255,0.2);
            position: absolute;
            top: 40px;
            right: 60px;
        }
        .template-section h2 {
            font-size: 64px;
            font-weight: 800;
            color: var(--gl-white);
            max-width: 800px;
            line-height: 1.1;
        }
        .template-section .section-subtitle {
            font-size: 24px;
            color: rgba(255,255,255,0.8);
            margin-top: 20px;
            max-width: 600px;
        }

        /* Template: Bullets */
        .template-bullets {
            background: var(--gl-white);
            padding: 60px 80px;
            display: flex;
            flex-direction: column;
        }
        .template-bullets .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid var(--gl-orange);
        }
        .template-bullets h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); }
        .template-bullets .slide-tag {
            background: var(--gl-gradient-primary);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .template-bullets .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .template-bullets ul { list-style: none; }
        .template-bullets li {
            font-size: 26px;
            color: var(--gl-gray-800);
            margin-bottom: 28px;
            padding-left: 50px;
            position: relative;
            line-height: 1.4;
        }
        .template-bullets li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 12px;
            width: 24px;
            height: 24px;
            background: var(--gl-gradient-primary);
            border-radius: 6px;
            transform: rotate(45deg);
        }
        .template-bullets li[data-level="1"] { margin-left: 40px; font-size: 24px; }
        .template-bullets li[data-level="1"]::before { width: 18px; height: 18px; top: 10px; border-radius: 50%; transform: none; }
        .template-bullets li[data-level="2"] { margin-left: 80px; font-size: 22px; }
        .template-bullets li[data-level="2"]::before { width: 14px; height: 14px; top: 10px; border-radius: 0; opacity: 0.8; }
        .template-bullets li[data-level="3"] { margin-left: 120px; font-size: 20px; }
        .template-bullets li[data-level="3"]::before { width: 10px; height: 10px; top: 10px; border-radius: 50%; transform: none; opacity: 0.6; }

        /* Template: Two Columns */
        .template-two-columns {
            background: var(--gl-gray-50);
            padding: 60px 80px;
        }
        .template-two-columns h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid var(--gl-orange);
        }
        .template-two-columns .columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            height: calc(100% - 120px);
        }
        .template-two-columns .column { display: flex; flex-direction: column; }
        .template-two-columns .column h3 {
            font-size: 28px;
            font-weight: 600;
            color: var(--gl-purple);
            margin-bottom: 24px;
        }
        .template-two-columns .column p {
            font-size: 20px;
            color: var(--gl-gray-700);
            line-height: 1.6;
        }
        .template-two-columns .column ul { list-style: none; }
        .template-two-columns .column li {
            font-size: 20px;
            color: var(--gl-gray-700);
            margin-bottom: 16px;
            padding-left: 30px;
            position: relative;
        }
        .template-two-columns .column li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--gl-orange);
            font-weight: bold;
        }

        /* Template: Image + Text */
        .template-image-text {
            background: var(--gl-white);
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
        .template-image-text .image-container {
            background: var(--gl-gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .template-image-text .image-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .template-image-text .image-placeholder {
            width: 200px;
            height: 200px;
            background: var(--gl-gradient-primary);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 60px;
        }
        .template-image-text .text-container {
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .template-image-text h2 {
            font-size: 38px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 24px;
        }
        .template-image-text p {
            font-size: 20px;
            color: var(--gl-gray-700);
            line-height: 1.7;
            margin-bottom: 16px;
        }

        /* Template: Quote */
        .template-quote {
            background: var(--gl-gradient-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 80px;
            position: relative;
        }
        .template-quote::before {
            content: '"';
            position: absolute;
            top: 60px;
            left: 80px;
            font-size: 300px;
            font-weight: 800;
            color: var(--gl-orange);
            opacity: 0.15;
            line-height: 1;
        }
        .template-quote .quote-content {
            max-width: 900px;
            text-align: center;
            z-index: 1;
        }
        .template-quote blockquote {
            font-size: 36px;
            font-weight: 500;
            color: var(--gl-white);
            line-height: 1.5;
            font-style: italic;
            margin-bottom: 40px;
        }
        .template-quote .author {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        .template-quote .author-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--gl-gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 20px;
        }
        .template-quote .author-info { text-align: left; }
        .template-quote .author-name { font-size: 20px; font-weight: 600; color: var(--gl-orange); }
        .template-quote .author-title { font-size: 16px; color: var(--gl-gray-400); }

        /* Template: Stats */
        .template-stats {
            background: var(--gl-gradient-dark);
            padding: 60px 80px;
        }
        .template-stats h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 60px;
            text-align: center;
        }
        .template-stats .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
        }
        .template-stats .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
        }
        .template-stats .stat-value {
            font-size: 64px;
            font-weight: 800;
            background: var(--gl-gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
        }
        .template-stats .stat-label {
            font-size: 20px;
            color: var(--gl-gray-300);
            font-weight: 500;
        }
        .template-stats .stat-change {
            font-size: 14px;
            margin-top: 12px;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
        }
        .template-stats .stat-change.positive { background: rgba(16, 133, 72, 0.2); color: var(--gl-green-light); }
        .template-stats .stat-change.negative { background: rgba(221, 43, 14, 0.2); color: var(--gl-red); }

        /* Template: Code */
        .template-code {
            background: var(--gl-gradient-dark);
            padding: 50px 60px;
        }
        .template-code h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 30px;
        }
        .template-code .code-container {
            background: #252030;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .template-code .code-header {
            background: var(--gl-gray-800);
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .template-code .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code .code-dot.red { background: #FF5F56; }
        .template-code .code-dot.yellow { background: #FFBD2E; }
        .template-code .code-dot.green { background: #27CA40; }
        .template-code .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code pre {
            padding: 30px;
            overflow-x: auto;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 16px;
            line-height: 1.6;
        }
        .template-code code { color: var(--gl-gray-200); }
        .template-code .code-description {
            margin-top: 30px;
            color: var(--gl-gray-400);
            font-size: 18px;
            line-height: 1.6;
            position: relative;
            z-index: 1;
        }

        /* Template: Code Annotated */
        .template-code-annotated {
            background: var(--gl-gradient-dark);
            padding: 40px 50px;
        }
        .template-code-annotated h2 {
            font-size: 32px;
            font-weight: 700;
            color: var(--gl-white);
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
        }
        .template-code-annotated .code-annotated-container {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 30px;
            height: calc(100% - 80px);
        }
        .template-code-annotated .code-panel {
            display: flex;
            flex-direction: column;
        }
        .template-code-annotated .code-container {
            background: #252030;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 1;
        }
        .template-code-annotated .code-header {
            background: var(--gl-gray-800);
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .template-code-annotated .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code-annotated .code-dot.red { background: #FF5F56; }
        .template-code-annotated .code-dot.yellow { background: #FFBD2E; }
        .template-code-annotated .code-dot.green { background: #27CA40; }
        .template-code-annotated .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code-annotated .code-body {
            padding: 16px 0;
            overflow-y: auto;
            flex: 1;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 14px;
            line-height: 28px;
        }
        .template-code-annotated .code-line {
            display: flex;
            padding: 0 20px;
            border-left: 3px solid transparent;
        }
        .template-code-annotated .code-line:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .template-code-annotated .code-line.highlighted {
            background: rgba(252, 109, 38, 0.15);
            border-left-color: var(--gl-orange);
        }
        .template-code-annotated .code-line.highlighted .line-number {
            color: var(--gl-orange);
        }
        .template-code-annotated .code-line.ellipsis {
            opacity: 0.5;
        }
        .template-code-annotated .code-line.ellipsis .line-number {
            color: var(--gl-gray-500);
            font-style: italic;
        }
        .template-code-annotated .line-number {
            color: var(--gl-gray-600);
            width: 40px;
            flex-shrink: 0;
            text-align: right;
            padding-right: 16px;
            user-select: none;
        }
        .template-code-annotated .line-content {
            color: var(--gl-gray-200);
            white-space: pre;
        }
        .template-code-annotated .annotations-panel {
            position: relative;
            padding-top: 52px;
            z-index: 1;
        }
        .template-code-annotated .annotation {
            position: absolute;
            left: 0;
            right: 0;
            display: flex;
            align-items: flex-start;
            gap: 0;
        }
        .template-code-annotated .annotation-arrow {
            width: 24px;
            height: 28px;
            position: relative;
            flex-shrink: 0;
        }
        .template-code-annotated .annotation-arrow::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            width: 16px;
            height: 2px;
            background: var(--gl-orange);
            transform: translateY(-50%);
        }
        .template-code-annotated .annotation-arrow::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 10px;
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-left: 8px solid var(--gl-orange);
            transform: translateY(-50%);
        }
        .template-code-annotated .annotation-content {
            background: rgba(252, 109, 38, 0.1);
            border: 1px solid rgba(252, 109, 38, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            flex: 1;
        }
        .template-code-annotated .annotation-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--gl-orange);
            margin-bottom: 6px;
        }
        .template-code-annotated .annotation-text {
            font-size: 13px;
            color: var(--gl-gray-300);
            line-height: 1.5;
        }

        /* Template: Timeline */
        .template-timeline {
            background: var(--gl-white);
            padding: 60px 80px;
        }
        .template-timeline h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 60px;
            text-align: center;
        }
        .template-timeline .timeline-wrapper {
            flex: 1;
            position: relative;
        }
        .template-timeline .timeline-line {
            position: absolute;
            top: 40px;
            height: 4px;
            background: var(--gl-gray-200);
            z-index: 0;
        }
        .template-timeline .timeline {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
        }
        .template-timeline .timeline-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 1;
            position: relative;
            z-index: 1;
        }
        .template-timeline .timeline-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--gl-gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(252, 109, 38, 0.3);
            position: relative;
            z-index: 2;
        }
        .template-timeline .timeline-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--gl-dark);
            margin-bottom: 12px;
        }
        .template-timeline .timeline-desc {
            font-size: 16px;
            color: var(--gl-gray-600);
            line-height: 1.5;
        }

        /* Template: Comparison */
        .template-comparison {
            background: var(--gl-gray-50);
            padding: 60px 80px;
        }
        .template-comparison h2 {
            font-size: 42px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 40px;
            text-align: center;
        }
        .template-comparison table {
            width: 100%;
            border-collapse: collapse;
            background: var(--gl-white);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .template-comparison thead { background: var(--gl-gradient-dark); }
        .template-comparison th {
            padding: 24px 30px;
            text-align: left;
            color: var(--gl-white);
            font-weight: 600;
            font-size: 18px;
        }
        .template-comparison th:first-child { border-radius: 16px 0 0 0; }
        .template-comparison th:last-child { border-radius: 0 16px 0 0; }
        .template-comparison th.highlight-col { background: var(--gl-gradient-primary); }
        .template-comparison td {
            padding: 20px 30px;
            font-size: 17px;
            color: var(--gl-gray-700);
            border-bottom: 1px solid var(--gl-gray-100);
        }
        .template-comparison tr:last-child td { border-bottom: none; }
        .template-comparison td.highlight-col { background: rgba(252, 109, 38, 0.05); font-weight: 500; }
        .template-comparison .check { color: var(--gl-green); font-size: 24px; }
        .template-comparison .cross { color: var(--gl-red); font-size: 24px; }

        /* Template: Mermaid */
        .template-mermaid {
            background: var(--gl-white);
            padding: 50px 60px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .template-mermaid h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 16px;
            flex-shrink: 0;
        }
        .template-mermaid .mermaid-description {
            font-size: 18px;
            color: var(--gl-gray-600);
            margin-bottom: 24px;
            line-height: 1.5;
            flex-shrink: 0;
        }
        .template-mermaid .mermaid-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gl-gray-100);
            border-radius: 16px;
            padding: 30px;
            overflow: hidden;
            min-height: 0;
            position: relative;
        }
        .template-mermaid .mermaid {
            font-family: 'Inter', sans-serif;
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .template-mermaid .mermaid svg {
            max-width: 100%;
            max-height: 100%;
            width: auto !important;
            height: auto !important;
        }

        /* Template: Draw.io */
        .template-drawio {
            background: var(--gl-white);
            padding: 50px 60px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .template-drawio h2 {
            font-size: 36px;
            font-weight: 700;
            color: var(--gl-dark);
            margin-bottom: 16px;
            flex-shrink: 0;
        }
        .template-drawio .drawio-description {
            font-size: 18px;
            color: var(--gl-gray-600);
            margin-bottom: 24px;
            line-height: 1.5;
            flex-shrink: 0;
        }
        .template-drawio .drawio-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            overflow: hidden;
            min-height: 0;
        }
        .template-drawio .drawio-placeholder {
            color: var(--gl-gray-400);
            text-align: center;
        }
        .template-drawio .drawio-placeholder svg {
            width: 64px;
            height: 64px;
            margin-bottom: 12px;
            opacity: 0.5;
        }
        .template-drawio .drawio-placeholder p {
            font-size: 16px;
        }
        .template-drawio img.drawio-svg {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            color-scheme: light only;
        }
`;

// Generate complete HTML
function generateHtml(presentationData) {
    const slidesHtml = generateSlidesHtml(presentationData.slides);
    const title = presentationData.metadata?.title || 'Presentation';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.12.2/dist/mermaid.min.js"></script>
    <style>${CSS_STYLES}
    </style>
</head>
<body>
    <div class="presentation-container">
${slidesHtml}
    </div>
    <script>
        function updateSlideScales() {
            document.querySelectorAll('.slide-wrapper').forEach(wrapper => {
                const wrapperWidth = wrapper.offsetWidth;
                const scale = Math.min(1, wrapperWidth / 1280);
                const slide = wrapper.querySelector('.slide');
                if (slide) {
                    slide.style.transform = 'scale(' + scale + ')';
                }
            });
        }
        window.addEventListener('load', updateSlideScales);
        window.addEventListener('resize', updateSlideScales);

        // Initialize Mermaid diagrams
        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            fontSize: 20,
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                nodeSpacing: 85,
                rankSpacing: 68
            },
            themeVariables: {
                primaryColor: '#FC6D26',
                primaryTextColor: '#171321',
                primaryBorderColor: '#E24329',
                lineColor: '#525059',
                secondaryColor: '#FCA326',
                tertiaryColor: '#F5F5F5'
            }
        });
    </script>
</body>
</html>`;
}

// Generate and write output
const html = generateHtml(presentationData);

try {
    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`✓ Generated: ${outputFile}`);
    console.log(`  ${presentationData.slides.length} slides`);
} catch (error) {
    console.error(`✗ Error writing ${outputFile}:`, error.message);
    process.exit(1);
}
