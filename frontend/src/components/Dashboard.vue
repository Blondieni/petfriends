<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-10 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-700">Hallo, {{ username }}! 👋</h1>
      <router-link to="/create-pet" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-md">
        + Neues Tier
      </router-link>
    </div>

    <div v-if="pets.length > 0" class="max-w-6xl mx-auto space-y-12">
      
      <section v-if="dogs.length > 0">
        <h3 class="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2 border-b border-indigo-100 pb-2">
          <span>🐶</span> Deine Hunde-Schnauzen
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCard v-for="pet in dogs" :key="pet.id" :pet="pet">
            <template #footer>
              <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">{{ pet.type }}</span>
              <div class="flex gap-4">
                <router-link :to="`/edit-pet/${pet.id}`" class="text-indigo-600 text-sm font-medium">✏️ Edit</router-link>
                <button @click="deletePet(pet.id)" class="text-red-500 text-sm font-medium">🗑️ Löschen</button>
              </div>
            </template>
          </PetCard>
        </div>
      </section>

      <section v-if="cats.length > 0">
        <h3 class="text-xl font-bold text-pink-700 mb-4 flex items-center gap-2 border-b border-pink-100 pb-2">
          <span>🐱</span> Deine Katzen-Schnurrer
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCard v-for="pet in cats" :key="pet.id" :pet="pet">
            <template #footer>
              <span class="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold">{{ pet.type }}</span>
              <div class="flex gap-4">
                <router-link :to="`/edit-pet/${pet.id}`" class="text-indigo-600 text-sm font-medium">✏️ Edit</router-link>
                <button @click="deletePet(pet.id)" class="text-red-500 text-sm font-medium">🗑️ Löschen</button>
              </div>
            </template>
          </PetCard>
        </div>
      </section>

      <section v-if="others.length > 0">
        <h3 class="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2 border-b border-amber-100 pb-2">
          <span>🐹</span> Kleintiere & Vögel
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PetCard v-for="pet in others" :key="pet.id" :pet="pet">
            <template #footer>
              <div class="flex gap-4 w-full justify-end">
                <router-link :to="`/edit-pet/${pet.id}`" class="text-indigo-600 text-sm font-medium">✏️ Edit</router-link>
                <button @click="deletePet(pet.id)" class="text-red-500 text-sm font-medium">🗑️ Löschen</button>
              </div>
            </template>
          </PetCard>
        </div>
      </section>
    </div>

    <div v-else class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 max-w-6xl mx-auto">
      <p class="text-gray-500 text-lg">Noch keine Schnauzen registriert. 🐾</p>
      <router-link to="/create-pet" class="text-indigo-600 font-bold hover:underline mt-2 inline-block">Erstelle jetzt dein erstes Tier-Profil</router-link>
    </div>

    <div class="mt-16 border-t pt-10 max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold text-pink-600 mb-6 flex items-center">
        <span class="mr-2">❤️</span> Deine Matches
      </h2>
      <div v-if="matches.length === 0" class="text-gray-500 italic p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        Noch keine Matches gefunden. Geh auf die Entdecken-Seite und verteile ein paar Likes!
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="match in matches" :key="match.id" class="bg-white rounded-xl shadow-md overflow-hidden border-2 border-pink-100 transition-transform hover:scale-105">
          <img v-if="match.imageUrl" :src="`http://localhost:5000${match.imageUrl}`" class="w-full h-40 object-cover" />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-800">{{ match.name }}</h3>
            <p class="text-sm text-gray-500 mb-4">{{ match.type }} • {{ match.breed }}</p>
            <router-link :to="`/chat/${match.ownerId}`" class="w-full bg-pink-500 text-white py-2 rounded-lg block text-center font-bold hover:bg-pink-600 transition">
              Nachricht senden
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' 
import PetCard from './PetCard.vue' // WICHTIG: Die Komponente laden!

const router = useRouter()
const username = ref(localStorage.getItem('username') || 'Nutzer')
const pets = ref([]) 
const matches = ref([]) 

const dogs = computed(() => pets.value.filter(p => p.type === 'Hund'))
const cats = computed(() => pets.value.filter(p => p.type === 'Katze'))
const others = computed(() => pets.value.filter(p => p.type !== 'Hund' && p.type !== 'Katze'))

const loadPets = async () => {
  try {
    const response = await api.get('/pets/my-pets')
    pets.value = response.data
  } catch (error) { console.error('Ladefehler Tiere:', error) }
}

const fetchMatches = async () => {
  try {
    const response = await api.get('/matching/my-matches')
    matches.value = response.data
  } catch (error) { console.error("Ladefehler Matches:", error) }
}

const deletePet = async (id) => {
  if (!confirm('Dieses Profil wirklich unwiderruflich löschen?')) return
  try {
    await api.delete(`/pets/${id}`)
    pets.value = pets.value.filter(p => p.id !== id)
    fetchMatches()
  } catch (error) { alert('Fehler beim Löschen des Tiers.') }
}

onMounted(() => {
  loadPets()
  fetchMatches()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}
</style>