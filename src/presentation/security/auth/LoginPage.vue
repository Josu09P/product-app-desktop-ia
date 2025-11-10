<!-- presentation/security/auth/LoginPage.vue -->
<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow-lg border-0 rounded-4" style="max-width: 480px; width: 100%;">
      <!-- Header -->
      <div class="card-header bg-gradient text-center py-4"
        style="background: linear-gradient(135deg, #198754, #0d6efd); border-radius: 1rem 1rem 0 0;">
        <h3 class="mb-0 fw-bold">Login Facial</h3>
        <small class="opacity-75">Reconocimiento biométrico</small>
      </div>

      <!-- Body -->
      <div class="card-body p-4 text-center">
        <!-- Vista de cámara -->
        <video ref="videoRef" autoplay playsinline class="rounded-3 shadow-sm bg-dark mb-3"
          style="width: 320px; height: 240px;"></video>
        <canvas ref="canvasRef" class="d-none"></canvas>

        <!-- Botones -->
        <div class="mb-3">
          <button @click="capturarYVerificar" class="btn btn-primary px-4 me-2">
            <i class="bi bi-camera"></i> Verificar Rostro
          </button>
          <button @click="irARegistro" class="btn btn-outline-secondary px-4">
            <i class="bi bi-person-plus"></i> Registrarse
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Verificando...</span>
          </div>
          <p class="text-muted mt-2">Verificando identidad...</p>
        </div>

        <!-- Vista previa -->
        <div v-if="preview && !loading" class="fade show">
          <h6 class="text-secondary mt-3">Última captura</h6>
          <img :src="preview" alt="Captura previa" class="rounded-circle border border-3 border-success shadow-sm mt-2"
            style="width: 80px; height: 80px; object-fit: cover;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { FacialAuthRequest } from '@/domain/models/RFacialModel'
import LoginFacialUseCase from '@/domain/usecase/FacialAuthUsecase/LoginFacialUseCase'

const router = useRouter()
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const preview = ref<string | null>(null)
const loading = ref(false)
let stream: MediaStream | null = null

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    })
    if (videoRef.value) videoRef.value.srcObject = stream
  } catch (error) {
    console.error('Error al acceder a la cámara:', error)
    alert('No se pudo acceder a la cámara. Por favor, permite el acceso.')
  }
})

onBeforeUnmount(() => {
  if (stream) stream.getTracks().forEach(track => track.stop())
})

function capturarFrame(): string | null {
  if (!videoRef.value || !canvasRef.value) return null

  const canvas = canvasRef.value
  const video = videoRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg')
}

async function capturarYVerificar() {
  loading.value = true

  try {
    const imageDataUrl = capturarFrame()
    if (!imageDataUrl) {
      alert('Error al capturar la imagen.')
      return
    }

    preview.value = imageDataUrl

    const request: FacialAuthRequest = {
      user_id: '', // No necesario para login
      image_base64: imageDataUrl.replace(/^data:image\/\w+;base64,/, ''),
    }

    const result = await LoginFacialUseCase.ejecutar(request)

    if (result?.success) {
      // Redirigir al home después de login exitoso
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    }
  } finally {
    loading.value = false
  }
}

function irARegistro() {
  router.push('/auth/register')
}
</script>
