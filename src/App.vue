<template>
  <NavbarCustom />
  <span style="margin-bottom: 20px;"></span>
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
<script setup lang="ts">
import NavbarCustom from '@/presentation/widgets/NavbarCustom.vue';
</script>
