<template>
  <div v-if="showPermissionRequest" class="permission-overlay">
    <div class="permission-modal">
      <div class="permission-header">
        <i class="bi bi-camera-video"></i>
        <h4>Permiso de Cámara Requerido</h4>
      </div>

      <div class="permission-body">
        <p>Esta aplicación necesita acceso a tu cámara para el reconocimiento facial.</p>

        <div class="camera-preview" v-if="!permissionGranted">
          <div class="camera-placeholder">
            <i class="bi bi-camera-off"></i>
            <p>Cámara no disponible</p>
          </div>
        </div>

        <div class="camera-preview" v-else>
          <video ref="previewVideo" autoplay muted class="camera-feed"></video>
        </div>
      </div>

      <div class="permission-footer">
        <button
          v-if="!permissionGranted"
          @click="requestCameraPermission"
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          Permitir Cámara
        </button>

        <button
          v-if="permissionGranted"
          @click="startCamera"
          class="btn btn-success"
        >
          Continuar
        </button>

        <button
          @click="denyPermission"
          class="btn btn-outline-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits, onBeforeUnmount } from 'vue'

const emit = defineEmits(['permission-granted', 'permission-denied'])

const showPermissionRequest = ref(false)
const permissionGranted = ref(false)
const loading = ref(false)
const previewVideo = ref<HTMLVideoElement | null>(null)
let permissionStream: MediaStream | null = null

// 🔧 LIMPIAR STREAM AL DESMONTAR
onBeforeUnmount(() => {
  if (permissionStream) {
    permissionStream.getTracks().forEach(track => track.stop())
    permissionStream = null
  }
})

async function checkCameraPermission() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasCameraAccess = devices.some(device =>
      device.kind === 'videoinput' && device.deviceId !== ''
    )

    permissionGranted.value = hasCameraAccess

    if (!hasCameraAccess) {
      showPermissionRequest.value = true
    } else {
      emit('permission-granted')
    }
  } catch (error) {
    console.error('Error verificando permisos:', error)
    showPermissionRequest.value = true
  }
}

async function requestCameraPermission() {
  loading.value = true

  try {
    // 🔧 LIMPIAR STREAM ANTERIOR SI EXISTE
    if (permissionStream) {
      permissionStream.getTracks().forEach(track => track.stop())
      permissionStream = null
    }

    permissionStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    })

    if (previewVideo.value) {
      previewVideo.value.srcObject = permissionStream
    }

    permissionGranted.value = true
    loading.value = false

  } catch (error) {
    console.error('Error al solicitar permisos:', error)
    loading.value = false
    alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.')
  }
}

function startCamera() {
  // 🔧 NO DETENER EL STREAM AQUÍ - se transferirá al componente principal
  showPermissionRequest.value = false
  emit('permission-granted')
}

function denyPermission() {
  // 🔧 LIMPIAR STREAM AL DENEGAR PERMISO
  if (permissionStream) {
    permissionStream.getTracks().forEach(track => track.stop())
    permissionStream = null
  }
  showPermissionRequest.value = false
  emit('permission-denied')
}

onMounted(async () => {
  await checkCameraPermission()
})
</script>
<style scoped>
.permission-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.permission-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.permission-header {
  background: linear-gradient(135deg, #198754, #0d6efd);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  text-align: center;
}

.permission-header i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.permission-body {
  padding: 1.5rem;
}

.camera-preview {
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.camera-placeholder {
  text-align: center;
  color: #6c757d;
}

.camera-placeholder i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.permission-footer {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
