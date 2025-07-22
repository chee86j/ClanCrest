import f3 from "../index.js";
import addRelative from "../CreateTree/addRelative.js";
import removeRelative from "../CreateTree/removeRelative.js";
import { createForm } from "../CreateTree/form.js";
import { formInfoSetup } from "../CreateTree/formInfoSetup.js";

export class AddFamilyMember {
  constructor(container, options = {}) {
    this.container = container;
    this.options = this.setupOptions(options);
    this.store = null;
    this.chart = null;
    this.addRelativeInstance = null;
    this.removeRelativeInstance = null;
    this.currentPerson = null;
    this.isInitialized = false;
    this.isAddingRoot = false;
    this.init();
  }

  setupOptions(options) {
    const defaults = {
      fields: [
        { id: "first name", type: "text", label: "First Name", required: true },
        { id: "last name", type: "text", label: "Last Name", required: true },
        { id: "birthday", type: "date", label: "Birth Date" },
        { id: "avatar", type: "url", label: "Avatar URL" },
        { id: "notes", type: "textarea", label: "Notes" },
      ],
      addRelLabels: {
        father: "Add Father",
        mother: "Add Mother",
        spouse: "Add Spouse",
        son: "Add Son",
        daughter: "Add Daughter",
      },
      show_modal: true,
      modal_backdrop: true,
      auto_close: true,
      onPersonAdded: null,
      onPersonUpdated: null,
      onPersonDeleted: null,
      onError: null,
    };
    return { ...defaults, ...options };
  }

  init() {
    if (this.isInitialized) return;
    this.createUI();
    this.bindEvents();
    this.isInitialized = true;
    this.showStatus("Add Family Member component initialized", "success");
  }

  setStoreAndChart(store, chart) {
    this.store = store;
    this.chart = chart;
    this.addRelativeInstance = addRelative(
      store,
      () => {},
      () => {}
    );
    this.removeRelativeInstance = removeRelative(
      store,
      () => {},
      () => {}
    );
    this.addRelativeInstance.setAddRelLabels(this.options.addRelLabels);
    this.update();
  }

  createUI() {
    this.container.innerHTML = `
      <div class="add-family-member">
        <div class="component-header">
          <h2>Add Family Member</h2>
          <p id="afm-header-desc">Select a person and choose a relationship to add</p>
        </div>
        <div class="component-content">
          <div class="person-selector">
            <label for="person-select">Select Person:</label>
            <select id="person-select" class="person-select">
              <option value="">Choose a person...</option>
            </select>
          </div>
          <div class="relationship-actions" id="relationship-actions"></div>
          <div class="quick-actions">
            <button class="btn btn-primary" id="add-root-btn">
              <i class="icon-person"></i> Add Root Person
            </button>
            <button class="btn btn-secondary" id="add-parents-btn">
              <i class="icon-parents"></i> Add Parents
            </button>
            <button class="btn btn-secondary" id="add-spouse-btn">
              <i class="icon-spouse"></i> Add Spouse
            </button>
            <button class="btn btn-secondary" id="add-child-btn">
              <i class="icon-child"></i> Add Child
            </button>
          </div>
        </div>
        <div class="status-container" id="status-container"></div>
      </div>
    `;
  }

  bindEvents() {
    const personSelect = document.getElementById("person-select");
    if (personSelect) {
      personSelect.addEventListener(
        "change",
        this.handlePersonSelect.bind(this)
      );
    }
    const addRootBtn = document.getElementById("add-root-btn");
    if (addRootBtn) {
      addRootBtn.addEventListener("click", this.handleAddRootPerson.bind(this));
    }
    const addParentsBtn = document.getElementById("add-parents-btn");
    if (addParentsBtn) {
      addParentsBtn.addEventListener("click", this.handleAddParents.bind(this));
    }
    const addSpouseBtn = document.getElementById("add-spouse-btn");
    if (addSpouseBtn) {
      addSpouseBtn.addEventListener("click", this.handleAddSpouse.bind(this));
    }
    const addChildBtn = document.getElementById("add-child-btn");
    if (addChildBtn) {
      addChildBtn.addEventListener("click", this.handleAddChild.bind(this));
    }
  }

