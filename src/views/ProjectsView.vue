<template>
  <div class="view-container">
    <div class="header">
      <h1>Meýilnama dolandyryjy</h1>
      <div class="add-project">
        <input v-model="newProjectName" placeholder="Täze taslama..." @keyup.enter="createProject" />
        <button @click="createProject">
          <span class="icon">+</span> Döret
        </button>
      </div>
    </div>

    <div class="projects-grid" v-if="projects && projects.length > 0">
      <div v-for="project in projects" :key="project.id" class="project-card" @click="openProject(project.id)">
        <div class="card-content">
          <h3>{{ project.name }}</h3>
          <p class="date">{{ formatDate(project.created_at) }}</p>
        </div>
        <button class="delete-btn" @click.stop="deleteProject(project.id)" title="Öçürmek">
          &times;
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Häzirki wagtda hiç hili taslama ýok. Täze taslama dörediň!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

interface Project {
  id: number;
  name: string;
  created_at: string;
}

const projects = ref<Project[]>([]);
const newProjectName = ref("");
const router = useRouter();

const fetchProjects = async () => {
  console.log("Frontend: fetching projects...");
  try {
    const result = await window.ipcRenderer.invoke("get-projects");
    console.log("Frontend: Result type:", typeof result);
    console.log("Frontend: Result is array:", Array.isArray(result));
    console.log("Frontend: Result value:", result);
    console.log("Frontend: Result length:", result?.length);

    // Ensure we have an array
    if (Array.isArray(result)) {
      projects.value = result;
      console.log(
        "Frontend: Projects set successfully, count:",
        projects.value.length,
      );
    } else {
      console.error("Frontend: Result is not an array!");
      projects.value = [];
    }
  } catch (error) {
    console.error("Taslamalary ýükläp bolmady:", error);
    projects.value = [];
  }
};

const createProject = async () => {
  console.log("Frontend: Creating project:", newProjectName.value);
  if (!newProjectName.value.trim()) {
    console.log("Frontend: Empty name, aborting");
    return;
  }
  try {
    const result = await window.ipcRenderer.invoke(
      "create-project",
      newProjectName.value,
    );
    console.log("Frontend: Project created:", result);
    newProjectName.value = "";
    await fetchProjects();
  } catch (error) {
    console.error("Taslama döredip bolmady:", error);
  }
};

const deleteProject = async (id: number) => {
  if (confirm("Siz çyndanam bu taslamany öçürmek isleýärsiňizmi?")) {
    try {
      await window.ipcRenderer.invoke("delete-project", id);
      await fetchProjects();
    } catch (error) {
      console.error("Taslamany öçürip bolmady:", error);
    }
  }
};

const openProject = (id: number) => {
  router.push({ name: "Board", params: { projectId: id } });
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("tk-TM", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

onMounted(() => {
  console.log("Component mounted, fetching projects...");
  fetchProjects();
});
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #fff;
}

.debug-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.debug-info details {
  margin-top: 0.5rem;
}

.debug-info pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #64ffda 0%, #1a73e8 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.add-project {
  display: flex;
  gap: 1rem;
}

input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition:
    border-color 0.3s,
    background 0.3s;
}

input:focus {
  border-color: #64ffda;
  background: rgba(255, 255, 255, 0.1);
}

button {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button:hover:not(:disabled) {
  background: #1557b0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #64ffda, #1a73e8);
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover::before {
  opacity: 1;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #e0e0e0;
}

.date {
  color: #888;
  font-size: 0.85rem;
  margin: 0;
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  font-size: 1.5rem;
  color: #666;
  opacity: 0;
  transition: all 0.3s;
}

.project-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4d;
  transform: scale(1.1);
  box-shadow: none;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
}
</style>
