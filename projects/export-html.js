// projects/export-html.js
// HTML presentation generation
// Requires: utils/html-utils.js (escapeHtml)
// Requires: projects/export-templates.js (renderExportSlide)
// Requires: projects/export-css.js (getExportCSS)
// Requires: projects/notifications.js (showToast)

function exportToHtml() {
    const html = generatePresentationHtml(currentProject);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('HTML exporté');
}

function generatePresentationHtml(project) {
    const slidesHtml = project.slides.map(slide =>
        `<div class="slide-wrapper">${renderExportSlide(slide)}</div>`
    ).join('\n');
    const title = project.name || 'Presentation';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.12.2/dist/mermaid.min.js"></script>
    <style>${getExportCSS()}
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

// Expose to global scope
window.exportToHtml = exportToHtml;
window.generatePresentationHtml = generatePresentationHtml;