  updatePersonSelector() {
    if (!this.store) return;
    const personSelect = document.getElementById("person-select");
    if (!personSelect) return;
    const data = this.store.getData();
    const currentValue = personSelect.value;
    personSelect.innerHTML = '<option value="">Choose a person...</option>';
    data.forEach((person) => {
      const option = document.createElement("option");
      option.value = person.id;
      option.textContent =
        `${person.data["first name"] || ""} ${
          person.data["last name"] || ""
        }`.trim() || "Unnamed Person";
      personSelect.appendChild(option);
    });
    if (currentValue && data.find((p) => p.id === currentValue)) {
      personSelect.value = currentValue;
    } else if (data.length === 1) {
      personSelect.value = data[0].id;
      this.currentPerson = data[0];
    }
    this.updateRelationshipActions();
    this.updateHeaderDesc();
  }

  updateRelationshipActions() {
    const actionsContainer = document.getElementById("relationship-actions");
    if (!actionsContainer) return;
    if (!this.store || this.store.getData().length === 0) {
      actionsContainer.innerHTML =
        '<p class="no-actions">No people in the tree. Please add the root person first.</p>';
      return;
    }
    if (!this.currentPerson) {
      actionsContainer.innerHTML =
        '<p class="no-actions">Select a person to add relatives.</p>';
      return;
    }
    const actions = [];
    if (!this.currentPerson.rels.father) {
      actions.push({
        type: "father",
        label: this.options.addRelLabels.father,
        icon: "icon-male",
      });
    }
    if (!this.currentPerson.rels.mother) {
      actions.push({
        type: "mother",
        label: this.options.addRelLabels.mother,
        icon: "icon-female",
      });
    }
    if (
      !this.currentPerson.rels.spouses ||
      this.currentPerson.rels.spouses.length === 0
    ) {
      actions.push({
        type: "spouse",
        label: this.options.addRelLabels.spouse,
        icon: "icon-spouse",
      });
    }
    if (
      !this.currentPerson.rels.children ||
      this.currentPerson.rels.children.length === 0
    ) {
      actions.push({
        type: "son",
        label: this.options.addRelLabels.son,
        icon: "icon-male",
      });
      actions.push({
        type: "daughter",
        label: this.options.addRelLabels.daughter,
        icon: "icon-female",
      });
    }
    if (actions.length === 0) {
      actionsContainer.innerHTML =
        '<p class="no-actions">All relationships are already set for this person.</p>';
    } else {
      actionsContainer.innerHTML = `
        <h3>Add Relationship</h3>
        <div class="relationship-buttons">
          ${actions
            .map(
              (action) => `
            <button class="btn btn-outline" data-relationship="${action.type}">
              <i class="${action.icon}"></i> ${action.label}
            </button>
          `
            )
            .join("")}
        </div>
      `;
      actionsContainer
        .querySelectorAll("[data-relationship]")
        .forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const relationship = e.target.closest("[data-relationship]").dataset
              .relationship;
            this.handleAddRelationship(relationship);
          });
        });
    }
  }

  updateHeaderDesc() {
    const desc = document.getElementById("afm-header-desc");
    if (!this.store || this.store.getData().length === 0) {
      desc.textContent =
        'No people in the tree. Click "Add Root Person" to start.';
    } else if (!this.currentPerson) {
      desc.textContent = "Select a person and choose a relationship to add.";
    } else {
      desc.textContent = `Selected: ${
        this.currentPerson.data["first name"] || ""
      } ${this.currentPerson.data["last name"] || ""}`;
    }
  }

  handlePersonSelect(event) {
    const personId = event.target.value;
    if (!personId) {
      this.currentPerson = null;
      this.updateRelationshipActions();
      this.updateHeaderDesc();
      return;
    }
    this.currentPerson = this.store.getDatum(personId);
    this.updateRelationshipActions();
    this.updateHeaderDesc();
    this.showStatus(
      `Selected: ${this.currentPerson.data["first name"]} ${this.currentPerson.data["last name"]}`,
      "info"
    );
  }

  handleAddRelationship(relationshipType) {
    if (!this.currentPerson) {
      this.showStatus("Please select a person first", "error");
      return;
    }
    try {
      this.addRelativeInstance.activate(this.currentPerson);
      const data = this.store.getData();
      const newPerson = data.find(
        (p) =>
          p._new_rel_data &&
          p._new_rel_data.rel_type === relationshipType &&
          p._new_rel_data.rel_id === this.currentPerson.id
      );
      if (newPerson) {
        this.openPersonForm(newPerson);
      } else {
        this.showStatus("Error: Could not create relationship", "error");
      }
    } catch (error) {
      this.showStatus(`Error adding relationship: ${error.message}`, "error");
    }
  }

  openPersonForm(person) {
    const formCreator = createForm({
      datum: person,
      store: this.store,
      fields: this.options.fields,
      postSubmit: this.handleFormSubmit.bind(this),
      addRelative: this.addRelativeInstance,
      removeRelative: this.removeRelativeInstance,
      deletePerson: this.handleDeletePerson.bind(this),
      onCancel: this.handleFormCancel.bind(this),
      editFirst: true,
      getKinshipInfo: null,
      onFormCreation: null,
    });
    const formContainer = formInfoSetup(
      formCreator,
      this.handleFormClose.bind(this)
    );
    this.createModal(formContainer, person);
  }

  createModal(content, person = null) {
    const existingModal = document.querySelector(".family-member-modal");
    if (existingModal) existingModal.remove();
    const modal = document.createElement("div");
    modal.className = "family-member-modal";
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${
            this.isAddingRoot ? "Add Root Person" : "Add Family Member"
          }</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;
    modal.querySelector(".modal-body").appendChild(content);
    document.body.appendChild(modal);
    modal.querySelector(".modal-close").addEventListener("click", () => {
      this.closeModal();
    });
    if (this.options.modal_backdrop) {
      modal.querySelector(".modal-backdrop").addEventListener("click", () => {
        this.closeModal();
      });
    }
    setTimeout(() => modal.classList.add("show"), 10);
    // Attach person id to form for update
    if (person) {
      const form = modal.querySelector("form");
      if (form) form.dataset.personId = person.id;
    }
  }

  closeModal() {
    const modal = document.querySelector(".family-member-modal");
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    }
    this.isAddingRoot = false;
  }

  handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const personData = {};
    this.options.fields.forEach((field) => {
      personData[field.id] = formData.get(field.id) || "";
    });
    const personId = event.target.closest("form").dataset.personId;
    let person = this.store.getDatum(personId);
    if (person) {
      Object.assign(person.data, personData);

      // Handle relationship establishment
      if (person._new_rel_data) {
        const relType = person._new_rel_data.rel_type;
        const relId = person._new_rel_data.rel_id;
        const relatedPerson = this.store.getDatum(relId);

        if (relatedPerson) {
          // Establish the relationship based on type
          if (relType === "father") {
            relatedPerson.rels.father = person.id;
            person.rels.children = person.rels.children || [];
            if (!person.rels.children.includes(relatedPerson.id)) {
              person.rels.children.push(relatedPerson.id);
            }
          } else if (relType === "mother") {
            relatedPerson.rels.mother = person.id;
            person.rels.children = person.rels.children || [];
            if (!person.rels.children.includes(relatedPerson.id)) {
              person.rels.children.push(relatedPerson.id);
            }
          } else if (relType === "spouse") {
            relatedPerson.rels.spouses = relatedPerson.rels.spouses || [];
            person.rels.spouses = person.rels.spouses || [];
            if (!relatedPerson.rels.spouses.includes(person.id)) {
              relatedPerson.rels.spouses.push(person.id);
            }
            if (!person.rels.spouses.includes(relatedPerson.id)) {
              person.rels.spouses.push(relatedPerson.id);
            }
          } else if (relType === "son" || relType === "daughter") {
            person.rels.children = person.rels.children || [];
            if (!person.rels.children.includes(relatedPerson.id)) {
              person.rels.children.push(relatedPerson.id);
            }
            if (relType === "son") {
              relatedPerson.rels.father = person.id;
            } else {
              relatedPerson.rels.mother = person.id;
            }
          }
        }

        // Remove the temporary relationship data
        delete person._new_rel_data;
      }

      this.store.updateTree({});
      this.closeModal();
      this.updatePersonSelector();
      if (this.options.onPersonAdded) {
        this.options.onPersonAdded(person);
      }
      this.showStatus("Family member added successfully!", "success");
      // Auto-select the new person
      this.currentPerson = person;
      this.updatePersonSelector();
      if (this.chart) this.chart.render();
    } else if (this.isAddingRoot) {
      // Add root person if tree is empty
      const newPerson = {
        id: this.generateId(),
        data: personData,
        rels: { father: null, mother: null, spouses: [], children: [] },
      };
      this.store.getData().push(newPerson);
      this.store.updateTree({});
      this.closeModal();
      this.updatePersonSelector();
      if (this.options.onPersonAdded) {
        this.options.onPersonAdded(newPerson);
      }
      this.showStatus("Root person added successfully!", "success");
      // Auto-select the new root
      this.currentPerson = newPerson;
      this.updatePersonSelector();
      if (this.chart) this.chart.render();
    }
  }

  handleFormCancel() {
    this.closeModal();
    this.showStatus("Operation cancelled", "info");
  }

  handleFormClose() {
    this.closeModal();
  }

  handleDeletePerson(person) {
    if (confirm("Are you sure you want to delete this person?")) {
      const data = this.store.getData();
      const index = data.findIndex((p) => p.id === person.id);
      if (index > -1) {
        data.splice(index, 1);
        this.store.updateTree({});
        this.updatePersonSelector();
        if (this.options.onPersonDeleted) {
          this.options.onPersonDeleted(person);
        }
        this.showStatus("Person deleted successfully", "success");
        // If deleted person was selected, clear selection
        if (this.currentPerson && this.currentPerson.id === person.id) {
          this.currentPerson = null;
          this.updatePersonSelector();
        }
        if (this.chart) this.chart.render();
      }
    }
  }

  handleAddRootPerson() {
    if (!this.store) {
      this.showStatus("Store not initialized", "error");
      return;
    }
    const data = this.store.getData();
    if (data.length > 0) {
      this.showStatus(
        "Root already exists. Select a person to add relatives.",
        "info"
      );
      return;
    }
    // Show root person form
    this.isAddingRoot = true;
    const rootDatum = {
      id: "",
      data: {},
      rels: { father: null, mother: null, spouses: [], children: [] },
    };
    const formCreator = createForm({
      datum: rootDatum,
      store: this.store,
      fields: this.options.fields,
      postSubmit: this.handleFormSubmit.bind(this),
      addRelative: this.addRelativeInstance,
      removeRelative: this.removeRelativeInstance,
      deletePerson: null,
      onCancel: this.handleFormCancel.bind(this),
      editFirst: true,
      getKinshipInfo: null,
      onFormCreation: null,
    });
    const formContainer = formInfoSetup(
      formCreator,
      this.handleFormClose.bind(this)
    );
    this.createModal(formContainer);
  }

  handleAddParents() {
    if (!this.currentPerson) {
      this.showStatus("Please select a person first", "error");
      return;
    }
    this.handleAddRelationship("father");
    setTimeout(() => {
      this.handleAddRelationship("mother");
    }, 100);
  }

  handleAddSpouse() {
    if (!this.currentPerson) {
      this.showStatus("Please select a person first", "error");
      return;
    }
    this.handleAddRelationship("spouse");
  }

  handleAddChild() {
    if (!this.currentPerson) {
      this.showStatus("Please select a person first", "error");
      return;
    }
    this.handleAddRelationship("son");
  }

  showStatus(message, type = "info") {
    const container = document.getElementById("status-container");
    if (!container) return;
    const statusDiv = document.createElement("div");
    statusDiv.className = `status status-${type}`;
    statusDiv.textContent = message;
    container.appendChild(statusDiv);
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.parentNode.removeChild(statusDiv);
      }
    }, 5000);
  }

  update() {
    this.updatePersonSelector();
    if (this.chart) this.chart.render();
  }

  destroy() {
    this.closeModal();
    this.container.innerHTML = "";
    this.isInitialized = false;
  }

  generateId() {
    return "id_" + Math.random().toString(36).substr(2, 9);
  }
}
