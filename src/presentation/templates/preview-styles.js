// src/templates/preview-styles.js
// Preview CSS generation for slide rendering
import { getThemeColors } from "./theme.js";

/**
 * Get CSS styles for slide preview with dynamic theme colors
 */
export function getPreviewStyles() {
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
        /* Shared WYSIWYG text-content styles - used by text, two-columns, image-text templates */
        .text-content { font-size: calc(32px * var(--text-field-scale, 1)); color: var(--slide-textColor, var(--gray-700)); line-height: 1.4; }
        .text-content p { margin-bottom: calc(20px * var(--text-field-scale, 1)); }
        .text-content p:last-child { margin-bottom: 0; }
        .text-content strong { font-weight: 700; }
        .text-content em { font-style: italic; }
        .text-content u { text-decoration: underline; }
        .text-content a { color: var(--accent-main); text-decoration: underline; }
        .text-content a:hover { text-decoration: none; }
        .text-content ul, .text-content ol { list-style: none; margin-bottom: calc(20px * var(--text-field-scale, 1)); }
        .text-content li { font-size: calc(28px * var(--text-field-scale, 1)); margin-bottom: calc(8px * var(--text-field-scale, 1)); padding-left: calc(40px * var(--text-field-scale, 1)); position: relative; line-height: 1.4; }
        .text-content ul li::before { content: ''; position: absolute; left: 0; top: calc(10px * var(--text-field-scale, 1)); width: calc(18px * var(--text-field-scale, 1)); height: calc(18px * var(--text-field-scale, 1)); background: var(--slide-bulletColor, var(--gradient-accent)); border-radius: calc(4px * var(--text-field-scale, 1)); transform: rotate(45deg); }
        .text-content ul ul { margin-bottom: calc(8px * var(--text-field-scale, 1)); }
        .text-content ul ul li { margin-left: calc(40px * var(--text-field-scale, 1)); font-size: calc(26px * var(--text-field-scale, 1)); }
        .text-content ul ul li::before { width: calc(12px * var(--text-field-scale, 1)); height: calc(12px * var(--text-field-scale, 1)); top: calc(13px * var(--text-field-scale, 1)); background: linear-gradient(var(--white), var(--white)) padding-box, var(--gradient-accent) border-box; border: calc(2px * var(--text-field-scale, 1)) solid transparent; border-radius: calc(4px * var(--text-field-scale, 1)); transform: rotate(45deg); }
        .text-content ul ul ul { margin-bottom: calc(4px * var(--text-field-scale, 1)); }
        .text-content ul ul ul li { margin-left: calc(50px * var(--text-field-scale, 1)); font-size: calc(22px * var(--text-field-scale, 1)); opacity: 0.9; margin-bottom: calc(4px * var(--text-field-scale, 1)); }
        .text-content ul ul ul li::before { content: '→'; width: auto; height: auto; top: calc(-3px * var(--text-field-scale, 1)); background: transparent; border: none; border-radius: 0; transform: none; font-size: calc(28px * var(--text-field-scale, 1)); font-weight: 700; color: var(--accent-main); line-height: 1.2; }
        .text-content ol { counter-reset: list-counter; }
        .text-content ol li { counter-increment: list-counter; }
        .text-content ol li::before { content: counter(list-counter) '.'; position: absolute; left: 0; top: 0; width: calc(32px * var(--text-field-scale, 1)); font-weight: 700; color: var(--accent-main); }
        .text-content ol ol { counter-reset: list-counter; }
        .text-content ol ol li { margin-left: calc(40px * var(--text-field-scale, 1)); font-size: calc(26px * var(--text-field-scale, 1)); }
        .text-content ol ol ol { counter-reset: list-counter; }
        .text-content ol ol ol li { margin-left: calc(80px * var(--text-field-scale, 1)); font-size: calc(24px * var(--text-field-scale, 1)); }
        .text-content h2 { font-size: calc(44px * var(--text-field-scale, 1)); font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); margin-bottom: calc(16px * var(--text-field-scale, 1)); margin-top: calc(24px * var(--text-field-scale, 1)); line-height: 1.2; }
        .text-content h2:first-child { margin-top: 0; }
        .text-content h3 { font-size: calc(36px * var(--text-field-scale, 1)); font-weight: 600; color: var(--slide-titleColor, var(--gray-800)); margin-bottom: calc(12px * var(--text-field-scale, 1)); margin-top: calc(20px * var(--text-field-scale, 1)); line-height: 1.25; }
        .text-content h3:first-child { margin-top: 0; }
        .text-content h4 { font-size: calc(22px * var(--text-field-scale, 1)); font-weight: 600; color: var(--slide-titleColor, var(--gray-700)); margin-bottom: calc(10px * var(--text-field-scale, 1)); margin-top: calc(16px * var(--text-field-scale, 1)); line-height: 1.3; }
        .text-content h4:first-child { margin-top: 0; }
        /* Cover - opening slide with split layout */
        .template-cover { display: grid; grid-template-columns: 320px 1fr; height: 100%; background: var(--slide-bgColor, var(--white)); position: relative; }
        .template-cover .cover-accent { background: var(--slide-accentColor, var(--gradient-accent)); position: relative; overflow: hidden; }
        .template-cover .cover-accent-pattern { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.15) 100%); }
        .template-cover .cover-accent::before { content: ''; position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; background: rgba(255,255,255,0.1); border-radius: 50%; }
        .template-cover .cover-accent::after { content: ''; position: absolute; bottom: -150px; right: -150px; width: 500px; height: 500px; background: rgba(0,0,0,0.1); border-radius: 50%; }
        .template-cover .cover-content { display: flex; flex-direction: column; padding: 60px 80px; }
        .template-cover .cover-logo { margin-bottom: 40px; }
        .template-cover .cover-logo .logo { max-width: 200px; max-height: 60px; height: 60px; width: auto; object-fit: contain; display: block; }
        .template-cover .cover-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-cover h1 { font-size: 52px; font-weight: 800; color: var(--slide-titleColor, var(--bg-main)); line-height: 1.1; margin-bottom: 20px; max-width: 700px; }
        .template-cover .cover-subtitle { font-size: 24px; font-weight: 400; color: var(--slide-subtitleColor, var(--gray-600)); max-width: 600px; line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; }
        .template-cover .cover-meta { display: flex; flex-direction: column; gap: 6px; }
        .template-cover .cover-author { font-size: 18px; font-weight: 600; color: var(--slide-authorColor, var(--accent-main)); }
        .template-cover .cover-date { font-size: 16px; color: var(--slide-dateColor, var(--gray-500)); }
        /* Cover Wide - wider accent with geometric shapes */
        .template-cover-wide { display: grid; grid-template-columns: 480px 1fr; height: 100%; background: var(--slide-bgColor, var(--white)); position: relative; }
        .template-cover-wide .cover-accent { background: var(--slide-accentColor, var(--gradient-accent)); position: relative; overflow: hidden; }
        .template-cover-wide .cover-shape { position: absolute; border-radius: 20px; transform: rotate(45deg); }
        .template-cover-wide .cover-shape-1 { width: 200px; height: 200px; top: -60px; left: -60px; background: rgba(255,255,255,0.15); }
        .template-cover-wide .cover-shape-2 { width: 300px; height: 300px; bottom: -100px; left: 50%; background: rgba(255,255,255,0.1); }
        .template-cover-wide .cover-shape-3 { width: 150px; height: 150px; top: 40%; right: -40px; background: rgba(0,0,0,0.1); }
        .template-cover-wide .cover-content { display: flex; flex-direction: column; padding: 60px 80px; }
        .template-cover-wide .cover-logo { margin-bottom: 40px; }
        .template-cover-wide .cover-logo .logo { max-width: 200px; max-height: 60px; height: 60px; width: auto; object-fit: contain; display: block; }
        .template-cover-wide .cover-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-cover-wide h1 { font-size: 52px; font-weight: 800; color: var(--slide-titleColor, var(--bg-main)); line-height: 1.1; margin-bottom: 20px; max-width: 650px; }
        .template-cover-wide .cover-subtitle { font-size: 24px; font-weight: 400; color: var(--slide-subtitleColor, var(--gray-600)); max-width: 550px; line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; }
        .template-cover-wide .cover-meta { display: flex; flex-direction: column; gap: 6px; }
        .template-cover-wide .cover-author { font-size: 18px; font-weight: 600; color: var(--slide-authorColor, var(--accent-main)); }
        .template-cover-wide .cover-date { font-size: 16px; color: var(--slide-dateColor, var(--gray-500)); }
        /* Cover Gradient - full gradient background with floating shapes */
        .template-cover-gradient { height: 100%; background: var(--slide-bgColor, var(--gradient-accent)); position: relative; overflow: hidden; }
        .template-cover-gradient .cover-shapes { position: absolute; inset: 0; pointer-events: none; }
        .template-cover-gradient .cover-shape { position: absolute; border-radius: 50%; }
        .template-cover-gradient .cover-shape-1 { width: 600px; height: 600px; top: -200px; right: -150px; background: rgba(255,255,255,0.1); }
        .template-cover-gradient .cover-shape-2 { width: 400px; height: 400px; bottom: -150px; left: -100px; background: rgba(0,0,0,0.1); }
        .template-cover-gradient .cover-content { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 60px 80px; height: 100%; }
        .template-cover-gradient .cover-logo { margin-bottom: 40px; }
        .template-cover-gradient .cover-logo .logo { max-width: 200px; max-height: 60px; height: 60px; width: auto; object-fit: contain; display: block; filter: brightness(0) invert(1); }
        .template-cover-gradient .cover-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-cover-gradient h1 { font-size: 56px; font-weight: 800; color: var(--slide-titleColor, var(--white)); line-height: 1.1; margin-bottom: 20px; max-width: 900px; }
        .template-cover-gradient .cover-subtitle { font-size: 26px; font-weight: 400; color: var(--slide-subtitleColor, rgba(255,255,255,0.85)); max-width: 700px; line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; }
        .template-cover-gradient .cover-meta { display: flex; flex-direction: column; gap: 6px; }
        .template-cover-gradient .cover-author { font-size: 18px; font-weight: 600; color: var(--slide-authorColor, var(--white)); }
        .template-cover-gradient .cover-date { font-size: 16px; color: var(--slide-dateColor, rgba(255,255,255,0.7)); }
        /* Cover Diagonal - diagonal split layout */
        .template-cover-diagonal { height: 100%; background: var(--slide-bgColor, var(--white)); position: relative; overflow: hidden; }
        .template-cover-diagonal .cover-accent { position: absolute; top: 0; left: 0; width: 60%; height: 100%; background: var(--slide-accentColor, var(--gradient-accent)); clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%); }
        .template-cover-diagonal .cover-content { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 60px 80px; height: 100%; }
        .template-cover-diagonal .cover-logo { margin-bottom: 40px; }
        .template-cover-diagonal .cover-logo .logo { max-width: 200px; max-height: 60px; height: 60px; width: auto; object-fit: contain; display: block; filter: brightness(0) invert(1); }
        .template-cover-diagonal .cover-text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-cover-diagonal h1 { font-size: 56px; font-weight: 800; color: var(--slide-titleColor, var(--white)); line-height: 1.1; margin-bottom: 20px; max-width: 600px; }
        .template-cover-diagonal .cover-subtitle { font-size: 24px; font-weight: 400; color: var(--slide-subtitleColor, rgba(255,255,255,0.85)); max-width: 500px; line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; }
        .template-cover-diagonal .cover-meta { display: flex; flex-direction: column; gap: 6px; }
        .template-cover-diagonal .cover-author { font-size: 18px; font-weight: 600; color: var(--slide-authorColor, var(--white)); }
        .template-cover-diagonal .cover-date { font-size: 16px; color: var(--slide-dateColor, rgba(255,255,255,0.7)); }
        /* Cover Shapes - floating accent shapes scattered */
        .template-cover-shapes { height: 100%; background: var(--slide-bgColor, var(--white)); position: relative; overflow: hidden; }
        .template-cover-shapes .cover-shapes { position: absolute; inset: 0; pointer-events: none; }
        .template-cover-shapes .cover-shape { position: absolute; background: var(--slide-accentColor, var(--gradient-accent)); }
        .template-cover-shapes .cover-shape-1 { width: 300px; height: 300px; top: -80px; right: -80px; border-radius: 60px; transform: rotate(15deg); }
        .template-cover-shapes .cover-shape-2 { width: 200px; height: 200px; bottom: 60px; right: 150px; border-radius: 40px; transform: rotate(-20deg); opacity: 0.7; }
        .template-cover-shapes .cover-shape-3 { width: 120px; height: 120px; top: 50%; left: 55%; border-radius: 30px; transform: rotate(35deg); opacity: 0.5; }
        .template-cover-shapes .cover-shape-4 { width: 80px; height: 80px; bottom: -20px; left: 30%; border-radius: 20px; transform: rotate(-10deg); opacity: 0.6; }
        .template-cover-shapes .cover-shape-5 { width: 150px; height: 150px; top: 20px; left: 45%; border-radius: 35px; transform: rotate(25deg); opacity: 0.4; }
        .template-cover-shapes .cover-content { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 60px 80px; height: 100%; }
        .template-cover-shapes .cover-logo { margin-bottom: 40px; }
        .template-cover-shapes .cover-logo .logo { max-width: 200px; max-height: 60px; height: 60px; width: auto; object-fit: contain; display: block; }
        .template-cover-shapes .cover-text { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 600px; }
        .template-cover-shapes h1 { font-size: 52px; font-weight: 800; color: var(--slide-titleColor, var(--bg-main)); line-height: 1.1; margin-bottom: 20px; }
        .template-cover-shapes .cover-subtitle { font-size: 24px; font-weight: 400; color: var(--slide-subtitleColor, var(--gray-600)); line-height: 1.4; text-transform: uppercase; letter-spacing: 0.05em; }
        .template-cover-shapes .cover-meta { display: flex; flex-direction: column; gap: 6px; }
        .template-cover-shapes .cover-author { font-size: 18px; font-weight: 600; color: var(--slide-authorColor, var(--accent-main)); }
        .template-cover-shapes .cover-date { font-size: 16px; color: var(--slide-dateColor, var(--gray-500)); }
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
        .template-section .section-number { font-size: 120px; font-weight: 800; color: color-mix(in srgb, var(--slide-numberColor, var(--white)) 70%, transparent); position: absolute; top: 40px; right: 60px; }
        .template-section h2 { font-size: 64px; font-weight: 800; color: var(--slide-titleColor, white); max-width: 800px; line-height: 1.1; position: relative; z-index: 1; }
        .template-section .section-subtitle { font-size: 24px; color: var(--slide-subtitleColor, rgba(255,255,255,0.8)); margin-top: 20px; max-width: 600px; position: relative; z-index: 1; text-transform: uppercase; letter-spacing: 0.05em; }
        /* Section Diagonal - diagonal split with accent color */
        .template-section-diagonal { height: 100%; background: var(--slide-bgColor, var(--white)); position: relative; overflow: hidden; }
        .template-section-diagonal .section-accent { position: absolute; top: 0; right: 0; width: 45%; height: 100%; background: var(--slide-accentColor, var(--gradient-accent)); clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%); }
        .template-section-diagonal .section-content { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; padding: 80px; height: 100%; }
        .template-section-diagonal .section-number { font-size: 100px; font-weight: 800; color: var(--slide-numberColor, var(--accent-main)); opacity: 0.7; position: absolute; top: 40px; left: 60px; }
        .template-section-diagonal h2 { font-size: 64px; font-weight: 800; color: var(--slide-titleColor, var(--bg-main)); max-width: 650px; line-height: 1.1; }
        .template-section-diagonal .section-subtitle { font-size: 24px; color: var(--slide-subtitleColor, var(--gray-600)); margin-top: 20px; max-width: 550px; text-transform: uppercase; letter-spacing: 0.05em; }
        /* Section Minimal - white background with accent underline */
        .template-section-minimal { height: 100%; background: var(--slide-bgColor, var(--white)); display: flex; align-items: center; justify-content: center; }
        .template-section-minimal .section-content { text-align: center; max-width: 900px; padding: 60px; }
        .template-section-minimal .section-number { font-size: 80px; font-weight: 800; background: var(--slide-numberColor, var(--gradient-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; display: block; }
        .template-section-minimal h2 { font-size: 56px; font-weight: 800; color: var(--slide-titleColor, var(--bg-main)); line-height: 1.1; margin-bottom: 24px; }
        .template-section-minimal .section-underline { width: 120px; height: 6px; background: var(--slide-accentColor, var(--gradient-accent)); margin: 0 auto 24px; border-radius: 3px; }
        .template-section-minimal .section-subtitle { font-size: 24px; color: var(--slide-subtitleColor, var(--gray-500)); max-width: 600px; margin: 0 auto; text-transform: uppercase; letter-spacing: 0.05em; }
        /* Two columns - WYSIWYG content */
        .template-two-columns { --text-field-scale: 1; background: var(--slide-bgColor, var(--white)); padding: 60px 80px; height: 100%; display: flex; flex-direction: column; }
        .template-two-columns .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-two-columns h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-two-columns .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: 600; }
        .template-two-columns .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; flex: 1; min-height: 0; }
        .template-two-columns .column { display: flex; flex-direction: column; overflow: visible; }
        .template-two-columns .column .text-content-container { overflow: visible; flex: 1; min-height: 0; }
        .template-two-columns .column .text-content { min-height: 100%; }
        /* Image text - uses text-field-content class for WYSIWYG styling */
        .template-image-text { --text-field-scale: 1; display: grid; grid-template-columns: 1fr 1fr; height: 100%; background: var(--white); }
        .template-image-text .image-side { background: var(--gray-200); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .template-image-text .image-side img { width: 100%; height: 100%; object-fit: contain; }
        .template-image-text .image-placeholder { width: 200px; height: 200px; background: var(--gradient-accent); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 60px; }
        .template-image-text .text-side { padding: 60px; display: flex; flex-direction: column; background: var(--slide-bgColor, white); overflow: hidden; }
        .template-image-text .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-image-text h2 { font-size: 38px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-image-text .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 8px 18px; border-radius: 16px; font-size: 14px; font-weight: 600; }
        .template-image-text .text-content-container { overflow: visible; flex: 1; min-height: 0; }
        .template-image-text .text-content { min-height: 100%; }
        /* Image-text image right variant */
        .template-image-text.image-right { grid-template-columns: 1fr 1fr; }
        .template-image-text.image-right .image-side { order: 2; }
        .template-image-text.image-right .text-side { order: 1; }
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
        .template-stats { background: var(--slide-bgColor, var(--gradient-bg)); padding: 60px; height: 100%; display: flex; flex-direction: column; }
        .template-stats h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--white)); margin-bottom: 0; text-align: center; flex-shrink: 0; }
        .template-stats .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; flex: 1; align-content: center; }
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
        .template-timeline { background: var(--slide-bgColor, var(--white)); padding: 60px 80px; height: 100%; display: flex; flex-direction: column; }
        .template-timeline .header-bar { display: flex; justify-content: center; align-items: center; margin-bottom: 0; padding-bottom: 20px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-timeline h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); text-align: center; }
        .template-timeline .timeline-wrapper { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .template-timeline .timeline { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
        .template-timeline .timeline-line { display: none; }
        .template-timeline .timeline::before { content: ''; position: absolute; top: 38px; left: calc(50% / var(--step-count, 4)); right: calc(50% / var(--step-count, 4)); height: 4px; background: var(--gray-200); z-index: 0; }
        .template-timeline .timeline-item { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; position: relative; z-index: 1; }
        .template-timeline .timeline-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--slide-iconColor, var(--gradient-accent)); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(252, 109, 38, 0.3); position: relative; z-index: 2; }
        .template-timeline .timeline-title { font-size: 20px; font-weight: 600; color: var(--slide-stepTitleColor, var(--bg-main)); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
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
        .template-mermaid .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-mermaid h2 { font-size: 36px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-mermaid .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: 600; }
        .template-mermaid .mermaid-description { font-size: 18px; color: var(--slide-descriptionColor, var(--gray-600)); margin-bottom: 24px; line-height: 1.5; flex-shrink: 0; }
        .template-mermaid .mermaid-container { flex: 1; display: flex; align-items: center; justify-content: center; background: var(--gray-100); border-radius: 16px; padding: 30px; overflow: hidden; min-height: 0; }
        .template-mermaid .mermaid { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        .template-mermaid .mermaid svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }
        .template-mermaid .mermaid svg text { fill: var(--gray-800) !important; font-family: 'Inter', sans-serif !important; }
        .template-mermaid .mermaid svg .node rect, .template-mermaid .mermaid svg .node circle, .template-mermaid .mermaid svg .node polygon, .template-mermaid .mermaid svg .node path { fill: var(--white) !important; stroke: var(--gray-400) !important; }
        .template-mermaid .mermaid svg .edgePath path { stroke: var(--gray-500) !important; }
        .template-mermaid .mermaid svg .edgeLabel { background-color: var(--gray-100) !important; }
        .template-mermaid .mermaid svg foreignObject { overflow: visible !important; }
        .template-mermaid .mermaid svg .nodeLabel, .template-mermaid .mermaid svg .label div { overflow: visible !important; white-space: nowrap !important; display: flex !important; align-items: center !important; justify-content: center !important; color: var(--gray-800) !important; }
        .template-mermaid .mermaid svg .nodeLabel p, .template-mermaid .mermaid svg .label div span { margin: 0 !important; padding: 0 !important; line-height: 1.2 !important; }
        /* Agenda - uses --agenda-scale (0.45-1) and --agenda-items for dynamic sizing */
        .template-agenda { --s: var(--agenda-scale, 1); --n: var(--agenda-items, 1); --list-height: 510px; --item-height: calc(var(--list-height) / var(--n)); background: var(--slide-bgColor, var(--white)); padding: 40px 80px 70px; height: 100%; position: relative; display: flex; flex-direction: column; box-sizing: border-box; }
        .template-agenda .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(16px + 14px * var(--s)); padding-bottom: calc(10px + 10px * var(--s)); border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-agenda h2 { font-size: calc(32px + 16px * var(--s)); font-weight: 700; color: var(--slide-titleColor, var(--gray-900)); }
        .template-agenda .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: calc(6px + 4px * var(--s)) calc(14px + 10px * var(--s)); border-radius: 20px; font-size: calc(12px + 4px * var(--s)); font-weight: 600; }
        .template-agenda .agenda-list { list-style: none; flex: 1; display: flex; flex-direction: column; overflow: visible; min-height: 0; }
        .template-agenda .agenda-add-btn { position: absolute; bottom: 25px; left: 80px; border: 2px dashed var(--gray-400); background: transparent; color: var(--gray-500); font-size: 14px; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
        .template-agenda .agenda-add-btn:hover { border-color: var(--accent-main); color: var(--accent-main); background: rgba(252, 109, 38, 0.1); }
        .template-agenda .agenda-item { display: flex; align-items: center; gap: calc(14px + 10px * var(--s)); height: var(--item-height); max-height: var(--item-height); min-height: 0; border-bottom: 1px solid var(--gray-200); overflow: visible; box-sizing: border-box; }
        .template-agenda .agenda-item:last-child { border-bottom: none; }
        .template-agenda .agenda-number { width: calc(28px + 20px * var(--s)); height: calc(28px + 20px * var(--s)); border-radius: 50%; background: var(--slide-numberColor, var(--gradient-accent)); color: white; display: flex; align-items: center; justify-content: center; font-size: calc(13px + 7px * var(--s)); font-weight: 700; flex-shrink: 0; }
        .template-agenda .agenda-content { flex: 1; min-width: 0; overflow: visible; display: flex; flex-direction: column; gap: 2px; }
        .template-agenda .agenda-title { font-size: calc(16px + 10px * var(--s)); font-weight: 600; color: var(--slide-itemColor, var(--gray-800)); line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .template-agenda .agenda-subtitle { font-size: calc(11px + 5px * var(--s)); color: var(--gray-500); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        /* Compact mode: subtitle inline with title */
        .template-agenda.agenda-compact .agenda-content { flex-direction: row; align-items: baseline; gap: 12px; }
        .template-agenda.agenda-compact .agenda-subtitle { flex-shrink: 0; }
        .template-agenda .agenda-duration { font-size: calc(11px + 5px * var(--s)); font-weight: 500; color: var(--slide-durationColor, var(--gray-500)); background: var(--gray-100); padding: calc(4px + 4px * var(--s)) calc(8px + 8px * var(--s)); border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        /* Draw.io */
        .template-drawio { background: var(--slide-bgColor, var(--white)); padding: 50px 60px; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .template-drawio .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-drawio h2 { font-size: 36px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-drawio .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: 600; }
        .template-drawio .drawio-description { font-size: 18px; color: var(--slide-descriptionColor, var(--gray-600)); margin-bottom: 24px; line-height: 1.5; flex-shrink: 0; }
        .template-drawio .drawio-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 30px; cursor: pointer; overflow: hidden; min-height: 0; position: relative; }
        .template-drawio .drawio-container:hover { background: var(--gray-100); border-radius: 16px; }
        .template-drawio .drawio-placeholder { color: var(--gray-400); text-align: center; }
        .template-drawio .drawio-placeholder svg { width: 64px; height: 64px; margin-bottom: 12px; opacity: 0.5; }
        .template-drawio .drawio-placeholder p { font-size: 16px; }
        .template-drawio img.drawio-svg { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; color-scheme: light only; }
        /* Text template with WYSIWYG content - uses --text-field-scale CSS variable for font scaling */
        .template-text { --text-field-scale: 1; background: var(--slide-bgColor, var(--white)); padding: 60px 80px; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
        .template-text .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid var(--accent-main); flex-shrink: 0; }
        .template-text h2 { font-size: 42px; font-weight: 700; color: var(--slide-titleColor, var(--bg-main)); }
        .template-text .slide-tag { background: var(--slide-tagColor, var(--gradient-accent)); color: white; padding: 10px 24px; border-radius: 20px; font-size: 16px; font-weight: 600; }
        .template-text .text-content-container { overflow: visible; flex: 1; }
        .template-text .text-content { min-height: 100%; }
    `;
}
