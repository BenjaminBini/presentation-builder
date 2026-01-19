// src/app/presentation.js
// Fullscreen presentation player mode

import { getProject, getSelectedSlideIndex, setSelectedSlideIndex, get, set } from '../core/state.js';

export function startPresentation() {
    const project = getProject();
    if (!project?.slides?.length) {
        return;
    }

    const selectedIndex = getSelectedSlideIndex();
    set('player.slideIndex', selectedIndex >= 0 ? selectedIndex : 0);

    const player = document.getElementById('presentationPlayer');
    const playerTitle = document.getElementById('playerTitle');

    if (player) player.classList.add('active');
    if (playerTitle) playerTitle.textContent = project.name || 'Présentation';

    updatePlayerSlide();
    updatePlayerControls();

    document.addEventListener('keydown', handlePlayerKeydown);

    const playerContent = document.querySelector('.player-content');
    if (playerContent && !get('player.resizeObserver')) {
        const observer = new ResizeObserver(() => scalePlayerSlide());
        set('player.resizeObserver', observer);
        observer.observe(playerContent);
    }

    window.addEventListener('resize', scalePlayerSlide);
}

export function exitPresentation() {
    const player = document.getElementById('presentationPlayer');
    if (player) player.classList.remove('active');

    document.removeEventListener('keydown', handlePlayerKeydown);
    window.removeEventListener('resize', scalePlayerSlide);

    const resizeObserver = get('player.resizeObserver');
    if (resizeObserver) {
        resizeObserver.disconnect();
        set('player.resizeObserver', null);
    }

    setSelectedSlideIndex(get('player.slideIndex'));
    if (window.renderSlideList) window.renderSlideList();
    if (window.renderEditor) window.renderEditor();
    if (window.updatePreview) window.updatePreview();
}

function updatePlayerSlide() {
    const player = document.getElementById('presentationPlayer');
    const slideContainer = document.getElementById('playerSlide');

    if (!player?.classList.contains('active') || !slideContainer) return;

    const project = getProject();
    const playerSlideIndex = get('player.slideIndex');
    const slide = project?.slides?.[playerSlideIndex];

    if (slide) {
        const { template, data } = slide;
        const getPreviewStyles = window.getPreviewStyles || (() => '');
        const renderTemplate = window.renderTemplate || (() => '');
        const styles = getPreviewStyles();
        slideContainer.innerHTML = `<style>${styles}</style>${renderTemplate(template, data)}`;

        scalePlayerSlide();

        if (slide.template === 'mermaid' && window.mermaid) {
            setTimeout(() => {
                window.mermaid.run({ nodes: slideContainer.querySelectorAll('.mermaid') });
            }, 100);
        }
    }
}

export function scalePlayerSlide() {
    const content = document.querySelector('.player-content');
    const wrapper = document.querySelector('.player-slide-wrapper');
    const slide = document.getElementById('playerSlide');
    if (!content || !wrapper || !slide) return;

    const availableWidth = content.clientWidth - 180;
    const availableHeight = content.clientHeight - 40;

    const scaleX = availableWidth / 1280;
    const scaleY = availableHeight / 720;
    const scale = Math.min(1, scaleX, scaleY);

    slide.style.transform = `scale(${scale})`;
    wrapper.style.width = `${1280 * scale}px`;
    wrapper.style.height = `${720 * scale}px`;
}

function updatePlayerControls() {
    const project = getProject();
    const playerSlideIndex = get('player.slideIndex');
    const total = project?.slides?.length || 0;
    const current = playerSlideIndex + 1;

    const counter = document.getElementById('playerCounter');
    const progressBar = document.getElementById('playerProgressBar');

    if (counter) counter.textContent = `${current} / ${total}`;
    if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;

    const prevBtn = document.querySelector('.player-nav-prev');
    const nextBtn = document.querySelector('.player-nav-next');

    if (prevBtn) prevBtn.disabled = playerSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = playerSlideIndex >= total - 1;
}

export function prevSlidePlayer() {
    const playerSlideIndex = get('player.slideIndex');
    if (playerSlideIndex > 0) {
        set('player.slideIndex', playerSlideIndex - 1);
        updatePlayerSlide();
        updatePlayerControls();
    }
}

export function nextSlidePlayer() {
    const project = getProject();
    const playerSlideIndex = get('player.slideIndex');
    if (playerSlideIndex < (project?.slides?.length || 0) - 1) {
        set('player.slideIndex', playerSlideIndex + 1);
        updatePlayerSlide();
        updatePlayerControls();
    }
}

function handlePlayerKeydown(event) {
    const project = getProject();
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
            event.preventDefault();
            prevSlidePlayer();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
            event.preventDefault();
            nextSlidePlayer();
            break;
        case 'Home':
            event.preventDefault();
            set('player.slideIndex', 0);
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'End':
            event.preventDefault();
            set('player.slideIndex', (project?.slides?.length || 1) - 1);
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'Escape':
            event.preventDefault();
            exitPresentation();
            break;
    }
}
