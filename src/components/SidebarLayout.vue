<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const menuItems = [
  { name: "Dolandyryş", path: "/", icon: "🏠" },
  { name: "Müşderiler", path: "/clients", icon: "👥" },
  { name: "Senenama", path: "/calendar", icon: "📅" },
  { name: "Önümçilik", path: "/production", icon: "🎬" },
  { name: "Enjamlar", path: "/inventory", icon: "🎒" },
  { name: "Maliýe", path: "/finance", icon: "💰" },
  { name: "Topar", path: "/team", icon: "👷" },
];
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>Studio</h2>
      </div>
      <nav>
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-item" active-class="active">
          <span class="icon">{{ item.icon }}</span>
          <span class="name">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #121212;
  color: #fff;
}

.sidebar {
  width: 250px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.logo h2 {
  margin: 0;
  color: #42b983;
}

nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #aaa;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #2a2a2a;
  color: #fff;
}

.nav-item.active {
  background-color: #42b98322;
  color: #42b983;
  border-right: 3px solid #42b983;
}

.icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #121212;
}
</style>
