// slide-editor-templates.js
// Template rendering functions for slide preview

/**
 * Get the current theme colors (base theme + overrides)
 */
function getThemeColors() {
    const baseTheme = THEMES[currentProject.theme?.base || 'gitlab'];
    const overrides = currentProject.theme?.overrides || {};
    const colors = { ...baseTheme.colors, ...overrides };
    return colors;
}

/**
 * Get CSS styles for slide preview with dynamic theme colors
 */
function getPreviewStyles() {
    const colors = getThemeColors();
    return `
        :root {
            --gl-orange: ${colors['orange']};
            --gl-orange-dark: ${colors['orange-dark']};
            --gl-orange-light: ${colors['orange-light']};
            --gl-dark: ${colors['dark']};
            --gl-gray-900: ${colors['gray-900']};
            --gl-gray-800: ${colors['gray-800']};
            --gl-gray-700: ${colors['gray-700']};
            --gl-gray-600: ${colors['gray-600']};
            --gl-gray-500: ${colors['gray-500']};
            --gl-gray-400: ${colors['gray-400']};
            --gl-gray-300: ${colors['gray-300']};
            --gl-gray-200: ${colors['gray-200']};
            --gl-gray-100: ${colors['gray-100']};
            --gl-white: ${colors['white']};
            --gl-purple: ${colors['purple']};
            --gl-blue: ${colors['blue']};
            --gl-green: ${colors['green']};
            --gl-green-light: ${colors['green-light']};
            --gl-red: ${colors['red']};
            --gl-gradient-primary: linear-gradient(135deg, ${colors['orange']} 0%, ${colors['orange-light']} 100%);
            --gl-gradient-dark: linear-gradient(135deg, ${colors['dark']} 0%, ${colors['gray-800']} 100%);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .slide-content {
            width: 1280px;
            height: 720px;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        /* Title */
        .template-title { background: var(--gl-gradient-dark); display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 60px; position: relative; }
        .template-title::before { content: ''; position: absolute; top: -50%; right: -30%; width: 800px; height: 800px; background: var(--gl-gradient-primary); border-radius: 50%; opacity: 0.1; filter: blur(100px); }
        .template-title .logo { width: 80px; height: 80px; margin-bottom: 40px; position: relative; z-index: 1; }
        .template-title h1 { font-size: 56px; font-weight: 800; background: var(--gl-gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; position: relative; z-index: 1; }
        .template-title .subtitle { font-size: 24px; color: var(--gl-gray-400); margin-bottom: 40px; position: relative; z-index: 1; }
        .template-title .author { font-size: 18px; color: var(--gl-gray-500); position: relative; z-index: 1; }
        .template-title .date { font-size: 16px; color: var(--gl-gray-600); margin-top: 8px; position: relative; z-index: 1; }
        /* Section */
        .template-section { background: var(--gl-gradient-primary); display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 60px; position: relative; }
        .template-section .section-number { position: absolute; font-size: 400px; font-weight: 800; color: rgba(255,255,255,0.1); z-index: 0; }
        .template-section h2 { font-size: 64px; font-weight: 800; color: white; position: relative; z-index: 1; }
        .template-section .section-subtitle { font-size: 24px; color: rgba(255,255,255,0.8); margin-top: 20px; position: relative; z-index: 1; }
        /* Bullets */
        .template-bullets { background: var(--gl-white); padding: 60px 80px; height: 100%; }
        .template-bullets .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
        .template-bullets h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); }
        .template-bullets .slide-tag { background: var(--gl-orange); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; }
        .template-bullets ul { list-style: none; }
        .template-bullets li { font-size: 24px; color: var(--gl-gray-700); padding: 16px 0; padding-left: 40px; position: relative; line-height: 1.5; }
        .template-bullets li::before { content: ''; position: absolute; left: 0; top: 24px; width: 12px; height: 12px; background: var(--gl-orange); transform: rotate(45deg); }
        /* Two columns */
        .template-two-columns { background: var(--gl-gray-100); padding: 60px 80px; height: 100%; }
        .template-two-columns h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); margin-bottom: 50px; }
        .template-two-columns .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
        .template-two-columns .column h3 { font-size: 24px; font-weight: 600; color: var(--gl-purple); margin-bottom: 20px; }
        .template-two-columns .column ul { list-style: none; }
        .template-two-columns .column li { font-size: 20px; color: var(--gl-gray-700); padding: 12px 0; padding-left: 30px; position: relative; }
        .template-two-columns .column li::before { content: '→'; position: absolute; left: 0; color: var(--gl-orange); }
        /* Image text */
        .template-image-text { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
        .template-image-text .image-side { background: var(--gl-gray-200); display: flex; align-items: center; justify-content: center; }
        .template-image-text .image-side img { width: 100%; height: 100%; object-fit: cover; }
        .template-image-text .image-placeholder { color: var(--gl-gray-400); font-size: 48px; }
        .template-image-text .text-side { padding: 60px; display: flex; flex-direction: column; justify-content: center; background: white; }
        .template-image-text h2 { font-size: 36px; font-weight: 700; color: var(--gl-dark); margin-bottom: 30px; }
        .template-image-text p { font-size: 20px; color: var(--gl-gray-700); line-height: 1.7; margin-bottom: 16px; }
        /* Quote */
        .template-quote { background: var(--gl-gradient-dark); display: flex; align-items: center; justify-content: center; padding: 80px; position: relative; height: 100%; }
        .template-quote::before { content: '"'; position: absolute; top: 60px; left: 80px; font-size: 300px; font-weight: 800; color: var(--gl-orange); opacity: 0.15; line-height: 1; }
        .template-quote .quote-content { max-width: 900px; text-align: center; position: relative; z-index: 1; }
        .template-quote blockquote { font-size: 32px; font-style: italic; color: var(--gl-white); line-height: 1.6; margin-bottom: 40px; }
        .template-quote .author-info { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .template-quote .author-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--gl-orange); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 24px; }
        .template-quote .author-name { font-size: 20px; font-weight: 600; color: var(--gl-white); }
        .template-quote .author-title { font-size: 16px; color: var(--gl-gray-400); }
        /* Stats */
        .template-stats { background: var(--gl-gradient-dark); padding: 60px 80px; height: 100%; }
        .template-stats h2 { font-size: 42px; font-weight: 700; color: var(--gl-white); margin-bottom: 60px; text-align: center; }
        .template-stats .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .template-stats .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; text-align: center; }
        .template-stats .stat-value { font-size: 56px; font-weight: 800; background: var(--gl-gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
        .template-stats .stat-label { font-size: 18px; color: var(--gl-gray-400); margin-bottom: 16px; }
        .template-stats .stat-change { font-size: 14px; padding: 6px 12px; border-radius: 20px; display: inline-block; }
        .template-stats .stat-change.positive { background: rgba(16,133,72,0.2); color: var(--gl-green-light); }
        .template-stats .stat-change.negative { background: rgba(221,43,14,0.2); color: var(--gl-red); }
        /* Code */
        .template-code { background: var(--gl-gradient-dark); padding: 50px 60px; height: 100%; }
        .template-code h2 { font-size: 36px; font-weight: 700; color: var(--gl-white); margin-bottom: 30px; }
        .template-code .code-container { background: #0d0a12; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .template-code .code-header { background: #2d2535; padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .template-code .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code .code-dot.red { background: #FF5F56; }
        .template-code .code-dot.yellow { background: #FFBD2E; }
        .template-code .code-dot.green { background: #27CA40; }
        .template-code .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code .code-body { padding: 16px 0; font-family: 'JetBrains Mono', monospace; font-size: 16px; line-height: 1.6; overflow: auto; }
        .template-code .code-line { display: flex; padding: 0 20px; }
        .template-code .code-line.ellipsis { opacity: 0.5; }
        .template-code .line-number { color: var(--gl-gray-600); width: 40px; flex-shrink: 0; text-align: right; padding-right: 16px; user-select: none; }
        .template-code .line-content { color: var(--gl-gray-200); white-space: pre; }
        .template-code .code-description { margin-top: 30px; color: var(--gl-gray-400); font-size: 18px; }
        /* Code annotated */
        .template-code-annotated { background: var(--gl-gradient-dark); padding: 40px 50px; height: 100%; }
        .template-code-annotated h2 { font-size: 32px; font-weight: 700; color: var(--gl-white); margin-bottom: 24px; }
        .template-code-annotated .code-annotated-container { display: grid; grid-template-columns: 1fr 380px; gap: 30px; height: calc(100% - 80px); }
        .template-code-annotated .code-container { background: #0d0a12; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .template-code-annotated .code-header { background: #2d2535; padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .template-code-annotated .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code-annotated .code-dot.red { background: #FF5F56; }
        .template-code-annotated .code-dot.yellow { background: #FFBD2E; }
        .template-code-annotated .code-dot.green { background: #27CA40; }
        .template-code-annotated .code-filename { margin-left: 16px; color: var(--gl-gray-400); font-size: 14px; }
        .template-code-annotated .code-body { padding: 16px 0; flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 28px; }
        .template-code-annotated .code-line { display: flex; padding: 0 20px; border-left: 3px solid transparent; }
        .template-code-annotated .code-line.highlighted { background: rgba(252,109,38,0.15); border-left-color: var(--gl-orange); }
        .template-code-annotated .code-line.highlighted .line-number { color: var(--gl-orange); }
        .template-code-annotated .code-line.annotation-boundary { border-bottom: 1px solid var(--gl-orange); }
        .template-code-annotated .code-line.ellipsis { opacity: 0.5; }
        .template-code-annotated .line-number { color: var(--gl-gray-600); width: 40px; flex-shrink: 0; text-align: right; padding-right: 16px; }
        .template-code-annotated .line-content { color: var(--gl-gray-200); white-space: pre; }
        .template-code-annotated .annotations-panel { position: relative; padding-top: 52px; }
        .template-code-annotated .annotation { position: absolute; left: 0; right: 0; display: flex; align-items: flex-start; }
        .template-code-annotated .annotation-arrow { width: 24px; height: 28px; position: relative; flex-shrink: 0; }
        .template-code-annotated .annotation-arrow::before { content: ''; position: absolute; top: 50%; left: 0; width: 16px; height: 2px; background: var(--gl-orange); transform: translateY(-50%); }
        .template-code-annotated .annotation-arrow::after { content: ''; position: absolute; top: 50%; left: 10px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid var(--gl-orange); transform: translateY(-50%); }
        .template-code-annotated .annotation-content { background: rgba(252,109,38,0.1); border: 1px solid rgba(252,109,38,0.3); border-radius: 8px; padding: 12px 16px; flex: 1; }
        .template-code-annotated .annotation-title { font-size: 14px; font-weight: 600; color: var(--gl-orange); margin-bottom: 6px; }
        .template-code-annotated .annotation-text { font-size: 13px; color: var(--gl-gray-300); line-height: 1.5; }
        /* Timeline */
        .template-timeline { background: var(--gl-white); padding: 60px 80px; height: 100%; }
        .template-timeline h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); margin-bottom: 80px; text-align: center; }
        .template-timeline .timeline { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
        .template-timeline .timeline::before { content: ''; position: absolute; top: 30px; left: 60px; right: 60px; height: 4px; background: var(--gl-gray-200); }
        .template-timeline .timeline-item { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; }
        .template-timeline .timeline-icon { width: 60px; height: 60px; border-radius: 50%; background: var(--gl-orange); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; margin-bottom: 20px; }
        .template-timeline .timeline-title { font-size: 18px; font-weight: 600; color: var(--gl-dark); margin-bottom: 8px; }
        .template-timeline .timeline-desc { font-size: 14px; color: var(--gl-gray-500); max-width: 150px; }
        /* Comparison */
        .template-comparison { background: var(--gl-white); padding: 60px 80px; height: 100%; }
        .template-comparison h2 { font-size: 42px; font-weight: 700; color: var(--gl-dark); margin-bottom: 40px; }
        .template-comparison table { width: 100%; border-collapse: collapse; }
        .template-comparison th { background: var(--gl-dark); color: white; padding: 16px 24px; text-align: left; font-size: 16px; font-weight: 600; }
        .template-comparison td { padding: 16px 24px; font-size: 17px; color: var(--gl-gray-700); border-bottom: 1px solid var(--gl-gray-100); }
        .template-comparison td.highlight-col { background: rgba(252,109,38,0.05); font-weight: 500; }
        .template-comparison .check { color: var(--gl-green); font-size: 24px; }
        .template-comparison .cross { color: var(--gl-red); font-size: 24px; }
        /* Mermaid */
        .template-mermaid { background: var(--gl-white); padding: 50px 60px; display: flex; flex-direction: column; height: 100%; }
        .template-mermaid h2 { font-size: 36px; font-weight: 700; color: var(--gl-dark); margin-bottom: 16px; }
        .template-mermaid .mermaid-description { font-size: 18px; color: var(--gl-gray-600); margin-bottom: 24px; }
        .template-mermaid .mermaid-container { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--gl-gray-100); border-radius: 16px; padding: 30px; }
    `;
}

