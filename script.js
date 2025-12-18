/*
 * NovaTask Pro - Modern Task Management System
 * Copyright (c) 2024 Karan Kumar. All rights reserved.
 * Version: 3.0.0
 */

class NovaTaskPro {
    constructor() {
        this.state = {
            tasks: this.loadFromStorage('novaTasks') || [],
            projects: this.loadFromStorage('novaProjects') || this.getDefaultProjects(),
            currentView: 'dashboard',
            currentProject: null,
            currentTaskId: null,
            currentSort: 'dueDate',
            filters: {
                priority: 'all',
                status: 'all',
                project: 'all'
            },
            searchQuery: '',
            selectedColor: '#667eea',
            user: {
                name: 'Karan Kumar',
                email: 'karankrtech@gmail.com',
                theme: localStorage.getItem('novaTheme') || 'light'
            },
            notifications: [
                {
                    id: 1,
                    type: 'warning',
                    title: 'Task Due Soon',
                    message: '"Complete project report" is due tomorrow',
                    time: '2 hours ago',
                    read: false
                },
                {
                    id: 2,
                    type: 'success',
                    title: 'Task Completed',
                    message: '"Buy groceries" marked as completed',
                    time: '5 hours ago',
                    read: true
                },
                {
                    id: 3,
                    type: 'info',
                    title: 'New Project',
                    message: 'New project "Website Redesign" created',
                    time: '1 day ago',
                    read: true
                }
            ]
        };

        this.init();
    }

    init() {
        this.cacheDOM();
        this.setupTheme();
        this.bindEvents();
        this.render();
        this.updateStats();
        this.setupServiceWorker();
    }

