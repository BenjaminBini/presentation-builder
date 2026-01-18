// projects/modal.js
// Modal UI operations
// Requires: utils/html-utils.js (escapeHtml)

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openProjectsModal() {
    document.getElementById('projectName').value = currentProject.name;
    renderProjectList();
    document.getElementById('projectsModal').classList.add('active');
}

function renderProjectList() {
    const list = document.getElementById('projectList');
    const projects = JSON.parse(localStorage.getItem('slideProjects') || '[]');

    if (projects.length === 0) {
        list.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Aucun projet local</p>';
    } else {
        list.innerHTML = projects.map((project, i) => `
            <div class="project-item" onclick="loadProject(${i})">
                <div class="project-item-info">
                    <h4>
                        ${project.driveId ? `<svg class="icon icon-sm drive-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px; stroke: var(--accent-main);"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` : ''}
                        ${escapeHtml(project.name)}
                    </h4>
                    <span>${project.slides.length} slides • ${new Date(project.savedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="project-item-actions">
                    <button class="slide-item-btn delete" onclick="event.stopPropagation(); deleteProject(${i})" title="Supprimer"><svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
            </div>
        `).join('');
    }

    // Render Drive projects if DriveUI is available
    if (typeof DriveUI !== 'undefined' && typeof DriveUI.renderDriveProjects === 'function') {
        DriveUI.renderDriveProjects();
    }
}

// Expose to global scope
window.openModal = openModal;
window.closeModal = closeModal;
window.openProjectsModal = openProjectsModal;
window.renderProjectList = renderProjectList;
