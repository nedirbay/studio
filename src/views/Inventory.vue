<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Equipment } from "../types/models";

const equipment = ref<Equipment[]>([]);
const showModal = ref(false);
const newItem = ref({
    name: "",
    serial_number: "",
    condition: "Good",
    status: "available" as "available" | "in-use" | "repair",
    purchase_date: new Date().toISOString().split("T")[0],
});

const fetchEquipment = async () => {
    equipment.value = await api.getEquipment();
};

const addItem = async () => {
    if (!newItem.value.name) return;
    await api.createEquipment(newItem.value);
    showModal.value = false;
    newItem.value = {
        name: "",
        serial_number: "",
        condition: "Good",
        status: "available",
        purchase_date: new Date().toISOString().split("T")[0],
    };
    await fetchEquipment();
};

onMounted(fetchEquipment);
</script>

<template>
    <div class="inventory-view">
        <header class="page-header">
            <h1>Enjamlar & Ammar</h1>
            <button class="btn-primary" @click="showModal = true">+ Enjam Goş</button>
        </header>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Ady</th>
                        <th>Seriýa Belgisi</th>
                        <th>Ýagdaýy</th>
                        <th>Hili</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in equipment" :key="item.id">
                        <td>{{ item.name }}</td>
                        <td>{{ item.serial_number || "-" }}</td>
                        <td>
                            <span class="status-badge" :class="item.status">{{
                                item.status
                                }}</span>
                        </td>
                        <td>{{ item.condition }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <h2>Enjam Goşmak</h2>
                <form @submit.prevent="addItem">
                    <div class="form-group">
                        <label>Ady</label>
                        <input v-model="newItem.name" required />
                    </div>
                    <div class="form-group">
                        <label>Seriýa Belgisi</label>
                        <input v-model="newItem.serial_number" />
                    </div>
                    <div class="form-group">
                        <label>Hili</label>
                        <input v-model="newItem.condition" />
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

.table-container {
    background: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #333;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #333;
}

th {
    background: #2a2a2a;
    color: #aaa;
    font-weight: 500;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    text-transform: uppercase;
}

.status-badge.available {
    background: #42b98333;
    color: #42b983;
}

.status-badge.in-use {
    background: #ff980033;
    color: #ff9800;
}

.status-badge.repair {
    background: #f4433633;
    color: #f44336;
}

/* Modal styles reused */
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
