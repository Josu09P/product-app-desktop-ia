<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow-lg border-0 rounded-4" style="max-width: 480px; width: 100%;">
      <!-- Header -->
      <div class="card-header bg-gradient text-center py-4"
        style="background: linear-gradient(135deg, #0d6efd, #198754); border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
        <h3 class="mb-0 fw-bold">Registro Facial</h3>
        <small class="opacity-75">Autenticación biométrica segura</small>
      </div>

      <!-- Body -->
      <div class="card-body p-4">
        <!-- Campo de ID -->
        <div class="mb-3">
          <label for="userId" class="form-label fw-semibold">ID de Usuario</label>
          <div class="input-group">
            <span class="input-group-text bg-primary">
              <i class="bi bi-person-badge"></i>
            </span>
            <input v-model="userId" type="text" id="userId" placeholder="Ingresa tu ID de usuario" class="form-control"
              required />
          </div>
        </div>

        <!-- Vista de cámara -->
        <div class="text-center mb-3">
          <video ref="videoRef" autoplay playsinline class="rounded-3 shadow-sm bg-dark mb-3"
            style="width: 320px; height: 240px;"></video>
          <canvas ref="canvasRef" class="d-none"></canvas>

          <div>
            <button @click="capturarFrame" class="btn btn-primary px-4 me-2">
              <i class="bi bi-camera"></i> Capturar Rostro
            </button>
            <button @click="registrarRostro" class="btn btn-success px-4">
              <i class="bi bi-check-circle"></i> Registrar
            </button>
          </div>
        </div>

        <!-- Vista previa -->
        <div v-if="preview" class="text-center fade show">
          <h6 class="text-secondary mt-3">Vista previa de captura</h6>
          <div class="d-flex justify-content-center">
            <img :src="preview" alt="Captura previa"
              class="rounded-circle border border-3 border-primary shadow-sm mt-2"
              style="width: 100px; height: 100px; object-fit: cover;" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer text-center text-muted small bg-white border-0">
        <i class="bi bi-shield-lock"></i> Tu información está protegida
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { FacialAuthRequest } from '@/domain/models/RFacialModel'
import RegisterFacialUseCase from '@/domain/usecase/FacialAuthUsecase/RegisterFacialUseCase'

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const userId = ref('')
const preview = ref<string | null>(null)
let stream: MediaStream | null = null

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.value) videoRef.value.srcObject = stream
  } catch (error) {
    console.error('Error al acceder a la cámara:', error)
  }
})

onBeforeUnmount(() => {
  if (stream) stream.getTracks().forEach(track => track.stop())
})

function capturarFrame() {
  if (!videoRef.value || !canvasRef.value) return
  const canvas = canvasRef.value
  const video = videoRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  preview.value = canvas.toDataURL('image/jpeg')
}

async function registrarRostro() {
  if (!preview.value) {
    alert('Primero debes capturar tu rostro.')
    return
  }
  const request: FacialAuthRequest = {
    user_id: userId.value,
    image_base64: preview.value.replace(/^data:image\/\w+;base64,/, ''),
  }
  await RegisterFacialUseCase.ejecutar(request)
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #0d6efd, #198754);
}
</style>
