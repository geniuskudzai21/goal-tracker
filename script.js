// Data Models
let goals = [];
let notes = [];
let rules = [];
let projects = [];
let quotes = [];
let skills = [];
let currentMotivationIndex = 0;
let motivationInterval;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const pageContents = document.querySelectorAll('.page-content');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize dashboard
    updateDashboard();
    updateGoalsList();
    updateNotesList();
    updateRulesList();
    updateProjectsList();
    updateQuotesList();
    
    // Start motivation rotation
    startMotivationRotation();

    // Initialize animations
    initializeAnimations();

    // Show dashboard by default
    showPage('dashboard');
});

// Load data from localStorage
function loadData() {
    // Load goals
    const storedGoals = localStorage.getItem('2026-goals');
    if (storedGoals) {
        goals = JSON.parse(storedGoals);
    } else {
        goals = [];
        saveGoals();
    }
    
    // Load notes
    const storedNotes = localStorage.getItem('2026-notes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    } else {
        notes = [];
        saveNotes();
    }
    
    // Load rules
    const storedRules = localStorage.getItem('2026-rules');
    if (storedRules) {
        rules = JSON.parse(storedRules);
    } else {
        rules = [];
        saveRules();
    }
    
    // Load projects
    const storedProjects = localStorage.getItem('2026-projects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
    } else {
        projects = [];
        saveProjects();
    }
    
    // Load quotes
    const storedQuotes = localStorage.getItem('2026-quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        quotes = [];
        saveQuotes();
    }
    
    // Load skills
    const storedSkills = localStorage.getItem('2026-skills');
    if (storedSkills) {
        skills = JSON.parse(storedSkills);
    } else {
        skills = [];
        saveSkills();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected page
            showPage(page);
        });
    });
    
    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Buttons
    document.getElementById('add-goal-btn')?.addEventListener('click', () => openModal('goal'));
    document.getElementById('add-goal-page-btn')?.addEventListener('click', () => openModal('goal'));
    document.getElementById('add-note-btn')?.addEventListener('click', () => openModal('note'));
    document.getElementById('add-rule-btn')?.addEventListener('click', addRule);
    document.getElementById('add-quote-btn')?.addEventListener('click', addQuote);
    document.getElementById('add-project-btn')?.addEventListener('click', () => openModal('project'));
    document.getElementById('add-skill-btn')?.addEventListener('click', () => openModal('skill'));
    
    // Project form submission
    document.getElementById('project-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProject();
    });
    
    // Skill form submission
    document.getElementById('skill-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSkill();
    });
    
    // Project progress slider
    document.getElementById('project-progress')?.addEventListener('input', function() {
        document.getElementById('project-progress-value').textContent = `${this.value}%`;
    });
    document.getElementById('new-quote-btn')?.addEventListener('click', showRandomQuote);
    document.getElementById('refresh-btn')?.addEventListener('click', refreshDashboard);
    
    // Goal form
    document.getElementById('goal-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveGoal();
    });
    
    // Note form
    document.getElementById('note-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveNote();
    });
    
    // Progress slider
    const progressSlider = document.getElementById('goal-progress');
    if (progressSlider) {
        progressSlider.addEventListener('input', function() {
            document.getElementById('progress-value').textContent = `${this.value}%`;
        });
    }
    
    // Goal filter
    const goalFilter = document.getElementById('goal-filter-category');
    if (goalFilter) {
        goalFilter.addEventListener('change', function() {
            updateGoalsList(this.value);
        });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
}

// Show a specific page
function showPage(pageId) {
    // Hide all pages
    pageContents.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        page.classList.add('active');
        
        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
        }
        
        // Refresh data if needed
        if (pageId === 'goals') {
            updateGoalsList();
        } else if (pageId === 'notes') {
            updateNotesList();
        } else if (pageId === 'rules') {
            updateRulesList();
            updateQuotesList();
        } else if (pageId === 'projects') {
            updateProjectsList();
        } else if (pageId === 'skills') {
            updateSkillsList();
        }
    }
}

// Update goals list
function updateGoalsList(filterCategory = 'all') {
    // Update all goals list
    updateGoalListContainer('all-goals-list', filterCategory);
    
    // Update active goals list
    const activeGoals = goals.filter(g => !g.completed);
    updateGoalListContainer('active-goals-list', filterCategory, false);
    
    // Update completed goals list
    const completedGoals = goals.filter(g => g.completed);
    updateGoalListContainer('completed-goals-list', filterCategory, true);
    
    // Update dashboard
    updateDashboard();
}

