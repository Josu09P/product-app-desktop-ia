<template>
  <NavbarCustom />
  <!--<span style="margin-bottom: 20px;"></span>-->
  <router-view v-slot="{ Component }">
    <!-- 🚨 KeepAlive envuelve el componente y evita que se destruya al cambiar de ruta 🚨 -->
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
<script setup lang="ts">
</script>
