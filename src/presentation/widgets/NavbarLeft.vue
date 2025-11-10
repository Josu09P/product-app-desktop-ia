<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// import { useUserStore } from '@/stores/userStore'
// import { GetUserByIdUseCase } from '@/domain/usecase/users/ListUserByIdUseCase'
// import defaultProfileImg from '@/assets/img/img-profile-default.jpg'

const isCollapsed = ref(false)
onMounted(async () => {
  const saved = localStorage.getItem('sidebar_collapsed')
  isCollapsed.value = saved === 'true'

  /*  if (!userStore.imgProfile) {
      const user = await GetUserByIdUseCase(userStore.id)
      if (user) userStore.setUser(user)
    }*/
})

watch(isCollapsed, (val) => {
  localStorage.setItem('sidebar_collapsed', val.toString())
})

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

/*
function openIA(service: string) {
  const urls: Record<string, string> = {
    deepseek: 'https://chat.deepseek.com/',
    mistral: 'https://chat.mistral.ai/chat',
    gemini: 'https://gemini.google.com/',
    chatgpt: 'https://chat.openai.com/',
  }
  window.open(urls[service], '_blank', 'width=900,height=750')
  showIAMenu.value = false
}*/
</script>

<template>
  <div id="sidebar" class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo -->
    <div class="logo-icon text-center d-flex align-items-center justify-content-center gap-2">
      <img src="@/assets/img/logo.png" v-if="isCollapsed" class="logo-app" alt="Nubri logo"
        style="border-radius: 1.5rem;" />
      <span v-else class="logo-text" color="green">AquaMind</span>
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
    </div>


    <!-- Imagen perfil + toggle -->
    <div class="text-center position-relative">
      <div class="profile-section mb-2">
        <router-link to="/dashboard/profile" title="Configuración">
          <!--<img :src="userStore.imgProfile || defaultProfileImg" class="profile-img" alt="Usuario" />-->
        </router-link>
      </div>

      <div class="toggle-btn mx-auto" @click="toggleSidebar">
        <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ia-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.ia-item:hover {
  background: #f5f5f5;
}

.ia-icon {
  width: 20px;
  height: 20px;
}

/* Animación */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Sidebar */
.sidebar {
  width: 250px;
  margin-top: 15px;
  background-color: var(--bg-color);
  border-right: solid 1px #d2d2d2;
  color: var(--text-color);
  height: 97vh;
  transition: width 0.3s ease;
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
  width: 70px;
}

.logo-app {
  width: 40px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.822));
}

.logo-text {
  font-family: "Knewave", system-ui;
  font-size: 28px;
  color: #333;
}

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
  transition: 0.3s;
}

.nav-link.nav-active {
  color: skyblue !important;
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
}

.nav-text {
  white-space: nowrap;
  transition: opacity 0.3s, visibility 0.3s;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  visibility: hidden;
}

.profile-img {
  border-radius: 50%;
  border: rgb(72, 72, 72) solid 2px !important;
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: none;
}

.toggle-btn {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid white;
  margin-top: 20px;
  margin-bottom: 1rem;
}

.toggle-btn i {
  font-size: 1.1rem;
  background-color: transparent;
}
</style>
