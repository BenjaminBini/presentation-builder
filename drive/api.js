// drive/api.js
// Google Drive API wrapper for file operations
// Requires: drive/config.js, drive/auth.js

window.DriveAPI = (function() {

    // Get or create the app folder in user's Drive
    async function getAppFolder() {
        await DriveAuth.ensureValidToken();

        const folderId = localStorage.getItem(DriveConfig.STORAGE_KEYS.FOLDER_ID);

        if (folderId) {
            try {
                // Verify folder still exists
                await gapi.client.drive.files.get({
                    fileId: folderId,
                    fields: 'id,trashed'
                });
                return folderId;
            } catch (e) {
                // Folder deleted or inaccessible, create new one
                localStorage.removeItem(DriveConfig.STORAGE_KEYS.FOLDER_ID);
            }
        }

        // Search for existing folder
        const searchResponse = await gapi.client.drive.files.list({
            q: `name='${DriveConfig.APP_FOLDER_NAME}' and mimeType='${DriveConfig.MIME_TYPES.FOLDER}' and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        });

        if (searchResponse.result.files && searchResponse.result.files.length > 0) {
            const id = searchResponse.result.files[0].id;
            localStorage.setItem(DriveConfig.STORAGE_KEYS.FOLDER_ID, id);
            return id;
        }

        // Create new folder
        const createResponse = await gapi.client.drive.files.create({
            resource: {
                name: DriveConfig.APP_FOLDER_NAME,
                mimeType: DriveConfig.MIME_TYPES.FOLDER
            },
            fields: 'id'
        });

        const newId = createResponse.result.id;
        localStorage.setItem(DriveConfig.STORAGE_KEYS.FOLDER_ID, newId);
        return newId;
    }

    // List all presentations in app folder
    async function listPresentations() {
        await DriveAuth.ensureValidToken();

        const folderId = await getAppFolder();

        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and mimeType='${DriveConfig.MIME_TYPES.JSON}' and trashed=false`,
            fields: 'files(id,name,modifiedTime,size,properties)',
            orderBy: 'modifiedTime desc',
            spaces: 'drive',
            pageSize: 100
        });

        return (response.result.files || []).map(file => ({
            id: file.id,
            name: file.name.replace(DriveConfig.FILE_EXTENSION, ''),
            modifiedTime: file.modifiedTime,
            size: parseInt(file.size || '0', 10),
            driveId: file.id,
            properties: file.properties || {}
        }));
    }

    // Get presentation content by ID
    async function getPresentation(fileId) {
        await DriveAuth.ensureValidToken();

        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${gapi.client.getToken().access_token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get presentation: ${response.status}`);
        }

        return await response.json();
    }

    // Get presentation metadata only
    async function getPresentationMetadata(fileId) {
        await DriveAuth.ensureValidToken();

        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'id,name,modifiedTime,version,properties'
        });

        return response.result;
    }

    // Create new presentation in Drive
    async function createPresentation(project) {
        await DriveAuth.ensureValidToken();

        const folderId = await getAppFolder();
        const fileName = sanitizeFileName(project.name);

        const metadata = {
            name: `${fileName}${DriveConfig.FILE_EXTENSION}`,
            mimeType: DriveConfig.MIME_TYPES.JSON,
            parents: [folderId],
            properties: {
                appVersion: '1.0',
                slideCount: String(project.slides ? project.slides.length : 0),
                lastLocalSave: project.savedAt || new Date().toISOString()
            }
        };

        const content = JSON.stringify(project, null, 2);

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {
            type: 'application/json'
        }));
        form.append('file', new Blob([content], {
            type: DriveConfig.MIME_TYPES.JSON
        }));

        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gapi.client.getToken().access_token}`
                },
                body: form
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create presentation');
        }

        return await response.json();
    }

    // Update existing presentation in Drive
    async function updatePresentation(fileId, project) {
        await DriveAuth.ensureValidToken();

        const fileName = sanitizeFileName(project.name);

        const metadata = {
            name: `${fileName}${DriveConfig.FILE_EXTENSION}`,
            properties: {
                appVersion: '1.0',
                slideCount: String(project.slides ? project.slides.length : 0),
                lastLocalSave: project.savedAt || new Date().toISOString()
            }
        };

        const content = JSON.stringify(project, null, 2);

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {
            type: 'application/json'
        }));
        form.append('file', new Blob([content], {
            type: DriveConfig.MIME_TYPES.JSON
        }));

        const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,modifiedTime`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${gapi.client.getToken().access_token}`
                },
                body: form
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to update presentation');
        }

        return await response.json();
    }

    // Delete presentation permanently
    async function deletePresentation(fileId) {
        await DriveAuth.ensureValidToken();

        await gapi.client.drive.files.delete({
            fileId: fileId
        });
    }

    // Move presentation to trash (soft delete)
    async function trashPresentation(fileId) {
        await DriveAuth.ensureValidToken();

        await gapi.client.drive.files.update({
            fileId: fileId,
            resource: { trashed: true }
        });
    }

    // Sanitize file name for Drive
    function sanitizeFileName(name) {
        return (name || 'Sans titre')
            // Remove illegal characters for Drive
            .replace(/[<>:"/\\|?*]/g, '-')
            // Collapse multiple spaces/dashes
            .replace(/\s+/g, ' ')
            .replace(/-+/g, '-')
            // Trim whitespace
            .trim()
            // Limit length (Drive has 255 char limit, leave room for extension)
            .substring(0, 200);
    }

    // Check if a file with the same name exists
    async function findByName(projectName) {
        await DriveAuth.ensureValidToken();

        const folderId = await getAppFolder();
        const fileName = sanitizeFileName(projectName) + DriveConfig.FILE_EXTENSION;

        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
            fields: 'files(id,name,modifiedTime)',
            spaces: 'drive'
        });

        return response.result.files && response.result.files.length > 0
            ? response.result.files[0]
            : null;
    }

    return {
        getAppFolder,
        listPresentations,
        getPresentation,
        getPresentationMetadata,
        createPresentation,
        updatePresentation,
        deletePresentation,
        trashPresentation,
        sanitizeFileName,
        findByName
    };
})();
