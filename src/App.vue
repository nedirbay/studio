<script setup lang="ts">
</script>

<template>
  <div class="app-layout">
    <router-view></router-view>
  </div>
</template>

<style>
/* Global resets if needed */
body {
  margin: 0;
  padding: 0;
  background-color: #121212;
  font-family: 'Inter', sans-serif;
  color: #fff;
}
</style>

<style scoped>
.app-layout {
  min-height: 100vh;
  width: 100%;
}
</style>
