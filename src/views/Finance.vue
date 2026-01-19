<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Transaction } from "../types/models";

const transactions = ref<Transaction[]>([]);
const stats = ref({ income: 0, expense: 0, net: 0 });
const showModal = ref(false);
const newTransaction = ref({
    type: "income" as "income" | "expense",
    amount: 0,
    category: "",
    description: "",
});

const fetchTransactions = async () => {
    transactions.value = await api.getTransactions();
    stats.value = await api.getFinanceStats();
};

const addTransaction = async () => {
    if (newTransaction.value.amount <= 0) return;
    await api.createTransaction(newTransaction.value);
    showModal.value = false;
    newTransaction.value = {
        type: "income",
        amount: 0,
        category: "",
        description: "",
    };
    await fetchTransactions();
};

const createInvoice = () => {
    // In a real app this would allow selecting a project
    alert("Invoice generated for latest project (Mock PDF)");
};

onMounted(fetchTransactions);
</script>

<template>
    <div class="finance-view">
        <header class="page-header">
            <div>
                <h1>Maliýe</h1>
                <p class="subtitle">Umumy ýagdaý</p>
            </div>
            <div class="header-actions">
                <button class="btn-secondary" @click="createInvoice">
                    📄 Faktura Döret
                </button>
                <button class="btn-primary" @click="showModal = true">
                    + Geleşik Goş
                </button>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card income">
                <div class="label">Jemi Girdeji</div>
                <div class="val">+{{ stats.income.toLocaleString() }} TMT</div>
            </div>
            <div class="stat-card expense">
                <div class="label">Çykdajylar</div>
                <div class="val">-{{ stats.expense.toLocaleString() }} TMT</div>
            </div>
            <div class="stat-card net">
                <div class="label">Arassa Peýda (Net)</div>
                <div class="val" :class="{ neg: stats.net < 0 }">
                    {{ stats.net.toLocaleString() }} TMT
                </div>
            </div>
        </div>

        <div class="transactions-list">
            <h3>Soňky Geleşikler</h3>
            <div v-for="t in transactions" :key="t.id" class="transaction-item">
                <div class="t-info">
                    <div class="category">{{ t.category || "Umumy" }}</div>
                    <div class="desc">{{ t.description }}</div>
                    <div class="date">{{ new Date(t.date).toLocaleDateString() }}</div>
                </div>
                <div class="amount" :class="t.type">
                    {{ t.type === "income" ? "+" : "-" }}
                    {{ t.amount.toLocaleString() }} TMT
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <h2>Geleşik Goşmak</h2>
                <form @submit.prevent="addTransaction">
                    <div class="form-group">
                        <label>Görnüşi</label>
                        <select v-model="newTransaction.type">
                            <option value="income">Girdeji</option>
                            <option value="expense">Çykdajy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Möçberi</label>
                        <input v-model.number="newTransaction.amount" type="number" required />
                    </div>
                    <div class="form-group">
                        <label>Kategoriýa</label>
                        <input v-model="newTransaction.category" placeholder="meselem: Toý, Kireý, Enjam" />
                    </div>
                    <div class="form-group">
                        <label>Düşündiriş</label>
                        <input v-model="newTransaction.description" />
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

.header-actions {
    display: flex;
    gap: 10px;
}

.subtitle {
    font-size: 0.9rem;
    color: #888;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
}

.stat-card {
    background: #1e1e1e;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #333;
}

.stat-card .label {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.stat-card .val {
    font-size: 1.5rem;
    font-weight: bold;
}

.stat-card.income .val {
    color: #42b983;
}

.stat-card.expense .val {
    color: #f44336;
}

.stat-card.net .val {
    color: #ff9800;
}

.stat-card.net .val.neg {
    color: #f44336;
}

.transactions-list h3 {
    margin-bottom: 16px;
    font-size: 1.1rem;
    color: #ccc;
}

.transaction-item {
    background: #1e1e1e;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #333;
}

.t-info .category {
    font-weight: bold;
    color: #fff;
    margin-bottom: 4px;
}

.t-info .desc {
    color: #aaa;
    font-size: 0.9rem;
}

.t-info .date {
    color: #666;
    font-size: 0.8rem;
    margin-top: 4px;
}

.amount {
    font-size: 1.1rem;
    font-weight: bold;
}

.amount.income {
    color: #42b983;
}

.amount.expense {
    color: #f44336;
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
    background: #333;
    color: #fff;
    border: 1px solid #555;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
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
