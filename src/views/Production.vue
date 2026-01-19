<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { ProjectTask } from "../types/models";

const tasks = ref<ProjectTask[]>([]);
const newTaskTitle = ref("");

const columns = [
    { id: "todo", title: "Edilmeli" },
    { id: "inprogress", title: "Işlenilýär" },
    { id: "completed", title: "Tamamlandy" },
];

const fetchTasks = async () => {
    tasks.value = await api.getTasks();
};

const addTask = async () => {
    if (!newTaskTitle.value) return;
    // Create a general task (project_id 0 or 1 for now as a catch-all if no project selected)
    // Ideally, we'd select a project. For now, we'll assume project_id 1 exists or use a dummy.
    // In a real app, we'd pick the project from a dropdown.
    await api.createTask({
        project_id: 1,
        title: newTaskTitle.value,
        status: "todo",
    });
    newTaskTitle.value = "";
    await fetchTasks();
};

// Simple drag and drop simulation (buttons)
const moveTask = async (task: ProjectTask, newStatus: string) => {
    await api.updateTaskStatus(task.id, newStatus);
    await fetchTasks();
};

onMounted(fetchTasks);

const getTasksByStatus = (status: string) => {
    return tasks.value.filter((t) => t.status === status);
};
</script>

<template>
    <div class="production-view">
        <header class="page-header">
            <h1>Önümçilik Akymy</h1>
            <div class="add-task">
                <input v-model="newTaskTitle" placeholder="Täze ýumuş..." @keyup.enter="addTask" />
                <button @click="addTask">Goş</button>
            </div>
        </header>

        <div class="kanban-board">
            <div v-for="col in columns" :key="col.id" class="column">
                <h3>{{ col.title }}</h3>
                <div class="task-list">
                    <div v-for="task in getTasksByStatus(col.id)" :key="task.id" class="task-card">
                        <p>{{ task.title }}</p>
                        <div class="controls">
                            <button v-if="col.id !== 'todo'" @click="moveTask(task, 'todo')">
                                ←
                            </button>
                            <button v-if="col.id !== 'completed'" @click="moveTask(task, 'completed')">
                                →
                            </button>
                        </div>
                    </div>
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

.add-task {
    display: flex;
    gap: 8px;
}

.add-task input {
    padding: 8px;
    background: #1e1e1e;
    border: 1px solid #333;
    color: #fff;
    border-radius: 4px;
}

.kanban-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    height: calc(100vh - 150px);
}

.column {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #333;
    display: flex;
    flex-direction: column;
}

.column h3 {
    margin: 0 0 16px 0;
    text-align: center;
    color: #aaa;
    border-bottom: 1px solid #333;
    padding-bottom: 12px;
}

.task-list {
    flex: 1;
    overflow-y: auto;
}

.task-card {
    background: #2a2a2a;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    border-left: 3px solid #42b983;
}

.controls {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}

.controls button {
    background: #333;
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 8px;
}
</style>
