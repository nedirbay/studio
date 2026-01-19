<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Client } from "../types/models";

const clients = ref<Client[]>([]);
const showModal = ref(false);
const newClient = ref({
  name: "",
  phone: "",
  email: "",
  social_links: "{}",
  relatives: "[]",
  type: "lead" as "lead" | "client",
});

const fetchClients = async () => {
  try {
    clients.value = await api.getClients();
  } catch (err) {
    console.error("Failed to fetch clients:", err);
  }
};

const addClient = async () => {
  if (!newClient.value.name) return;

  try {
    await api.createClient(newClient.value);
    showModal.value = false;
    newClient.value = {
      name: "",
      phone: "",
      email: "",
      social_links: "{}",
      relatives: "[]",
      type: "lead",
    };
    await fetchClients();
  } catch (err) {
    console.error("Failed to create client:", err);
    alert("Error saving client. Check console.");
  }
};

onMounted(fetchClients);
</script>

<template>
  <div class="clients-view">
    <header class="page-header">
      <h1>Müşderiler CRM</h1>
      <button class="btn-primary" @click="showModal = true">
        + Täze Müşderi
      </button>
    </header>

    <div class="clients-list">
      <div v-for="client in clients" :key="client.id" class="client-card">
        <div class="avatar">{{ client.name.charAt(0) }}</div>
        <div class="info">
          <h3>{{ client.name }}</h3>
          <p class="role" :class="client.type">
            {{ client.type === "lead" ? "Potensial" : "Müşderi" }}
          </p>
          <div class="contact">
            <span>📞 {{ client.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>Täze Müşderi Goşmak</h2>
        <form @submit.prevent="addClient">
          <div class="form-group">
            <label>Ady</label>
            <input v-model="newClient.name" type="text" required placeholder="Doly Ady" />
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input v-model="newClient.phone" type="text" placeholder="+993..." />
          </div>
          <div class="form-group">
            <label>Görnüşi</label>
            <select v-model="newClient.type">
              <option value="lead">Potensial (Lead)</option>
              <option value="client">Müşderi (Şertnama)</option>
            </select>
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
  margin-bottom: 32px;
}

.btn-primary {
  background: #42b983;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.clients-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.client-card {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  border: 1px solid #333;
  transition: transform 0.2s;
}

.client-card:hover {
  transform: translateY(-2px);
  border-color: #42b983;
}

.avatar {
  background: #333;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 16px;
  color: #aaa;
}

.info h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
}

.role {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
}

.role.lead {
  background: #ff980033;
  color: #ff9800;
}

.role.client {
  background: #42b98333;
  color: #42b983;
}

.contact {
  color: #888;
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
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #aaa;
}

.form-group input,
.form-group select {
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
</style>