// Update a specific goal list container
function updateGoalListContainer(containerId, filterCategory = 'all', completed = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let filteredGoals = goals;
    
    // Filter by completion status
    if (completed !== null) {
        filteredGoals = filteredGoals.filter(g => g.completed === completed);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
        filteredGoals = filteredGoals.filter(g => g.category === filterCategory);
    }
    
    if (filteredGoals.length === 0) {
        let message = '';
        if (completed === true) {
            message = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No completed goals yet. Keep working!</p></div>';
        } else if (completed === false) {
            message = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No active goals. Add a new goal to get started!</p></div>';
        } else {
            message = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>No goals found. Add your first goal!</p></div>';
        }
        container.innerHTML = message;
        return;
    }
    
    // Sort by creation date (newest first)
    filteredGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = '';
    filteredGoals.forEach(goal => {
        const goalEl = createGoalElement(goal);
        container.appendChild(goalEl);
    });
}

// Update notes list
function updateNotesList() {
    const notesContainer = document.getElementById('notes-container');
    if (!notesContainer) return;
    
    if (notes.length === 0) {
        notesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>No notes yet. Add your first note!</p></div>';
        return;
    }
    
    // Sort by creation date (newest first)
    const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    notesContainer.innerHTML = '';
    sortedNotes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-card';
        noteEl.setAttribute('data-id', note.id);
        
        const typeColors = {
            idea: '#8b5cf6',
            note: '#3b82f6',
            inspiration: '#10b981',
            reminder: '#f59e0b'
        };
        
        const typeIcons = {
            idea: 'lightbulb',
            note: 'sticky-note',
            inspiration: 'fire',
            reminder: 'bell'
        };
        
        noteEl.innerHTML = `
            <div class="note-title" style="color: ${typeColors[note.type] || '#8b5cf6'}">
                <i class="fas fa-${typeIcons[note.type] || 'sticky-note'}"></i> ${note.title}
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-date">${formatDate(note.createdAt)}</div>
            <div class="note-actions">
                <button class="btn btn-sm" style="background-color: var(--danger); color: white; padding: 4px 8px;" onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        notesContainer.appendChild(noteEl);
    });
}

// Update rules list
function updateRulesList() {
    const rulesContainer = document.getElementById('rules-container');
    if (!rulesContainer) return;
    
    if (rules.length === 0) {
        rulesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-book"></i><p>No rules yet. Add your first rule!</p></div>';
        return;
    }
    
    rulesContainer.innerHTML = '';
    rules.forEach(rule => {
        const ruleEl = document.createElement('div');
        ruleEl.className = 'rule-item';
        ruleEl.setAttribute('data-id', rule.id);
        
        ruleEl.innerHTML = `
            <div class="rule-icon">
                <i class="fas fa-${rule.icon || 'star'}"></i>
            </div>
            <div class="rule-content">
                <h4>${rule.title}</h4>
                <p>${rule.content}</p>
            </div>
            <div style="margin-left: auto;">
                <button class="btn btn-sm" style="background-color: var(--danger); color: white;" onclick="deleteRule(${rule.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        rulesContainer.appendChild(ruleEl);
    });
}

// Update projects list
function updateProjectsList() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-project-diagram"></i><p>No projects yet. Add your first project!</p></div>';
        return;
    }
    
    projectsContainer.innerHTML = '';
    projects.forEach(project => {
        const projectEl = document.createElement('div');
        projectEl.className = 'project-card';
        projectEl.setAttribute('data-id', project.id);
        
        const statusClass = `status-${project.status}`;
        const statusText = project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        projectEl.innerHTML = `
            <div class="project-actions">
                <button class="project-action-btn update-btn" onclick="updateProject(${project.id})" title="Update Project">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="project-action-btn delete-btn" onclick="deleteProject(${project.id})" title="Delete Project">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="project-status ${statusClass}">${statusText}</div>
            <h4 style="margin-bottom: 10px; font-weight: 600;">${project.title}</h4>
            <p style="color: var(--text-muted); margin-bottom: 15px;">${project.description}</p>
            <div class="progress-container">
                <div class="progress-info">
                    <span>${project.progress}% complete</span>
                    <span>${project.deadline ? `Due: ${formatDate(new Date(project.deadline))}` : 'No deadline'}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
            </div>
        `;
        
        projectsContainer.appendChild(projectEl);
    });
}

