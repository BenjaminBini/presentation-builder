// utils/svg-utils.js
// Shared SVG utility functions

/**
 * Get GitLab logo SVG
 * @param {number} size - Size of the logo (default: 80)
 * @returns {string} GitLab logo SVG markup
 */
function getGitLabLogoSvg(size = 80) {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M190 362.42L253.31 167.69H126.69L190 362.42Z" fill="#E24329"/>
            <path d="M190 362.42L126.69 167.69H20.28L190 362.42Z" fill="#FC6D26"/>
            <path d="M20.28 167.69L2.53 222.23C0.91 227.22 2.69 232.67 6.97 235.78L190 362.42L20.28 167.69Z" fill="#FCA326"/>
            <path d="M20.28 167.69H126.69L80.89 26.87C78.95 21.01 70.74 21.01 68.8 26.87L20.28 167.69Z" fill="#E24329"/>
            <path d="M190 362.42L253.31 167.69H359.72L190 362.42Z" fill="#FC6D26"/>
            <path d="M359.72 167.69L377.47 222.23C379.09 227.22 377.31 232.67 373.03 235.78L190 362.42L359.72 167.69Z" fill="#FCA326"/>
            <path d="M359.72 167.69H253.31L299.11 26.87C301.05 21.01 309.26 21.01 311.2 26.87L359.72 167.69Z" fill="#E24329"/>
        </svg>
    `;
}

/**
 * Get GitLab logo SVG (without size parameter for templates)
 * @returns {string} GitLab logo SVG markup with class for styling
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
