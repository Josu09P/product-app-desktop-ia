<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { AuthHelper } from '@/utils/authHelper'
import { useRouter } from 'vue-router'

const isCollapsed = ref(false)
const router = useRouter()

// Cargar estado del sidebar al montar el componente
onMounted(() => {
  loadSidebarState()
})

// Guardar estado cuando cambie
watch(isCollapsed, (newValue) => {
  saveSidebarState(newValue)
})

// Función para cargar el estado desde localStorage
function loadSidebarState() {
  try {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    } else {
      // Estado por defecto: expandido
      isCollapsed.value = false
      saveSidebarState(false)
    }
  } catch (error) {
    console.error('Error cargando estado del sidebar:', error)
    isCollapsed.value = false
  }
}

// Función para guardar el estado en localStorage
function saveSidebarState(state: boolean) {
  try {
    localStorage.setItem('sidebar_collapsed', state.toString())
    console.log(`💾 Estado del sidebar guardado: ${state ? 'colapsado' : 'expandido'}`)
  } catch (error) {
    console.error('Error guardando estado del sidebar:', error)
  }
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

// Función para obtener el estado actual (útil para otros componentes)
function getSidebarState(): boolean {
  return isCollapsed.value
}

// Función para establecer estado específico
function setSidebarState(state: boolean) {
  isCollapsed.value = state
}

// Función para cerrar sesión con SweetAlert
async function logout() {
  try {
    const result = await Swal.fire({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro de que deseas salir de la aplicación?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Cerrar Sesión',
      cancelButtonText: 'Cancelar',
      customClass: {
      popup: 'glass-modal',
      title: 'text-white',
      htmlContainer: 'text-white',
      confirmButton: 'btn btn-danger me-2',
      cancelButton: 'btn btn-secondary'
    },
    })

    if (result.isConfirmed) {
      // Limpiar estado del sidebar al cerrar sesión (opcional)
      // localStorage.removeItem('sidebar_collapsed')

      // Ejecutar logout
      AuthHelper.logout()

      // Mostrar confirmación
      await Swal.fire({
        title: 'Sesión Cerrada',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        background: 'var(--bg-color)',
        color: 'var(--text-color)',
        timer: 1500,
        showConfirmButton: false
      })

      // Redirigir al login
      router.push('/auth/login')
    }
  } catch (error) {
    console.error('Error durante el logout:', error)
  }
}

// Exponer funciones si es necesario para otros componentes
defineExpose({
  getSidebarState,
  setSidebarState,
  toggleSidebar
})
</script>

<template>
  <div id="sidebar" class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo -->
    <div class="logo-icon text-center d-flex align-items-center justify-content-center gap-2">
      <img
        src="@/assets/img/logo-2.png"
        v-if="isCollapsed"
        class="logo-app"
        alt="AquaMind logo"
        style="border-radius: 1.5rem;"
      />
      <span v-else class="logo-text">
        <img src="@/assets/img/logo-2.png" alt="AquaMind" width="150px">
      </span>
    </div>

    <!-- Navegación -->
    <div class="nav-center w-100">
      <router-link to="/home" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-house-door-fill"></i>
        <span class="nav-text">Inicio</span>
      </router-link>

      <router-link to="/sentimientos" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-emoji-smile-fill"></i>
        <span class="nav-text">Análisis de Sentimientos</span>
      </router-link>

      <router-link to="/rl-simple" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-graph-up"></i>
        <span class="nav-text">Regresión Lineal Simple</span>
      </router-link>

      <router-link to="/rl-multiple" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-graph-up-arrow"></i>
        <span class="nav-text">Regresión Lineal Múltiple</span>
      </router-link>

      <router-link to="/clusters" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-diagram-3-fill"></i>
        <span class="nav-text">Clustering</span>
      </router-link>

      <router-link to="/Documentation" class="nav-link" exact-active-class="nav-active">
        <i class="bi bi-file-earmark-fill"></i>
        <span class="nav-text">Documentación</span>
      </router-link>
    </div>

    <!-- Sección inferior: Cerrar Sesión + Perfil + Toggle -->
    <div class="sidebar-bottom text-center position-relative w-100" style="margin-bottom: 20px;">
      <!-- Botón Cerrar Sesión -->
      <div class="logout-section">
        <button @click="logout" class="logout-btn" :title="isCollapsed ? 'Cerrar Sesión' : ''">
          <i class="bi bi-box-arrow-right"></i>
          <span class="logout-text" v-if="!isCollapsed" style="padding-left: 7px;">Cerrar Sesión</span>
        </button>
      </div>


      <!-- Toggle sidebar -->
      <div class="toggle-btn mx-auto" @click="toggleSidebar" :title="isCollapsed ? 'Expandir menú' : 'Contraer menú'">
        <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --sidebar-width-expanded: 250px;
  --sidebar-width-collapsed: 70px;
  --transition-duration: 0.3s;
}

/* Sidebar principal */
.sidebar {
  width: var(--sidebar-width-expanded);
  margin-top: 30px;
  background: transparent;
  background-color: var(--bg-navbar);
  backdrop-filter: blur(10px);
  border-right: solid 1px #d2d2d2;
  color: var(--text-color);
  height:100vh;
  transition: all var(--transition-duration) ease;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

/* Logo */
.logo-app {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.822));
  transition: all var(--transition-duration) ease;
}

.logo-text {
  font-family: "Knewave", system-ui;
  font-size: 28px;
  color: #333;
  transition: opacity var(--transition-duration) ease;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  visibility: hidden;
}

/* Navegación */
.nav-center {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #555;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  font-size: 14px;
  gap: 10px;
  transition: all var(--transition-duration) ease;
  text-decoration: none;
  position: relative;
}

.nav-link:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(2px);
}

.nav-link.nav-active {
  color: skyblue !important;
  background: rgba(135, 206, 235, 0.1);
}

.nav-link.nav-active i {
  background-color: #00000046;
  color: rgb(0, 0, 0) !important;
  box-shadow: 0 0 2px rgba(100, 100, 100, 0.76);
}

.nav-link i {
  font-size: 1.1rem;
  background-color: white;
  padding: 7px;
  border-radius: 19px;
  min-width: 38px;
  text-align: center;
  margin-left: -2px;
  transition: all var(--transition-duration) ease;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  transition: all var(--transition-duration) ease;
  opacity: 1;
  visibility: visible;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  visibility: hidden;
  position: absolute;
}

/* Sección inferior */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Botón de cerrar sesión */
.logout-section {
  padding: 0 0.5rem;
  width: 100%;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border: none;
  border-radius: 2.0rem;
  background: transparent;
  color: #dc3545;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-duration) ease;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  transform: translateX(2px);
}

.logout-btn i {
  font-size: 1.1rem;
  background-color: white;
  padding: 7px;
  border-radius: 19px;
  min-width: 38px;
  text-align: center;
  flex-shrink: 0;
}

.logout-text {
  white-space: nowrap;
  transition: all var(--transition-duration) ease;
  opacity: 1;
  visibility: visible;
}

.sidebar.collapsed .logout-text {
  opacity: 0;
  visibility: hidden;
}

.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 0.5rem;
}

/* Botón toggle */
.toggle-btn {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  margin-top: 10px;
  margin-bottom: 1rem;
  background: white;
  transition: all var(--transition-duration) ease;
}

.toggle-btn:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.toggle-btn i {
  font-size: 1.1rem;
  color: #333;
  transition: all var(--transition-duration) ease;
}

/* Responsive */
@media (max-height: 600px) {
  .sidebar {
    height: 92vh;
  }

  .nav-center {
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.4rem 0.75rem;
  }
}
</style>
