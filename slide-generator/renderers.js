// renderers.js
// Individual template renderers (title, bullets, code, etc.)

const { escapeHtml, getGitLabLogo } = require('./utils');

/**
 * Render title slide template
 */
function renderTitle(data) {
    return `
        <div class="slide template-title">
            ${data.logo ? `<img src="${data.logo}" alt="Logo" class="logo">` : getGitLabLogo(80)}
            <h1>${escapeHtml(data.title)}</h1>
            ${data.subtitle ? `<div class="subtitle">${escapeHtml(data.subtitle)}</div>` : ''}
            ${data.author ? `<div class="author">${escapeHtml(data.author)}</div>` : ''}
            ${data.date ? `<div class="date">${escapeHtml(data.date)}</div>` : ''}
        </div>
    `;
}

/**
 * Render section slide template
 */
function renderSection(data) {
    const logoStyle = data.logoSize && data.logoSize !== 100
        ? ` style="transform: scale(${data.logoSize / 100}); transform-origin: left center;"`
        : '';
    return `
        <div class="slide template-section">
            <div class="logo-container"${logoStyle}>
                ${data.logo ? `<img src="${data.logo}" alt="Logo" class="logo">` : getGitLabLogo(60)}
            </div>
            <span class="section-number">${escapeHtml(data.number) || ''}</span>
            <h2>${escapeHtml(data.title)}</h2>
            ${data.subtitle ? `<div class="section-subtitle">${escapeHtml(data.subtitle)}</div>` : ''}
        </div>
    `;
}

/**
 * Render bullets slide template
 */
function renderBullets(data) {
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
}

/**
 * Render two-columns slide template
 */
function renderTwoColumns(data) {
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
}

/**
 * Render image-text slide template
 */
function renderImageText(data) {
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
}

/**
 * Render quote slide template
 */
function renderQuote(data) {
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
}

/**
 * Render stats slide template
 */
function renderStats(data) {
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
}

/**
 * Render code slide template
 */
function renderCode(data) {
    return `
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
    `;
}

/**
 * Render code-annotated slide template
 */
function renderCodeAnnotated(data) {
    const lines = data.code.split('\n');
    const lineHeight = 28; // pixels per line
    const codeStartOffset = 52; // header height + padding
    const startLineNum = data.startLine || 1; // offset for line numbering
    const hasCodeBefore = startLineNum > 1; // show ellipsis at start
    const hasCodeAfter = data.showEllipsisAfter || false;

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
}

/**
 * Render timeline slide template
 */
function renderTimeline(data) {
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
}

/**
 * Render comparison slide template
 */
function renderComparison(data) {
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
}

/**
 * Render mermaid slide template
 */
function renderMermaid(data) {
    return `
        <div class="slide template-mermaid">
            <h2>${escapeHtml(data.title)}</h2>
            ${data.description ? `<p class="mermaid-description">${escapeHtml(data.description)}</p>` : ''}
            <div class="mermaid-container">
                <pre class="mermaid">${escapeHtml(data.diagram)}</pre>
            </div>
        </div>
    `;
}

/**
 * Render drawio slide template
 */
function renderDrawio(data) {
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

module.exports = {
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
};
