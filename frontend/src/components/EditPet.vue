<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 class="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
      <span>✏️</span> Haustier-Profil bearbeiten
    </h2>
    
    <form @submit.prevent="updatePet" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name des Tieres</label>
        <input v-model="pet.name" type="text" placeholder="z.B. Bello" required
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Tierart / Rasse</label>
        <input v-model="pet.breed" type="text" placeholder="z.B. Golden Retriever" required
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Alter (in Jahren)</label>
        <input v-model="pet.age" type="number" placeholder="z.B. 3" required
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Neues Foto (optional)</label>
        <input type="file" @change="handleFileUpload" accept="image/*"
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
      </div>

      <div class="flex gap-4">
        <button type="submit" 
          class="flex-1 py-3 mt-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md">
          Änderungen speichern
        </button>
        <button type="button" @click="router.push('/dashboard')"
          class="flex-1 py-3 mt-4 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-md">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute() // Um die ID aus der URL zu bekommen
const petId = route.params.id

const pet = ref({
  name: '',
  breed: '',
  age: '',
  species: 'Hund'
})

const selectedFile = ref(null)

// 1. Daten beim Laden der Seite vom Backend holen
onMounted(async () => {
  try {
    const response = await api.get('/pets/my-pets')
    // Wir suchen das Tier mit der richtigen ID aus der Liste
    const foundPet = response.data.find(p => p.id == petId)
    if (foundPet) {
      pet.value = {
        name: foundPet.name,
        breed: foundPet.breed,
        age: foundPet.age,
        species: foundPet.species
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden des Tieres:', error)
  }
})

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

const updatePet = async () => {
  try {
    const formData = new FormData()
    formData.append('name', pet.value.name)
    formData.append('breed', pet.value.breed)
    formData.append('species', pet.value.species)
    formData.append('age', pet.value.age)
    
    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    }

    // WICHTIG: Hier nutzen wir PUT statt POST und hängen die ID an
    await api.put(`/pets/${petId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    alert(`Profil für ${pet.value.name} wurde aktualisiert!`)
    router.push('/dashboard')
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error)
    alert('Fehler: Haustier konnte nicht aktualisiert werden.')
  }
}
</script>