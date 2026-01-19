<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { ProjectTask } from "../types/models";
import Draggable from "vuedraggable";

const tasks = ref<ProjectTask[]>([]);
const projectId = ref<number | null>(null);

const columns = ref([
    { id: "todo", title: "Edilmeli" },
    { id: "inprogress", title: "Işlenilýär" },
    { id: "review", title: "Barlag" },
    { id: "done", title: "Tamamlandy" },
]);

const tasksByStatus = (status: string) => {
    return tasks.value.filter((t) => t.status === status);
};

const showModal = ref(false);
const newTask = ref({ title: "", status: "todo", due_time: "" });

// Checklist Modal
const showChecklistModal = ref(false);
const selectedTask = ref<ProjectTask | null>(null);
const newChecklistItem = ref("");

const fetchTasks = async () => {
    tasks.value = await api.getTasks(projectId.value || undefined);
};

const addTask = async () => {
    if (!newTask.value.title) return;
    await api.createTask({ ...newTask.value, project_id: projectId.value || 1 });
    showModal.value = false;
    newTask.value = { title: "", status: "todo", due_time: "" };
    await fetchTasks();
};

const updateTaskStatus = async (evt: any, status: string) => {
    if (evt.added) {
        const task = evt.added.element;
        await api.updateTaskStatus(task.id, status);
        // Optimistic update
        task.status = status;
    }
};

const openChecklist = (task: ProjectTask) => {
    selectedTask.value = task;
    showChecklistModal.value = true;
};

const addChecklist = async () => {
    if (!newChecklistItem.value || !selectedTask.value) return;
    await api.addChecklistItem(selectedTask.value.id, newChecklistItem.value);
    newChecklistItem.value = "";
    await fetchTasks();
    // Refresh selected task
    selectedTask.value =
        tasks.value.find((t) => t.id === selectedTask.value?.id) || null;
};

const toggleItem = async (item: any) => {
    await api.toggleChecklistItem(item.id, item.is_completed);
};

const launchSoftware = async (name: string) => {
    await api.launchSoftware(name);
    alert(name + " işe girizildi");
};

onMounted(fetchTasks);
</script>

<template>
    <div class="production-view">
        <header class="page-header">
            <div>
                <h1>Önümçilik Akymy</h1>
                <p class="subtitle">Taslamalar we Ýumuşlar</p>
            </div>

            <div class="header-actions">
                <div class="software-launcher">
                    <button class="icon-btn premiere" @click="launchSoftware('Adobe Premiere')">
                        Pr
                    </button>
                    <button class="icon-btn photoshop" @click="launchSoftware('Adobe Photoshop')">
                        Ps
                    </button>
                    <button class="icon-btn davinci" @click="launchSoftware('DaVinci Resolve')">
                        Dr
                    </button>
                </div>
                <button class="btn-primary" @click="showModal = true">
                    + Ýumuş Goş
                </button>
            </div>
        </header>

        <div class="kanban-board">
            <div v-for="col in columns" :key="col.id" class="kanban-column">
                <div class="column-header">
                    <h3>{{ col.title }}</h3>
                    <span class="count">{{ tasksByStatus(col.id).length }}</span>
                </div>

                <Draggable :list="tasks" group="tasks" itemKey="id" class="task-list"
                    @change="(e) => updateTaskStatus(e, col.id)">
                    <template #item="{ element }">
                        <div v-if="element.status === col.id" class="task-card" @click="openChecklist(element)">
                            <div class="task-title">{{ element.title }}</div>
                            <div class="task-meta">
                                <span v-if="element.checklist?.length" class="checklist-badge">
                                    ☑️
                                    {{
                                        element.checklist.filter((i: any) => i.is_completed).length
                                    }}/{{ element.checklist.length }}
                                </span>
                                <span v-if="element.due_time" class="due-badge">🕒 {{ element.due_time }}</span>
                            </div>
                        </div>
                    </template>
                </Draggable>
            </div>
        </div>

        <!-- Create Task Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <h2>Täze Ýumuş</h2>
                <form @submit.prevent="addTask">
                    <div class="form-group">
                        <input v-model="newTask.title" placeholder="Täze ýumuş..." required />
                    </div>
                    <div class="actions">
                        <button type="submit" class="btn-primary">Goş</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Checklist Modal -->
        <div v-if="showChecklistModal && selectedTask" class="modal-overlay" @click.self="showChecklistModal = false">
            <div class="modal checklist-modal">
                <h2>{{ selectedTask.title }}</h2>
                <div class="checklist-container">
                    <div v-for="item in selectedTask.checklist" :key="item.id" class="checklist-item">
                        <input type="checkbox" v-model="item.is_completed" @change="toggleItem(item)" />
                        <span :class="{ completed: item.is_completed }">{{
                            item.text
                            }}</span>
                    </div>
                </div>

                <div class="add-item-box">
                    <input v-model="newChecklistItem" placeholder="+ Barlag nokadyny goş..."
                        @keyup.enter="addChecklist" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.subtitle {
    color: #888;
    font-size: 0.9rem;
}

.header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.software-launcher {
    display: flex;
    gap: 8px;
}

.icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
}

.premiere {
    background: #9999ff;
    color: #00005b;
}

.photoshop {
    background: #31a8ff;
    color: #001e36;
}

.davinci {
    background: #ff6b6b;
    color: #3d0000;
}

.kanban-board {
    display: flex;
    gap: 16px;
    height: calc(100vh - 150px);
    overflow-x: auto;
}

.kanban-column {
    flex: 1;
    min-width: 250px;
    background: #1e1e1e;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    border: 1px solid #333;
}

.column-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: #aaa;
    font-size: 0.9rem;
    text-transform: uppercase;
}

.task-list {
    flex: 1;
    overflow-y: auto;
    min-height: 100px;
}

.task-card {
    background: #2b2b2b;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    border: 1px solid #444;
}

.task-card:hover {
    border-color: #666;
}

.task-meta {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    font-size: 0.8rem;
    color: #888;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #1e1e1e;
    padding: 24px;
    border-radius: 8px;
    width: 400px;
    border: 1px solid #333;
}

.checklist-item {
    display: flex;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #333;
}

.completed {
    text-decoration: line-through;
    color: #666;
}

.add-item-box input {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid #444;
    color: #fff;
    margin-top: 16px;
    border-radius: 4px;
}

.btn-primary {
    background: #42b983;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}

.form-group input {
    width: 100%;
    padding: 10px;
    background: #121212;
    border: 1px solid #333;
    color: #fff;
    border-radius: 6px;
}
</style>
