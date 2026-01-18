// drive/auth.js
// Google OAuth 2.0 authentication module
// Requires: drive/config.js

window.DriveAuth = (function() {
    let tokenClient = null;
    let gapiInitialized = false;
    let gisInitialized = false;
    let currentUser = null;
    let tokenExpiresAt = null;

    // Event callbacks
    const callbacks = {
        onSignIn: [],
        onSignOut: [],
        onError: [],
        onReady: []
    };

    // Called when GAPI library loads
    window.gapiLoaded = function() {
        gapi.load('client', initializeGapiClient);
    };

    // Called when GIS library loads
    window.gisLoaded = function() {
        initializeGisClient();
    };

    // Initialize GAPI client
    async function initializeGapiClient() {
        try {
            await gapi.client.init({
                discoveryDocs: DriveConfig.DISCOVERY_DOCS
            });
            gapiInitialized = true;
            checkReady();
        } catch (error) {
            console.error('GAPI initialization error:', error);
            triggerCallbacks('onError', error);
        }
    }

    // Initialize Google Identity Services
    function initializeGisClient() {
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: DriveConfig.CLIENT_ID,
                scope: DriveConfig.SCOPES,
                callback: handleTokenResponse
            });
            gisInitialized = true;
            checkReady();
        } catch (error) {
            console.error('GIS initialization error:', error);
            triggerCallbacks('onError', error);
        }
    }

    // Check if both libraries are ready
    function checkReady() {
        if (gapiInitialized && gisInitialized) {
            triggerCallbacks('onReady');

            // Try to restore session
            const savedToken = localStorage.getItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
            if (savedToken) {
                restoreSession(savedToken);
            }
        }
    }

    // Handle token response from OAuth
    function handleTokenResponse(response) {
        if (response.error !== undefined) {
            console.error('Auth error:', response);
            triggerCallbacks('onError', response);
            return;
        }

        // Save token
        localStorage.setItem(
            DriveConfig.STORAGE_KEYS.AUTH_TOKEN,
            JSON.stringify(response)
        );

        // Calculate expiration time
        tokenExpiresAt = Date.now() + (response.expires_in * 1000);

        // Fetch user info
        fetchUserInfo().then(user => {
            currentUser = user;
            triggerCallbacks('onSignIn', user);
        }).catch(error => {
            console.error('Error fetching user info:', error);
            triggerCallbacks('onError', error);
        });
    }

    // Restore session from saved token
    async function restoreSession(tokenJson) {
        try {
            const token = JSON.parse(tokenJson);

            // Check if token is expired
            if (token.expires_in) {
                const savedAt = localStorage.getItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
                if (savedAt) {
                    const elapsed = (Date.now() - parseInt(savedAt)) / 1000;
                    if (elapsed > token.expires_in) {
                        // Token expired, need to re-auth
                        localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
                        localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
                        return;
                    }
                }
            }

            gapi.client.setToken(token);
            currentUser = await fetchUserInfo();
            triggerCallbacks('onSignIn', currentUser);
        } catch (error) {
            console.error('Session restore error:', error);
            localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');
        }
    }

    // Fetch current user information
    async function fetchUserInfo() {
        const response = await gapi.client.drive.about.get({
            fields: 'user(displayName,emailAddress,photoLink)'
        });
        return response.result.user;
    }

    // Initialize the auth system
    function init() {
        return new Promise((resolve, reject) => {
            if (gapiInitialized && gisInitialized) {
                resolve();
                return;
            }

            // Set up ready callback
            on('onReady', resolve);

            // Check if libraries are already loaded
            if (typeof gapi !== 'undefined' && !gapiInitialized) {
                window.gapiLoaded();
            }
            if (typeof google !== 'undefined' && google.accounts && !gisInitialized) {
                window.gisLoaded();
            }
        });
    }

    // Sign in user
    function signIn() {
        if (!tokenClient) {
            console.error('DriveAuth not initialized');
            return;
        }

        // Save current time for token expiration calculation
        localStorage.setItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time', Date.now().toString());

        if (gapi.client.getToken() === null) {
            // First time - prompt for consent
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Already authorized - skip consent if possible
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }

    // Sign out user
    function signOut() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token, () => {
                console.log('Token revoked');
            });
            gapi.client.setToken(null);
        }

        // Clear storage
        localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(DriveConfig.STORAGE_KEYS.AUTH_TOKEN + '_time');

        currentUser = null;
        tokenExpiresAt = null;
        triggerCallbacks('onSignOut');
    }

    // Check if user is signed in
    function isSignedIn() {
        return currentUser !== null && gapi.client.getToken() !== null;
    }

    // Get current user
    function getUser() {
        return currentUser;
    }

    // Check if token is expired or about to expire
    function isTokenExpired() {
        if (!tokenExpiresAt) return true;
        // Add 5-minute buffer
        return Date.now() > (tokenExpiresAt - 5 * 60 * 1000);
    }

    // Refresh token if needed
    async function ensureValidToken() {
        if (isTokenExpired() && isSignedIn()) {
            return new Promise((resolve, reject) => {
                const originalCallback = tokenClient.callback;
                tokenClient.callback = (response) => {
                    tokenClient.callback = originalCallback;
                    if (response.error) {
                        reject(response);
                    } else {
                        handleTokenResponse(response);
                        resolve();
                    }
                };
                tokenClient.requestAccessToken({ prompt: '' });
            });
        }
    }

    // Subscribe to events
    function on(event, callback) {
        if (callbacks[event]) {
            callbacks[event].push(callback);
        }
    }

    // Unsubscribe from events
    function off(event, callback) {
        if (callbacks[event]) {
            callbacks[event] = callbacks[event].filter(cb => cb !== callback);
        }
    }

    // Trigger callbacks
    function triggerCallbacks(event, data) {
        if (callbacks[event]) {
            callbacks[event].forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('Callback error:', e);
                }
            });
        }
    }

    return {
        init,
        signIn,
        signOut,
        isSignedIn,
        getUser,
        isTokenExpired,
        ensureValidToken,
        on,
        off
    };
})();
