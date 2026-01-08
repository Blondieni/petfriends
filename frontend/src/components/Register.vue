<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <h2 class="text-3xl font-extrabold text-center text-indigo-600 mb-6">PetFriends Registrierung</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700">Dein Name</label>
          <input v-model="name" type="text" placeholder="Max Mustermann" required
            class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">E-Mail-Adresse</label>
          <input v-model="email" type="email" placeholder="deine@mail.de" required
            class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">Passwort</label>
          <input v-model="password" type="password" placeholder="********" required
            class="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>
        <button type="submit" 
          class="w-full py-3 mt-4 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 shadow-md">
          Konto erstellen
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600">
        Hast du schon ein Konto? 
        <router-link to="/login" class="text-indigo-600 font-bold hover:underline">Hier anmelden</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = () => {
  console.log('Registrierung für:', name.value, email.value)
  // Hier würde später die API-Anfrage an dein Backend erfolgen
  alert('Konto erfolgreich simuliert erstellt! Bitte melde dich nun an.')
  router.push('/login')
}
</script>