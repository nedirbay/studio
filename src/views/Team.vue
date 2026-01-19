<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { TeamMember } from "../types/models";

const members = ref<TeamMember[]>([]);
const showModal = ref(false);
const newMember = ref({
    name: "",
    role: "",
    phone: "",
    skills: "",
    rating: 5,
});

const fetchTeam = async () => {
    members.value = await api.getTeamMembers();
};

const addMember = async () => {
    if (!newMember.value.name) return;
    await api.createTeamMember(newMember.value);
    showModal.value = false;
    newMember.value = { name: "", role: "", phone: "", skills: "", rating: 5 };
    await fetchTeam();
};

onMounted(fetchTeam);
</script>

<template>
    <div class="team-view">
        <header class="page-header">
            <h1>Topar & HR</h1>
            <button class="btn-primary" @click="showModal = true">+ Işgär Goş</button>
        </header>

        <div class="team-grid">
            <div v-for="member in members" :key="member.id" class="member-card">
                <div class="avatar">{{ member.name.charAt(0) }}</div>
                <h3>{{ member.name }}</h3>
                <div class="role">{{ member.role }}</div>
                <div class="rating">
                    <span v-for="i in 5" :key="i" :class="{ filled: i <= (member.rating || 0) }">★</span>
                </div>
                <div class="contact">{{ member.phone }}</div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <h2>Topar Agzasyny Goşmak</h2>
                <form @submit.prevent="addMember">
                    <div class="form-group">
                        <label>Ady</label>
                        <input v-model="newMember.name" required />
                    </div>
                    <div class="form-group">
                        <label>Wezipesi</label>
                        <input v-model="newMember.role" placeholder="meselem: Suratçy" />
                    </div>
                    <div class="form-group">
                        <label>Telefon</label>
                        <input v-model="newMember.phone" />
                    </div>
                    <div class="form-group">
                        <label>Reýting (1-5)</label>
                        <input v-model.number="newMember.rating" type="number" min="1" max="5" />
                    </div>
                    <div class="actions">
                        <button type="button" @click="showModal = false">Yza</button>
                        <button type="submit" class="btn-primary">Ýatda Sakla</button>
                    </div>
                </form>
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

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 24px;
}

.member-card {
    background: #1e1e1e;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    border: 1px solid #333;
}

.avatar {
    width: 80px;
    height: 80px;
    background: #333;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #aaa;
}

.role {
    color: #42b983;
    margin-bottom: 8px;
    font-size: 0.9rem;
    text-transform: uppercase;
}

.rating {
    color: #333;
    margin-bottom: 12px;
}

.rating .filled {
    color: #ffeb3b;
}

.contact {
    color: #666;
    font-size: 0.9rem;
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
}

.modal {
    background: #1e1e1e;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    border: 1px solid #333;
}

.form-group {
    margin-bottom: 16px;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #aaa;
}

.form-group input {
    width: 100%;
    padding: 10px;
    background: #121212;
    border: 1px solid #333;
    color: #fff;
    border-radius: 6px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

.btn-primary {
    background: #42b983;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}
</style>
