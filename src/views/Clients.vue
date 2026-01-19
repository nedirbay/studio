<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Client } from "../types/models";

const clients = ref<Client[]>([]);
const showModal = ref(false);
const showDetailModal = ref(false);
const selectedClient = ref<Client | null>(null);
const clientTotalPaid = ref(0);

// Form State
const newClient = ref({
  name: "",
  phone: "",
  email: "",
  instagram: "",
  tiktok: "",
  birth_date: "",
  relatives_text: "",
  type: "lead" as "lead" | "client",
});

const fetchClients = async () => {
  try {
    clients.value = await api.getClients();
  } catch (err) {
    console.error("Failed to fetch clients:", err);
  }
};

const openDetail = async (client: Client) => {
  selectedClient.value = client;
  clientTotalPaid.value = await api.getClientFinancials(client.id);
  showDetailModal.value = true;
};

const addClient = async () => {
  if (!newClient.value.name) return;

  try {
    const socialLinks = JSON.stringify({
      instagram: newClient.value.instagram,
      tiktok: newClient.value.tiktok,
    });

    // Parse relatives text
    const relatives = JSON.stringify(
      newClient.value.relatives_text
        .split("\n")
        .filter((line) => line.trim() !== ""),
    );

    await api.createClient({
      name: newClient.value.name,
      phone: newClient.value.phone,
      email: newClient.value.email,
      birth_date: newClient.value.birth_date,
      social_links: socialLinks,
      relatives: relatives,
      type: newClient.value.type,
    });

    showModal.value = false;
    newClient.value = {
      name: "",
      phone: "",
      email: "",
      instagram: "",
      tiktok: "",
      birth_date: "",
      relatives_text: "",
      type: "lead",
    };
    await fetchClients();
  } catch (err) {
    console.error("Failed to create client:", err);
    alert("Error saving client. Check console.");
  }
};

const generateContract = async () => {
  if (!selectedClient.value) return;
  const res = await api.generateContract(selectedClient.value);
  alert(res.message);
};

const isBirthday = (dateStr?: string) => {
  if (!dateStr) return false;
  const today = new Date();
  const birth = new Date(dateStr);
  return (
    today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth()
  );
};

const getSocials = (json?: string) => {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
};

const getRelatives = (json?: string) => {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
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
      <div v-for="client in clients" :key="client.id" class="client-card" @click="openDetail(client)">
        <div class="avatar">
          {{ client.name.charAt(0) }}
          <span v-if="isBirthday(client.birth_date)" class="bday-badge">🎂</span>
        </div>
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

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>Täze Müşderi Goşmak</h2>
        <form @submit.prevent="addClient">
          <div class="row">
            <div class="form-group half">
              <label>Ady</label>
              <input v-model="newClient.name" type="text" required placeholder="Doly Ady" />
            </div>
            <div class="form-group half">
              <label>Görnüşi</label>
              <select v-model="newClient.type">
                <option value="lead">Potensial (Lead)</option>
                <option value="client">Müşderi (Şertnama)</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="form-group half">
              <label>Telefon</label>
              <input v-model="newClient.phone" type="text" placeholder="+993..." />
            </div>
            <div class="form-group half">
              <label>Doglan güni</label>
              <input v-model="newClient.birth_date" type="date" />
            </div>
          </div>

          <div class="form-group">
            <label>Instagram / TikTok</label>
            <div class="social-inputs">
              <input v-model="newClient.instagram" placeholder="Instagram (@...)" />
              <input v-model="newClient.tiktok" placeholder="TikTok (@...)" />
            </div>
          </div>

          <div class="form-group">
            <label>Garyndaşlar (Her setirde birin ýaz)</label>
            <textarea v-model="newClient.relatives_text" rows="3"
              placeholder="Aman (Kaka): +993...&#10;Maral (Eje): +993..."></textarea>
          </div>

          <div class="actions">
            <button type="button" @click="showModal = false">Yza</button>
            <button type="submit" class="btn-primary">Ýatda Sakla</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedClient" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal detail-modal">
        <header class="detail-header">
          <div>
            <h2>{{ selectedClient.name }}</h2>
            <span class="role" :class="selectedClient.type">{{
              selectedClient.type === "lead" ? "Potensial" : "Müşderi"
            }}</span>
          </div>
          <button class="close-btn" @click="showDetailModal = false">×</button>
        </header>

        <div class="detail-body">
          <div class="section info-grid">
            <div class="info-item">
              <label>Telefon:</label>
              <span>{{ selectedClient.phone }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ selectedClient.email || "-" }}</span>
            </div>
            <div class="info-item">
              <label>Doglan güni:</label>
              <span>
                {{ selectedClient.birth_date || "-" }}
                <span v-if="isBirthday(selectedClient.birth_date)">🎂</span>
              </span>
            </div>
          </div>

          <div class="section">
            <h3>Sosial Media</h3>
            <div class="tags">
              <span v-if="getSocials(selectedClient.social_links).instagram" class="tag insta">
                📸 {{ getSocials(selectedClient.social_links).instagram }}
              </span>
              <span v-if="getSocials(selectedClient.social_links).tiktok" class="tag tiktok">
                🎵 {{ getSocials(selectedClient.social_links).tiktok }}
              </span>
            </div>
          </div>

          <div class="section">
            <h3>Garyndaşlar</h3>
            <ul class="relatives-list">
              <li v-for="(rel, idx) in getRelatives(selectedClient.relatives)" :key="idx">
                {{ rel }}
              </li>
              <li v-if="getRelatives(selectedClient.relatives).length === 0" class="empty">
                Bellik ýok
              </li>
            </ul>
          </div>

          <div class="section financial">
            <h3>Maliýe Ýagdaýy</h3>
            <div class="stat-box">
              <label>Jemi Tölenen:</label>
              <div class="amount">
                {{ clientTotalPaid.toLocaleString() }} TMT
              </div>
            </div>
          </div>
        </div>

        <footer class="detail-footer">
          <button class="btn-secondary" @click="generateContract">
            📄 Şertnama Döret (PDF)
          </button>
          <button class="btn-primary">✏️ Üýtget</button>
        </footer>
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

.btn-secondary {
  background: #555;
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
  cursor: pointer;
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
  position: relative;
}

.bday-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1rem;
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
  z-index: 1000;
}

.modal {
  background: #1e1e1e;
  padding: 30px;
  border-radius: 12px;
  width: 500px;
  border: 1px solid #333;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-modal {
  width: 600px;
}

.row {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  background: #121212;
  border: 1px solid #333;
  color: #fff;
  border-radius: 6px;
}

.social-inputs {
  display: flex;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Detail Modal Styles */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid #333;
  padding-bottom: 16px;
}

.detail-header h2 {
  margin: 0 0 8px 0;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  font-size: 1rem;
  color: #aaa;
  margin-bottom: 12px;
  border-left: 3px solid #42b983;
  padding-left: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.tags {
  display: flex;
  gap: 10px;
}

.tag {
  background: #333;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.tag.insta {
  color: #e1306c;
}

.tag.tiktok {
  color: #00f2ea;
}

.relatives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.relatives-list li {
  padding: 8px;
  background: #121212;
  border-radius: 4px;
  margin-bottom: 4px;
}

.empty {
  color: #555;
  font-style: italic;
}

.financial .stat-box {
  background: #121212;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #333;
}

.financial .amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #333;
  padding-top: 16px;
  margin-top: 16px;
}
</style>
