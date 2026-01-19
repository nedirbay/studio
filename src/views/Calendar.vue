<script setup lang="ts"></script>

<template>
    <div class="calendar-view">
        <header class="page-header">
            <h1>Akylly Senenama</h1>
            <button class="btn-primary">+ Çäre Goş</button>
        </header>

        <div class="calendar-placeholder">
            <div class="month-view">
                <!-- Mock Calendar Grid -->
                <div class="week-header">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div class="days-grid">
                    <div v-for="i in 30" :key="i" class="day-cell">
                        <span class="date">{{ i }}</span>
                        <div v-if="i === 15" class="event wedding">
                            Amangeldi & Maral (Wedding)
                        </div>
                        <div v-if="i === 18" class="event lovestory">
                            Love Story (Sunset)
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

.btn-primary {
    background: #42b983;
    color: #white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}

.calendar-placeholder {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #333;
}

.week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 10px;
    text-align: center;
    color: #aaa;
    font-weight: bold;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #333;
    /* border color */
}

.day-cell {
    background: #1e1e1e;
    min-height: 120px;
    padding: 8px;
    position: relative;
}

.date {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #666;
}

.event {
    background: #42b983;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 24px;
    margin-bottom: 4px;
}

.event.wedding {
    background: #9c27b0;
}

.event.lovestory {
    background: #ff9800;
}
</style>