// Update quotes list
function updateQuotesList() {
    const quotesContainer = document.getElementById('quotes-container');
    if (!quotesContainer) return;
    
    if (quotes.length === 0) {
        quotesContainer.innerHTML = '<div class="empty-state"><i class="fas fa-quote-right"></i><p>No quotes yet. Add your first quote!</p></div>';
        return;
    }
    
    quotesContainer.innerHTML = '';
    quotes.forEach(quote => {
        const quoteEl = document.createElement('div');
        quoteEl.className = 'note-card';
        quoteEl.setAttribute('data-id', quote.id);
        
        quoteEl.innerHTML = `
            <div class="note-content" style="font-style: italic; margin-bottom: 10px;">"${quote.content}"</div>
            <div class="note-date" style="text-align: right;">— ${quote.author}</div>
            <div class="note-actions">
                <button class="btn btn-sm" style="background-color: var(--danger); color: white; padding: 4px 8px;" onclick="deleteQuote(${quote.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        quotesContainer.appendChild(quoteEl);
    });
}

// Update skills list
function updateSkillsList() {
    const skillsContainer = document.getElementById('skills-list');
    if (!skillsContainer) return;
    
    if (skills.length === 0) {
        skillsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px 0;"><i class="fas fa-trophy"></i> No skills yet</p>';
        return;
    }
    
    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
        const skillEl = document.createElement('div');
        skillEl.className = 'skill-item';
        skillEl.setAttribute('data-id', skill.id);
        
        const categoryLabels = {
            'tech': 'Tech',
            'language': 'Lang',
            'soft-skills': 'Skills',
            'creative': 'Creative',
            'other': 'Other'
        };
        
        const proficiencyColors = {
            'beginner': '#f59e0b',
            'intermediate': '#3b82f6',
            'advanced': '#10b981',
            'expert': '#8b5cf6'
        };
        
        const categoryLabel = categoryLabels[skill.category] || skill.category;
        const proficiencyColor = proficiencyColors[skill.proficiency] || '#6b7280';
        
        skillEl.innerHTML = `
            <div class="skill-header">
                <h4 class="skill-name">${skill.name}</h4>
                <span class="skill-category" style="background-color: ${proficiencyColor}; color: white;">
                    ${skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
                </span>
            </div>
            <div class="skill-meta">
                <span style="background-color: rgba(109, 40, 217, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">${categoryLabel}</span>
                <span class="skill-date"><i class="fas fa-calendar" style="font-size: 0.8rem;"></i> ${formatDate(skill.learnedDate)}</span>
            </div>
            ${skill.notes ? `
                <div class="skill-notes" style="font-size: 0.85rem; color: var(--text-muted); margin: 8px 0; padding: 8px; background-color: rgba(0,0,0,0.05); border-radius: 4px; border-left: 3px solid ${proficiencyColor};">
                    <i class="fas fa-sticky-note" style="margin-right: 5px;"></i>${skill.notes}
                </div>
            ` : ''}
            ${skill.progress !== undefined ? `
                <div class="skill-progress" style="margin: 10px 0;">
                    <div class="progress-info">
                        <span>Progress: ${skill.progress}%</span>
                        <span>${skill.progress === 100 ? 'Completed' : 'In Progress'}</span>
                    </div>
                    <div class="progress-bar" style="background-color: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${skill.progress}%; background-color: ${proficiencyColor}; height: 100%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            ` : ''}
            <div class="skill-actions" style="display: flex; gap: 8px;">
                <button class="btn btn-sm" style="background-color: var(--primary); color: white; padding: 6px 10px; font-size: 0.85rem; flex: 1;" onclick="updateSkillProgress(${skill.id})" title="Update Progress">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" style="background-color: var(--danger); color: white; padding: 6px 10px; font-size: 0.85rem; flex: 1;" onclick="deleteSkill(${skill.id})" title="Delete Skill">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        skillsContainer.appendChild(skillEl);
    });
}

// Open modal
function openModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    if (modal) {
        modal.style.display = 'flex';

        if (type === 'goal') {
            // Set current date as default for deadline
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('goal-deadline').value = `${year}-${month}-${day}`;
        } else if (type === 'project') {
            // Reset form and set default values for project modal
            document.getElementById('project-form').reset();
            document.getElementById('project-progress').value = 0;
            document.getElementById('project-progress-value').textContent = '0%';
        } else if (type === 'skill') {
            // Reset form and set today's date as default
            document.getElementById('skill-form').reset();
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('skill-date').value = `${year}-${month}-${day}`;
        }
    }
}

