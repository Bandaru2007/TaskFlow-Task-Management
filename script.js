```javascript
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const submitButton = document.getElementById("submitButton");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("taskflow-tasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            ["High", "Medium", "Low"].includes(task.priority) &&
            typeof task.completed === "boolean"
        );
    }
} catch {
    tasks = [];
}

let currentFilter = "all";
let editingTaskId = null;

// Display today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Save tasks
function saveTasks() {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

// Update dashboard statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressFill").style.width = progress + "%";
}

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h4");
        title.textContent = task.title;

        const date = document.createElement("p");
        date.textContent = "Created: " + task.createdAt;

        info.append(title, date);

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "✎";
        editButton.setAttribute("aria-label", "Edit task");

        editButton.addEventListener("click", () => {
            taskInput.value = task.title;
            priorityInput.value = task.priority;
            editingTaskId = task.id;
            submitButton.textContent = "Update Task";
            taskInput.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "🗑";
        deleteButton.setAttribute("aria-label", "Delete task");

        deleteButton.addEventListener("click", () => {
            if (confirm("Do you want to delete this task?")) {
                tasks = tasks.filter(item => item.id !== task.id);

                if (editingTaskId === task.id) {
                    resetForm();
                }

                saveTasks();
                renderTasks();
            }
        });

        actions.append(editButton, deleteButton);

        item.append(checkbox, info, priority, actions);
        taskList.appendChild(item);
    });

    taskCount.textContent =
        filteredTasks.length + (filteredTasks.length === 1 ? " task" : " tasks");

    emptyState.classList.toggle("hidden", filteredTasks.length > 0);

    updateStats();

    // Highlight the selected filter
    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

// Reset form
function resetForm() {
    taskForm.reset();
    editingTaskId = null;
    submitButton.textContent = "+ Add Task";
}

// Add or update a task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
        alert("Please enter a task name.");
        return;
    }

    if (editingTaskId !== null) {
        const task = tasks.find(item => item.id === editingTaskId);

        if (task) {
            task.title = title;
            task.priority = priority;
        }
    } else {
        tasks.unshift({
            id: crypto.randomUUID(),
            title: title,
            priority: priority,
            completed: false,
            createdAt: new Date().toLocaleDateString("en-IN")
        });
    }

    saveTasks();
    resetForm();
    renderTasks();
});

// Search tasks
searchInput.addEventListener("input", renderTasks);

// Filter tasks
document.querySelectorAll(".menu-item").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

// Initial display
renderTasks();
```
