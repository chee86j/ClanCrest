import f3 from '../index.js'

/**
 * FamilyTreeBuilder - A comprehensive UI component for creating and customizing family trees
 * Provides an intuitive interface with drag-and-drop, form-based editing, and real-time preview
 */
export class FamilyTreeBuilder {
  constructor(container, options = {}) {
    this.container = container
    this.options = this.setupOptions(options)
    this.store = null
    this.chart = null
    this.currentData = []
    this.isInitialized = false
    
    this.init()
  }

  /**
   * Setup default options with user overrides
   */
  setupOptions(options) {
    const defaults = {
      // Chart configuration
      node_separation: 250,
      level_separation: 150,
      card_dimensions: {w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5},
      
      // UI configuration
      show_toolbar: true,
      show_sidebar: true,
      show_preview: true,
      show_statistics: true,
      
      // Form fields
      default_fields: [
        {id: 'first_name', type: 'text', label: 'First Name', required: true},
        {id: 'last_name', type: 'text', label: 'Last Name', required: true},
        {id: 'birth_date', type: 'date', label: 'Birth Date'},
        {id: 'gender', type: 'select', label: 'Gender', options: [
          {value: 'M', label: 'Male'},
          {value: 'F', label: 'Female'}
        ]},
        {id: 'avatar', type: 'url', label: 'Avatar URL'},
        {id: 'notes', type: 'textarea', label: 'Notes'}
      ],
      
      // API configuration
      api_base_url: 'http://localhost:3001/api',
      auto_save: false,
      auto_save_interval: 30000, // 30 seconds
      
      // Callbacks
      onPersonAdded: null,
      onPersonUpdated: null,
      onPersonDeleted: null,
      onTreeSaved: null,
      onTreeLoaded: null,
      onError: null
    }
    
    return { ...defaults, ...options }
  }

  /**
   * Initialize the family tree builder
   */
  init() {
    if (this.isInitialized) return
    
    this.createUI()
    this.initializeChart()
    this.bindEvents()
    this.setupAutoSave()
    
    this.isInitialized = true
    this.showStatus('Family tree builder initialized', 'success')
  }

