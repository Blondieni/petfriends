<template>
  <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col h-full hover:shadow-lg transition">
    
    <div class="relative w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
      <img v-if="pet.imageUrl" :src="`http://localhost:5000${pet.imageUrl}`" class="w-full h-full object-cover" />
      <div v-else class="flex items-center justify-center h-full text-gray-400">Kein Foto 🐾</div>
      
      <span :class="{
        'bg-indigo-500': pet.type === 'Hund',
        'bg-pink-500': pet.type === 'Katze',
        'bg-sky-500': pet.type === 'Vogel',
        'bg-amber-600': pet.type === 'Kleintier'
      }" class="absolute top-2 right-2 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg z-10">
        {{ pet.type }}
      </span>
    </div>
    
    <div class="flex-grow">
      <h3 class="text-xl font-bold text-gray-800">{{ pet.name }}</h3>
      <p class="text-gray-600 font-medium">{{ pet.breed }} <span class="text-gray-400">({{ pet.age }} Jahre)</span></p>
      
      <p v-if="pet.description" class="text-sm text-gray-500 mt-2 italic line-clamp-2 border-l-2 border-gray-100 pl-2">
        "{{ pet.description }}"
      </p>
    </div>

    <div class="mt-4 pt-4 border-t flex justify-between items-center">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
// Die Komponente nimmt ein "pet"-Objekt entgegen
defineProps({
  pet: Object
})
</script>