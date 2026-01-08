import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Register from './components/Register.vue'
import CreatePet from './components/CreatePet.vue'
import EditPet from './components/EditPet.vue' // 1. NEU: Import für die Bearbeiten-Seite

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/create-pet', name: 'CreatePet', component: CreatePet },
  { 
    // 2. NEU: Die Route für das Bearbeiten. Das ":id" ist wichtig!
    path: '/edit-pet/:id', 
    name: 'EditPet', 
    component: EditPet 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 3. Der angepasste Türsteher
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  // Wir prüfen jetzt, ob die Seite geschützt werden muss
  // dashboard, create-pet und alle Pfade, die mit /edit-pet/ anfangen
  const isProtectedRoute = to.path === '/dashboard' || 
                           to.path === '/create-pet' || 
                           to.path.startsWith('/edit-pet/')

  if (isProtectedRoute && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router