// Update skill progress
function updateSkillProgress(id) {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;
    
    const newProgress = prompt(`Update progress for "${skill.name}" (0-100%):`, skill.progress || 0);
    if (newProgress === null) return;
    
    const progressNum = parseInt(newProgress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        alert("Please enter a valid number between 0 and 100");
        return;
    }
    
    skill.progress = progressNum;
    
    saveSkills();
    updateSkillsList();
    updateDashboard();
    showNotification(`Progress updated for "${skill.name}"!`);
}

// Open skill modal for editing
function openSkillModalForEdit(skill) {
    const modal = document.getElementById('skill-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    // Pre-fill form with existing data
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-category').value = skill.category;
    document.getElementById('skill-proficiency').value = skill.proficiency;
    document.getElementById('skill-notes').value = skill.notes || '';
    
    // Format date for input
    const date = new Date(skill.learnedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    document.getElementById('skill-date').value = `${year}-${month}-${day}`;
    
    // Change modal title and button text
    document.querySelector('#skill-modal .modal-title').textContent = 'Update Skill';
    document.querySelector('#skill-form button[type="submit"]').textContent = 'Update Skill';
    
    // Remove existing event listeners and add new one for updating
    const form = document.getElementById('skill-form');
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateSkill(skill.id);
    });
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    // Reset forms and modal titles
    document.getElementById('goal-form')?.reset();
    document.getElementById('note-form')?.reset();
    document.getElementById('project-form')?.reset();
    document.getElementById('skill-form')?.reset();
    document.getElementById('progress-value').textContent = '0%';
    document.getElementById('project-progress-value').textContent = '0%';
    
    // Reset modal titles
    document.querySelector('#goal-modal .modal-title').textContent = 'Add New Goal';
    document.querySelector('#goal-form button[type="submit"]').textContent = 'Save Goal';
    
    document.querySelector('#note-modal .modal-title').textContent = 'Add Note or Idea';
    document.querySelector('#note-form button[type="submit"]').textContent = 'Save Note';
    
    document.querySelector('#project-modal .modal-title').textContent = 'Add New Project';
    document.querySelector('#project-form button[type="submit"]').textContent = 'Save Project';
    
    document.querySelector('#skill-modal .modal-title').textContent = 'Add New Skill';
    document.querySelector('#skill-form button[type="submit"]').textContent = 'Save Skill';
    
    // Reset event listeners for skill form
    const skillForm = document.getElementById('skill-form');
    const newSkillForm = skillForm.cloneNode(true);
    skillForm.parentNode.replaceChild(newSkillForm, skillForm);
    
    newSkillForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSkill();
    });
}

// Save goal
function saveGoal() {
    const title = document.getElementById('goal-title').value;
    const description = document.getElementById('goal-description').value;
    const category = document.getElementById('goal-category').value;
    const progress = parseInt(document.getElementById('goal-progress').value);
    const deadline = document.getElementById('goal-deadline').value;
    
    const newGoal = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        progress: progress,
        completed: progress === 100,
        createdAt: new Date(),
        deadline: deadline || null
    };
    
    goals.push(newGoal);
    saveGoals();
    updateGoalsList();
    closeModal();
    showNotification('Goal added successfully!');
}

// Save note
function saveNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const type = document.getElementById('note-type').value;
    
    const newNote = {
        id: Date.now(),
        title: title,
        content: content,
        type: type,
        createdAt: new Date()
    };
    
    notes.push(newNote);
    saveNotes();
    updateNotesList();
    closeModal();
    showNotification('Note saved successfully!');
}

