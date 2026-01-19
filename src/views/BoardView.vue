<template>
    <div class="board-container">
        <div class="board-header">
            <button @click="goBack" class="back-btn">
                <span class="arrow">←</span> Taslamalar
            </button>
            <h2>Taslama Dolandyryşy</h2>
        </div>

        <div class="kanban-columns">
            <!-- TODO Column -->
            <div class="column todo">
                <div class="column-header">
                    <h3>Edilmeli</h3>
                    <span class="count">{{ todoTasks.length }}</span>
                </div>

                <div class="add-task-wrapper">
                    <input v-model="newTaskTitle" @keyup.enter="addTask" placeholder="+ Täze iş goş..."
                        class="task-input" />
                    <input type="date" v-model="newTaskTime" class="time-input" @keyup.enter="addTask" />
                    <div class="add-btn" @click="addTask">+</div>
                </div>

                <draggable v-model="todoTasks" group="tasks" item-key="id" class="drag-area"
                    @change="(e) => onStatsChange(e, 'todo')">
                    <template #item="{ element }">
                        <div class="task-card">
                            <div class="task-content">
                                <span class="task-title">{{ element.title }}</span>
                                <span v-if="element.due_time" class="task-time">⏰ {{ element.due_time }}</span>
                            </div>
                            <button class="delete-task" @click="deleteTask(element.id)">
                                ×
                            </button>
                        </div>
                    </template>
                </draggable>
            </div>

            <!-- IN PROGRESS Column -->
            <div class="column inprogress">
                <div class="column-header">
                    <h3>Dowam edýär</h3>
                    <span class="count">{{ inProgressTasks.length }}</span>
                </div>
                <draggable v-model="inProgressTasks" group="tasks" item-key="id" class="drag-area"
                    @change="(e) => onStatsChange(e, 'inprogress')">
                    <template #item="{ element }">
                        <div class="task-card">
                            <div class="task-content">
                                <span class="task-title">{{ element.title }}</span>
                                <span v-if="element.due_time" class="task-time">⏰ {{ element.due_time }}</span>
                            </div>
                            <button class="delete-task" @click="deleteTask(element.id)">
                                ×
                            </button>
                        </div>
                    </template>
                </draggable>
            </div>

            <!-- COMPLETED Column -->
            <div class="column completed">
                <div class="column-header">
                    <h3>Tamamlandy</h3>
                    <span class="count">{{ completedTasks.length }}</span>
                </div>
                <draggable v-model="completedTasks" group="tasks" item-key="id" class="drag-area"
                    @change="(e) => onStatsChange(e, 'completed')">
                    <template #item="{ element }">
                        <div class="task-card completed-card">
                            <div class="task-content">
                                <span class="task-title">{{ element.title }}</span>
                                <span v-if="element.due_time" class="task-time">⏰ {{ element.due_time }}</span>
                            </div>
                            <button class="delete-task" @click="deleteTask(element.id)">
                                ×
                            </button>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import draggable from "vuedraggable";

const router = useRouter();
const route = useRoute();
const projectId = Number(route.params.projectId);

interface Task {
    id: number;
    project_id: number;
    title: string;
    due_time?: string;
    status: "todo" | "inprogress" | "completed";
}

const todoTasks = ref<Task[]>([]);
const inProgressTasks = ref<Task[]>([]);
const completedTasks = ref<Task[]>([]);
const newTaskTitle = ref("");
const newTaskTime = ref("");

const fetchTasks = async () => {
    try {
        const tasks: Task[] = await window.ipcRenderer.invoke(
            "get-tasks",
            projectId,
        );
        todoTasks.value = tasks.filter((t) => t.status === "todo");
        inProgressTasks.value = tasks.filter((t) => t.status === "inprogress");
        completedTasks.value = tasks.filter((t) => t.status === "completed");
    } catch (err) {
        console.error("Failed to load tasks", err);
    }
};

const addTask = async () => {
    if (!newTaskTitle.value.trim()) return;
    try {
        const task = await window.ipcRenderer.invoke("create-task", {
            projectId,
            title: newTaskTitle.value,
            due_time: newTaskTime.value,
        });
        todoTasks.value.push(task);
        newTaskTitle.value = "";
        newTaskTime.value = "";
    } catch (err) {
        console.error("Failed to create task", err);
    }
};

const deleteTask = async (taskId: number) => {
    if (confirm("Işi öçürmek isleýärsiňizmi?")) {
        try {
            await window.ipcRenderer.invoke("delete-task", taskId);
            // Remove from local lists
            todoTasks.value = todoTasks.value.filter((t) => t.id !== taskId);
            inProgressTasks.value = inProgressTasks.value.filter(
                (t) => t.id !== taskId,
            );
            completedTasks.value = completedTasks.value.filter(
                (t) => t.id !== taskId,
            );
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    }
};

const onStatsChange = async (event: any, newStatus: string) => {
    if (event.added) {
        const task = event.added.element;
        try {
            await window.ipcRenderer.invoke("update-task-status", {
                taskId: task.id,
                status: newStatus,
            });
            // Update local task object status just in case
            task.status = newStatus;
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert change? For now, assume success or reload.
            fetchTasks();
        }
    }
};

const goBack = () => {
    router.push("/");
};

onMounted(fetchTasks);
</script>

<style scoped>
.board-container {
    padding: 2rem;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.board-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
}

.back-btn {
    background: transparent;
    color: #aaa;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}

.back-btn:hover {
    border-color: #64ffda;
    color: #64ffda;
}

h2 {
    margin: 0;
    color: #333;
    color: #e0e0e0;
}

.kanban-columns {
    display: flex;
    gap: 2rem;
    flex: 1;
    overflow-x: auto;
    padding-bottom: 1rem;
}

.column {
    flex: 1;
    min-width: 300px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid;
}

.todo .column-header {
    border-color: #ff6b6b;
}

.inprogress .column-header {
    border-color: #feca57;
}

.completed .column-header {
    border-color: #1dd1a1;
}

.column h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.count {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #fff;
}

.add-task-wrapper {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
}

.add-task-wrapper input.task-input {
    flex: 1;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    outline: none;
}

.add-task-wrapper input.time-input {
    width: 100px;
    padding: 0.7rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    outline: none;
    cursor: pointer;
}

.add-task-wrapper .add-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.2rem;
    color: #fff;
    transition: all 0.2s;
}

.add-task-wrapper .add-btn:hover {
    background: #64ffda;
    color: #000;
}

.add-task-wrapper input:focus {
    border-color: #64ffda;
}

.drag-area {
    flex: 1;
    overflow-y: auto;
    min-height: 100px;
}

.task-card {
    background: rgba(255, 255, 255, 0.08);
    padding: 1rem;
    margin-bottom: 0.8rem;
    border-radius: 8px;
    cursor: grab;
    position: relative;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
}

.task-card:active {
    cursor: grabbing;
}

.task-title {
    color: #eee;
    display: block;
    word-break: break-word;
    margin-bottom: 0.3rem;
    font-weight: 500;
}

.task-time {
    display: block;
    font-size: 0.8rem;
    color: #64ffda;
    background: rgba(100, 255, 218, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    width: fit-content;
}

.completed-card .task-title {
    text-decoration: line-through;
    color: #888;
}

.completed-card .task-time {
    opacity: 0.5;
    text-decoration: line-through;
}

.delete-task {
    position: absolute;
    top: 5px;
    right: 5px;
    background: transparent;
    border: none;
    font-size: 1.2rem;
    color: #666;
    cursor: pointer;
    line-height: 1;
    padding: 0 4px;
}

.delete-task:hover {
    color: #ff4d4d;
}
</style>
