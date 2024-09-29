document.addEventListener('DOMContentLoaded', function() {
    const newTaskInput = document.getElementById('newTask');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');

    // Load tasks immediately
    loadTasks();

    // Add task
    addTaskButton.addEventListener('click', function() {
        addTask();
    });

    // Enter key to add task
    newTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Complete, edit, and save task
    taskList.addEventListener('click', function(e) {
        const taskElement = e.target.closest('.task');
        if (!taskElement) return;

        const taskIndex = parseInt(taskElement.dataset.index);

        if (e.target.type === 'checkbox') {
            removeTask(taskIndex);
        } else if (e.target.classList.contains('edit-btn')) {
            toggleEditMode(taskElement, taskIndex);
        }
    });

    taskList.addEventListener('keypress', function(e) {
        if (e.target.classList.contains('edit-input') && e.key === 'Enter') {
            const taskElement = e.target.closest('.task');
            const taskIndex = parseInt(taskElement.dataset.index);
            saveEditedTask(taskElement, taskIndex);
        }
    });

    function loadTasks() {
        chrome.storage.local.get(['tasks'], function(result) {
            const tasks = result.tasks || [];
            renderTasks(tasks);
        });
    }

    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            chrome.storage.local.get(['tasks'], function(result) {
                const tasks = result.tasks || [];
                tasks.push({ text: taskText, completed: false });
                chrome.storage.local.set({ tasks: tasks }, function() {
                    renderTasks(tasks);
                    newTaskInput.value = '';
                });
            });
        }
    }

    function removeTask(taskIndex) {
        chrome.storage.local.get(['tasks'], function(result) {
            let tasks = result.tasks || [];
            if (tasks[taskIndex]) {
                tasks.splice(taskIndex, 1);
                chrome.storage.local.set({ tasks: tasks }, function() {
                    renderTasks(tasks);
                });
            }
        });
    }

    function toggleEditMode(taskElement, taskIndex) {
        const taskTextSpan = taskElement.querySelector('.task-text');
        const editInput = taskElement.querySelector('.edit-input');
        const editButton = taskElement.querySelector('.edit-btn');

        if (taskElement.classList.contains('editing')) {
            saveEditedTask(taskElement, taskIndex);
        } else {
            taskElement.classList.add('editing');
            const currentText = taskTextSpan.textContent;
            editInput.value = currentText;
            taskTextSpan.style.display = 'none';
            editInput.style.display = 'inline-block';
            editButton.textContent = 'Save';
            editInput.focus();
        }
    }

    function saveEditedTask(taskElement, taskIndex) {
        const editInput = taskElement.querySelector('.edit-input');
        const taskTextSpan = taskElement.querySelector('.task-text');
        const editButton = taskElement.querySelector('.edit-btn');
        const newText = editInput.value.trim();

        if (newText) {
            chrome.storage.local.get(['tasks'], function(result) {
                let tasks = result.tasks || [];
                if (tasks[taskIndex]) {
                    tasks[taskIndex].text = newText;
                    chrome.storage.local.set({ tasks: tasks }, function() {
                        taskTextSpan.textContent = newText;
                        taskTextSpan.style.display = 'inline';
                        editInput.style.display = 'none';
                        editButton.textContent = 'Edit';
                        taskElement.classList.remove('editing');
                    });
                }
            });
        }
    }

    function renderTasks(tasks) {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            tasks.forEach((task, index) => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task';
                taskElement.dataset.index = index;
                taskElement.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <input type="text" class="edit-input" style="display: none;">
                    <button class="edit-btn">Edit</button>
                `;
                taskList.appendChild(taskElement);
            });
        }
    }
});