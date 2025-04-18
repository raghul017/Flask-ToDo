document.addEventListener("DOMContentLoaded", () => {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");

  // Initialize the board
  const board = {
    todo: document.getElementById("todo-list"),
    doing: document.getElementById("doing-list"),
    done: document.getElementById("done-list"),
  };

  // Modal elements
  const taskModal = document.getElementById("task-modal");
  const taskForm = document.getElementById("task-form");
  const closeModal = document.getElementById("close-modal");
  const cancelTask = document.getElementById("cancel-task");
  const searchInput = document.getElementById("search-input");
  const priorityFilter = document.getElementById("priority-filter");

  // Task data storage
  let tasks = [
    {
      id: 1,
      title: "Research project requirements",
      status: "todo",
      priority: "high",
      date: "10-12 Jul",
      assignee: "👤",
    },
    {
      id: 2,
      title: "Create project timeline",
      status: "doing",
      priority: "medium",
      date: "12-15 Jul",
      assignee: "👥",
    },
    {
      id: 3,
      title: "Initial client meeting",
      status: "done",
      priority: "low",
      date: "8-9 Jul",
      assignee: "👤",
    },
  ];

  // Create task card
  function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.dataset.status = task.status;

    card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
            <div class="task-tags">
                <span class="tag priority-${task.priority}">${task.priority}</span>
                <span class="tag">${task.date}</span>
            </div>
            <div class="task-assignee">${task.assignee}</div>
        </div>
    `;

    // Add drag event listeners
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);

    // Add click listener for editing
    card.addEventListener("click", () => openTaskModal(task));

    return card;
  }

  // Render tasks
  function renderTasks() {
    // Clear all columns
    Object.values(board).forEach((column) => {
      column.innerHTML = "";
    });

    // Filter tasks
    const searchTerm = searchInput.value.toLowerCase();
    const selectedPriority = priorityFilter.value;

    // Filter and render tasks
    tasks
      .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesPriority =
          selectedPriority === "all" || task.priority === selectedPriority;
        return matchesSearch && matchesPriority;
      })
      .forEach((task) => {
        const card = createTaskCard(task);
        board[task.status].appendChild(card);
      });
  }

  // Drag handlers
  function handleDragStart(e) {
    e.target.classList.add("dragging");
    e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
  }

  // Setup column drag and drop
  Object.entries(board).forEach(([status, column]) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const draggable = document.querySelector(".dragging");
      if (!draggable) return;

      const afterElement = getDragAfterElement(column, e.clientY);
      if (afterElement) {
        column.insertBefore(draggable, afterElement);
      } else {
        column.appendChild(draggable);
      }
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      const taskId = parseInt(e.dataTransfer.getData("text/plain"));
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        renderTasks();
      }
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".task-card:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // Modal handlers
  function openTaskModal(task = null) {
    const titleInput = document.getElementById("task-title");
    const priorityInput = document.getElementById("task-priority");
    const dateInput = document.getElementById("task-date");
    const assigneeInput = document.getElementById("task-assignee");

    if (task) {
      taskForm.dataset.taskId = task.id;
      titleInput.value = task.title;
      priorityInput.value = task.priority;
      dateInput.value = task.date;
      assigneeInput.value = task.assignee;
    } else {
      taskForm.dataset.taskId = "";
      taskForm.reset();
    }

    taskModal.style.display = "flex";
  }

  function closeTaskModal() {
    taskModal.style.display = "none";
    taskForm.reset();
    delete taskForm.dataset.taskId;
  }

  // Event listeners
  closeModal.addEventListener("click", closeTaskModal);
  cancelTask.addEventListener("click", closeTaskModal);

  taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) closeTaskModal();
  });

  // Form submission
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskData = {
      title: document.getElementById("task-title").value,
      priority: document.getElementById("task-priority").value,
      date: document.getElementById("task-date").value,
      assignee: document.getElementById("task-assignee").value,
    };

    if (taskForm.dataset.taskId) {
      // Update existing task
      const taskId = parseInt(taskForm.dataset.taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, taskData);
      }
    } else {
      // Create new task
      const newTask = {
        id: Date.now(),
        status: "todo",
        ...taskData,
      };
      tasks.push(newTask);
    }

    closeTaskModal();
    renderTasks();
  });

  // Add task buttons
  document.querySelectorAll(".add-task-btn").forEach((btn) => {
    btn.addEventListener("click", () => openTaskModal());
  });

  // Search and filter
  searchInput.addEventListener("input", renderTasks);
  priorityFilter.addEventListener("change", renderTasks);

  // Initial render
  renderTasks();
});
