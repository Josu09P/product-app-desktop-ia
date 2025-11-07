<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Título por defecto'
  },
  size: {
    type: String,
    default: 'large'
  }
});

const headingClass = computed(() => {
  switch (props.size) {
    case 'large':
      return 'h1';
    case 'medium':
      return 'h3';
    case 'small':
      return 'h5';
    case 'xs':
      return 'h6';
    default:
      return props.size;
  }
});
</script>

<template>
  <h1 :class="[headingClass, 'fw-bold', 'm-0', 'theme-text-title']">
    {{ title }}
  </h1>
</template>
<style scoped>
h1.theme-text-title {
  margin-bottom: 11px !important;
}
</style>