// Add rule
function addRule() {
    const title = prompt('Enter rule title:');
    if (!title) return;
    
    const content = prompt('Enter rule description:');
    if (!content) return;
    
    const icons = ['star', 'check-circle', 'brain', 'heart', 'clock', 'sun', 'moon', 'book', 'running', 'dumbbell'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    const newRule = {
        id: Date.now(),
        title: title,
        content: content,
        icon: randomIcon
    };
    
    rules.push(newRule);
    saveRules();
    updateRulesList();
    showNotification('Rule added successfully!');
}

// Add quote
function addQuote() {
    const content = prompt('Enter the quote:');
    if (!content) return;
    
    const author = prompt('Enter the author:');
    if (!author) return;
    
    const newQuote = {
        id: Date.now(),
        content: content,
        author: author
    };
    
    quotes.push(newQuote);
    saveQuotes();
    updateQuotesList();
    showNotification('Quote added successfully!');
}

// Save project from modal form
function saveProject() {
    const title = document.getElementById('project-title').value;
    const description = document.getElementById('project-description').value;
    const status = document.getElementById('project-status').value;
    const progress = parseInt(document.getElementById('project-progress').value);
    const deadline = document.getElementById('project-deadline').value;

    if (!title) {
        showNotification('Please enter a project title', 'error');
        return;
    }

    const newProject = {
        id: Date.now(),
        title: title,
        description: description,
        status: status,
        progress: progress,
        deadline: deadline || null
    };

    projects.push(newProject);
    saveProjects();
    updateProjectsList();
    closeModal();
    showNotification('Project added successfully!');
}

// Save skill
function saveSkill() {
    const name = document.getElementById('skill-name').value;
    const category = document.getElementById('skill-category').value;
    const proficiency = document.getElementById('skill-proficiency').value;
    const date = document.getElementById('skill-date').value;

    if (!name || !date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const newSkill = {
        id: Date.now(),
        name: name,
        category: category,
        proficiency: proficiency,
        learnedDate: new Date(date),
        progress: 0, // Start with 0% progress
        description: `${name} - ${proficiency.charAt(0).toUpperCase() + proficiency.slice(1)} level`
    };

    skills.push(newSkill);
    saveSkills();
    updateSkillsList();
    updateDashboard();
    closeModal();
    showNotification(`Skill "${name}" added successfully!`);
}

// Update existing skill
function updateSkill(id) {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;
    
    const name = document.getElementById('skill-name').value;
    const category = document.getElementById('skill-category').value;
    const proficiency = document.getElementById('skill-proficiency').value;
    const date = document.getElementById('skill-date').value;
    const notes = document.getElementById('skill-notes').value;

    if (!name || !date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    skill.name = name;
    skill.category = category;
    skill.proficiency = proficiency;
    skill.learnedDate = new Date(date);
    skill.notes = notes || null;
    skill.description = `${name} - ${proficiency.charAt(0).toUpperCase() + proficiency.slice(1)} level`;
    
    saveSkills();
    updateSkillsList();
    updateDashboard();
    closeModal();
    showNotification(`Skill "${name}" updated successfully!`);
}

// Update goal progress
function updateGoalProgress(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const newProgress = prompt(`Update progress for "${goal.title}" (0-100%):`, goal.progress);
    if (newProgress === null) return;
    
    const progressNum = parseInt(newProgress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        alert("Please enter a valid number between 0 and 100");
        return;
    }
    
    goal.progress = progressNum;
    goal.completed = progressNum === 100;
    
    saveGoals();
    updateGoalsList();
    showNotification(`Progress updated for "${goal.title}"!`);
}

// Toggle goal completion
function toggleGoalCompletion(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    goal.completed = !goal.completed;
    goal.progress = goal.completed ? 100 : Math.min(goal.progress, 99);
    
    saveGoals();
    updateGoalsList();
    
    const action = goal.completed ? "completed" : "reopened";
    showNotification(`"${goal.title}" ${action}!`);
}

// Delete goal
function deleteGoal(id) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    const goal = goals.find(g => g.id === id);
    goals = goals.filter(g => g.id !== id);
    
    saveGoals();
    updateGoalsList();
    showNotification(`"${goal.title}" has been deleted.`);
}

// Delete note
function deleteNote(id) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    const note = notes.find(n => n.id === id);
    notes = notes.filter(n => n.id !== id);
    
    saveNotes();
    updateNotesList();
    showNotification(`Note has been deleted.`);
}

// Delete rule
function deleteRule(id) {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    rules = rules.filter(r => r.id !== id);
    
    saveRules();
    updateRulesList();
    showNotification(`Rule has been deleted.`);
}

// Delete project
function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    projects = projects.filter(p => p.id !== id);
    
    saveProjects();
    updateProjectsList();
    showNotification(`Project has been deleted.`);
}

