<template>
  <!--  <NavbarCustom />-->
  <div class="d-flex container-all">
    <NavbarLeft />
    <main class="main-content mt-2">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavbarLeft from '@/presentation/widgets/NavbarLeft.vue'
//import NavbarCustom from '../widgets/navbar/NavbarCustom.vue'
</script>
<style scoped>
html,
body {
  scroll-behavior: smooth;
}

.container-all {
  display: flex;
  background-color: var(--bg-color);
  padding-top: 40px;
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
