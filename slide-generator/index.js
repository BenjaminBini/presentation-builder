#!/usr/bin/env node

/**
 * Slide Generator - GitLab Style
 *
 * Usage: node slide-generator/index.js [input.json] [output.html]
 *
 * If no arguments provided:
 *   - Input: presentation-data.json
 *   - Output: presentation.html
 */

const fs = require('fs');
const path = require('path');
const { escapeHtml } = require('./utils');
const { generateSlidesHtml } = require('./templates');
const { CSS_STYLES } = require('./styles');

// Get command line arguments
const inputFile = process.argv[2] || 'presentation-data.json';
const outputFile = process.argv[3] || 'presentation.html';

/**
 * Read and parse presentation data from JSON file
 * @param {string} filepath - Path to JSON file
 * @returns {Object} Parsed presentation data
 */
function loadPresentationData(filepath) {
    try {
        const jsonContent = fs.readFileSync(filepath, 'utf8');
        const data = JSON.parse(jsonContent);
        console.log(`✓ Loaded: ${filepath}`);
        return data;
    } catch (error) {
        console.error(`✗ Error reading ${filepath}:`, error.message);
        process.exit(1);
    }
}

/**
 * Generate complete HTML document from presentation data
 * @param {Object} presentationData - Presentation configuration and slides
 * @returns {string} Complete HTML document
 */
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

/**
 * Write HTML content to file
 * @param {string} filepath - Output file path
 * @param {string} content - HTML content to write
 * @param {number} slideCount - Number of slides generated
 */
function writeOutput(filepath, content, slideCount) {
    try {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`✓ Generated: ${filepath}`);
        console.log(`  ${slideCount} slides`);
    } catch (error) {
        console.error(`✗ Error writing ${filepath}:`, error.message);
        process.exit(1);
    }
}

// Main execution
function main() {
    const presentationData = loadPresentationData(inputFile);
    const html = generateHtml(presentationData);
    writeOutput(outputFile, html, presentationData.slides.length);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { loadPresentationData, generateHtml, writeOutput };
