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
        <label class="block text-sm font-medium text-gray-700">Tierart</label>
        <select v-model="pet.type" required
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
          <option value="Hund">Hund</option>
          <option value="Katze">Katze</option>
          <option value="Kleintier">Kleintier</option>
          <option value="Vogel">Vogel</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Rasse (optional)</label>
        <input v-model="pet.breed" type="text" placeholder="z.B. Golden Retriever"
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Alter (in Jahren)</label>
        <input v-model="pet.age" type="number" placeholder="z.B. 3" required
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700">Beschreibung / Charakter</label>
        <textarea v-model="pet.description" 
          placeholder="Erzähle etwas über das Wesen, Vorlieben oder Besonderheiten..." 
          class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"></textarea>
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
import api from '../services/api'

const router = useRouter()

// Pet-Objekt initialisieren (Namen passend zum Backend-Schema)
const pet = ref({
  name: '',
  type: 'Hund', // Entspricht der Spalte 'type' im Prisma-Model
  breed: '',
  age: '',
  description: '' // NEU: Feld für die Beschreibung
})

const selectedFile = ref(null)

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

const savePet = async () => {
  try {
    const formData = new FormData()
    formData.append('name', pet.value.name)
    formData.append('type', pet.value.type) // Wichtig: type statt species
    formData.append('breed', pet.value.breed)
    formData.append('age', pet.value.age)
    formData.append('description', pet.value.description) // Beschreibung mitschicken
    
    if (selectedFile.value) {
      formData.append('image', selectedFile.value) // Entspricht upload.single('image') im Backend
    }

    // API-Call an /pets/add
    await api.post('/pets/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    alert(`Profil für ${pet.value.name} wurde erfolgreich erstellt!`)
    router.push('/dashboard')
  } catch (error) {
    console.error('Fehler beim Speichern:', error)
    const errorMsg = error.response?.data?.error || 'Haustier konnte nicht gespeichert werden.'
    alert('Hoppla! ' + errorMsg)
  }
}
</script>