// Delete quote
function deleteQuote(id) {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    
    quotes = quotes.filter(q => q.id !== id);
    
    saveQuotes();
    updateQuotesList();
    showNotification(`Quote has been deleted.`);
}

// Delete skill
function deleteSkill(id) {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    
    skills = skills.filter(s => s.id !== id);
    
    saveSkills();
    updateSkillsList();
    updateDashboard();
    showNotification(`Skill has been deleted.`);
}

// Update project
function updateProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    const newProgress = prompt(`Update progress for "${project.title}" (0-100%):`, project.progress);
    if (newProgress === null) return;
    
    const progressNum = parseInt(newProgress);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
        alert("Please enter a valid number between 0 and 100");
        return;
    }
    
    project.progress = progressNum;
    
    if (progressNum === 100) {
        project.status = 'completed';
    } else if (progressNum > 0) {
        project.status = 'in-progress';
    } else {
        project.status = 'planning';
    }
    
    saveProjects();
    updateProjectsList();
    showNotification(`Project updated!`);
}

// Show random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        showNotification("No quotes available. Add some quotes first!");
        return;
    }
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    alert(`"${randomQuote.content}"\n\n— ${randomQuote.author}`);
}

// Refresh dashboard
function refreshDashboard() {
    updateDashboard();
    showNotification('Dashboard refreshed!');
}

// Update dashboard
function updateDashboard() {
    // Update stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const totalProgress = goals.length > 0 
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) 
        : 0;
    
    // Update project stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Update skills stats
    const totalSkills = skills.length;
    const completedSkills = skills.filter(s => s.progress === 100).length;
    
    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('completed-goals').textContent = completedGoals;
    document.getElementById('progress-percentage').textContent = `${totalProgress}%`;
    document.getElementById('total-ideas').textContent = notes.length;
    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('completed-projects').textContent = completedProjects;
    document.getElementById('learnt-skills').textContent = completedSkills;
    document.getElementById('total-skills').textContent = totalSkills;
    
    // Update recent goals
    updateCompletedSkills();
    updateRecentGoals();
}