  /**
   * Create the main UI structure
   */
  createUI() {
    this.container.innerHTML = `
      <div class="family-tree-builder">
        <div class="builder-header">
          <h1>Family Tree Builder</h1>
          <div class="header-controls">
            <button class="btn btn-primary" id="save-tree-btn">
              <i class="icon-save"></i> Save Tree
            </button>
            <button class="btn btn-secondary" id="load-tree-btn">
              <i class="icon-load"></i> Load Tree
            </button>
            <button class="btn btn-success" id="export-tree-btn">
              <i class="icon-export"></i> Export
            </button>
            <button class="btn btn-warning" id="clear-tree-btn">
              <i class="icon-clear"></i> Clear
            </button>
          </div>
        </div>

        <div class="builder-main">
          ${this.options.show_sidebar ? `
            <div class="builder-sidebar">
              <div class="sidebar-section">
                <h3>Add Person</h3>
                <form id="add-person-form" class="person-form">
                  <div class="form-group">
                    <label for="first-name">First Name *</label>
                    <input type="text" id="first-name" name="first_name" required>
                  </div>
                  <div class="form-group">
                    <label for="last-name">Last Name *</label>
                    <input type="text" id="last-name" name="last_name" required>
                  </div>
                  <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender" name="gender">
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="birth-date">Birth Date</label>
                    <input type="date" id="birth-date" name="birth_date">
                  </div>
                  <div class="form-group">
                    <label for="avatar-url">Avatar URL</label>
                    <input type="url" id="avatar-url" name="avatar" placeholder="https://example.com/avatar.jpg">
                  </div>
                  <div class="form-group">
                    <label for="notes">Notes</label>
                    <textarea id="notes" name="notes" rows="3"></textarea>
                  </div>
                  <div class="form-group">
                    <label for="parent-relationship">Parent Relationship</label>
                    <select id="parent-relationship" name="parent_relationship">
                      <option value="">No Parent</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="spouse-relationship">Spouse</label>
                    <select id="spouse-relationship" name="spouse_relationship">
                      <option value="">No Spouse</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary btn-full">
                    <i class="icon-add"></i> Add Person
                  </button>
                </form>
              </div>

              <div class="sidebar-section">
                <h3>Tree Statistics</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-number" id="total-persons">0</span>
                    <span class="stat-label">Total Persons</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number" id="male-count">0</span>
                    <span class="stat-label">Male</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number" id="female-count">0</span>
                    <span class="stat-label">Female</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number" id="relationships-count">0</span>
                    <span class="stat-label">Relationships</span>
                  </div>
                </div>
              </div>

              <div class="sidebar-section">
                <h3>Quick Actions</h3>
                <div class="quick-actions">
                  <button class="btn btn-sm btn-secondary" id="add-root-btn">
                    <i class="icon-person"></i> Add Root Person
                  </button>
                  <button class="btn btn-sm btn-secondary" id="add-parents-btn">
                    <i class="icon-parents"></i> Add Parents
                  </button>
                  <button class="btn btn-sm btn-secondary" id="add-spouse-btn">
                    <i class="icon-spouse"></i> Add Spouse
                  </button>
                  <button class="btn btn-sm btn-secondary" id="add-child-btn">
                    <i class="icon-child"></i> Add Child
                  </button>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="builder-content">
            <div class="chart-container">
              <div id="family-chart" class="family-chart"></div>
            </div>
            
            ${this.options.show_preview ? `
              <div class="preview-panel">
                <h3>Tree Preview</h3>
                <div id="tree-preview" class="tree-preview"></div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="builder-footer">
          <div class="status-bar">
            <span id="status-message" class="status-message">Ready</span>
            <div class="status-indicators">
              <span id="auto-save-indicator" class="status-indicator" title="Auto-save status"></span>
              <span id="connection-indicator" class="status-indicator" title="Connection status"></span>
            </div>
          </div>
        </div>
      </div>
    `

    // Add CSS styles
    this.addStyles()
  }

  /**
   * Add CSS styles for the component
   */
  addStyles() {
    if (document.getElementById('family-tree-builder-styles')) return

    const style = document.createElement('style')
    style.id = 'family-tree-builder-styles'
    style.textContent = `
      .family-tree-builder {
        display: flex;
        flex-direction: column;
        height: 100vh;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .builder-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .builder-header h1 {
        margin: 0;
        color: #333;
        font-size: 1.8rem;
        font-weight: 600;
      }

      .header-controls {
        display: flex;
        gap: 0.5rem;
      }

      .builder-main {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .builder-sidebar {
        width: 350px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        padding: 1rem;
      }

      .sidebar-section {
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .sidebar-section h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .person-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-group label {
        font-weight: 500;
        color: #555;
        font-size: 0.9rem;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 0.75rem;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 0.9rem;
        transition: border-color 0.3s ease;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .btn-primary {
        background: #667eea;
        color: white;
      }

      .btn-primary:hover {
        background: #5a6fd8;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #5a6268;
      }

      .btn-success {
        background: #28a745;
        color: white;
      }

      .btn-success:hover {
        background: #218838;
      }

      .btn-warning {
        background: #ffc107;
        color: #212529;
      }

      .btn-warning:hover {
        background: #e0a800;
      }

      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }

      .btn-full {
        width: 100%;
        justify-content: center;
      }

      .builder-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chart-container {
        flex: 1;
        position: relative;
        background: #f8f9fa;
        border-radius: 10px;
        margin: 1rem;
        overflow: hidden;
      }

      .family-chart {
        width: 100%;
        height: 100%;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      .preview-panel {
        height: 200px;
        background: white;
        border-top: 1px solid #e1e5e9;
        padding: 1rem;
        overflow-y: auto;
      }

      .tree-preview {
        font-family: monospace;
        font-size: 0.8rem;
        color: #666;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-item {
        text-align: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e1e5e9;
      }

      .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.8rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .quick-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .builder-footer {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 0.75rem 2rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status-message {
        font-size: 0.9rem;
        color: #666;
      }

      .status-indicators {
        display: flex;
        gap: 0.5rem;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #6c757d;
        transition: background-color 0.3s ease;
      }

      .status-indicator.connected {
        background: #28a745;
      }

      .status-indicator.auto-saving {
        background: #ffc107;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .builder-sidebar {
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .builder-sidebar.open {
          transform: translateX(0);
        }

        .builder-header {
          padding: 1rem;
        }

        .builder-header h1 {
          font-size: 1.4rem;
        }

        .header-controls {
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }
      }

      /* Accessibility improvements */
      .btn:focus,
      input:focus,
      select:focus,
      textarea:focus {
        outline: 2px solid #667eea;
        outline-offset: 2px;
      }

      /* Loading states */
      .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }

      .loading::after {
        content: '';
        display: block;
        width: 40px;
        height: 40px;
        border: 4px solid #e1e5e9;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `

    document.head.appendChild(style)
  }

  /**
   * Initialize the family chart
   */
  initializeChart() {
    const chartContainer = document.getElementById('family-chart')
    
    // Create store with empty data
    this.store = f3.createStore({
      data: [],
      node_separation: this.options.node_separation,
      level_separation: this.options.level_separation
    })

    // Create SVG container
    this.chart = f3.createSvg(chartContainer)

    // Create card component
    this.Card = f3.elements.Card({
      store: this.store,
      svg: this.chart,
      card_dim: this.options.card_dimensions,
      card_display: [d => `${d.data['first name'] || ''} ${d.data['last name'] || ''}`],
      mini_tree: true,
      link_break: false
    })

    // Set up chart updates
    this.store.setOnUpdate(props => f3.view(this.store.getTree(), this.chart, this.Card, props || {}))
    this.store.updateTree({initial: true})

    this.updateStatistics()
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Form submission
    const addPersonForm = document.getElementById('add-person-form')
    if (addPersonForm) {
      addPersonForm.addEventListener('submit', this.handleAddPerson.bind(this))
    }

    // Button events
    const saveBtn = document.getElementById('save-tree-btn')
    if (saveBtn) {
      saveBtn.addEventListener('click', this.handleSaveTree.bind(this))
    }

    const loadBtn = document.getElementById('load-tree-btn')
    if (loadBtn) {
      loadBtn.addEventListener('click', this.handleLoadTree.bind(this))
    }

    const exportBtn = document.getElementById('export-tree-btn')
    if (exportBtn) {
      exportBtn.addEventListener('click', this.handleExportTree.bind(this))
    }

    const clearBtn = document.getElementById('clear-tree-btn')
    if (clearBtn) {
      clearBtn.addEventListener('click', this.handleClearTree.bind(this))
    }

    // Quick action buttons
    const addRootBtn = document.getElementById('add-root-btn')
    if (addRootBtn) {
      addRootBtn.addEventListener('click', this.handleAddRootPerson.bind(this))
    }

    const addParentsBtn = document.getElementById('add-parents-btn')
    if (addParentsBtn) {
      addParentsBtn.addEventListener('click', this.handleAddParents.bind(this))
    }

    const addSpouseBtn = document.getElementById('add-spouse-btn')
    if (addSpouseBtn) {
      addSpouseBtn.addEventListener('click', this.handleAddSpouse.bind(this))
    }

    const addChildBtn = document.getElementById('add-child-btn')
    if (addChildBtn) {
      addChildBtn.addEventListener('click', this.handleAddChild.bind(this))
    }
  }

  /**
   * Handle adding a new person
   */
  handleAddPerson(event) {
    event.preventDefault()
    
    const formData = new FormData(event.target)
    const personData = {
      id: this.generateId(),
      data: {
        'first name': formData.get('first_name') || '',
        'last name': formData.get('last_name') || '',
        'birthday': formData.get('birth_date') || '',
        'gender': formData.get('gender') || '',
        'avatar': formData.get('avatar') || '',
        'notes': formData.get('notes') || ''
      },
      rels: {
        father: null,
        mother: null,
        spouses: [],
        children: []
      }
    }

    // Handle parent relationship
    const parentRelationship = formData.get('parent_relationship')
    if (parentRelationship) {
      // TODO: Implement parent relationship logic
    }

    // Handle spouse relationship
    const spouseRelationship = formData.get('spouse_relationship')
    if (spouseRelationship) {
      // TODO: Implement spouse relationship logic
    }

    this.addPerson(personData)
    event.target.reset()
    this.showStatus('Person added successfully', 'success')
  }

  /**
   * Add a person to the tree
   */
  addPerson(personData) {
    const currentData = this.store.getData()
    currentData.push(personData)
    this.store.updateData(currentData)
    this.updateStatistics()
    
    if (this.options.onPersonAdded) {
      this.options.onPersonAdded(personData)
    }
  }

  /**
   * Handle saving the tree
   */
  async handleSaveTree() {
    try {
      this.showStatus('Saving tree...', 'info')
      
      const data = this.store.getData()
      const response = await fetch(`${this.options.api_base_url}/family-tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ familyData: data })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      this.showStatus(`Tree saved successfully: ${result.count} persons`, 'success')
      
      if (this.options.onTreeSaved) {
        this.options.onTreeSaved(result)
      }
    } catch (error) {
      console.error('Error saving tree:', error)
      this.showStatus(`Error saving tree: ${error.message}`, 'error')
      
      if (this.options.onError) {
        this.options.onError(error)
      }
    }
  }

  /**
   * Handle loading the tree
   */
  async handleLoadTree() {
    try {
      this.showStatus('Loading tree...', 'info')
      
      const response = await fetch(`${this.options.api_base_url}/family-tree`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      this.store.updateData(data)
      this.updateStatistics()
      this.showStatus(`Tree loaded: ${data.length} persons`, 'success')
      
      if (this.options.onTreeLoaded) {
        this.options.onTreeLoaded(data)
      }
    } catch (error) {
      console.error('Error loading tree:', error)
      this.showStatus(`Error loading tree: ${error.message}`, 'error')
      
      if (this.options.onError) {
        this.options.onError(error)
      }
    }
  }

  /**
   * Handle exporting the tree
   */
  handleExportTree() {
    const data = this.store.getData()
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = 'family-tree.json'
    link.click()
    
    this.showStatus('Tree exported successfully', 'success')
  }

  /**
   * Handle clearing the tree
   */
  handleClearTree() {
    if (confirm('Are you sure you want to clear the entire tree? This action cannot be undone.')) {
      this.store.updateData([])
      this.updateStatistics()
      this.showStatus('Tree cleared', 'info')
    }
  }

  /**
   * Handle adding a root person
   */
  handleAddRootPerson() {
    const personData = {
      id: this.generateId(),
      data: {
        'first name': 'New',
        'last name': 'Person',
        'birthday': '',
        'gender': 'M',
        'avatar': '',
        'notes': ''
      },
      rels: {
        father: null,
        mother: null,
        spouses: [],
        children: []
      }
    }
    
    this.addPerson(personData)
    this.showStatus('Root person added', 'success')
  }

  /**
   * Handle adding parents
   */
  handleAddParents() {
    // TODO: Implement add parents functionality
    this.showStatus('Add parents functionality coming soon', 'info')
  }

  /**
   * Handle adding spouse
   */
  handleAddSpouse() {
    // TODO: Implement add spouse functionality
    this.showStatus('Add spouse functionality coming soon', 'info')
  }

  /**
   * Handle adding child
   */
  handleAddChild() {
    // TODO: Implement add child functionality
    this.showStatus('Add child functionality coming soon', 'info')
  }

  /**
   * Update statistics display
   */
  updateStatistics() {
    const data = this.store.getData()
    const totalPersons = data.length
    const maleCount = data.filter(p => p.data.gender === 'M').length
    const femaleCount = data.filter(p => p.data.gender === 'F').length
    const relationshipCount = data.reduce((count, person) => {
      return count + (person.rels.spouses?.length || 0) + (person.rels.children?.length || 0)
    }, 0)

    const totalPersonsEl = document.getElementById('total-persons')
    const maleCountEl = document.getElementById('male-count')
    const femaleCountEl = document.getElementById('female-count')
    const relationshipsCountEl = document.getElementById('relationships-count')

    if (totalPersonsEl) totalPersonsEl.textContent = totalPersons
    if (maleCountEl) maleCountEl.textContent = maleCount
    if (femaleCountEl) femaleCountEl.textContent = femaleCount
    if (relationshipsCountEl) relationshipsCountEl.textContent = relationshipCount
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message')
    if (statusEl) {
      statusEl.textContent = message
      statusEl.className = `status-message status-${type}`
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    if (!this.options.auto_save) return

    setInterval(() => {
      if (this.store.getData().length > 0) {
        this.handleSaveTree()
      }
    }, this.options.auto_save_interval)
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Get current tree data
   */
  getData() {
    return this.store.getData()
  }

  /**
   * Set tree data
   */
  setData(data) {
    this.store.updateData(data)
    this.updateStatistics()
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Clean up event listeners and resources
    this.isInitialized = false
  }
}

export default FamilyTreeBuilder 