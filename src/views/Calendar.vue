<script setup lang="ts">
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { api } from "../services/api";
import type { Project } from "../types/models";

const projects = ref<Project[]>([]);
const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    events: [] as any[],
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek",
    },
    eventClick: (info: any) => {
        alert(
            "Event: " + info.event.title + "\nType: " + info.event.extendedProps.type,
        );
    },
});

const loadEvents = async () => {
    try {
        projects.value = await api.getProjects();

        // Map projects to events
        calendarOptions.value.events = projects.value.map((p) => {
            // Simple conflict detection: check if there are other projects on this day
            const conflict =
                projects.value.filter(
                    (op) => op.date && op.date.split("T")[0] === p.date.split("T")[0],
                ).length > 1;

            return {
                title: p.name,
                start: p.date,
                backgroundColor: conflict ? "#ff4444" : getColor(p.type),
                borderColor: conflict ? "#cc0000" : getColor(p.type),
                extendedProps: {
                    type: p.type,
                    conflict: conflict,
                },
            };
        });
    } catch (e) {
        console.error("Failed to load events", e);
    }
};

const getColor = (type: string) => {
    switch (type) {
        case "wedding":
            return "#e1306c";
        case "love_story":
            return "#ff9800";
        default:
            return "#42b983";
    }
};

const syncGoogle = () => {
    alert("Google Calendar Sync started... (Mock)");
};

onMounted(loadEvents);
</script>

<template>
    <div class="calendar-view">
        <header class="page-header">
            <div>
                <h1>Akylly Senenama</h1>
                <p class="subtitle">Toýlar, Love Story we ş.m</p>
            </div>
            <div class="header-actions">
                <button class="btn-secondary" @click="syncGoogle">
                    🔄 Google Sync
                </button>
                <button class="btn-primary">+ Çäre Goş</button>
            </div>
        </header>

        <div class="calendar-container">
            <FullCalendar :options="calendarOptions" />
        </div>

        <div class="legend">
            <span class="dot wedding"></span> Toý <span class="dot love"></span> Love
            Story <span class="dot conflict"></span> Konflikt (2 toý)
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

.calendar-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.calendar-container {
    flex: 1;
    background: #1e1e1e;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #333;
    color: #fff;
    overflow: auto;
}

.header-actions {
    display: flex;
    gap: 10px;
}

/* FullCalendar Customization */
:deep(.fc) {
    --fc-border-color: #333;
    --fc-page-bg-color: #1e1e1e;
    --fc-neutral-bg-color: #121212;
    --fc-list-event-hover-bg-color: #333;
    --fc-today-bg-color: rgba(66, 185, 131, 0.1);
    color: #fff;
}

:deep(.fc-col-header-cell) {
    background: #252525;
    padding: 10px 0;
}

:deep(.fc-daygrid-day-number) {
    color: #aaa;
    text-decoration: none;
}

:deep(.fc-button) {
    background-color: #333;
    border-color: #444;
}

:deep(.fc-button-primary:not(:disabled).fc-button-active),
:deep(.fc-button-primary:not(:disabled):active) {
    background-color: #42b983;
    border-color: #42b983;
}

.legend {
    margin-top: 16px;
    display: flex;
    gap: 16px;
    font-size: 0.9rem;
    color: #aaa;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}

.dot.wedding {
    background: #e1306c;
}

.dot.love {
    background: #ff9800;
}

.dot.conflict {
    background: #ff4444;
}

.btn-primary {
    background: #42b983;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}

.btn-secondary {
    background: #444;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}
</style>
