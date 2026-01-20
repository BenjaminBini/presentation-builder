// src/projects/storage.js
// LocalStorage abstraction for project persistence

/**
 * ProjectStorage - LocalStorage operations for projects
 */
class ProjectStorage {
  constructor(storageKey = 'slideProjects') {
    this._storageKey = storageKey;
  }

  /**
   * Get all projects from localStorage
   * @returns {Array<Project>}
   */
  getAll() {
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
   * Get a project by name
   * @param {string} name - Project name
   * @returns {Project|null}
   */
  getByName(name) {
    const projects = this.getAll();
    return projects.find(p => p.name === name) || null;
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
   * @param {Project} project - Project to save
   * @returns {boolean} Success status
   */
  save(project) {
    try {
      const projects = this.getAll();
      const existingIndex = projects.findIndex(p => p.name === project.name);

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

// Export class and singleton
export { ProjectStorage, storage };

// Convenience export (only projectExists is used externally)
export const projectExists = (name) => storage.exists(name);
