// URL de l'API REST Backend (Docker Service)
const API_URL = '/api/tasks';

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    document.getElementById('task-form').addEventListener('submit', handleAddTask);
});

// Récupération des tâches depuis le backend
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
    }
}

// Affichage dynamique des tâches dans les colonnes
function renderTasks(tasks) {
    const lists = {
        todo: document.getElementById('list-todo'),
        in_progress: document.getElementById('list-in_progress'),
        done: document.getElementById('list-done')
    };

    const counts = { todo: 0, in_progress: 0, done: 0 };

    // Vider les listes actuelles
    Object.values(lists).forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const card = createTaskCard(task);
        if (lists[task.status]) {
            lists[task.status].appendChild(card);
            counts[task.status]++;
        }
    });

    // Mettre à jour les compteurs
    document.getElementById('count-todo').textContent = counts.todo;
    document.getElementById('count-in_progress').textContent = counts.in_progress;
    document.getElementById('count-done').textContent = counts.done;
}

// Création HTML d'une carte de tâche
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';

    card.innerHTML = `
        <div class="task-header">
            <strong>${escapeHtml(task.title)}</strong>
            <span class="priority-badge badge-${task.priority}">${task.priority}</span>
        </div>
        <div class="task-actions">
            ${task.status !== 'done' ? `<button onclick="updateTaskStatus(${task.id}, '${getNextStatus(task.status)}')">Avancer ➔</button>` : '<span></span>'}
            <button class="delete-btn" onclick="deleteTask(${task.id})">Supprimer</button>
        </div>
    `;

    return card;
}

// Fonction utilitaire pour le statut suivant
function getNextStatus(currentStatus) {
    if (currentStatus === 'todo') return 'in_progress';
    if (currentStatus === 'in_progress') return 'done';
    return currentStatus;
}

// Ajout d'une nouvelle tâche
async function handleAddTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById('task-title');
    const prioritySelect = document.getElementById('task-priority');

    const newTask = {
        title: titleInput.value,
        priority: prioritySelect.value,
        status: 'todo'
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
        titleInput.value = '';
        fetchTasks();
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
}

// Mise à jour du statut d'une tâche
async function updateTaskStatus(id, newStatus) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchTasks();
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
    }
}

// Suppression d'une tâche
async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

// Échappement HTML pour la sécurité
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
