// src/domain/error-handler.js
// Global error handler with blocking UI overlay

import { escapeHtml } from '../infrastructure/utils/html.js';

function dismissErrorOverlay() {
    const overlay = document.getElementById('errorOverlay');
    if (overlay) overlay.remove();
}

function showErrorOverlay(message, source, lineno, colno) {
    // Remove existing overlay if any
    const existing = document.getElementById('errorOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'errorOverlay';
    overlay.innerHTML = `
        <div class="error-overlay-content">
            <div class="error-overlay-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <h2>Une erreur est survenue</h2>
            <p class="error-message">${escapeHtml(message)}</p>
            ${source ? `<p class="error-source">${escapeHtml(source)}${lineno ? `:${lineno}` : ''}${colno ? `:${colno}` : ''}</p>` : ''}
            <button class="btn btn-primary" data-action="dismiss-error-overlay">
                Continuer
            </button>
        </div>
    `;

    // Add click handler directly since this is created dynamically
    overlay.querySelector('[data-action="dismiss-error-overlay"]')
        ?.addEventListener('click', dismissErrorOverlay);

    // Add styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    const content = overlay.querySelector('.error-overlay-content');
    content.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    const icon = overlay.querySelector('.error-overlay-icon');
    icon.style.cssText = `
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        color: #ff3b30;
    `;
    icon.querySelector('svg').style.cssText = 'width: 100%; height: 100%;';

    const h2 = overlay.querySelector('h2');
    h2.style.cssText = 'margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #1a1a1a;';

    const errorMsg = overlay.querySelector('.error-message');
    errorMsg.style.cssText = `
        margin: 0 0 8px;
        font-size: 14px;
        color: #666;
        font-family: ui-monospace, monospace;
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
        word-break: break-word;
    `;

    const errorSource = overlay.querySelector('.error-source');
    if (errorSource) {
        errorSource.style.cssText = `
            margin: 0 0 20px;
            font-size: 12px;
            color: #999;
            font-family: ui-monospace, monospace;
        `;
    }

    const btn = overlay.querySelector('button');
    btn.style.cssText += 'margin-top: 12px;';

    document.body.appendChild(overlay);
}

export function initErrorHandler() {
    // Catch regular errors
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Global error:', { message, source, lineno, colno, error });
        showErrorOverlay(message, source, lineno, colno);
        return false;
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        const message = event.reason?.message || event.reason || 'Unhandled promise rejection';
        showErrorOverlay(message);
    };
}
