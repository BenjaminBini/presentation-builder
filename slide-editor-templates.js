// slide-editor-templates.js
// Template rendering functions for slide preview

/**
 * Get the current theme colors (base theme + overrides)
 */
function getThemeColors() {
  const baseTheme = THEMES[currentProject.theme?.base || "gitlab"];
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .slide-content {
            /* Theme colors scoped to slide content only */
            --accent-main: ${colors["accent-main"]};
            --accent-alt: ${colors["accent-alt"]};
            --accent-third: ${colors["accent-third"]};
            --text-main: ${colors["text-main"]};
            --text-alt: ${colors["text-alt"]};
            --text-third: ${colors["text-third"]};
            --bg-main: ${colors["bg-main"]};
            --bg-alt: ${colors["bg-alt"]};
            --bg-third: ${colors["bg-third"]};
            --confirm: ${colors["confirm"]};
            --info: ${colors["info"]};
            --warn: ${colors["warn"]};
            --error: ${colors["error"]};
            /* Static palette */
            --gray-900: #1F1A24;
            --gray-800: #2E2A35;
            --gray-700: #3F3A47;
            --gray-600: #525059;
            --gray-500: #737278;
            --gray-400: #9A99A0;
            --gray-300: #BFBFC3;
            --gray-200: #DCDCDE;
            --gray-100: #ECECEF;
            --white: #FFFFFF;
            --purple: #6B4FBB;
            --confirm-light: #2DA160;
            /* Gradients */
            --gradient-accent: linear-gradient(135deg, ${colors["accent-main"]} 0%, ${colors["accent-third"]} 100%);
            --gradient-bg: linear-gradient(135deg, ${colors["bg-main"]} 0%, ${colors["bg-alt"]} 100%);
            /* Slide dimensions */
            width: 1280px;
            height: 720px;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        /* Title */
        .template-title { background: var(--slide-bgColor, var(--gradient-bg)); display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding: 60px; position: relative; }
        .template-title::before { content: ''; position: absolute; top: -50%; right: -30%; width: 800px; height: 800px; background: var(--slide-gradientColor, var(--gradient-accent)); border-radius: 50%; opacity: 0.1; filter: blur(100px); }
        .template-title .logo-container { margin-bottom: 40px; position: relative; z-index: 1; }
        .template-title .logo { max-width: 400px; max-height: 80px; height: 80px; width: auto; object-fit: contain; display: block; }
        .template-title h1 { font-size: 56px; font-weight: 800; color: var(--slide-titleColor, var(--white)); margin-bottom: 20px; position: relative; z-index: 1; line-height: 1.1; max-width: 900px; }
        .template-title .subtitle { font-size: 24px; font-weight: 400; color: var(--slide-subtitleColor, var(--gray-300)); margin-bottom: 40px; position: relative; z-index: 1; }
        .template-title .author { font-size: 18px; color: var(--slide-authorColor, var(--accent-main)); font-weight: 500; position: relative; z-index: 1; }
        .template-title .date { font-size: 16px; color: var(--slide-dateColor, var(--gray-500)); margin-top: 10px; position: relative; z-index: 1; }
        /* Section */
        .template-section { background: var(--slide-bgColor, var(--gradient-accent)); display: flex; flex-direction: column; justify-content: center; padding: 80px; height: 100%; position: relative; overflow: hidden; }
        .template-section::after { content: ''; position: absolute; bottom: 0; right: 0; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(30%, 30%); }
        .template-section .section-number { font-size: 120px; font-weight: 800; color: var(--slide-numberColor, rgba(255,255,255,0.2)); position: absolute; top: 40px; right: 60px; }
        .template-section h2 { font-size: 64px; font-weight: 800; color: var(--slide-titleColor, white); max-width: 800px; line-height: 1.1; position: relative; z-index: 1; }
        .template-section .section-subtitle { font-size: 24px; color: var(--slide-subtitleColor, rgba(255,255,255,0.8)); margin-top: 20px; max-width: 600px; position: relative; z-index: 1; }
        /* Bullets */
        .template-bullets { background: var(--slide-bgColor, var(--white)); padding: 60px 80px; height: 100%; display: flex; flex-direction: column; }
        .template-bullets .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid var(--accent-main); }
        .template-bullets h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-bullets .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .template-bullets .content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-bullets ul { list-style: none; }
        .template-bullets li { font-size: 26px; color: var(--slide-textColor, var(--gray-800)); margin-bottom: 28px; padding-left: 50px; position: relative; line-height: 1.4; display: flex; align-items: flex-start; }
        .template-bullets li::before { content: ''; position: absolute; left: 0; top: 8px; width: 24px; height: 24px; background: var(--slide-bulletColor, var(--gradient-accent)); border-radius: 6px; transform: rotate(45deg); }
        .template-bullets li .item-text { flex: 1; }
        .template-bullets li .delete-item-btn { flex-shrink: 0; }
        .template-bullets li[data-level="1"] { margin-left: 40px; font-size: 24px; }
        .template-bullets li[data-level="1"]::before { width: 18px; height: 18px; top: 10px; border-radius: 50%; transform: none; }
        .template-bullets li[data-level="2"] { margin-left: 80px; font-size: 22px; }
        .template-bullets li[data-level="2"]::before { width: 14px; height: 14px; top: 10px; border-radius: 0; opacity: 0.8; }
        .template-bullets li[data-level="3"] { margin-left: 120px; font-size: 20px; }
        .template-bullets li[data-level="3"]::before { width: 10px; height: 10px; top: 10px; border-radius: 50%; transform: none; opacity: 0.6; }
        /* Two columns */
        .template-two-columns { background: var(--slide-bgColor, var(--gray-100)); padding: 60px 80px; height: 100%; }
        .template-two-columns h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid var(--accent-main); }
        .template-two-columns .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; height: calc(100% - 120px); }
        .template-two-columns .column { display: flex; flex-direction: column; }
        .template-two-columns .column h3 { font-size: 28px; font-weight: 600; color: var(--slide-columnTitleColor, var(--purple)); margin-bottom: 24px; }
        .template-two-columns .column ul { list-style: none; }
        .template-two-columns .column li { font-size: 20px; color: var(--slide-textColor, var(--gray-700)); margin-bottom: 16px; padding-left: 30px; position: relative; display: flex; align-items: flex-start; }
        .template-two-columns .column li::before { content: '→'; position: absolute; left: 0; color: var(--slide-bulletColor, var(--accent-main)); font-weight: bold; }
        .template-two-columns .column li .item-text { flex: 1; }
        .template-two-columns .column li .delete-item-btn { flex-shrink: 0; }
        /* Image text */
        .template-image-text { display: grid; grid-template-columns: 1fr 1fr; height: 100%; background: var(--white); }
        .template-image-text .image-side { background: var(--gray-200); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .template-image-text .image-side img { width: 100%; height: 100%; object-fit: contain; }
        .template-image-text .image-placeholder { width: 200px; height: 200px; background: var(--gradient-accent); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 60px; }
        .template-image-text .text-side { padding: 60px; display: flex; flex-direction: column; justify-content: center; background: var(--slide-bgColor, white); }
        .template-image-text h2 { font-size: 38px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 24px; }
        .template-image-text p { font-size: 20px; color: var(--slide-textColor, var(--gray-700)); line-height: 1.7; margin-bottom: 16px; }
        /* Quote */
        .template-quote { background: var(--slide-bgColor, var(--gradient-bg)); display: flex; align-items: center; justify-content: center; padding: 80px; position: relative; height: 100%; }
        .template-quote::before { content: '"'; position: absolute; top: 60px; left: 80px; font-size: 300px; font-weight: 800; color: var(--slide-quoteMarkColor, var(--accent-main)); opacity: 0.15; line-height: 1; }
        .template-quote .quote-content { max-width: 900px; text-align: center; position: relative; z-index: 1; }
        .template-quote blockquote { font-size: 36px; font-weight: 500; font-style: italic; color: var(--slide-quoteColor, var(--white)); line-height: 1.5; margin-bottom: 40px; }
        .template-quote .author-info { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .template-quote .author-avatar { width: 60px; height: 60px; border-radius: 50%; background: var(--gradient-accent); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; }
        .template-quote .author-name { font-size: 20px; font-weight: 600; color: var(--slide-authorNameColor, var(--accent-main)); }
        .template-quote .author-title { font-size: 16px; color: var(--slide-authorTitleColor, var(--gray-400)); }
        /* Stats */
        .template-stats { background: var(--slide-bgColor, var(--gradient-bg)); padding: 60px 80px; height: 100%; }
        .template-stats h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--white)); margin-bottom: 60px; text-align: center; }
        .template-stats .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .template-stats .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; text-align: center; }
        .template-stats .stat-value { font-size: 64px; font-weight: 800; background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .template-stats .stat-label { font-size: 20px; color: var(--slide-labelColor, var(--gray-300)); font-weight: 500; }
        .template-stats .stat-change { font-size: 14px; margin-top: 12px; padding: 4px 12px; border-radius: 20px; display: inline-block; }
        .template-stats .stat-change.positive { background: rgba(16, 133, 72, 0.2); color: var(--confirm-light); }
        .template-stats .stat-change.negative { background: rgba(221, 43, 14, 0.2); color: var(--error); }
        /* Code */
        .template-code { background: var(--slide-bgColor, var(--gradient-bg)); padding: 50px 60px; height: 100%; }
        .template-code h2 { font-size: 36px; font-weight: 700; color: var(--slide-titleColor, var(--white)); margin-bottom: 30px; }
        .template-code .code-container { background: var(--slide-windowBgColor, #252030); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); position: relative; z-index: 1; }
        .template-code .code-header { background: #2d2535; padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .template-code .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code .code-dot.red { background: #FF5F56; }
        .template-code .code-dot.yellow { background: #FFBD2E; }
        .template-code .code-dot.green { background: #27CA40; }
        .template-code .code-filename { margin-left: 16px; color: var(--gray-400); font-size: 14px; }
        .template-code .code-body { padding: 16px 0; font-family: 'JetBrains Mono', monospace; font-size: 16px; line-height: 1.6; overflow: auto; }
        .template-code .code-line { display: flex; padding: 0 20px; }
        .template-code .code-line.ellipsis { opacity: 0.5; }
        .template-code .line-number { color: var(--gray-600); width: 40px; flex-shrink: 0; text-align: right; padding-right: 16px; user-select: none; }
        .template-code .line-content { color: var(--gray-200); white-space: pre; }
        .template-code .code-description { margin-top: 30px; color: var(--slide-descriptionColor, var(--gray-400)); font-size: 18px; }
        /* Code annotated */
        .template-code-annotated { background: var(--slide-bgColor, var(--gradient-bg)); padding: 40px 50px; height: 100%; }
        .template-code-annotated h2 { font-size: 32px; font-weight: 700; color: var(--slide-titleColor, var(--white)); margin-bottom: 24px; position: relative; z-index: 1; }
        .template-code-annotated .code-annotated-container { display: grid; grid-template-columns: 1fr 380px; gap: 30px; height: calc(100% - 80px); }
        .template-code-annotated .code-panel { display: flex; flex-direction: column; }
        .template-code-annotated .code-container { background: var(--slide-windowBgColor, #252030); border-radius: 12px; overflow: hidden; flex: 1; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3); position: relative; z-index: 1; }
        .template-code-annotated .code-header { background: #2d2535; padding: 12px 20px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .template-code-annotated .code-dot { width: 12px; height: 12px; border-radius: 50%; }
        .template-code-annotated .code-dot.red { background: #FF5F56; }
        .template-code-annotated .code-dot.yellow { background: #FFBD2E; }
        .template-code-annotated .code-dot.green { background: #27CA40; }
        .template-code-annotated .code-filename { margin-left: 16px; color: var(--gray-400); font-size: 14px; }
        .template-code-annotated .code-body { padding: 16px 0; flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 28px; }
        .template-code-annotated .code-line { display: flex; padding: 0 20px; border-left: 3px solid transparent; }
        .template-code-annotated .code-line.highlighted { background: rgba(252,109,38,0.15); border-left-color: var(--accent-main); }
        .template-code-annotated .code-line.highlighted .line-number { color: var(--accent-main); }
        .template-code-annotated .code-line.annotation-boundary { border-bottom: 1px solid var(--accent-main); }
        .template-code-annotated .code-line.ellipsis { opacity: 0.5; }
        .template-code-annotated .line-number { color: var(--gray-600); width: 40px; flex-shrink: 0; text-align: right; padding-right: 16px; }
        .template-code-annotated .line-content { color: var(--gray-200); white-space: pre; }
        .template-code-annotated .annotations-panel { position: relative; padding-top: 52px; background: var(--slide-annotationBgColor, transparent); }
        .template-code-annotated .annotation { position: absolute; left: 0; right: 0; display: flex; align-items: flex-start; }
        .template-code-annotated .annotation-arrow { width: 24px; height: 28px; position: relative; flex-shrink: 0; }
        .template-code-annotated .annotation-arrow::before { content: ''; position: absolute; top: 50%; left: 0; width: 16px; height: 2px; background: var(--accent-main); transform: translateY(-50%); }
        .template-code-annotated .annotation-arrow::after { content: ''; position: absolute; top: 50%; left: 10px; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid var(--accent-main); transform: translateY(-50%); }
        .template-code-annotated .annotation-content { background: rgba(252,109,38,0.1); border: 1px solid rgba(252,109,38,0.3); border-radius: 8px; padding: 12px 16px; flex: 1; }
        .template-code-annotated .annotation-title { font-size: 14px; font-weight: 600; color: var(--accent-main); margin-bottom: 6px; }
        .template-code-annotated .annotation-text { font-size: 13px; color: var(--slide-annotationTextColor, var(--gray-300)); line-height: 1.5; }
        /* Timeline */
        .template-timeline { background: var(--slide-bgColor, var(--white)); padding: 60px 80px; height: 100%; }
        .template-timeline h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 60px; text-align: center; }
        .template-timeline .timeline-wrapper { flex: 1; position: relative; }
        .template-timeline .timeline-line { position: absolute; top: 40px; height: 4px; background: var(--gray-200); z-index: 0; }
        .template-timeline .timeline { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
        .template-timeline .timeline-item { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; position: relative; z-index: 1; }
        .template-timeline .timeline-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--slide-iconColor, var(--gradient-accent)); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(252, 109, 38, 0.3); position: relative; z-index: 2; }
        .template-timeline .timeline-title { font-size: 20px; font-weight: 600; color: var(--slide-stepTitleColor, var(--bg-main)); margin-bottom: 12px; }
        .template-timeline .timeline-desc { font-size: 16px; color: var(--slide-stepDescColor, var(--gray-600)); line-height: 1.5; }
        .template-timeline .timeline-add-btn-wrapper { position: absolute; top: 14px; right: 0px; z-index: 10; }
        /* Comparison */
        .template-comparison { background: var(--slide-bgColor, var(--gray-100)); padding: 40px 80px 60px; height: 100%; display: flex; flex-direction: column; }
        .template-comparison h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 30px; text-align: center; flex-shrink: 0; }
        .template-comparison .table-wrapper { position: relative; flex: 1; display: flex; flex-direction: column; }
        .template-comparison .table-container { display: flex; align-items: stretch; margin-top: 30px; }
        .template-comparison table { flex: 1; border-collapse: collapse; background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
        .template-comparison thead { background: var(--gradient-bg); }
        .template-comparison th { color: var(--slide-headerTextColor, white); padding: 24px 30px; text-align: left; font-size: 18px; font-weight: 600; }
        .template-comparison th:first-child { border-radius: 16px 0 0 0; }
        .template-comparison th:last-child { border-radius: 0 16px 0 0; }
        .template-comparison th.highlight-col { background: var(--gradient-accent); }
        .template-comparison td { padding: 20px 30px; font-size: 17px; color: var(--gray-700); border-bottom: 1px solid var(--gray-100); }
        .template-comparison tr:last-child td { border-bottom: none; }
        .template-comparison td.highlight-col { background: rgba(252,109,38,0.05); font-weight: 500; }
        .template-comparison .check { color: var(--confirm); font-size: 24px; }
        .template-comparison .cross { color: var(--error); font-size: 24px; }
        .template-comparison .table-delete-col-btn, .template-comparison .table-delete-row-btn { width: 22px; height: 22px; border: none; background: var(--error); color: white; border-radius: 50%; cursor: pointer; opacity: 0; transition: opacity 0.2s; z-index: 10; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 4px; }
        .template-comparison .table-delete-col-btn svg, .template-comparison .table-delete-row-btn svg { width: 100%; height: 100%; }
        .template-comparison .table-wrapper:hover .table-delete-col-btn, .template-comparison .table-wrapper:hover .table-delete-row-btn { opacity: 0.6; }
        .template-comparison .table-delete-col-btn:hover, .template-comparison .table-delete-row-btn:hover { opacity: 1; }
        .template-comparison .table-col-controls { position: absolute; top: 0; left: 0; right: 50px; height: 30px; display: flex; pointer-events: none; }
        .template-comparison .table-col-control { flex: 1; display: flex; justify-content: center; align-items: center; pointer-events: auto; }
        .template-comparison .table-row-controls { display: table; width: 50px; flex-shrink: 0; }
        .template-comparison .table-row-controls .row-control-header { display: table-row; }
        .template-comparison .table-row-controls .row-control-header-cell { display: table-cell; padding: 24px 0; }
        .template-comparison .table-row-controls .row-control { display: table-row; }
        .template-comparison .table-row-controls .row-control-cell { display: table-cell; vertical-align: middle; padding: 20px 0 20px 14px; border-bottom: 1px solid transparent; }
        .template-comparison .table-row-controls .row-control:last-child .row-control-cell { border-bottom: none; }
        .template-comparison .table-add-col-btn { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 28px; height: 28px; border: 2px dashed var(--gray-300); background: var(--white); color: var(--gray-400); font-size: 18px; border-radius: 6px; cursor: pointer; transition: all 0.2s; opacity: 0; z-index: 10; }
        .template-comparison .table-wrapper:hover .table-add-col-btn { opacity: 1; }
        .template-comparison .table-add-col-btn:hover { border-color: var(--accent-main); color: var(--accent-main); background: rgba(252,109,38,0.1); }
        .template-comparison .table-add-row-btn { position: absolute; bottom: 10px; left: calc(50% - 25px); transform: translateX(-50%); border: 2px dashed var(--gray-300); background: var(--white); color: var(--gray-400); padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; opacity: 0; white-space: nowrap; z-index: 10; }
        .template-comparison .table-wrapper:hover .table-add-row-btn { opacity: 1; }
        .template-comparison .table-add-row-btn:hover { border-color: var(--accent-main); color: var(--accent-main); background: rgba(252,109,38,0.1); }
        /* Mermaid */
        .template-mermaid { background: var(--slide-bgColor, var(--white)); padding: 50px 60px; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .template-mermaid h2 { font-size: 36px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 16px; flex-shrink: 0; }
        .template-mermaid .mermaid-description { font-size: 18px; color: var(--slide-descriptionColor, var(--gray-600)); margin-bottom: 24px; line-height: 1.5; flex-shrink: 0; }
        .template-mermaid .mermaid-container { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 16px; padding: 30px; overflow: hidden; min-height: 0; position: relative; }
        .template-mermaid .mermaid { font-family: 'Inter', sans-serif; position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; display: flex; align-items: center; justify-content: center; }
        .template-mermaid .mermaid svg { max-width: 100%; max-height: 100%; width: auto !important; height: auto !important; }
        /* Agenda */
        .template-agenda { background: var(--slide-bgColor, var(--white)); padding: 60px 100px; height: 100%; }
        .template-agenda h2 { font-size: 48px; font-weight: 700; color: var(--slide-titleColor, var(--gray-900)); margin-bottom: 50px; }
        .template-agenda .agenda-list { list-style: none; }
        .template-agenda .agenda-item { display: flex; align-items: center; gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--gray-200); }
        .template-agenda .agenda-item:last-child { border-bottom: none; }
        .template-agenda .agenda-number { width: 48px; height: 48px; border-radius: 50%; background: var(--slide-numberColor, var(--accent-main)); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
        .template-agenda .agenda-content { flex: 1; }
        .template-agenda .agenda-title { font-size: 26px; font-weight: 600; color: var(--slide-itemColor, var(--gray-800)); line-height: 1.3; }
        .template-agenda .agenda-subtitle { font-size: 16px; color: var(--gray-500); margin-top: 4px; }
        .template-agenda .agenda-duration { font-size: 16px; font-weight: 500; color: var(--slide-durationColor, var(--gray-500)); background: var(--gray-100); padding: 8px 16px; border-radius: 20px; white-space: nowrap; }
        /* Draw.io */
        .template-drawio { background: var(--slide-bgColor, var(--white)); padding: 50px 60px; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .template-drawio h2 { font-size: 36px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: 16px; flex-shrink: 0; }
        .template-drawio .drawio-description { font-size: 18px; color: var(--slide-descriptionColor, var(--gray-600)); margin-bottom: 24px; line-height: 1.5; flex-shrink: 0; }
        .template-drawio .drawio-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 30px; cursor: pointer; overflow: hidden; min-height: 0; position: relative; }
        .template-drawio .drawio-container:hover { background: var(--gray-100); border-radius: 16px; }
        .template-drawio .drawio-placeholder { color: var(--gray-400); text-align: center; }
        .template-drawio .drawio-placeholder svg { width: 64px; height: 64px; margin-bottom: 12px; opacity: 0.5; }
        .template-drawio .drawio-placeholder p { font-size: 16px; }
        .template-drawio img.drawio-svg { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; color-scheme: light only; }
    `;
}

/**
 * Generate CSS custom properties from slide colors
 */
function getSlideColorStyles(template, colors) {
  const settings = TEMPLATE_COLOR_SETTINGS[template] || [];
  if (settings.length === 0 || !colors) return "";

  const styles = settings
    .map((setting) => {
      const value = colors[setting.key] || setting.default;
      return `--slide-${setting.key}: var(--${value})`;
    })
    .join("; ");

  return styles ? `style="${styles}"` : "";
}

/**
 * Render a slide template
 */
function renderTemplate(template, data) {
  const colorStyles = getSlideColorStyles(template, data.colors);

  switch (template) {
    case "title":
      const logoScale = (data.logoSize || 100) / 100;
      return `
                <div class="slide-content template-title" ${colorStyles}>
                    <div class="logo-container" data-editable="image" data-field-key="logo" style="position:relative; transform: scale(${logoScale}); transform-origin: center center;">
                        ${
                          data.logo
                            ? `<img src="${data.logo}" class="logo">`
                            : getGitLabLogo()
                        }
                    </div>
                    <h1 data-editable="text" data-field-key="title" data-placeholder="Titre de la présentation">${escapeHtml(
                      data.title || ""
                    )}</h1>
                    <div class="subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                      data.subtitle || ""
                    )}</div>
                    <div class="author" data-editable="text" data-field-key="author" data-placeholder="Auteur">${escapeHtml(
                      data.author || ""
                    )}</div>
                    <div class="date" data-editable="text" data-field-key="date" data-placeholder="Date">${escapeHtml(
                      data.date || ""
                    )}</div>
                </div>
            `;

    case "section":
      return `
                <div class="slide-content template-section" ${colorStyles}>
                    <span class="section-number" data-editable="text" data-field-key="number" data-placeholder="01">${escapeHtml(
                      data.number || ""
                    )}</span>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre de section">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="section-subtitle" data-editable="text" data-field-key="subtitle" data-placeholder="Sous-titre">${escapeHtml(
                      data.subtitle || ""
                    )}</div>
                </div>
            `;

    case "bullets":
      const showTag = data.showTag !== false;
      return `
                <div class="slide-content template-bullets" ${colorStyles}>
                    <div class="header-bar">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || ""
                        )}</h2>
                        ${
                          showTag
                            ? `<span class="slide-tag" data-editable="text" data-field-key="tag" data-placeholder="Tag">${escapeHtml(
                                data.tag || ""
                              )}</span>`
                            : ""
                        }
                    </div>
                    <ul class="repeatable-list" data-list-key="items">
                        ${(data.items || [])
                          .map((item, i) => {
                            const isObject = typeof item === "object";
                            const text = isObject ? item.text : item;
                            const level = isObject ? item.level || 0 : 0;
                            return `<li class="repeatable-item" data-item-level="${level}" ${
                              level > 0 ? `data-level="${level}"` : ""
                            }><span class="item-text" data-editable="text" data-field-key="items" data-field-index="${i}" data-placeholder="Point ${
                              i + 1
                            }">${escapeHtml(
                              text || ""
                            )}</span><button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`;
                          })
                          .join("")}
                        <li class="add-item-row"><button class="add-item-btn" data-list-key="items" title="Ajouter un élément">+ Ajouter</button></li>
                    </ul>
                </div>
            `;

    case "two-columns":
      return `
                <div class="slide-content template-two-columns" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="columns">
                        <div class="column">
                            <h3 data-editable="text" data-field-key="left.title" data-placeholder="Titre colonne gauche">${escapeHtml(
                              data.left?.title || ""
                            )}</h3>
                            <ul class="repeatable-list" data-list-key="left.items">
                                ${(data.left?.items || [])
                                  .map(
                                    (item, i) =>
                                      `<li class="repeatable-item"><span class="item-text" data-editable="text" data-field-key="left.items" data-field-index="${i}" data-placeholder="Point ${
                                        i + 1
                                      }">${escapeHtml(
                                        item
                                      )}</span><button class="delete-item-btn" data-list-key="left.items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`
                                  )
                                  .join("")}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="left.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                        <div class="column">
                            <h3 data-editable="text" data-field-key="right.title" data-placeholder="Titre colonne droite">${escapeHtml(
                              data.right?.title || ""
                            )}</h3>
                            <ul class="repeatable-list" data-list-key="right.items">
                                ${(data.right?.items || [])
                                  .map(
                                    (item, i) =>
                                      `<li class="repeatable-item"><span class="item-text" data-editable="text" data-field-key="right.items" data-field-index="${i}" data-placeholder="Point ${
                                        i + 1
                                      }">${escapeHtml(
                                        item
                                      )}</span><button class="delete-item-btn" data-list-key="right.items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`
                                  )
                                  .join("")}
                                <li class="add-item-row"><button class="add-item-btn" data-list-key="right.items" title="Ajouter un élément">+ Ajouter</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;

    case "image-text":
      const textArray = Array.isArray(data.text)
        ? data.text
        : (data.text || "").split("\n");
      return `
                <div class="slide-content template-image-text" ${colorStyles}>
                    <div class="image-side" data-editable="image" data-field-key="image" style="position:relative;cursor:pointer;">
                        ${
                          data.image
                            ? `<img src="${data.image}" alt="${escapeHtml(
                                data.imageAlt || ""
                              )}">`
                            : '<div class="image-placeholder"><svg style="width:64px;height:64px;stroke:currentColor;stroke-width:1.5;fill:none;" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>'
                        }
                    </div>
                    <div class="text-side">
                        <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                          data.title || ""
                        )}</h2>
                        ${textArray
                          .map(
                            (p, i) =>
                              `<p data-editable="text" data-field-key="text" data-field-index="${i}" data-placeholder="Paragraphe ${
                                i + 1
                              }">${escapeHtml(p)}</p>`
                          )
                          .join("")}
                    </div>
                </div>
            `;

    case "quote":
      const initials = (data.authorName || "A")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2);
      return `
                <div class="slide-content template-quote" ${colorStyles}>
                    <div class="quote-content">
                        <blockquote data-editable="multiline" data-field-key="quote" data-placeholder="Citation">${escapeHtml(
                          data.quote || ""
                        )}</blockquote>
                        <div class="author-info">
                            <div class="author-avatar-container" data-editable="image" data-field-key="authorImage" style="position:relative;">
                                ${
                                  data.authorImage
                                    ? `<img src="${data.authorImage}" class="author-avatar">`
                                    : `<div class="author-avatar">${initials}</div>`
                                }
                            </div>
                            <div>
                                <div class="author-name" data-editable="text" data-field-key="authorName" data-placeholder="Nom de l'auteur">${escapeHtml(
                                  data.authorName || ""
                                )}</div>
                                <div class="author-title" data-editable="text" data-field-key="authorTitle" data-placeholder="Titre de l'auteur">${escapeHtml(
                                  data.authorTitle || ""
                                )}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

    case "stats":
      return `
                <div class="slide-content template-stats" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="stats-grid repeatable-list" data-list-key="stats" data-list-type="object">
                        ${(data.stats || [])
                          .map(
                            (stat, i) => `
                            <div class="stat-card repeatable-item" data-item-index="${i}">
                                <button class="delete-item-btn" data-list-key="stats" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                <div class="stat-value" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="value" data-placeholder="Valeur">${escapeHtml(
                              stat.value || ""
                            )}</div>
                                <div class="stat-label" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="label" data-placeholder="Label">${escapeHtml(
                              stat.label || ""
                            )}</div>
                                <span class="stat-change ${
                                  (stat.change || "").startsWith("-")
                                    ? "negative"
                                    : "positive"
                                }" data-editable="text" data-field-key="stats" data-field-index="${i}" data-field-subkey="change" data-placeholder="+0%">${escapeHtml(
                              stat.change || ""
                            )}</span>
                            </div>
                        `
                          )
                          .join("")}
                        <div class="stat-card add-item-row"><button class="add-item-btn" data-list-key="stats" data-list-type="object" title="Ajouter une statistique">+</button></div>
                    </div>
                </div>
            `;

    case "code":
      return `
                <div class="slide-content template-code" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="code-container" data-editable="code" data-field-key="code">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(
                              data.filename || "code.js"
                            )}</span>
                        </div>
                        <div class="code-body">${renderCodeLines(
                          data.code || "",
                          data.showLineNumbers,
                          data.startLine || 1,
                          data.showEllipsisBefore,
                          data.showEllipsisAfter
                        )}</div>
                    </div>
                    <p class="code-description" data-editable="text" data-field-key="description" data-placeholder="Description du code">${escapeHtml(
                      data.description || ""
                    )}</p>
                </div>
            `;

    case "code-annotated":
      return renderCodeAnnotated(data, colorStyles);

    case "timeline":
      const stepCount = (data.steps || []).length;
      return `
                <div class="slide-content template-timeline" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="timeline-wrapper">
                        <div class="timeline-line" style="left: calc(50% / ${
                          stepCount || 1
                        }); right: calc(50% / ${stepCount || 1});"></div>
                        <div class="timeline repeatable-list" data-list-key="steps" data-list-type="object">
                            ${(data.steps || [])
                              .map(
                                (step, i) => `
                                <div class="timeline-item repeatable-item" data-item-index="${i}">
                                    <button class="delete-item-btn" data-list-key="steps" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                    <div class="timeline-icon" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="icon" data-placeholder="${
                                  i + 1
                                }">${escapeHtml(
                                  step.icon || String(i + 1)
                                )}</div>
                                    <div class="timeline-title" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="title" data-placeholder="Étape ${
                                  i + 1
                                }">${escapeHtml(step.title || "")}</div>
                                    <div class="timeline-desc" data-editable="text" data-field-key="steps" data-field-index="${i}" data-field-subkey="description" data-placeholder="Description">${escapeHtml(
                                  step.description || ""
                                )}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <div class="timeline-add-btn-wrapper">
                            <button class="add-item-btn" data-list-key="steps" data-list-type="object" title="Ajouter une étape">+</button>
                        </div>
                    </div>
                </div>
            `;

    case "comparison":
      const highlightIdx = data.highlightColumn
        ? parseInt(data.highlightColumn) - 1
        : -1;
      const columns = data.columns || [];
      const rows = data.rows || [];
      return `
                <div class="slide-content template-comparison" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <div class="table-wrapper">
                        <div class="table-col-controls">
                            ${columns
                              .map(
                                (_, i) =>
                                  `<div class="table-col-control"><button class="table-delete-col-btn" data-col-index="${i}" title="Supprimer la colonne"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`
                              )
                              .join("")}
                        </div>
                        <button class="table-add-col-btn" title="Ajouter une colonne">+</button>
                        <button class="table-add-row-btn" title="Ajouter une ligne">+ Ajouter</button>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        ${columns
                                          .map(
                                            (col, i) =>
                                              `<th class="${
                                                i === highlightIdx
                                                  ? "highlight-col"
                                                  : ""
                                              }" data-editable="text" data-field-key="columns" data-field-index="${i}" data-placeholder="Colonne ${
                                                i + 1
                                              }">${escapeHtml(col)}</th>`
                                          )
                                          .join("")}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows
                                      .map(
                                        (row, rowIdx) => `
                                        <tr>
                                            ${row
                                              .map((cell, colIdx) => {
                                                let content = cell;
                                                let isBoolean =
                                                  cell === true ||
                                                  cell === "true" ||
                                                  cell === false ||
                                                  cell === "false";
                                                if (
                                                  cell === true ||
                                                  cell === "true"
                                                )
                                                  content =
                                                    '<span class="check">✓</span>';
                                                else if (
                                                  cell === false ||
                                                  cell === "false"
                                                )
                                                  content =
                                                    '<span class="cross">✗</span>';
                                                else
                                                  content = escapeHtml(
                                                    String(cell)
                                                  );
                                                const editableAttr = isBoolean
                                                  ? ""
                                                  : `data-editable="text" data-field-key="rows" data-field-index="${rowIdx}" data-field-subkey="${colIdx}" data-placeholder="Cellule"`;
                                                return `<td class="${
                                                  colIdx === highlightIdx
                                                    ? "highlight-col"
                                                    : ""
                                                }" ${editableAttr}>${content}</td>`;
                                              })
                                              .join("")}
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                            <div class="table-row-controls">
                                <div class="row-control-header"><div class="row-control-header-cell"></div></div>
                                ${rows
                                  .map(
                                    (_, rowIdx) =>
                                      `<div class="row-control"><div class="row-control-cell"><button class="table-delete-row-btn" data-row-index="${rowIdx}" title="Supprimer la ligne"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>
            `;

    case "mermaid":
      return `
                <div class="slide-content template-mermaid" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <p class="mermaid-description" data-editable="text" data-field-key="description" data-placeholder="Description du diagramme">${escapeHtml(
                      data.description || ""
                    )}</p>
                    <div class="mermaid-container" data-editable="code" data-field-key="diagram">
                        <pre class="mermaid">${escapeHtml(
                          data.diagram || ""
                        )}</pre>
                    </div>
                </div>
            `;

    case "agenda":
      const agendaItems = data.items || [];
      const showDuration = data.showDuration !== false;
      return `
                <div class="slide-content template-agenda" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Agenda">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <ul class="agenda-list repeatable-list" data-list-key="items">
                        ${agendaItems
                          .map(
                            (item, i) => `
                            <li class="agenda-item repeatable-item">
                                <div class="agenda-number">${i + 1}</div>
                                <div class="agenda-content">
                                    <div class="agenda-title" data-editable="text" data-field-key="items" data-field-index="${i}" data-field-subkey="title" data-placeholder="Sujet ${
                              i + 1
                            }">${escapeHtml(item.title || "")}</div>
                                    ${
                                      item.subtitle
                                        ? `<div class="agenda-subtitle">${escapeHtml(
                                            item.subtitle
                                          )}</div>`
                                        : ""
                                    }
                                </div>
                                ${
                                  showDuration && item.duration
                                    ? `<div class="agenda-duration">${escapeHtml(
                                        item.duration
                                      )}</div>`
                                    : ""
                                }
                                <button class="delete-item-btn" data-list-key="items" data-item-index="${i}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                            </li>
                        `
                          )
                          .join("")}
                        <li class="add-item-row"><button class="add-item-btn" data-list-key="items" title="Ajouter un point">+ Ajouter</button></li>
                    </ul>
                </div>
            `;

    case "drawio":
      const placeholderSvg =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="8" height="6" rx="1"/><rect x="14" y="2" width="8" height="6" rx="1"/><rect x="8" y="16" width="8" height="6" rx="1"/><path d="M6 8v4h6M18 8v4h-6M12 12v4"/></svg>';
      return `
                <div class="slide-content template-drawio" ${colorStyles}>
                    <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
                      data.title || ""
                    )}</h2>
                    <p class="drawio-description" data-editable="text" data-field-key="description" data-placeholder="Description">${escapeHtml(
                      data.description || ""
                    )}</p>
                    <div class="drawio-container" data-editable="drawio" data-field-key="diagram">
                        ${
                          data.diagram
                            ? `<img class="drawio-svg" src="${escapeHtml(
                                data.diagram
                              )}" alt="Diagram">`
                            : `<div class="drawio-placeholder">${placeholderSvg}<p>Cliquez pour créer un diagramme</p></div>`
                        }
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
function renderCodeAnnotated(data, colorStyles = "") {
  const lines = (data.code || "").split("\n");
  const lineHeight = 28;
  const codeStartOffset = 52;
  const startLineNum = data.startLine || 1;
  const showLineNumbers = data.showLineNumbers !== false; // Default true for annotated code
  const showEllipsisBefore = data.showEllipsisBefore || false;
  const showEllipsisAfter =
    data.showEllipsisAfter || data.notEndOfFile || false; // Support legacy

  const highlightedLines = new Set();
  (data.annotations || []).forEach((ann) => {
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

  const codeLines = lines
    .map((line, i) => {
      const lineNum = startLineNum + i;
      const isHighlighted = highlightedLines.has(lineNum);
      const canAnnotate = !isHighlighted;
      const addBtn = canAnnotate
        ? `<button class="add-annotation-btn" data-line="${lineNum}" title="Ajouter une annotation"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>`
        : "";

      // Check if this is the last line of an annotation and next line starts a different annotation
      const currentAnnotation = lineToAnnotation.get(lineNum);
      const nextAnnotation = lineToAnnotation.get(lineNum + 1);
      const isAnnotationBoundary =
        isHighlighted &&
        nextAnnotation !== undefined &&
        currentAnnotation !== nextAnnotation;

      const classes = ["code-line"];
      if (isHighlighted) classes.push("highlighted");
      if (isAnnotationBoundary) classes.push("annotation-boundary");

      if (showLineNumbers) {
        return `<div class="${classes.join(
          " "
        )}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-number">${lineNum}</span><span class="line-content">${
          escapeHtml(line) || " "
        }</span>${addBtn}</div>`;
      } else {
        return `<div class="${classes.join(
          " "
        )}" data-line-num="${lineNum}" data-can-annotate="${canAnnotate}"><span class="line-content">${
          escapeHtml(line) || " "
        }</span>${addBtn}</div>`;
      }
    })
    .join("");

  const allCodeLines = [
    showEllipsisBefore ? ellipsisLine : "",
    codeLines,
    showEllipsisAfter ? ellipsisLine : "",
  ]
    .filter(Boolean)
    .join("");
  const annotationOffset = showEllipsisBefore ? lineHeight : 0;

  const annotationsHtml = (data.annotations || [])
    .map((ann, i) => {
      const startLine = ann.line;
      const endLine = ann.lineTo || ann.line;
      const midLine = (startLine + endLine) / 2;
      const lineIndex = midLine - startLineNum;
      const topPosition =
        codeStartOffset + annotationOffset + lineIndex * lineHeight;
      return `
            <div class="annotation" style="top: ${topPosition}px;" data-annotation-index="${i}">
                <div class="annotation-arrow"></div>
                <div class="annotation-content">
                    <button class="delete-annotation-btn" data-annotation-index="${i}" title="Supprimer l'annotation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    <div class="annotation-title" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="title" data-placeholder="Titre">${escapeHtml(
        ann.title || ""
      )}</div>
                    <div class="annotation-text" data-editable="text" data-field-key="annotations" data-field-index="${i}" data-field-subkey="text" data-placeholder="Description">${escapeHtml(
        ann.text || ""
      )}</div>
                </div>
            </div>
        `;
    })
    .join("");

  return `
        <div class="slide-content template-code-annotated" ${colorStyles}>
            <h2 data-editable="text" data-field-key="title" data-placeholder="Titre">${escapeHtml(
              data.title || ""
            )}</h2>
            <div class="code-annotated-container">
                <div class="code-panel">
                    <div class="code-container" data-editable="code" data-field-key="code" data-code-annotated="true">
                        <div class="code-header">
                            <span class="code-dot red"></span>
                            <span class="code-dot yellow"></span>
                            <span class="code-dot green"></span>
                            <span class="code-filename" data-editable="text" data-field-key="filename" data-placeholder="fichier.js">${escapeHtml(
                              data.filename || "code.js"
                            )}</span>
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
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Render code lines with optional line numbers and ellipsis
 */
function renderCodeLines(
  code,
  showLineNumbers,
  startLine,
  showEllipsisBefore,
  showEllipsisAfter
) {
  const lines = (code || "").split("\n");
  const start = startLine || 1;

  const ellipsisLine = `<div class="code-line ellipsis"><span class="line-number">...</span><span class="line-content"></span></div>`;
  const ellipsisLineNoNum = `<div class="code-line ellipsis"><span class="line-content">...</span></div>`;

  const codeLines = lines
    .map((line, i) => {
      const lineNum = start + i;
      if (showLineNumbers) {
        return `<div class="code-line"><span class="line-number">${lineNum}</span><span class="line-content">${
          escapeHtml(line) || " "
        }</span></div>`;
      } else {
        return `<div class="code-line"><span class="line-content">${
          escapeHtml(line) || " "
        }</span></div>`;
      }
    })
    .join("");

  const ellipsisBefore = showEllipsisBefore
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : "";
  const ellipsisAfter = showEllipsisAfter
    ? showLineNumbers
      ? ellipsisLine
      : ellipsisLineNoNum
    : "";

  return ellipsisBefore + codeLines + ellipsisAfter;
}
