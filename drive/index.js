// drive/index.js
// Drive module initialization
// Requires: All other drive modules

window.initDrive = async function() {
    // Check if Google API libraries are available
    if (typeof gapi === 'undefined') {
        console.warn('Google API (gapi) not loaded, Drive features disabled');
        return false;
    }

    if (typeof google === 'undefined' || !google.accounts) {
        console.warn('Google Identity Services not loaded, Drive features disabled');
        return false;
    }

    // Check if client ID is configured
    if (!DriveConfig.CLIENT_ID || DriveConfig.CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com') {
        console.warn('Google Drive Client ID not configured. Edit drive/config.js to enable Drive sync.');
        return false;
    }

    try {
        // Initialize authentication
        await DriveAuth.init();

        // Initialize UI
        DriveUI.init();

        // Hook into existing autosave
        const originalAutosave = window.autosave;
        if (typeof originalAutosave === 'function') {
            window.autosave = function() {
                // Call original localStorage save
                originalAutosave();

                // Queue Drive sync if enabled
                if (DriveAuth.isSignedIn() && DriveSync.isSyncEnabled()) {
                    DriveSync.queueSync(window.currentProject);
                }
            };
        }

        console.log('Google Drive integration initialized successfully');
        return true;

    } catch (error) {
        console.error('Failed to initialize Drive integration:', error);
        return false;
    }
};

// GAPI loaded callback
window.gapiLoaded = function() {
    if (window.DriveAuth) {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    discoveryDocs: DriveConfig.DISCOVERY_DOCS
                });
                window._gapiReady = true;
                checkAndInitDrive();
            } catch (error) {
                console.error('GAPI client init error:', error);
            }
        });
    }
};

// GIS loaded callback
window.gisLoaded = function() {
    window._gisReady = true;
    checkAndInitDrive();
};

// Check if both libraries are ready and initialize
function checkAndInitDrive() {
    if (window._gapiReady && window._gisReady && !window._driveInitialized) {
        window._driveInitialized = true;
        window.initDrive();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if libraries are already loaded
    if (typeof gapi !== 'undefined' && typeof google !== 'undefined' && google.accounts) {
        window.initDrive();
    }
});
