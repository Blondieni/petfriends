<template>
  <nav class="bg-indigo-600 p-4 text-white shadow-md flex justify-between items-center">
    <div class="text-xl font-bold flex items-center gap-2 cursor-pointer" @click="$router.push('/dashboard')">
      <span>PetFriends</span> 🐾
    </div>
    
    <div class="flex gap-6 items-center">
      <router-link to="/dashboard" class="hover:text-indigo-200 transition">Feed</router-link>
      
      <router-link to="/create-pet" class="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-400 transition text-sm font-medium">
        + Tier anlegen
      </router-link>

      <button @click="handleLogout" 
        class="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition font-semibold text-sm">
        Abmelden
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>