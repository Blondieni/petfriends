<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-indigo-700">Hallo, {{ username }}! 👋</h1>
      <button @click="handleLogout" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm">
        Abmelden
      </button>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-700">Deine aktuellen Schnauzen:</h2>
      <router-link to="/create-pet" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md">
        + Neues Tier
      </router-link>
    </div>

    <div v-if="pets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="pet in pets" :key="pet.id" class="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col">
        
        <div class="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <img v-if="pet.image" :src="`http://localhost:5000${pet.image}`" 
               class="w-full h-full object-cover" alt="Tierfoto" />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <span>Kein Foto vorhanden 🐾</span>
          </div>
        </div>

        <div class="flex-grow">
          <h3 class="text-xl font-bold text-gray-800">{{ pet.name }}</h3>
          <p class="text-gray-600">{{ pet.breed }} ({{ pet.age }} Jahre)</p>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {{ pet.species }}
          </span>
          
          <div class="flex gap-4">
            <router-link :to="`/edit-pet/${pet.id}`" 
              class="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 transition-colors">
              <span>✏️</span> Bearbeiten
            </router-link>

            <button @click="deletePet(pet.id)" 
              class="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors">
              <span>🗑️</span> Löschen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
      <p class="text-gray-500 text-lg">Du hast noch keine Haustiere angelegt.</p>
      <router-link to="/create-pet" class="text-indigo-600 font-bold hover:underline mt-2 inline-block">
        Jetzt das erste Profil erstellen
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' 

const router = useRouter()
const username = ref(localStorage.getItem('username') || 'Nutzer')
const pets = ref([]) 

// Haustiere vom Backend laden
const loadPets = async () => {
  try {
    const response = await api.get('/pets/my-pets')
    pets.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden der Tiere:', error)
  }
}

// Lösch-Logik
const deletePet = async (id) => {
  if (!confirm('Möchtest du dieses Haustier-Profil wirklich löschen?')) return;

  try {
    await api.delete(`/pets/${id}`);
    pets.value = pets.value.filter(pet => pet.id !== id);
    console.log(`Tier mit ID ${id} wurde gelöscht.`);
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    alert('Hoppla! Das Tier konnte nicht gelöscht werden.');
  }
};

onMounted(() => {
  loadPets()
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>