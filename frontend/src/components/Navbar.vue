<template>
  <nav class="bg-indigo-600 p-4 text-white shadow-md flex justify-between items-center sticky top-0 z-50">
    <div class="text-xl font-bold flex items-center gap-2 cursor-pointer" @click="$router.push('/dashboard')">
      <span>PetFriends</span> 🐾
    </div>
    
    <div v-if="isLoggedIn" class="flex gap-6 items-center">
      <router-link to="/dashboard" class="hover:text-indigo-200 transition">Feed</router-link>
      
      <router-link to="/explore" class="hover:text-indigo-200 transition flex items-center">
        <span class="mr-1">🔍</span> Entdecken
      </router-link>

      <router-link to="/inbox" class="relative group">
        <span class="text-xl group-hover:scale-110 transition-transform block">💬</span>
        <span v-if="unreadCount > 0" 
              class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-indigo-600 animate-bounce">
          {{ unreadCount }}
        </span>
      </router-link>
      
      <router-link to="/create-pet" class="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-400 transition text-sm font-medium border border-indigo-400">
        + Tier anlegen
      </router-link>

      <button @click="handleLogout" 
        class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition font-semibold text-sm shadow-sm">
        Abmelden
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import api from '../services/api' // WICHTIG: Importiere dein API-Modul

const router = useRouter()
const isLoggedIn = ref(false)
const unreadCount = ref(0) // NEU: Speicher für ungelesene Nachrichten
let interval = null // Speicher für das Polling

// Prüft den Login-Status
const checkAuth = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// NEU: Holt die Anzahl der ungelesenen Nachrichten vom Server
const fetchUnreadCount = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await api.get('/messages/unread/count')
    unreadCount.value = res.data.unreadCount
  } catch (err) {
    console.error("Fehler beim Zählen der Nachrichten:", err)
  }
}

watchEffect(() => {
  checkAuth()
})

onMounted(() => {
  checkAuth()
  fetchUnreadCount() // Sofort einmal prüfen
  
  // Polling: Alle 10 Sekunden schauen, ob neue Post da ist
  interval = setInterval(() => {
    if (isLoggedIn.value) fetchUnreadCount()
  }, 10000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval) // Aufräumen, wenn Komponente zerstört wird
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  if (interval) clearInterval(interval)
  router.push('/login')
}
</script>