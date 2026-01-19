<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";

const stats = ref({
  activeProjects: 0,
  pendingTasks: 0,
  monthlyIncome: 0,
  hddUsage: "45%", // Mock for now, requires node 'os' or 'diskusage' in electron main
});

onMounted(async () => {
  // Fetch real data
  const projects = await api.getProjects();
  stats.value.activeProjects = projects.filter(
    (p) => p.status !== "done",
  ).length;

  const tasks = await api.getTasks();
  stats.value.pendingTasks = tasks.filter(
    (t) => t.status !== "completed",
  ).length;

  const transactions = await api.getTransactions();
  // Filter for current month income (mock logic for simplicity)
  stats.value.monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
});
</script>

<template>
  <div class="dashboard">
    <header>
      <h1>Dashboard</h1>
      <p class="subtitle">Welcome back to the Studio Cockpit</p>
    </header>

    <div class="grid">
      <!-- Global Status -->
      <div class="card status">
        <h3>Active Projects</h3>
        <div class="value">{{ stats.activeProjects }}</div>
      </div>

      <!-- Quick Tasks -->
      <div class="card tasks">
        <h3>Pending Tasks</h3>
        <div class="value">{{ stats.pendingTasks }}</div>
      </div>

      <!-- Finance -->
      <div class="card finance">
        <h3>Month Income</h3>
        <div class="value income">
          {{ stats.monthlyIncome.toLocaleString() }} TMT
        </div>
      </div>

      <!-- HDD Monitoring -->
      <div class="card hdd">
        <h3>Storage (C:)</h3>
        <div class="progress-bar">
          <div class="fill" :style="{ width: stats.hddUsage }"></div>
        </div>
        <div class="meta">{{ stats.hddUsage }} Used</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  margin-bottom: 32px;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.card {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #333;
}

.card h3 {
  margin: 0 0 16px 0;
  color: #aaa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.value {
  font-size: 2.5rem;
  font-weight: bold;
}

.income {
  color: #42b983;
}

.progress-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.fill {
  height: 100%;
  background: #42b983;
  transition: width 0.3s ease;
}
</style>
