<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <AppPermissions
      v-if="!cameraReady"
      @permission-granted="onPermissionGranted"
      @permission-denied="onPermissionDenied"
    />
    <div v-else class="card shadow-lg border-0 rounded-4" style="max-width: 480px; width: 100%;">
      <div class="card-header bg-gradient text-center py-4"
        style="background: linear-gradient(135deg, #198754, #0d6efd); border-radius: 1rem 1rem 0 0;">
        <h3 class="mb-0 fw-bold">Login Facial</h3>
        <small class="opacity-75">Reconocimiento biométrico</small>
      </div>

      <div class="card-body p-4 text-center">
        <video ref="videoRef" autoplay playsinline class="rounded-3 shadow-sm bg-dark mb-3"
          style="width: 320px; height: 240px;"></video>
         <div class="mb-2">
          <button @click="managePermissions" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-gear"></i> Gestionar Permisos
          </button>
        </div>
        <canvas ref="canvasRef" class="d-none"></canvas>
        <div class="mb-3">
          <button @click="capturarYVerificar" class="btn btn-primary px-4 me-2" :disabled="loading">
            <i class="bi bi-camera"></i>
            {{ loading ? 'Verificando...' : 'Verificar Rostro' }}
          </button>
          <button @click="irARegistro" class="btn btn-outline-secondary px-4">
            <i class="bi bi-person-plus"></i> Registrarse
          </button>
        </div>

        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Verificando...</span>
          </div>
          <p class="text-muted mt-2">Verificando identidad...</p>
        </div>

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
import AppPermissions from '@/presentation/widgets/permits/AppPermissions.vue'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AuthHelper } from '@/utils/authHelper'

const router = useRouter()
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const preview = ref<string | null>(null)
const loading = ref(false)
const cameraReady = ref(false)
let stream: MediaStream | null = null

// 🔧 FUNCIÓN MEJORADA PARA DETENER LA CÁMARA
function stopCamera() {
  if (stream) {
    console.log('🛑 Deteniendo stream de cámara...')
    stream.getTracks().forEach(track => {
      track.stop()
      console.log(`🔴 Track ${track.kind} detenido`)
    })
    stream = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

const onPermissionGranted = async () => {
  cameraReady.value = true
  await startCamera()
}

const onPermissionDenied = () => {
  alert('La aplicación necesita permisos de cámara para funcionar.')
}

const managePermissions = () => {
  cameraReady.value = false
  stopCamera()
}

async function startCamera() {
  try {
    // 🔧 DETENER CÁMARA ANTERIOR SI EXISTE
    stopCamera()

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      }
    })

    // 🔧 REGISTRAR STREAM GLOBALMENTE (OPCIONAL)
    if (!window.activeCameraStreams) {
      window.activeCameraStreams = []
    }
    window.activeCameraStreams.push(stream)

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    console.log('✅ Cámara iniciada correctamente')
  } catch (error) {
    console.error('❌ Error al acceder a la cámara:', error)
    cameraReady.value = false
    alert('Error al iniciar la cámara. Intenta gestionar los permisos nuevamente.')
  }
}

// 🔧 MEJORAR LA FUNCIÓN DE LOGIN PARA LIMPIAR CÁMARA
async function capturarYVerificar() {
  if (loading.value) return // Evitar múltiples clics

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
      console.log('✅ Login facial exitoso, limpiando cámara...')

      // 🔧 LIMPIAR CÁMARA INMEDIATAMENTE DESPUÉS DEL LOGIN EXITOSO
      stopCamera()

      // Mostrar mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirigir al home
      router.push('/home')
    } else {
      alert('Error en la verificación facial. Intenta nuevamente.')
    }
  } catch (error) {
    console.error('Error durante el login facial:', error)
    alert('Error durante la verificación. Intenta nuevamente.')
  } finally {
    loading.value = false
  }
}

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

function irARegistro() {
  // 🔧 LIMPIAR CÁMARA AL IR AL REGISTRO
  stopCamera()
  router.push('/auth/register')
}

onMounted(async () => {
  try {
    await startCamera()
  } catch (error) {
    console.error('Error al iniciar cámara en mounted:', error)
    // No mostrar alerta aquí, el componente de permisos se encargará
  }
})

onBeforeUnmount(() => {
  // 🔧 ASEGURARSE DE LIMPIAR LA CÁMARA AL SALIR DEL COMPONENTE
  console.log('🧹 Limpiando cámara al desmontar componente de login')
  stopCamera()
})
</script>
