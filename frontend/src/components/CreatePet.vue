<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 class="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
      <span>🐾</span> Neues Haustier-Profil
    </h2>
    
    <form @submit.prevent="savePet" class="space-y-4">
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
        <label class="block text-sm font-medium text-gray-700">Foto hochladen</label>
        <input type="file" @change="handleFileUpload" accept="image/*"
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
      </div>

      <button type="submit" 
        class="w-full py-3 mt-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md">
        Profil speichern
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' // WICHTIG: Die API-Verbindung importieren

const router = useRouter()
const pet = ref({
  name: '',
  breed: '',
  age: '',
  species: 'Hund' // Standardwert für dein Backend
})

const selectedFile = ref(null)

// NEU: Diese Funktion merkt sich die Datei, wenn du sie auswählst
const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

const savePet = async () => {
  try {
    // Da wir ein Bild mitschicken, nutzen wir FormData ("digitaler Briefumschlag")
    const formData = new FormData()
    formData.append('name', pet.value.name)
    formData.append('breed', pet.value.breed)
    formData.append('species', pet.value.species)
    formData.append('age', pet.value.age)
    
    if (selectedFile.value) {
      formData.append('image', selectedFile.value) // Das Feld muss "image" heißen wie im Backend!
    }

    // Ab an das Backend (Route: /api/pets/add)
    await api.post('/pets/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    alert(`Profil für ${pet.value.name} wurde erfolgreich erstellt!`)
    router.push('/dashboard')
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    alert('Fehler: Haustier konnte nicht gespeichert werden.')
  }
}
</script>