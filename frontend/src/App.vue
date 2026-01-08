<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <Navbar v-if="$route.path !== '/login'" />
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue' // Importiert die neue Navbar-Komponente
</script>