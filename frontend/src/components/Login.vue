<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <h2 class="text-3xl font-extrabold text-center text-indigo-600 mb-6">PetFriends-Login</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
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

        <p v-if="error" class="text-red-500 text-sm text-center font-semibold">
          {{ error }}
        </p>

        <button type="submit" 
          class="w-full py-3 mt-4 text-white font-bold bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md">
          Anmelden
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Noch kein Konto? 
        <router-link to="/register" class="text-indigo-600 font-bold hover:underline">
          Hier registrieren
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' // WICHTIG: Importiert deine API-Konfiguration

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('') // Definiert die Variable für Fehlermeldungen

const handleLogin = async () => {
  try {
    error.value = ''; // Setzt alte Fehler zurück

    // Sendet die Daten an das Backend
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    // Prüft, ob ein Token in der Antwort ist
    if (response.data && response.data.token) {
      // Speichert das echte Token und den Usernamen im Browser
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username || 'Nutzer');
      alert("Gespeichertes Token: " + localStorage.getItem('token'));
      
      console.log('Login erfolgreich, Token gespeichert.');
      router.push('/dashboard'); // Weiterleitung zum Dashboard
    }
  } catch (err) {
    console.error("Login-Fehler Details:", err);
    // Zeigt eine Fehlermeldung an, falls die Daten falsch sind oder der Server nicht antwortet
    error.value = err.response?.data?.error || 'Login fehlgeschlagen. Bitte Daten prüfen.';
  }
};
</script>