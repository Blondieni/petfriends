<template>
  <div class="max-w-2xl mx-auto p-4 flex flex-col h-[80vh]">
    <div class="flex items-center mb-4">
      <button @click="$router.push('/dashboard')" class="mr-4 text-indigo-600 font-bold hover:underline flex items-center">
        <span class="mr-1">←</span> Zurück
      </button>
      <h2 class="text-2xl font-bold text-indigo-700 flex items-center">
        <span class="mr-2">💬</span> Chat mit Tierbesitzer
      </h2>
    </div>

    <div class="flex-grow bg-white rounded-2xl shadow-inner border p-4 overflow-y-auto space-y-4 mb-4" ref="chatBox">
      <div v-for="msg in messages" :key="msg.id" 
           :class="['max-w-[80%] p-3 rounded-2xl shadow-sm text-sm', 
                    msg.senderId == myId ? 'ml-auto bg-indigo-600 text-white rounded-br-none' : 'mr-auto bg-gray-100 text-gray-800 rounded-bl-none']">
        {{ msg.content }}
        <div :class="['text-[10px] mt-1 opacity-70', msg.senderId == myId ? 'text-right' : 'text-left']">
          {{ new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
        </div>
      </div>
      <div v-if="messages.length === 0" class="text-center text-gray-400 mt-10 italic">
        Noch keine Nachrichten. Sag mal Hallo! 🐾
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="flex gap-2">
      <input v-model="newMessage" type="text" placeholder="Deine Nachricht..." 
             class="flex-grow p-3 rounded-full border-2 border-gray-200 focus:border-indigo-500 outline-none transition" />
      <button type="submit" :disabled="!newMessage.trim()"
              class="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-md">
        <span class="px-2 font-bold">Senden</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const messages = ref([]);
const newMessage = ref('');
const myId = ref(null);
const chatBox = ref(null);
let intervalId = null;

/**
 * Scrollt das Chat-Fenster automatisch nach unten, wenn neue Nachrichten erscheinen.
 */
const scrollToBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

/**
 * Markiert Nachrichten als gelesen (Anforderung FD-02).
 */
const markAsRead = async () => {
  try {
    await api.put(`/messages/read/${route.params.userId}`);
  } catch (err) {
    console.error("Status-Update fehlgeschlagen");
  }
};

/**
 * Lädt den Nachrichtenverlauf (Anforderung IK-02).
 * Enthält die Sicherung gegen 'undefined' Parameter beim Routing.
 */
const loadMessages = async () => {
  // --- NEU: Sicherung gegen 'undefined' Fehler ---
  if (!route.params.userId || route.params.userId === 'undefined') return;

  try {
    const res = await api.get(`/messages/${route.params.userId}`);
    messages.value = res.data;
    scrollToBottom();
    markAsRead(); 
  } catch (err) { 
    console.error("Fehler beim Laden der Nachrichten:", err); 
  }
};

/**
 * Sendet eine neue Nachricht (Anforderung IK-01).
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || !route.params.userId) return;
  try {
    const res = await api.post('/messages/send', {
      receiverId: route.params.userId,
      content: newMessage.value
    });
    messages.value.push(res.data);
    newMessage.value = '';
    scrollToBottom();
  } catch (err) { 
    console.error("Fehler beim Senden:", err); 
  }
};

onMounted(async () => {
  // Eigene ID aus dem JWT-Token extrahieren
  const token = localStorage.getItem('token');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    myId.value = payload.userId;
  }
  
  loadMessages();
  
  // Polling alle 5 Sekunden (Simulierte Echtzeit-Kommunikation)
  intervalId = setInterval(loadMessages, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>