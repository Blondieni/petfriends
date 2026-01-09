<template>
  <div class="max-w-3xl mx-auto p-6 min-h-screen bg-gray-50">
    <h1 class="text-3xl font-bold text-indigo-700 mb-8 flex items-center">
      <span class="mr-3">📩</span> Deine Nachrichten
    </h1>

    <div v-if="chats.length === 0" class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
      <p class="text-gray-500 text-lg">Noch keine aktiven Gespräche.</p>
      <router-link to="/explore" class="text-indigo-600 font-bold hover:underline mt-4 inline-block">
        Finde jetzt neue Freunde! 🐾
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="chat in chats" :key="chat.id" 
           @click="openChat(chat.otherUser.id)"
           class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
        
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
            {{ chat.otherUser.firstName.charAt(0) }}
          </div>
          
          <div>
            <h3 class="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
              {{ chat.otherUser.firstName }} {{ chat.otherUser.lastName }}
            </h3>
            <p class="text-gray-500 text-sm truncate max-w-[200px] sm:max-w-md">
              {{ chat.lastMessage }}
            </p>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <span class="text-xs text-gray-400">
            {{ new Date(chat.timestamp).toLocaleDateString([], {day: '2-digit', month: '2-digit'}) }}
          </span>
          <span v-if="chat.unreadCount > 0" 
                class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {{ chat.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const chats = ref([]);

const loadInbox = async () => {
  try {
    const res = await api.get('/messages/inbox');
    chats.value = res.data;
  } catch (err) {
    console.error("Fehler beim Laden der Inbox:", err);
  }
};

const openChat = (userId) => {
  router.push(`/chat/${userId}`);
};

onMounted(loadInbox);
</script>