// Update completed skills section
function updateCompletedSkills() {
    const completedSkillsContainer = document.getElementById('completed-skills-section');
    if (!completedSkillsContainer) return;
    
    const completedSkills = skills.filter(s => s.progress === 100);
    
    if (completedSkills.length === 0) {
        completedSkillsContainer.innerHTML = `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-trophy"></i> Completed Skills</h3>
                </div>
                <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                    <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>No completed skills yet. Keep learning!</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort by completion date (most recent first)
    const sortedCompletedSkills = [...completedSkills].sort((a, b) => new Date(b.learnedDate) - new Date(a.learnedDate));
    
    completedSkillsContainer.innerHTML = `
        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-trophy"></i> Completed Skills (${completedSkills.length})</h3>
            </div>
            <div class="completed-skills-grid" style="display: grid; gap: 15px;">
                ${sortedCompletedSkills.map(skill => `
                    <div class="skill-item completed-skill" style="border-left: 4px solid #10b981; padding: 15px; background-color: rgba(16, 185, 129, 0.05); border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <h4 style="margin: 0; color: #10b981; font-weight: 600;">${skill.name}</h4>
                            <span style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">
                                <i class="fas fa-check"></i> Completed
                            </span>
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">${skill.description || ''}</div>
                        <div style="display: flex; gap: 10px; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
                            <span style="background-color: rgba(109, 40, 217, 0.2); padding: 2px 6px; border-radius: 4px; font-weight: 500;">
                                ${skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                            </span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(skill.learnedDate)}</span>
                            <span style="background-color: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
                                ${skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Update recent goals
function updateRecentGoals() {
    const recentGoalsContainer = document.getElementById('recent-goals');
    if (!recentGoalsContainer) return;
    
    // Get 3 most recent goals
    const recentGoals = [...goals]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    
    if (recentGoals.length === 0) {
        recentGoalsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>No goals yet. Add your first goal!</p></div>';
        return;
    }
    
    recentGoalsContainer.innerHTML = '';
    recentGoals.forEach(goal => {
        const goalEl = createGoalElement(goal, true);
        recentGoalsContainer.appendChild(goalEl);
    });
}

// Create goal element
function createGoalElement(goal, isCompact = false) {
    const goalEl = document.createElement('div');
    goalEl.className = 'goal-item';
    goalEl.setAttribute('data-id', goal.id);
    
    // Category color mapping
    const categoryColors = {
        health: '#10b981',
        career: '#8b5cf6',
        education: '#3b82f6',
        finance: '#f59e0b',
        personal: '#ef4444',
        hobbies: '#ec4899'
    };
    
    const categoryNames = {
        health: 'Health & Fitness',
        career: 'Career',
        education: 'Education',
        finance: 'Finance',
        personal: 'Personal Growth',
        hobbies: 'Hobbies'
    };
    
    // Set border color based on category
    goalEl.style.borderLeftColor = categoryColors[goal.category] || '#8b5cf6';
    
    let deadlineHtml = '';
    if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        let deadlineClass = '';
        if (daysUntil < 0) {
            deadlineClass = 'text-danger';
        } else if (daysUntil < 30) {
            deadlineClass = 'text-warning';
        } else {
            deadlineClass = 'text-success';
        }
        
        deadlineHtml = `<div class="progress-info"><span class="${deadlineClass}"><i class="far fa-calendar-alt"></i> ${daysUntil >= 0 ? `${daysUntil} days left` : 'Overdue'}</span></div>`;
    }
    
    const progressBarWidth = goal.completed ? 100 : goal.progress;
    
    if (isCompact) {
        goalEl.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <span class="goal-category">${categoryNames[goal.category]}</span>
            </div>
            <div class="progress-container">
                <div class="progress-info">
                    <span>${progressBarWidth}% complete</span>
                    <span>${goal.completed ? 'Completed' : 'In Progress'}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressBarWidth}%"></div>
                </div>
            </div>
        `;
    } else {
        goalEl.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <span class="goal-category">${categoryNames[goal.category]}</span>
            </div>
            <div class="goal-description">${goal.description || 'No description provided.'}</div>
            <div class="goal-footer">
                <div class="progress-container">
                    <div class="progress-info">
                        <span>${progressBarWidth}% complete</span>
                        <span>${goal.completed ? 'Completed' : 'In Progress'}</span>
                        ${deadlineHtml}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressBarWidth}%"></div>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-sm btn-outline" onclick="updateGoalProgress(${goal.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" style="background-color: ${goal.completed ? 'var(--warning)' : 'var(--secondary)'}; color: white;" onclick="toggleGoalCompletion(${goal.id})">
                        <i class="fas ${goal.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn btn-sm" style="background-color: var(--danger); color: white;" onclick="deleteGoal(${goal.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    return goalEl;
}

// Save data to localStorage
function saveGoals() {
    localStorage.setItem('2026-goals', JSON.stringify(goals));
}

function saveNotes() {
    localStorage.setItem('2026-notes', JSON.stringify(notes));
}

function saveRules() {
    localStorage.setItem('2026-rules', JSON.stringify(rules));
}

function saveProjects() {
    localStorage.setItem('2026-projects', JSON.stringify(projects));
}

function saveQuotes() {
    localStorage.setItem('2026-quotes', JSON.stringify(quotes));
}

function saveSkills() {
    localStorage.setItem('2026-skills', JSON.stringify(skills));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--primary);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
    
    // Add CSS for animations
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Motivation line rotation
function startMotivationRotation() {
    if (quotes.length === 0) return;
    
    // Display first motivation line
    displayMotivation();
    
    // Clear any existing interval
    if (motivationInterval) clearInterval(motivationInterval);
    
    // Rotate every 10 seconds
    motivationInterval = setInterval(displayMotivation, 10000);
}

function displayMotivation() {
    if (quotes.length === 0) return;
    
    const motivationElement = document.getElementById('daily-motivation');
    if (!motivationElement) return;
    
    // Get the current quote from the motivational library
    const currentQuote = quotes[currentMotivationIndex];
    motivationElement.textContent = `"${currentQuote.content}" — ${currentQuote.author}`;
    
    // Move to next quote
    currentMotivationIndex = (currentMotivationIndex + 1) % quotes.length;
}