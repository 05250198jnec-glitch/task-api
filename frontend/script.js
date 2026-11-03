const API_URL = 'http://localhost:3000/tasks';

const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const statusSelect = document.getElementById('status');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const taskList = document.getElementById('task-list');
const errorBanner = document.getElementById('error-banner');

async function fetchTasks() {
  try {
    hideError();
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    showError(`Could not load tasks: ${err.message}`);
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="text-align:center; color:#64748b;">No tasks found.</p>';
    return;
  }

  tasks.forEach(task => {
    let rawStatus = (task.status || '').toLowerCase();
    if (!rawStatus) {
      const isCompleted = task.completed === true || task.completed === 1 || task.completed === '1';
      rawStatus = isCompleted ? 'completed' : 'pending';
    }

    let badgeClass = 'pending';
    let badgeText = 'PENDING';

    if (rawStatus === 'completed') {
      badgeClass = 'completed';
      badgeText = 'COMPLETED';
    } else if (rawStatus === 'in_progress' || rawStatus === 'in progress') {
      badgeClass = 'in_progress';
      badgeText = 'IN PROGRESS';
    }

    const item = document.createElement('div');
    item.className = `task-item ${badgeClass === 'completed' ? 'completed-item' : ''}`;

    const descText = task.description ? task.description.trim() : '';

    item.innerHTML = `
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${descText ? `<div class="task-description">${escapeHtml(descText)}</div>` : ''}
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="task-actions">
        <button class="btn-edit" onclick="startEdit(${task.id}, '${escapeQuote(task.title)}', '${escapeQuote(descText)}', '${rawStatus}')">Edit</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(item);
  });
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = taskIdInput.value;
  const rawStatus = statusSelect.value.toLowerCase();
  const isCompleted = rawStatus === 'completed' || rawStatus === 'true' || rawStatus === '1';

  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput ? descriptionInput.value.trim() : null,
    status: statusSelect.value,
    completed: isCompleted
  };

  try {
    hideError();
    let response;
    if (id) {
      response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    resetForm();
    fetchTasks();
  } catch (err) {
    showError(`Could not save task: ${err.message}`);
  }
});

function startEdit(id, title, description, status) {
  taskIdInput.value = id;
  titleInput.value = title;
  if (descriptionInput) descriptionInput.value = description || '';

  const normalizedStatus = (status || 'pending').toLowerCase().replace(' ', '_');

  let optionFound = false;
  for (let option of statusSelect.options) {
    const optVal = option.value.toLowerCase().replace(' ', '_');
    if (optVal === normalizedStatus) {
      statusSelect.value = option.value;
      optionFound = true;
      break;
    }
  }

  if (!optionFound && statusSelect.options.length > 0) {
    statusSelect.selectedIndex = 0;
  }

  submitBtn.textContent = 'Update Task';
  cancelBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  taskIdInput.value = '';
  taskForm.reset();
  if (descriptionInput) descriptionInput.value = '';
  submitBtn.textContent = 'Add Task';
  cancelBtn.hidden = true;
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    hideError();
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    fetchTasks();
  } catch (err) {
    showError(`Could not delete task: ${err.message}`);
  }
}

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.hidden = true;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[match]));
}

function escapeQuote(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

fetchTasks();