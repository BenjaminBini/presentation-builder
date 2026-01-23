// src/projects/storage.js
// LocalStorage abstraction for project persistence

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * ProjectStorage - LocalStorage operations for projects
 */
class ProjectStorage {
  constructor(storageKey = 'slideProjects') {
    this._storageKey = storageKey;
    this._migrated = false;
  }

  /**
   * Migrate existing projects to use localId
   * @private
   */
  _migrateProjects() {
    if (this._migrated) return;

    try {
      const data = localStorage.getItem(this._storageKey);
      if (!data) {
        this._migrated = true;
        return;
      }

      const projects = JSON.parse(data);
      let needsSave = false;

      for (const project of projects) {
        if (!project.localId) {
          project.localId = generateUUID();
          needsSave = true;
        }
      }

      if (needsSave) {
        localStorage.setItem(this._storageKey, JSON.stringify(projects));
      }

      this._migrated = true;
    } catch (e) {
      console.error('Error migrating projects:', e);
      this._migrated = true;
    }
  }

  /**
   * Get all projects from localStorage
   * @returns {Array<Project>}
   */
  getAll() {
    this._migrateProjects();
    try {
      const data = localStorage.getItem(this._storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading projects from localStorage:', e);
      return [];
    }
  }

  /**
   * Get a project by index
   * @param {number} index - Project index
   * @returns {Project|null}
   */
  get(index) {
    const projects = this.getAll();
    return projects[index] || null;
  }

  /**
   * Get a project by localId
   * @param {string} localId - Project localId
   * @returns {Project|null}
   */
  getByLocalId(localId) {
    if (!localId) return null;
    const projects = this.getAll();
    return projects.find(p => p.localId === localId) || null;
  }

  /**
   * Get a project by name
   * @param {string} name - Project name
   * @returns {Project|null}
   */
  getByName(name) {
    const projects = this.getAll();
    return projects.find(p => p.name === name) || null;
  }

  /**
   * Find project index by localId
   * @param {string} localId - Project localId
   * @returns {number} Index or -1 if not found
   */
  findIndexByLocalId(localId) {
    if (!localId) return -1;
    const projects = this.getAll();
    return projects.findIndex(p => p.localId === localId);
  }

  /**
   * Find project index by name
   * @param {string} name - Project name
   * @returns {number} Index or -1 if not found
   */
  findIndex(name) {
    const projects = this.getAll();
    return projects.findIndex(p => p.name === name);
  }

  /**
   * Save a project (create or update)
   * Uses localId for identity if available, falls back to name
   * @param {Project} project - Project to save
   * @returns {boolean} Success status
   */
  save(project) {
    try {
      const projects = this.getAll();

      // Ensure project has a localId
      if (!project.localId) {
        project.localId = generateUUID();
      }

      // Find by localId first, then by name as fallback
      let existingIndex = project.localId
        ? projects.findIndex(p => p.localId === project.localId)
        : -1;

      // Fallback to name-based lookup for legacy compatibility
      if (existingIndex < 0 && project.name) {
        existingIndex = projects.findIndex(p => p.name === project.name && !p.localId);
      }

      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }

      localStorage.setItem(this._storageKey, JSON.stringify(projects));
      return true;
    } catch (e) {
      console.error('Error saving project to localStorage:', e);
      return false;
    }
  }

  /**
   * Delete a project by index
   * @param {number} index - Project index
   * @returns {boolean} Success status
   */
  delete(index) {
    try {
      const projects = this.getAll();
      projects.splice(index, 1);
      localStorage.setItem(this._storageKey, JSON.stringify(projects));
      return true;
    } catch (e) {
      console.error('Error deleting project from localStorage:', e);
      return false;
    }
  }

  /**
   * Delete a project by localId
   * @param {string} localId - Project localId
   * @returns {boolean} Success status
   */
  deleteByLocalId(localId) {
    const index = this.findIndexByLocalId(localId);
    if (index < 0) return false;
    return this.delete(index);
  }

  /**
   * Check if a project name exists
   * @param {string} name - Project name
   * @returns {boolean}
   */
  exists(name) {
    return this.findIndex(name) >= 0;
  }

  /**
   * Get all project names
   * @returns {Set<string>}
   */
  getAllNames() {
    const projects = this.getAll();
    return new Set(projects.map(p => p.name));
  }

  /**
   * Clear all projects
   * @returns {boolean} Success status
   */
  clear() {
    try {
      localStorage.removeItem(this._storageKey);
      return true;
    } catch (e) {
      console.error('Error clearing projects from localStorage:', e);
      return false;
    }
  }
}

// Create singleton instance
const storage = new ProjectStorage();

// Export class, singleton, and utility functions
export { ProjectStorage, storage, generateUUID };

// Convenience export (only projectExists is used externally)
export const projectExists = (name) => storage.exists(name);
