<template>
  <div class="d-flex container-all">
    <NavbarLeft />
    <main class="main-content mt-2">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavbarLeft from '@/presentation/widgets/NavbarLeft.vue'
import { onMounted, provide, ref } from 'vue'

const isSidebarCollapsed = ref(false)

// Cargar estado del sidebar al iniciar
onMounted(() => {
  const saved = localStorage.getItem('sidebar_collapsed')
  isSidebarCollapsed.value = saved === 'true'
})

// Proveer el estado del sidebar a componentes hijos (opcional)
provide('sidebarState', {
  isCollapsed: isSidebarCollapsed,
  toggle: () => { isSidebarCollapsed.value = !isSidebarCollapsed.value }
})
</script>
<style scoped>
.container-all {
  display: flex;
  background-color: var(--bg-color);
  padding-top: 35px;
  min-height: 100vh;
  width: 100vw;
  color: var(--text-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.main-content {
  margin-left: 70px;
  padding: 20px 70px;
  flex: 2;
}
</style>
