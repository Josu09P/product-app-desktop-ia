<script setup lang="ts">
import DashboardLayout from '@/presentation/layouts/DashboardLayout.vue';

import { ref } from 'vue';
import YoutubeService from '@/data/services/SentimientosServices';
import { toast } from 'vue3-toastify';
import type { SentimientosModel } from '@/domain/models/SentimientosModel';

const videoUrl = ref('');
const loading = ref(false);
const result = ref<SentimientosModel | null>(null);

async function analizar() {
  if (!videoUrl.value) {
    toast.error('Por favor, ingresa una URL de YouTube');
    return;
  }

  loading.value = true;
  result.value = null;

  try {
    result.value = await YoutubeService.analizarVideo(videoUrl.value);
    toast.success('Análisis completado exitosamente');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error(error.message || 'Error durante el análisis');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="container py-4">
      <h3 class="mb-3">Análisis de Sentimientos (YouTube)</h3>
      <div class="input-group mb-3">
        <input type="text" v-model="videoUrl" class="form-control" placeholder="Pega la URL del video de YouTube" />
        <button class="btn btn-primary" @click="analizar" :disabled="loading">
          <i class="bi bi-search"></i> Analizar
        </button>
      </div>

      <div v-if="loading" class="alert alert-info">Analizando...</div>

      <div v-if="result">
        <h5>{{ result.titulo_video }}</h5>
        <p>Total comentarios analizados: {{ result.total_comentarios }}</p>

        <ul>
          <li v-for="(value, key) in result.conteo" :key="key">
            {{ key }}: {{ value }}
          </li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
</template>
