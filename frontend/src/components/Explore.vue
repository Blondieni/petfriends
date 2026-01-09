<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="max-w-xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-700 mb-8 flex items-center">
        <span class="mr-2">🔍</span> Neue Freunde entdecken
      </h1>

      <div class="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600">Ich suche für:</span>
        <select v-model="selectedMyPetId" class="p-2 rounded-lg border-2 border-indigo-200 outline-none bg-indigo-50 text-indigo-900 font-bold">
          <option value="" disabled>Tier auswählen...</option>
          <option v-for="pet in myPets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
        </select>
      </div>

      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center mb-8">
        <span class="text-gray-400 font-bold text-xs uppercase tracking-wider">🔍 Filter:</span>
        
        <div class="flex-grow">
          <input 
            v-model="filterZip" 
            type="text" 
            placeholder="PLZ eingeben (z.B. 49...)" 
            class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        <select v-model="filterType" class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Alle Tiere</option>
          <option value="Hund">Hunde</option>
          <option value="Katze">Katzen</option>
          <option value="Kleintier">Kleintiere</option>
          <option value="Vogel">Vögel</option>
        </select>
      </div>

      <div v-if="filteredPets.length === 0 || currentIndex >= filteredPets.length" 
           class="text-center py-20 bg-white rounded-3xl shadow-md border-2 border-dashed border-gray-200">
        <p class="text-gray-400 text-lg">Keine passenden Vorschläge verfügbar. 🐾</p>
        <button @click="resetFilters" class="mt-4 text-indigo-600 font-bold hover:underline">
          Filter zurücksetzen
        </button>
      </div>

      <div v-else class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col transition-all">
        <div class="relative h-[450px] w-full bg-gray-200">
          <img v-if="currentPet.imageUrl" :src="`http://localhost:5000${currentPet.imageUrl}`" class="w-full h-full object-cover" />
          <div v-else class="flex items-center justify-center h-full text-gray-400 text-6xl">🐾</div>
          
          <div class="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h2 class="text-4xl font-black">{{ currentPet.name }}, {{ currentPet.age || '?' }}</h2>
            <p class="text-lg opacity-90">{{ currentPet.type }} • {{ currentPet.breed }}</p>
            <p class="mt-1 text-sm text-indigo-300">
              📍 {{ currentPet.owner?.zipCode || 'Unbekannter Ort' }} 
              <span class="text-white/60 ml-2">| Besitzer: {{ currentPet.owner?.firstName }}</span>
            </p>
            <p v-if="currentPet.description" class="mt-4 text-sm italic line-clamp-2 text-gray-200">
              "{{ currentPet.description }}"
            </p>
          </div>
        </div>

        <div class="flex justify-evenly p-8 bg-white">
          <button @click="handleRate(false)" class="w-20 h-20 flex items-center justify-center bg-white text-red-500 rounded-full text-4xl shadow-xl hover:bg-red-50 transition-transform active:scale-90 border border-gray-100">
            ✖️
          </button>
          <button @click="handleRate(true)" class="w-20 h-20 flex items-center justify-center bg-white text-green-500 rounded-full text-4xl shadow-xl hover:bg-green-50 transition-transform active:scale-90 border border-gray-100">
            ❤️
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMatch" class="fixed inset-0 bg-indigo-900/90 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div class="text-center">
        <h2 class="text-6xl font-black text-pink-400 mb-4 italic animate-bounce">IT'S A MATCH! 🐾</h2>
        <p class="text-white text-2xl mb-10">Ihr habt gegenseitiges Interesse gezeigt.</p>
        <button @click="showMatch = false" class="px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-xl shadow-2xl hover:bg-pink-50 transition">
          Weiter entdecken
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'

// Daten-Listen
const otherPets = ref([]) // Das ist dein 'pets' aus dem Snippet
const myPets = ref([])

// Status-Variablen
const selectedMyPetId = ref("")
const currentIndex = ref(0)
const showMatch = ref(false)

// Filter-Variablen (müssen filterZip/filterType heißen wie im Template!)
const filterZip = ref('')
const filterType = ref('')

/**
 * DIE MAGIE: Gefilterte Liste (Anforderung SU-03)
 * Verarbeitet die 'otherPets' basierend auf PLZ und Tierart.
 */
const filteredPets = computed(() => {
  return otherPets.value.filter(pet => {
    // Check PLZ (Besitzer-Daten)
    const matchesZip = !filterZip.value || 
                       (pet.owner?.zipCode && pet.owner.zipCode.startsWith(filterZip.value));
    
    // Check Tierart (type)
    const matchesType = !filterType.value || 
                        pet.type === filterType.value;

    return matchesZip && matchesType;
  });
});

// Das aktuell sichtbare Tier aus der gefilterten Liste
const currentPet = computed(() => filteredPets.value[currentIndex.value] || {})

// Falls Filter sich ändern, zurück zum ersten Tier der neuen Liste
watch([filterType, filterZip], () => {
  currentIndex.value = 0;
});

const resetFilters = () => {
  filterType.value = '';
  filterZip.value = '';
  currentIndex.value = 0;
};

/**
 * Daten beim Start laden
 */
const loadData = async () => {
  try {
    const [others, mine] = await Promise.all([
      api.get('/pets/explore'), 
      api.get('/pets/my-pets')
    ])
    otherPets.value = others.data 
    myPets.value = mine.data
    // Vorauswahl des ersten eigenen Tieres
    if (myPets.value.length > 0) selectedMyPetId.value = myPets.value[0].id
  } catch (err) {
    console.error("Ladefehler:", err)
  }
}

/**
 * Bewertung abgeben (Like/Dislike)
 */
const handleRate = async (isLiked) => {
  if (!selectedMyPetId.value) return alert("Wähle erst ein eigenes Tier aus!")
  
  if (isLiked) {
    try {
      const res = await api.post('/matching/like', {
        fromPetId: selectedMyPetId.value,
        toPetId: currentPet.value.id
      })
      if (res.data.isMatch) showMatch.value = true 
    } catch (err) { console.error("Like-Fehler:", err) }
  }
  currentIndex.value++ 
}

onMounted(loadData)
</script>