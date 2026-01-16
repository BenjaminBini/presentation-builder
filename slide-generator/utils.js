// utils.js
// Re-export utility functions from the utils folder

const { escapeHtml } = require('../utils/html-utils.cjs');
const { getGitLabLogo } = require('../utils/svg-utils.cjs');

module.exports = {
    escapeHtml,
    getGitLabLogo
};