/**
 * Render a slide template
 */
function renderTemplate(template, data) {
    switch (template) {
        case 'title':
            return `
                <div class="slide-content template-title">
                    <div class="logo-container" data-editable="image" data-field-key="logo" style="position:relative;">
                        ${data.logo ? `<img src="${data.logo}" class="logo">` : getGitLabLogo()}
                    </div>
                    <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(data.title || '')}</h1>
                    <div class="subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(data.subtitle || '')}</div>
                    <div class="author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(data.author || '')}</div>
                    <div class="date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(data.date || '')}</div>
                </div>
            `;

        case 'section':
            return `
                <div class="slide-content template-section">
                    <span class="section-number" data-editable="text" data-field-key="number" data-placeholder="01">${escapeHtml(data.number || '')}</span>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre de section">${escapeHtml(data.title || '')}</h2>
                    <div class="section-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(data.subtitle || '')}</div>
                </div>
            `;

        case 'bullets':
            return `
                <div class="slide-content template-bullets">
                    <div class="header-bar">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                        <span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(data.tag || '')}</span>
                    </div>
                    <ul class="repeatable-list" data-list-key="items">
                        ${(data.items || []).map((item, i) => `<li class="repeatable-item" data-editable="text" data-field-key="items" data-field-index="${i}" data-placeholder="Point ${i + 1}">${escapeHtml(item)}<button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer">×</button></li>`).join('')}
                        <li class="add-item-row"><button class="add-item-btn" data-list-key="items" title="Ajouter un élément">+ Ajouter</button></li>
                    </ul>
                </div>
            `;

        case 'two-columns':
            return `
                <div class="slide-content template-two-columns">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <div class="columns">
                        <div class="column">
                            <h3 data-editable="text" data-field-key="left.title" data-placeholder="Titre colonne gauche">${escapeHtml(data.left?.title || '')}</h3>
                            <ul class="repeatable-list" data-list-key="left.items">
                                ${(data.left?.items || []).map((item, i) => `<li class="repeatable-item" data-editable="text" data-field-key="left.items" data-field-index="${i}" data-placeholder="Point ${i + 1}">${escapeHtml(item)}<button class="delete-item-btn" data-list-key="left.items" data-item-index="${i}" title="Supprimer">×</button></li>`).join('')}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="left.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                        <div class="column">
                            <h3 data-editable="text" data-field-key="right.title" data-placeholder="Titre colonne droite">${escapeHtml(data.right?.title || '')}</h3>
                            <ul class="repeatable-list" data-list-key="right.items">
                                ${(data.right?.items || []).map((item, i) => `<li class="repeatable-item" data-editable="text" data-field-key="right.items" data-field-index="${i}" data-placeholder="Point ${i + 1}">${escapeHtml(item)}<button class="delete-item-btn" data-list-key="right.items" data-item-index="${i}" title="Supprimer">×</button></li>`).join('')}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="right.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;

        case 'image-text':
            const textArray = Array.isArray(data.text) ? data.text : (data.text || '').split('\n');
            return `
                <div class="slide-content template-image-text">
                    <div class="image-side" data-editable="image" data-field-key="image" style="position:relative;cursor:pointer;">
                        ${data.image ? `<img src="${data.image}" alt="${escapeHtml(data.imageAlt || '')}">` : '<div class="image-placeholder"><svg style="width:64px;height:64px;stroke:currentColor;stroke-width:1.5;fill:none;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'}
                    </div>
                    <div class="text-side">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                        ${textArray.map((p, i) => `<p data-editable="text" data-field-key="text" data-field-index="${i}" data-placeholder="Paragraphe ${i + 1}">${escapeHtml(p)}</p>`).join('')}
                    </div>
                </div>
            `;

        case 'quote':
            const initials = (data.authorName || 'A').split(' ').map(n => n[0]).join('').substring(0, 2);
            return `
                <div class="slide-content template-quote">
                    <div class="quote-content">
                        <blockquote data-editable="multiline" data-field-key="quote" data-placeholder="Citation">${escapeHtml(data.quote || '')}</blockquote>
                        <div class="author-info">
                            <div class="author-avatar-container" data-editable="image" data-field-key="authorImage" style="position:relative;">
                                ${data.authorImage ? `<img src="${data.authorImage}" class="author-avatar">` : `<div class="author-avatar">${initials}</div>`}
                            </div>
                            <div>
                                <div class="author-name" data-editable="text" data-field-key="authorName" data-placeholder="Nom de l'auteur">${escapeHtml(data.authorName || '')}</div>
                                <div class="author-title" data-editable="text" data-field-key="authorTitle" data-placeholder="Titre de l'auteur">${escapeHtml(data.authorTitle || '')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

        case 'stats':
            return `
                <div class="slide-content template-stats">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <div class="stats-grid repeatable-list" data-list-key="stats" data-list-type="object">
                        ${(data.stats || []).map((stat, i) => `
                            <div class="stat-card repeatable-item" data-item-index="${i}">
                                <button class="delete-item-btn" data-list-key="stats" data-item-index="${i}" title="Supprimer">×</button>
                                <div class="stat-value" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="value" data-placeholder="Valeur">${escapeHtml(stat.value || '')}</div>
                                <div class="stat-label" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="label" data-placeholder="Label">${escapeHtml(stat.label || '')}</div>
                                <span class="stat-change ${(stat.change || '').startsWith('-') ? 'negative' : 'positive'}" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="change" data-placeholder="+0%">${escapeHtml(stat.change || '')}</span>
                            </div>
                        `).join('')}
                        <div class="stat-card add-item-row"><button class="add-item-btn" data-list-key="stats" data-list-type="object" title="Ajouter une statistique">+</button></div>
                    </div>
                </div>
            `;

        case 'code':
            return `
                <div class="slide-content template-code">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <div class="code-container" data-editable="code" data-field-key="code">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(data.filename || 'code.js')}</span>
                        </div>
                        <div class="code-body">${renderCodeLines(data.code || '', data.showLineNumbers, data.startLine || 1, data.showEllipsisBefore, data.showEllipsisAfter)}</div>
                    </div>
                    <p class="code-description" data-editable="text" data-field-key="description" data-placeholder="Description du code">${escapeHtml(data.description || '')}</p>
                </div>
            `;

        case 'code-annotated':
            return renderCodeAnnotated(data);

        case 'timeline':
            return `
                <div class="slide-content template-timeline">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <div class="timeline repeatable-list" data-list-key="steps" data-list-type="object">
                        ${(data.steps || []).map((step, i) => `
                            <div class="timeline-item repeatable-item" data-item-index="${i}">
                                <button class="delete-item-btn" data-list-key="steps" data-item-index="${i}" title="Supprimer">×</button>
                                <div class="timeline-icon" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="icon" data-placeholder="${i + 1}">${escapeHtml(step.icon || String(i + 1))}</div>
                                <div class="timeline-title" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="title" data-placeholder="Étape ${i + 1}">${escapeHtml(step.title || '')}</div>
                                <div class="timeline-desc" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="description" data-placeholder="Description">${escapeHtml(step.description || '')}</div>
                            </div>
                        `).join('')}
                        <div class="timeline-item add-item-row"><button class="add-item-btn" data-list-key="steps" data-list-type="object" title="Ajouter une étape">+</button></div>
                    </div>
                </div>
            `;

        case 'comparison':
            const highlightIdx = data.highlightColumn ? parseInt(data.highlightColumn) - 1 : -1;
            return `
                <div class="slide-content template-comparison">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <table>
                        <thead>
                            <tr>${(data.columns || []).map((col, i) => `<th class="${i === highlightIdx ? 'highlight-col' : ''}" data-editable="text" data-field-key="columns" data-field-index="${i}" data-placeholder="Colonne ${i + 1}">${escapeHtml(col)}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${(data.rows || []).map((row, rowIdx) => `
                                <tr>${row.map((cell, colIdx) => {
                                    let content = cell;
                                    let isBoolean = cell === true || cell === 'true' || cell === false || cell === 'false';
                                    if (cell === true || cell === 'true') content = '<span class="check">✓</span>';
                                    else if (cell === false || cell === 'false') content = '<span class="cross">✗</span>';
                                    else content = escapeHtml(String(cell));
                                    // For boolean cells, don't make them directly editable (use property panel)
                                    const editableAttr = isBoolean ? '' : `data-editable="text" data-field-key="rows" data-field-index="${rowIdx}" data-field-subkey="${colIdx}" data-placeholder="Cellule"`;
                                    return `<td class="${colIdx === highlightIdx ? 'highlight-col' : ''}" ${editableAttr}>${content}</td>`;
                                }).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        case 'mermaid':
            return `
                <div class="slide-content template-mermaid">
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
                    <p class="mermaid-description" data-editable="text" data-field-key="description" data-placeholder="Description du diagramme">${escapeHtml(data.description || '')}</p>
                    <div class="mermaid-container" data-editable="code" data-field-key="diagram">
                        <pre class="mermaid">${escapeHtml(data.diagram || '')}</pre>
                    </div>
                </div>
            `;

        default:
            return `<div class="slide-content" style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;">Template inconnu: ${template}</div>`;
    }
}

/**
 * Render code-annotated template
 */
function renderCodeAnnotated(data) {
    const lines = (data.code || '').split('\n');
    const lineHeight = 28;
    const codeStartOffset = 52;
    const startLineNum = data.startLine || 1;
    const showLineNumbers = data.showLineNumbers !== false; // Default true for annotated code
    const showEllipsisBefore = data.showEllipsisBefore || false;
    const showEllipsisAfter = data.showEllipsisAfter || data.notEndOfFile || false; // Support legacy

    const highlightedLines = new Set();
    (data.annotations || []).forEach(ann => {
        const start = ann.line;
        const end = ann.lineTo || ann.line;
        for (let i = start; i <= end; i++) highlightedLines.add(i);
    });

    const ellipsisLine = showLineNumbers
        ? `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`
        : `<div class="code-line ellipsis"><span class="line-content">...</span></div>`;

    // Build a map of which annotation each line belongs to
    const lineToAnnotation = new Map();
    (data.annotations || []).forEach((ann, idx) => {
        const start = ann.line;
        const end = ann.lineTo || ann.line;
        for (let i = start; i <= end; i++) {
            lineToAnnotation.set(i, idx);
        }
    });

    const codeLines = lines.map((line, i) => {
        const lineNum = startLineNum + i;
        const isHighlighted = highlightedLines.has(lineNum);
        const canAnnotate = !isHighlighted;
        const addBtn = canAnnotate ? `<button class="add-annotation-btn" data-line="${lineNum}" title="Ajouter une annotation"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>` : '';

        // Check if this is the last line of an annotation and next line starts a different annotation
        const currentAnnotation = lineToAnnotation.get(lineNum);
        const nextAnnotation = lineToAnnotation.get(lineNum + 1);
        const isAnnotationBoundary = isHighlighted && nextAnnotation !== undefined && currentAnnotation !== nextAnnotation;

        const classes = ['code-line'];
        if (isHighlighted) classes.push('highlighted');
        if (isAnnotationBoundary) classes.push('annotation-boundary');

        if (showLineNumbers) {
            return `<div class="${classes.join(' ')}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-number">${lineNum}</span><span class="line-content">${escapeHtml(line) || ' '}</span>${addBtn}</div>`;
        } else {
            return `<div class="${classes.join(' ')}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-content">${escapeHtml(line) || ' '}</span>${addBtn}</div>`;
        }
    }).join('');

    const allCodeLines = [showEllipsisBefore ? ellipsisLine : '', codeLines, showEllipsisAfter ? ellipsisLine : ''].filter(Boolean).join('');
    const annotationOffset = showEllipsisBefore ? lineHeight : 0;

    const annotationsHtml = (data.annotations || []).map((ann, i) => {
        const startLine = ann.line;
        const endLine = ann.lineTo || ann.line;
        const midLine = (startLine + endLine) / 2;
        const lineIndex = midLine - startLineNum;
        const topPosition = codeStartOffset + annotationOffset + (lineIndex * lineHeight);
        return `
            <div class="annotation" style="top: ${topPosition}px;" data-annotation-index="${i}">
                <div class="annotation-arrow"></div>
                <div class="annotation-content">
                    <button class="delete-annotation-btn" data-annotation-index="${i}" title="Supprimer l'annotation">×</button>
                    <div class="annotation-title" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="title" data-placeholder="Titre">${escapeHtml(ann.title || '')}</div>
                    <div class="annotation-text" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="text" data-placeholder="Description">${escapeHtml(ann.text || '')}</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="slide-content template-code-annotated">
            <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(data.title || '')}</h2>
            <div class="code-annotated-container">
                <div class="code-panel">
                    <div class="code-container" data-editable="code" data-field-key="code" data-code-annotated="true">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(data.filename || 'code.js')}</span>
                        </div>
                        <div class="code-body">${allCodeLines}</div>
                    </div>
                </div>
                <div class="annotations-panel">${annotationsHtml}</div>
            </div>
        </div>
    `;
}

/**
 * Get GitLab logo SVG
 */
function getGitLabLogo() {
    return `<svg class="logo" viewBox="0 0 380 380" fill="none">
        <path d="M190 362.42L253.31 167.69H126.69L190 362.42Z" fill="#E24329"/>
        <path d="M190 362.42L126.69 167.69H20.28L190 362.42Z" fill="#FC6D26"/>
        <path d="M20.28 167.69L2.53 222.23C0.91 227.22 2.69 232.67 6.97 235.78L190 362.42L20.28 167.69Z" fill="#FCA326"/>
        <path d="M20.28 167.69H126.69L80.89 26.87C78.95 21.01 70.74 21.01 68.8 26.87L20.28 167.69Z" fill="#E24329"/>
        <path d="M190 362.42L253.31 167.69H359.72L190 362.42Z" fill="#FC6D26"/>
        <path d="M359.72 167.69L377.47 222.23C379.09 227.22 377.31 232.67 373.03 235.78L190 362.42L359.72 167.69Z" fill="#FCA326"/>
        <path d="M359.72 167.69H253.31L299.11 26.87C301.05 21.01 309.26 21.01 311.2 26.87L359.72 167.69Z" fill="#E24329"/>
    </svg>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Render code lines with optional line numbers and ellipsis
 */
function renderCodeLines(code, showLineNumbers, startLine, showEllipsisBefore, showEllipsisAfter) {
    const lines = (code || '').split('\n');
    const start = startLine || 1;

    const ellipsisLine = `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`;
    const ellipsisLineNoNum = `<div class="code-line ellipsis"><span class="line-content">...</span></div>`;

    const codeLines = lines.map((line, i) => {
        const lineNum = start + i;
        if (showLineNumbers) {
            return `<div class="code-line"><span class="line-number">${lineNum}</span><span class="line-content">${escapeHtml(line) || ' '}</span></div>`;
        } else {
            return `<div class="code-line"><span class="line-content">${escapeHtml(line) || ' '}</span></div>`;
        }
    }).join('');

    const ellipsisBefore = showEllipsisBefore ? (showLineNumbers ? ellipsisLine : ellipsisLineNoNum) : '';
    const ellipsisAfter = showEllipsisAfter ? (showLineNumbers ? ellipsisLine : ellipsisLineNoNum) : '';

    return ellipsisBefore + codeLines + ellipsisAfter;
}
