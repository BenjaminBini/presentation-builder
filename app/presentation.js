// app/presentation.js
// Fullscreen presentation player mode

window.startPresentation = function() {
    if (window.currentProject.slides.length === 0) {
        showToast('Ajoutez des slides avant de présenter', 'error');
        return;
    }

    window.playerSlideIndex = window.selectedSlideIndex >= 0 ? window.selectedSlideIndex : 0;
    document.getElementById('presentationPlayer').classList.add('active');
    document.getElementById('playerTitle').textContent = window.currentProject.name || 'Présentation';

    updatePlayerSlide();
    updatePlayerControls();

    // Add keyboard listener
    document.addEventListener('keydown', handlePlayerKeydown);

    // Set up resize observer for player
    const playerContent = document.querySelector('.player-content');
    if (playerContent && !window.playerResizeObserver) {
        window.playerResizeObserver = new ResizeObserver(() => window.scalePlayerSlide());
        window.playerResizeObserver.observe(playerContent);
    }

    // Also listen to window resize
    window.addEventListener('resize', window.scalePlayerSlide);
};

window.exitPresentation = function() {
    document.getElementById('presentationPlayer').classList.remove('active');
    document.removeEventListener('keydown', handlePlayerKeydown);
    window.removeEventListener('resize', window.scalePlayerSlide);

    // Clean up resize observer
    if (window.playerResizeObserver) {
        window.playerResizeObserver.disconnect();
        window.playerResizeObserver = null;
    }

    // Sync selected slide with player position
    window.selectedSlideIndex = window.playerSlideIndex;
    renderSlideList();
    renderEditor();
    updatePreview();
};

function updatePlayerSlide() {
    const player = document.getElementById('presentationPlayer');
    const slideContainer = document.getElementById('playerSlide');

    if (!player.classList.contains('active')) return;

    const slide = window.currentProject.slides[window.playerSlideIndex];
    if (slide) {
        const { template, data } = slide;
        const styles = getPreviewStyles();
        slideContainer.innerHTML = `<style>${styles}</style>${renderTemplate(template, data)}`;

        // Apply scaling after content is rendered
        window.scalePlayerSlide();

        // Re-render mermaid if needed
        if (slide.template === 'mermaid') {
            setTimeout(() => {
                mermaid.run({ nodes: slideContainer.querySelectorAll('.mermaid') });
            }, 100);
        }
    }
}

window.scalePlayerSlide = function() {
    const content = document.querySelector('.player-content');
    const wrapper = document.querySelector('.player-slide-wrapper');
    const slide = document.getElementById('playerSlide');
    if (!content || !wrapper || !slide) return;

    // Account for nav buttons (60px each + gap) and padding
    const availableWidth = content.clientWidth - 180;
    const availableHeight = content.clientHeight - 40;

    const scaleX = availableWidth / 1280;
    const scaleY = availableHeight / 720;
    const scale = Math.min(1, scaleX, scaleY);

    slide.style.transform = `scale(${scale})`;

    // Size the wrapper to match scaled dimensions
    wrapper.style.width = `${1280 * scale}px`;
    wrapper.style.height = `${720 * scale}px`;
};

function updatePlayerControls() {
    const total = window.currentProject.slides.length;
    const current = window.playerSlideIndex + 1;

    document.getElementById('playerCounter').textContent = `${current} / ${total}`;
    document.getElementById('playerProgressBar').style.width = `${(current / total) * 100}%`;

    // Update nav button states
    document.querySelector('.player-nav-prev').disabled = window.playerSlideIndex === 0;
    document.querySelector('.player-nav-next').disabled = window.playerSlideIndex >= total - 1;
}

window.prevSlidePlayer = function() {
    if (window.playerSlideIndex > 0) {
        window.playerSlideIndex--;
        updatePlayerSlide();
        updatePlayerControls();
    }
};

window.nextSlidePlayer = function() {
    if (window.playerSlideIndex < window.currentProject.slides.length - 1) {
        window.playerSlideIndex++;
        updatePlayerSlide();
        updatePlayerControls();
    }
};

function handlePlayerKeydown(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
            event.preventDefault();
            window.prevSlidePlayer();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
            event.preventDefault();
            window.nextSlidePlayer();
            break;
        case 'Home':
            event.preventDefault();
            window.playerSlideIndex = 0;
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'End':
            event.preventDefault();
            window.playerSlideIndex = window.currentProject.slides.length - 1;
            updatePlayerSlide();
            updatePlayerControls();
            break;
        case 'Escape':
            event.preventDefault();
            window.exitPresentation();
            break;
    }
}
