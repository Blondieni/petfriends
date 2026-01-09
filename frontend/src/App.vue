<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <Navbar 
      v-if="$route.path !== '/login' && $route.path !== '/register'" 
      :unreadCount="unreadCount" 
    />
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import api from './services/api'

const unreadCount = ref(0)
let intervalId = null

// Funktion zum Abrufen der ungelesenen Nachrichten (Anforderung FD-02)
const fetchUnreadCount = async () => {
  const token = localStorage.getItem('token')
  if (!token) return // Abbrechen, wenn nicht eingeloggt

  try {
    const res = await api.get('/messages/unread/count')
    unreadCount.value = res.data.unreadCount
  } catch (err) {
    console.error("Fehler beim Laden des Benachrichtigungs-Status")
  }
}

onMounted(() => {
  fetchUnreadCount()
  // Polling: Alle 10 Sekunden prüfen (Anforderung NFA-LE-03: Zeitnahe Info)
  intervalId = setInterval(fetchUnreadCount, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId) // Speicher aufräumen
})
</script>