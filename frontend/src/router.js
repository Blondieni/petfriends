import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Register from './components/Register.vue'
import CreatePet from './components/CreatePet.vue'
import EditPet from './components/EditPet.vue'
import Explore from './components/Explore.vue'
import ChatView from './components/ChatView.vue'
import InboxView from './components/InboxView.vue' // 1. NEU: Postfach Import

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/create-pet', name: 'CreatePet', component: CreatePet },
  { path: '/edit-pet/:id', name: 'EditPet', component: EditPet },
  { path: '/explore', name: 'Explore', component: Explore },
  { 
    path: '/chat/:userId', 
    name: 'Chat', 
    component: ChatView 
  },
  { 
    // 2. NEU: Die Inbox-Route für die Chat-Übersicht (Anforderung IK-02)
    path: '/inbox', 
    name: 'Inbox', 
    component: InboxView 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 3. Der Türsteher (Erweitert um Inbox und Chat)
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  const isProtectedRoute = to.path === '/dashboard' || 
                           to.path === '/create-pet' || 
                           to.path === '/explore' || 
                           to.path === '/inbox' || // NEU: Inbox schützen
                           to.path.startsWith('/chat/') || 
                           to.path.startsWith('/edit-pet/')

  if (isProtectedRoute && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router