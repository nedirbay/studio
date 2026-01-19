<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Equipment, TeamMember } from "../types/models";

const equipment = ref<Equipment[]>([]);
const teamMembers = ref<TeamMember[]>([]);
const showModal = ref(false);
const showActionModal = ref(false);
const selectedItem = ref<Equipment | null>(null);
const selectedAction = ref<"check-in" | "check-out">("check-out");
const selectedMemberId = ref<number | null>(null);

const newItem = ref({
    name: "",
    serial_number: "",
    condition: "Good",
    status: "available" as "available" | "in-use" | "repair",
});

const fetchEquipment = async () => {
    equipment.value = await api.getEquipment();
};
const fetchTeam = async () => {
    teamMembers.value = await api.getTeamMembers();
};

const addItem = async () => {
    await api.createEquipment(newItem.value);
    showModal.value = false;
    newItem.value = {
        name: "",
        serial_number: "",
        condition: "Good",
        status: "available",
    };
    await fetchEquipment();
};

const openActionModal = (item: Equipment, action: "check-in" | "check-out") => {
    selectedItem.value = item;
    selectedAction.value = action;
    showActionModal.value = true;
};

const performAction = async () => {
    if (!selectedItem.value) return;

    if (selectedAction.value === "check-out") {
        if (!selectedMemberId.value) return alert("Işgär saýlaň!");
        await api.checkOutEquipment(selectedItem.value.id, selectedMemberId.value);
    } else {
        await api.checkInEquipment(selectedItem.value.id);
    }

    showActionModal.value = false;
    selectedMemberId.value = null;
    await fetchEquipment();
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case "available":
            return "Elýeterli";
        case "in-use":
            return "Ulanylýar";
        case "repair":
            return "Bejergide";
        default:
            return status;
    }
};

onMounted(() => {
    fetchEquipment();
    fetchTeam();
});
</script>

<template>
    <div class="inventory-view">
        <header class="page-header">
            <h1>Enjamlar & Ammar</h1>
            <button class="btn-primary" @click="showModal = true">+ Enjam Goş</button>
        </header>

        <div class="inventory-table">
            <table>
                <thead>
                    <tr>
                        <th>Ady</th>
                        <th>Seriýa Belgisi</th>
                        <th>Resource (Shutter)</th>
                        <th>Ýagdaýy</th>
                        <th>Hili</th>
                        <th>Hereket</th>
                    </tr>
                </thead>
                <tbody>
                    <div v-if="equipment.length === 0" class="empty-state">Enjam ýok</div>
                    <tr v-for="item in equipment" :key="item.id">
                        <td class="name-col">
                            {{ item.name }}
                            <span v-if="item.checked_out_to" class="borrower-badge">
                                👤 {{ item.checked_out_to }}
                            </span>
                        </td>
                        <td>{{ item.serial_number }}</td>
                        <td>
                            <div class="progress-bar">
                                <div class="fill" :style="{
                                    width:
                                        Math.min(
                                            (item.shutter_count /
                                                (item.max_shutter_life || 150000)) *
                                            100,
                                            100,
                                        ) + '%',
                                }"></div>
                            </div>
                            <span class="tiny-text">{{ item.shutter_count }} /
                                {{ item.max_shutter_life || "∞" }}</span>
                        </td>
                        <td>
                            <span class="status-badge" :class="item.status">
                                {{ getStatusLabel(item.status) }}
                            </span>
                        </td>
                        <td>{{ item.condition }}</td>
                        <td>
                            <button v-if="item.status === 'available'" class="action-btn out"
                                @click="openActionModal(item, 'check-out')">
                                Çykar
                            </button>
                            <button v-if="item.status === 'in-use'" class="action-btn in"
                                @click="openActionModal(item, 'check-in')">
                                Tabşyr
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Modal -->
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
                        <select v-model="newItem.condition">
                            <option>Täze</option>
                            <option>Gowy</option>
                            <option>Köne</option>
                        </select>
                    </div>
                    <div class="actions">
                        <button type="button" @click="showModal = false">Yza</button>
                        <button type="submit" class="btn-primary">Ýatda Sakla</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Check In/Out Modal -->
        <div v-if="showActionModal" class="modal-overlay" @click.self="showActionModal = false">
            <div class="modal">
                <h2>
                    {{
                        selectedAction === "check-out"
                            ? "Enjam Bermek"
                            : "Enjam Kabul Etmek"
                    }}
                </h2>
                <p class="modal-subtitle">
                    {{ selectedItem?.name }} ({{ selectedItem?.serial_number }})
                </p>

                <form @submit.prevent="performAction">
                    <div v-if="selectedAction === 'check-out'" class="form-group">
                        <label>Kime berilýär?</label>
                        <select v-model="selectedMemberId" required>
                            <option v-for="m in teamMembers" :key="m.id" :value="m.id">
                                {{ m.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="selectedAction === 'check-in'" class="info-text">
                        Bu enjam yzyna kabul edilýär we "Elýeterli" statusyna geçer.
                    </div>

                    <div class="actions">
                        <button type="button" @click="showActionModal = false">Yza</button>
                        <button type="submit" class="btn-primary">Tassykla</button>
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

.inventory-table {
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
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #333;
}

th {
    background: #252525;
    color: #888;
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

.action-btn {
    padding: 4px 10px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: bold;
}

.action-btn.out {
    background: #ebdec2;
    color: #5c4b26;
}

.action-btn.in {
    background: #c2ebce;
    color: #1e522d;
}

.borrower-badge {
    display: block;
    font-size: 0.75rem;
    color: #ff9800;
    margin-top: 4px;
}

.progress-bar {
    background: #333;
    height: 6px;
    border-radius: 3px;
    width: 100px;
    overflow: hidden;
    margin-bottom: 4px;
}

.fill {
    background: #42b983;
    height: 100%;
}

.tiny-text {
    font-size: 0.7rem;
    color: #666;
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
    width: 400px;
    border: 1px solid #333;
}

.modal-subtitle {
    color: #888;
    margin-top: -10px;
    margin-bottom: 20px;
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

.btn-primary {
    background: #42b983;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}
</style>
