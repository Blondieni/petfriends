import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // Hier wird dein Navigations-Gehirn importiert [cite: 749]

const app = createApp(App)

app.use(router) // Hier sagen wir Vue: "Benutze den Router für die Navigation" [cite: 153]

app.mount('#app')