    cacheDOM() {
        // Main containers
        this.tasksContainer = document.getElementById('tasksContainer');
        this.projectsList = document.getElementById('projectsList');
        this.emptyState = document.getElementById('emptyState');
        
        // Navigation
        this.navLinks = document.querySelectorAll('.nav-link[data-view]');
        this.viewTitle = document.getElementById('viewTitle');
        this.viewDescription = document.getElementById('viewDescription');
        
        // Stats elements
        this.inboxCount = document.getElementById('inboxCount');
        this.todayCount = document.getElementById('todayCount');
        this.upcomingCount = document.getElementById('upcomingCount');
        this.completedCount = document.getElementById('completedCount');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.overdueTasks = document.getElementById('overdueTasks');
        this.completionRate = document.getElementById('completionRate');
        this.streakCount = document.getElementById('streakCount');
        
        // Search and filter
        this.searchInput = document.getElementById('searchInput');
        this.clearSearch = document.getElementById('clearSearch');
        this.sortBtn = document.getElementById('sortBtn');
        this.filterBtn = document.getElementById('filterBtn');
        this.applyFilterBtn = document.getElementById('applyFilterBtn');
        this.filterPriority = document.getElementById('filterPriority');
        this.filterStatus = document.getElementById('filterStatus');
        this.filterProject = document.getElementById('filterProject');
        
        // Task input
        this.taskInput = document.getElementById('taskInput');
        this.quickAddTaskBtn = document.getElementById('quickAddTaskBtn');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.addFirstTaskBtn = document.getElementById('addFirstTaskBtn');
        
        // Modals
        this.taskModal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
        this.projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
        this.notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
        
        // Task modal elements
        this.modalTaskTitle = document.getElementById('modalTaskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskDueDate = document.getElementById('taskDueDate');
        this.taskPriority = document.getElementById('taskPriority');
        this.taskProject = document.getElementById('taskProject');
        this.taskStatus = document.getElementById('taskStatus');
        this.saveTaskBtn = document.getElementById('saveTaskBtn');
        this.deleteTaskBtn = document.getElementById('deleteTaskBtn');
        
        // Subtasks
        this.subtaskInput = document.getElementById('subtaskInput');
        this.addSubtaskBtn = document.getElementById('addSubtaskBtn');
        this.subtasksContainer = document.getElementById('subtasksContainer');
        this.subtaskCount = document.getElementById('subtaskCount');
        
        // Tags
        this.tagInput = document.getElementById('tagInput');
        this.addTagBtn = document.getElementById('addTagBtn');
        this.tagsContainer = document.getElementById('tagsContainer');
        
        // Project modal
        this.projectName = document.getElementById('projectName');
        this.projectDescription = document.getElementById('projectDescription');
        this.saveProjectBtn = document.getElementById('saveProjectBtn');
        
        // Quick options
        this.quickDate = document.getElementById('quickDate');
        this.quickPriority = document.getElementById('quickPriority');
        this.quickProject = document.getElementById('quickProject');
        
        // View toggle
        this.viewList = document.getElementById('viewList');
        this.viewGrid = document.getElementById('viewGrid');
        this.refreshTasks = document.getElementById('refreshTasks');
        
        // Mobile menu
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        
        // Notifications
        this.notificationBtn = document.getElementById('notificationBtn');
        this.notificationList = document.getElementById('notificationList');
        this.markAllRead = document.getElementById('markAllRead');
        
        // Toast
        this.toast = new bootstrap.Toast(document.getElementById('liveToast'));
        
        // Initialize date inputs
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.taskDueDate.min = today.toISOString().slice(0, 16);
        this.taskDueDate.value = tomorrow.toISOString().slice(0, 16);
    }

    setupTheme() {
        if (this.state.user.theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    bindEvents() {
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value;
            this.debounce(() => this.renderTasks(), 300);
        });
        
        this.clearSearch.addEventListener('click', () => {
            this.searchInput.value = '';
            this.state.searchQuery = '';
            this.renderTasks();
        });

        // Task creation
        this.quickAddTaskBtn.addEventListener('click', () => this.addQuickTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addQuickTask();
        });
        this.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.addFirstTaskBtn.addEventListener('click', () => this.openTaskModal());

        // Task modal
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        this.deleteTaskBtn.addEventListener('click', () => this.deleteTask());

        // Subtasks
        this.addSubtaskBtn.addEventListener('click', () => this.addSubtask());
        this.subtaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addSubtask();
        });

        // Tags
        this.addTagBtn.addEventListener('click', () => this.addTag());
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // Projects
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.projectName.value = '';
            this.projectDescription.value = '';
            this.projectModal.show();
        });
        this.saveProjectBtn.addEventListener('click', () => this.createProject());

        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColor(e));
        });

        // Filters
        this.applyFilterBtn.addEventListener('click', () => this.applyFilters());

        // Sort
        document.querySelectorAll('#sortDropdown .dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleSort(e));
        });

        // Quick actions
        [this.quickDate, this.quickPriority, this.quickProject].forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

        // View toggle
        this.viewList.addEventListener('click', () => this.setViewMode('list'));
        this.viewGrid.addEventListener('click', () => this.setViewMode('grid'));
        this.refreshTasks.addEventListener('click', () => this.refreshTasksList());

        // Mobile menu
        this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        this.sidebarOverlay.addEventListener('click', () => this.toggleMobileMenu());
        this.sidebarClose.addEventListener('click', () => this.toggleMobileMenu());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Notifications
        this.notificationBtn.addEventListener('click', () => this.showNotifications());
        this.markAllRead.addEventListener('click', () => this.markAllNotificationsRead());

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveToStorage());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Initialize dropdowns
        this.initializeDropdowns();
    }

    initializeDropdowns() {
        // Initialize Bootstrap dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const dropdownMenu = this.nextElementSibling;
                dropdownMenu.classList.toggle('show');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    // ====== TASK MANAGEMENT ======
    addQuickTask() {
        const title = this.taskInput.value.trim();
        if (!title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        const task = {
            id: 'task_' + Date.now(),
            title: title,
            description: '',
            dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            priority: 'medium',
            project: 'inbox',
            status: 'pending',
            tags: [],
            subtasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: false
        };

        this.state.tasks.unshift(task);
        this.saveToStorage();
        this.renderTasks();
        this.updateStats();
        this.taskInput.value = '';
        this.showToast('Task added successfully!');
        
        // Open modal for editing
        setTimeout(() => this.openTaskModal(task.id), 500);
    }

    openTaskModal(taskId = null) {
        if (taskId) {
            const task = this.state.tasks.find(t => t.id === taskId);
            if (!task) return;
            
            this.state.currentTaskId = taskId;
            
            // Set form values
            this.modalTaskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.taskDueDate.value = task.dueDate ? this.formatDateForInput(task.dueDate) : '';
            this.taskPriority.value = task.priority;
            this.taskProject.value = task.project;
            this.taskStatus.value = task.status;
            
            // Render subtasks and tags
            this.renderSubtasks(task.subtasks);
            this.renderTags(task.tags);
            
            // Update project dropdown
            this.updateProjectDropdown();
            
            // Set delete button visibility
            this.deleteTaskBtn.style.display = 'block';
        } else {
            this.state.currentTaskId = null;
            this.modalTaskTitle.value = '';
            this.taskDescription.value = '';
            this.taskDueDate.value = '';
            this.taskPriority.value = 'medium';
            this.taskProject.value = this.state.currentProject || 'inbox';
            this.taskStatus.value = 'pending';
            this.subtasksContainer.innerHTML = '';
            this.tagsContainer.innerHTML = '';
            this.updateSubtaskCount();
            this.updateProjectDropdown();
            
            // Hide delete button for new tasks
            this.deleteTaskBtn.style.display = 'none';
        }
        
        this.taskModal.show();
        
        // Focus on title input
        setTimeout(() => {
            this.modalTaskTitle.focus();
        }, 300);
    }

    saveTask() {
        const taskId = this.state.currentTaskId;
        const isNewTask = !taskId;

        const taskData = {
            id: taskId || 'task_' + Date.now(),
            title: this.modalTaskTitle.value.trim(),
            description: this.taskDescription.value.trim(),
            dueDate: this.taskDueDate.value || null,
            priority: this.taskPriority.value,
            project: this.taskProject.value,
            status: this.taskStatus.value,
            tags: this.getCurrentTags(),
            subtasks: this.getCurrentSubtasks(),
            createdAt: isNewTask ? new Date().toISOString() : 
                this.state.tasks.find(t => t.id === taskId)?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completed: this.taskStatus.value === 'completed'
        };

        if (!taskData.title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        if (isNewTask) {
            this.state.tasks.unshift(taskData);
        } else {
            const index = this.state.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.state.tasks[index] = taskData;
            }
        }

        this.saveToStorage();
        this.renderTasks();
        this.updateStats();
        this.taskModal.hide();
        this.showToast(isNewTask ? 'Task created!' : 'Task updated!');
    }

    deleteTask() {
        if (!this.state.currentTaskId) return;
        
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        this.state.tasks = this.state.tasks.filter(task => task.id !== this.state.currentTaskId);
        this.saveToStorage();
        this.renderTasks();
        this.updateStats();
        this.taskModal.hide();
        this.showToast('Task deleted', 'info');
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.state.tasks[taskIndex];
        task.completed = !task.completed;
        task.status = task.completed ? 'completed' : 'pending';
        task.updatedAt = new Date().toISOString();

        // Move task to end if completed, to beginning if not
        this.state.tasks.splice(taskIndex, 1);
        if (task.completed) {
            this.state.tasks.push(task);
        } else {
            this.state.tasks.unshift(task);
        }

        this.saveToStorage();
        this.renderTasks();
        this.updateStats();
        
        const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
        this.showToast(message);
    }

    // ====== SUBTASKS ======
    addSubtask() {
        const title = this.subtaskInput.value.trim();
        if (!title) {
            this.showToast('Please enter a subtask title', 'error');
            return;
        }

        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item fade-in';
        subtaskItem.innerHTML = `
            <input type="checkbox" class="form-check-input subtask-checkbox">
            <span class="subtask-text flex-grow-1">${this.escapeHtml(title)}</span>
            <button class="btn-task-action btn-delete-subtask" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.subtasksContainer.appendChild(subtaskItem);
        this.subtaskInput.value = '';
        this.updateSubtaskCount();

        // Add event listeners
        const checkbox = subtaskItem.querySelector('.subtask-checkbox');
        checkbox.addEventListener('change', function() {
            subtaskItem.classList.toggle('completed', this.checked);
        });

        const deleteBtn = subtaskItem.querySelector('.btn-delete-subtask');
        deleteBtn.addEventListener('click', () => {
            subtaskItem.classList.add('fade-out');
            setTimeout(() => {
                subtaskItem.remove();
                this.updateSubtaskCount();
            }, 300);
        });
        
        // Focus back on input
        this.subtaskInput.focus();
    }

    renderSubtasks(subtasks) {
        this.subtasksContainer.innerHTML = '';
        (subtasks || []).forEach(subtask => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = `subtask-item ${subtask.completed ? 'completed' : ''}`;
            subtaskItem.innerHTML = `
                <input type="checkbox" class="form-check-input subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <span class="subtask-text flex-grow-1">${this.escapeHtml(subtask.title)}</span>
                <button class="btn-task-action btn-delete-subtask" type="button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.subtasksContainer.appendChild(subtaskItem);
            
            // Add event listeners
            const checkbox = subtaskItem.querySelector('.subtask-checkbox');
            checkbox.addEventListener('change', function() {
                subtaskItem.classList.toggle('completed', this.checked);
            });

            const deleteBtn = subtaskItem.querySelector('.btn-delete-subtask');
            deleteBtn.addEventListener('click', () => {
                subtaskItem.classList.add('fade-out');
                setTimeout(() => {
                    subtaskItem.remove();
                    this.updateSubtaskCount();
                }, 300);
            });
        });
        this.updateSubtaskCount();
    }

    getCurrentSubtasks() {
        const subtasks = [];
        this.subtasksContainer.querySelectorAll('.subtask-item').forEach(item => {
            const title = item.querySelector('.subtask-text').textContent;
            const completed = item.querySelector('.subtask-checkbox').checked;
            subtasks.push({ title, completed });
        });
        return subtasks;
    }

    updateSubtaskCount() {
        const count = this.subtasksContainer.children.length;
        this.subtaskCount.textContent = count;
        this.subtaskCount.classList.toggle('badge', count > 0);
    }

    // ====== TAGS ======
    addTag() {
        const tag = this.tagInput.value.trim();
        if (!tag) {
            this.showToast('Please enter a tag', 'error');
            return;
        }

        // Check if tag already exists
        const existingTags = Array.from(this.tagsContainer.querySelectorAll('.tag-item'))
            .map(tagEl => tagEl.textContent.trim());
        
        if (existingTags.includes(tag)) {
            this.showToast('Tag already exists', 'error');
            return;
        }

        const tagElement = document.createElement('span');
        tagElement.className = 'tag-item fade-in';
        tagElement.innerHTML = `
            ${this.escapeHtml(tag)}
            <i class="fas fa-times"></i>
        `;

        this.tagsContainer.appendChild(tagElement);
        this.tagInput.value = '';

        tagElement.querySelector('i').addEventListener('click', () => {
            tagElement.classList.add('fade-out');
            setTimeout(() => {
                tagElement.remove();
            }, 300);
        });
        
        // Focus back on input
        this.tagInput.focus();
    }

    renderTags(tags) {
        this.tagsContainer.innerHTML = '';
        (tags || []).forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${this.escapeHtml(tag)}
                <i class="fas fa-times"></i>
            `;
            this.tagsContainer.appendChild(tagElement);
            
            tagElement.querySelector('i').addEventListener('click', () => {
                tagElement.classList.add('fade-out');
                setTimeout(() => {
                    tagElement.remove();
                }, 300);
            });
        });
    }

    getCurrentTags() {
        const tags = [];
        this.tagsContainer.querySelectorAll('.tag-item').forEach(tag => {
            const text = tag.textContent.trim();
            tags.push(text);
        });
        return tags;
    }

    // ====== PROJECTS ======
    getDefaultProjects() {
        return [
            {
                id: 'inbox',
                name: 'Inbox',
                color: '#667eea',
                description: 'Default tasks folder',
                icon: 'fas fa-inbox'
            },
            {
                id: 'work',
                name: 'Work',
                color: '#4facfe',
                description: 'Work-related tasks',
                icon: 'fas fa-briefcase'
            },
            {
                id: 'personal',
                name: 'Personal',
                color: '#43e97b',
                description: 'Personal tasks',
                icon: 'fas fa-user'
            },
            {
                id: 'shopping',
                name: 'Shopping',
                color: '#fa709a',
                description: 'Shopping list',
                icon: 'fas fa-shopping-cart'
            }
        ];
    }

    createProject() {
        const name = this.projectName.value.trim();
        if (!name) {
            this.showToast('Please enter a project name', 'error');
            return;
        }

        // Check if project already exists
        if (this.state.projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Project already exists', 'error');
            return;
        }

        const project = {
            id: 'project_' + Date.now(),
            name: name,
            description: this.projectDescription.value.trim(),
            color: this.state.selectedColor,
            icon: 'fas fa-folder',
            createdAt: new Date().toISOString()
        };

        this.state.projects.push(project);
        this.saveToStorage();
        this.renderProjects();
        this.projectModal.hide();
        this.showToast('Project created!');
        
        // Switch to the new project
        setTimeout(() => {
            this.handleProjectClick(project.id);
        }, 300);
    }

    renderProjects() {
        this.projectsList.innerHTML = '';
        
        // Update project dropdowns
        const projectSelects = [this.taskProject, this.filterProject];
        projectSelects.forEach(select => {
            if (!select) return;
            
            select.innerHTML = '<option value="all">All Projects</option>';
            this.state.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                if (project.id === (this.state.currentProject || 'inbox')) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        });
        
        // Render project list
        this.state.projects.forEach(project => {
            if (project.id === 'inbox') return;
            
            const taskCount = this.state.tasks.filter(t => t.project === project.id).length;
            
            const projectItem = document.createElement('li');
            projectItem.innerHTML = `
                <a href="#" class="nav-link project-item ${project.id === this.state.currentProject ? 'active' : ''}" 
                   data-project="${project.id}">
                    <i class="${project.icon || 'fas fa-folder'}" style="color: ${project.color}"></i>
                    <span>${project.name}</span>
                    <span class="nav-badge">${taskCount}</span>
                </a>
            `;
            
            projectItem.querySelector('.project-item').addEventListener('click', (e) => {
                e.preventDefault();
                this.handleProjectClick(project.id);
            });
            
            this.projectsList.appendChild(projectItem);
        });
    }

    updateProjectDropdown() {
        const projectSelect = this.taskProject;
        if (!projectSelect) return;
        
        projectSelect.innerHTML = '';
        this.state.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            if (project.id === (this.state.currentProject || 'inbox')) {
                option.selected = true;
            }
            projectSelect.appendChild(option);
        });
    }

    // ====== TASK RENDERING ======
    renderTasks() {
        let filteredTasks = this.filterTasks();
        
        if (filteredTasks.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        // Sort tasks
        filteredTasks.sort((a, b) => this.sortTasks(a, b));
        
        // Render tasks
        this.tasksContainer.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task, index);
            this.tasksContainer.appendChild(taskElement);
        });
    }

    filterTasks() {
        let tasks = [...this.state.tasks];
        
        // Apply view filter
        switch(this.state.currentView) {
            case 'dashboard':
                // Show all tasks for dashboard
                break;
            case 'inbox':
                tasks = tasks.filter(task => task.project === 'inbox');
                break;
            case 'today':
                const today = new Date().toDateString();
                tasks = tasks.filter(task => {
                    if (!task.dueDate) return false;
                    return new Date(task.dueDate).toDateString() === today;
                });
                break;
            case 'upcoming':
                tasks = tasks.filter(task => {
                    if (!task.dueDate) return false;
                    return new Date(task.dueDate) > new Date();
                });
                break;
            case 'completed':
                tasks = tasks.filter(task => task.status === 'completed');
                break;
            case 'project':
                if (this.state.currentProject) {
                    tasks = tasks.filter(task => task.project === this.state.currentProject);
                }
                break;
        }
        
        // Apply search filter
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            tasks = tasks.filter(task => 
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Apply additional filters
        if (this.state.filters.priority !== 'all') {
            tasks = tasks.filter(task => task.priority === this.state.filters.priority);
        }
        if (this.state.filters.status !== 'all') {
            tasks = tasks.filter(task => task.status === this.state.filters.status);
        }
        if (this.state.filters.project !== 'all') {
            tasks = tasks.filter(task => task.project === this.state.filters.project);
        }
        
        return tasks;
    }

    sortTasks(a, b) {
        switch(this.state.currentSort) {
            case 'priority':
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title':
                return a.title.localeCompare(b.title);
            default: // dueDate
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
        }
    }

    createTaskElement(task, index) {
        const project = this.state.projects.find(p => p.id === task.project) || this.state.projects[0];
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const dueDateClass = isOverdue ? 'overdue' : '';
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.status === 'completed' ? 'completed' : ''} fade-in`;
        taskElement.style.animationDelay = `${index * 0.05}s`;
        taskElement.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="form-check-input task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
                <div class="task-content">
                    <h6 class="task-title">${this.escapeHtml(task.title)}</h6>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="task-footer">
                        <span class="task-priority priority-${task.priority}">
                            <i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        ${task.dueDate ? `
                            <span class="task-due-date ${dueDateClass}">
                                <i class="far fa-calendar"></i> ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                        <span class="task-tag" style="border-left: 3px solid ${project.color}">
                            <i class="${project.icon || 'fas fa-folder'}"></i> ${project.name}
                        </span>
                        ${(task.tags || []).slice(0, 2).map(tag => `
                            <span class="task-tag">
                                <i class="fas fa-hashtag"></i> ${this.escapeHtml(tag)}
                            </span>
                        `).join('')}
                        ${(task.tags || []).length > 2 ? `
                            <span class="task-tag">
                                <i class="fas fa-ellipsis-h"></i> +${task.tags.length - 2}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-task-action btn-edit-task" type="button">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-task-action delete btn-delete-task" type="button">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
        
        const editBtn = taskElement.querySelector('.btn-edit-task');
        editBtn.addEventListener('click', () => this.openTaskModal(task.id));
        
        const deleteBtn = taskElement.querySelector('.btn-delete-task');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                this.state.tasks = this.state.tasks.filter(t => t.id !== task.id);
                this.saveToStorage();
                this.renderTasks();
                this.updateStats();
                this.showToast('Task deleted', 'info');
            }
        });
        
        // Add click handler for the whole task (except buttons)
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions') && !e.target.closest('.task-checkbox')) {
                this.openTaskModal(task.id);
            }
        });
        
        return taskElement;
    }

    // ====== VIEW MANAGEMENT ======
    handleNavClick(e) {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        
        // Update active state
        this.navLinks.forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Update view
        this.state.currentView = view;
        this.state.currentProject = null;
        this.updateView();
        
        // Close mobile menu if open
        this.closeMobileMenu();
    }

    handleProjectClick(projectId) {
        this.state.currentView = 'project';
        this.state.currentProject = projectId;
        
        // Update active state
        this.navLinks.forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.project === projectId) {
                item.classList.add('active');
            }
        });
        
        this.updateView();
        this.closeMobileMenu();
    }

    updateView() {
        // Update title and description
        const viewConfig = {
            dashboard: { 
                title: 'Dashboard', 
                desc: 'Welcome back! Here\'s your overview' 
            },
            inbox: { 
                title: 'Inbox', 
                desc: 'All your tasks in one place' 
            },
            today: { 
                title: 'Today', 
                desc: 'Tasks due today' 
            },
            upcoming: { 
                title: 'Upcoming', 
                desc: 'Upcoming tasks' 
            },
            completed: { 
                title: 'Completed', 
                desc: 'Completed tasks' 
            },
            project: { 
                title: this.state.projects.find(p => p.id === this.state.currentProject)?.name || 'Project',
                desc: this.state.projects.find(p => p.id === this.state.currentProject)?.description || ''
            }
        };
        
        const config = viewConfig[this.state.currentView] || viewConfig.dashboard;
        this.viewTitle.textContent = config.title;
        this.viewDescription.textContent = config.desc;
        
        // Show/hide dashboard stats
        const dashboardStats = document.getElementById('dashboardStats');
        if (dashboardStats) {
            dashboardStats.style.display = this.state.currentView === 'dashboard' ? 'grid' : 'none';
        }
        
        this.renderTasks();
    }

    setViewMode(mode) {
        // Update button states
        this.viewList.classList.toggle('active', mode === 'list');
        this.viewGrid.classList.toggle('active', mode === 'grid');
        
        // Update tasks container class
        this.tasksContainer.classList.toggle('grid-view', mode === 'grid');
        
        // Save preference
        localStorage.setItem('novaViewMode', mode);
        
        this.showToast(`Switched to ${mode} view`);
    }

    refreshTasksList() {
        this.renderTasks();
        this.showToast('Tasks refreshed');
        
        // Add rotation animation
        this.refreshTasks.classList.add('loading');
        setTimeout(() => {
            this.refreshTasks.classList.remove('loading');
        }, 1000);
    }

    // ====== STATS ======
    updateStats() {
        const tasks = this.state.tasks;
        const now = new Date();
        const today = new Date().toDateString();
        
        // Count tasks by view
        this.inboxCount.textContent = tasks.filter(t => t.project === 'inbox').length;
        this.todayCount.textContent = tasks.filter(t => 
            t.dueDate && new Date(t.dueDate).toDateString() === today
        ).length;
        this.upcomingCount.textContent = tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) > now && t.status !== 'completed'
        ).length;
        this.completedCount.textContent = tasks.filter(t => t.status === 'completed').length;
        
        // Update main stats
        this.totalTasks.textContent = tasks.length;
        this.completedTasks.textContent = tasks.filter(t => t.status === 'completed').length;
        this.pendingTasks.textContent = tasks.filter(t => t.status !== 'completed').length;
        this.overdueTasks.textContent = tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
        ).length;
        
        // Calculate completion rate
        const completionRate = tasks.length > 0 
            ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
            : 0;
        this.completionRate.textContent = `${completionRate}%`;
        
        // Calculate streak (simplified - completed tasks today)
        const completedToday = tasks.filter(t => 
            t.status === 'completed' && 
            new Date(t.updatedAt).toDateString() === today
        ).length;
        this.streakCount.textContent = completedToday > 0 ? '1' : '0';
        
        // Update notification badge
        const unreadCount = this.state.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    // ====== FILTERS & SORT ======
    applyFilters() {
        this.state.filters = {
            priority: this.filterPriority.value,
            status: this.filterStatus.value,
            project: this.filterProject.value
        };
        this.renderTasks();
        this.showToast('Filters applied');
        
        // Close dropdown
        const dropdown = document.querySelector('#filterDropdown.show');
        if (dropdown) dropdown.classList.remove('show');
    }

    handleSort(e) {
        e.preventDefault();
        this.state.currentSort = e.target.dataset.sort;
        this.renderTasks();
        this.showToast(`Sorted by ${e.target.textContent}`);
        
        // Close dropdown
        const dropdown = document.querySelector('#sortDropdown.show');
        if (dropdown) dropdown.classList.remove('show');
    }

    // ====== UI HELPERS ======
    showEmptyState() {
        this.emptyState.style.display = 'block';
        this.tasksContainer.innerHTML = '';
        this.tasksContainer.appendChild(this.emptyState);
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.querySelector('.toast-body i');
        
        toastMessage.textContent = message;
        
        if (type === 'error') {
            toastTitle.textContent = 'Error';
            toastIcon.className = 'fas fa-exclamation-circle me-3 text-danger fs-5';
        } else if (type === 'info') {
            toastTitle.textContent = 'Info';
            toastIcon.className = 'fas fa-info-circle me-3 text-info fs-5';
        } else {
            toastTitle.textContent = 'Success';
            toastIcon.className = 'fas fa-check-circle me-3 text-success fs-5';
        }
        
        this.toast.show();
    }

    selectColor(e) {
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('active');
        });
        e.target.classList.add('active');
        this.state.selectedColor = e.target.dataset.color;
    }

    handleQuickAction(e) {
        const action = e.currentTarget.dataset.action;
        const messages = {
            date: 'Set due date',
            priority: 'Set priority level',
            project: 'Assign to project'
        };
        
        // Focus on relevant input in task modal
        if (action === 'date' && this.taskDueDate) {
            this.openTaskModal();
            setTimeout(() => {
                this.taskDueDate.focus();
            }, 300);
        }
        
        this.showToast(messages[action] || 'Action triggered', 'info');
    }

    toggleTheme() {
        if (this.state.user.theme === 'light') {
            this.state.user.theme = 'dark';
            document.body.classList.add('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            this.state.user.theme = 'light';
            document.body.classList.remove('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        localStorage.setItem('novaTheme', this.state.user.theme);
        this.showToast(`Switched to ${this.state.user.theme} mode`);
    }

    showNotifications() {
        this.renderNotifications();
        this.notificationModal.show();
    }

    renderNotifications() {
        this.notificationList.innerHTML = '';
        
        this.state.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${!notification.read ? 'unread' : ''}`;
            notificationItem.innerHTML = `
                <i class="fas fa-bell ${notification.type === 'warning' ? 'text-warning' : 
                    notification.type === 'success' ? 'text-success' : 'text-info'}"></i>
                <div class="notification-content">
                    <h6>${notification.title}</h6>
                    <p>${notification.message}</p>
                    <small>${notification.time}</small>
                </div>
            `;
            
            notificationItem.addEventListener('click', () => {
                notification.read = true;
                this.updateStats();
                this.renderNotifications();
            });
            
            this.notificationList.appendChild(notificationItem);
        });
    }

    markAllNotificationsRead() {
        this.state.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateStats();
        this.renderNotifications();
        this.showToast('All notifications marked as read');
    }

    // ====== MOBILE MENU ======
    toggleMobileMenu() {
        this.sidebar.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.sidebar.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleResize() {
        if (window.innerWidth > 992) {
            this.closeMobileMenu();
        }
        
        // Update view mode for mobile
        if (window.innerWidth < 768) {
            this.setViewMode('list');
        }
    }

    // ====== KEYBOARD SHORTCUTS ======
    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + N: New task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openTaskModal();
        }
        
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.searchInput.focus();
        }
        
        // Escape: Close modals/mobile menu
        if (e.key === 'Escape') {
            if (this.sidebar.classList.contains('active')) {
                this.closeMobileMenu();
            }
        }
    }

    // ====== UTILITIES ======
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `${diffDays} days`;
        if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ====== STORAGE ======
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('novaTasks', JSON.stringify(this.state.tasks));
            localStorage.setItem('novaProjects', JSON.stringify(this.state.projects));
            localStorage.setItem('novaSettings', JSON.stringify({
                currentView: this.state.currentView,
                currentProject: this.state.currentProject,
                currentSort: this.state.currentSort,
                filters: this.state.filters,
                theme: this.state.user.theme
            }));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // ====== SERVICE WORKER ======
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
            });
        }
    }

    // ====== RENDER ======
    render() {
        this.renderProjects();
        this.renderTasks();
        this.updateView();
        
        // Load saved view mode
        const savedViewMode = localStorage.getItem('novaViewMode') || 'list';
        this.setViewMode(savedViewMode);
        
        // Load saved filters
        const savedSettings = this.loadFromStorage('novaSettings');
        if (savedSettings) {
            Object.assign(this.state, savedSettings);
            if (this.filterPriority) this.filterPriority.value = this.state.filters.priority;
            if (this.filterStatus) this.filterStatus.value = this.state.filters.status;
            if (this.filterProject) this.filterProject.value = this.state.filters.project;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.novaTask = new NovaTaskPro();
    
    // Add fade-in animation to body
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Make app globally available for debugging
window.NovaTaskPro = NovaTaskPro;