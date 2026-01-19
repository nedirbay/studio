<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../services/api";
import type { Transaction } from "../types/models";

const transactions = ref<Transaction[]>([]);
const showModal = ref(false);
const newTransaction = ref({
    type: "income" as "income" | "expense",
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
});

const fetchTransactions = async () => {
    transactions.value = await api.getTransactions();
};

const addTransaction = async () => {
    if (newTransaction.value.amount <= 0) return;
    await api.createTransaction(newTransaction.value);
    showModal.value = false;
    // Reset
    newTransaction.value = {
        type: "income",
        amount: 0,
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
    };
    await fetchTransactions();
};

onMounted(fetchTransactions);
</script>

<template>
    <div class="finance-view">
        <header class="page-header">
            <h1>Maliýe</h1>
            <button class="btn-primary" @click="showModal = true">
                + Geleşik Goş
            </button>
        </header>

        <div class="transactions-list">
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
.finance-view {
    max-width: 800px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
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

.category {
    font-weight: bold;
    margin-bottom: 4px;
}

.desc {
    color: #aaa;
    font-size: 0.9rem;
}

.date {
    color: #666;
    font-size: 0.8rem;
    margin-top: 4px;
}

.amount {
    font-size: 1.2rem;
    font-weight: bold;
}

.amount.income {
    color: #42b983;
}

.amount.expense {
    color: #f44336;
}

/* Modal styles included via scoped style duplication or global class usage (simplified here) */
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

.btn-primary {
    background: #42b983;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
}
</style>
