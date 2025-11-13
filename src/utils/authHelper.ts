// utils/authHelper.ts
export interface AuthData {
  token: string
  user_id: string
  timestamp: string
}

export class AuthHelper {
  // Guardar datos de autenticación
  static saveAuthData(token: string, user_id: string): void {
    const authData: AuthData = {
      token,
      user_id,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('auth_data_aquamind', JSON.stringify(authData))

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new Event('authStateChanged'))
  }

  // Obtener datos de autenticación
  static getAuthData(): AuthData | null {
    const data = localStorage.getItem('auth_data_aquamind')
    if (!data) return null

    try {
      return JSON.parse(data) as AuthData
    } catch {
      return null
    }
  }

  // Obtener solo el token
  static getToken(): string | null {
    const authData = this.getAuthData()
    return authData?.token || null
  }

  // Obtener solo el user_id
  static getUserId(): string | null {
    const authData = this.getAuthData()
    return authData?.user_id || null
  }

  // Verificar si está autenticado
  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    // Opcional: verificar expiración del token
    return !this.isTokenExpired()
  }

  // 🔧 LIMPIAR CÁMARA AL HACER LOGOUT
  static cleanupCamera(): void {
    try {
      // Detener todos los streams de medios activos
      if (navigator.mediaDevices) {
        // Esta función detiene cualquier stream activo
        const stopAllTracks = (stream: MediaStream) => {
          stream.getTracks().forEach(track => {
            track.stop()
            console.log(`🔴 Track ${track.kind} detenido durante logout`)
          })
        }

        // Limpiar cualquier referencia en componentes de video
        const videoElements = document.querySelectorAll('video')
        videoElements.forEach(video => {
          if (video.srcObject instanceof MediaStream) {
            stopAllTracks(video.srcObject)
            video.srcObject = null
          }
        })

        // Limpiar streams globales si existen
        if (window.activeCameraStreams) {
          window.activeCameraStreams.forEach(stopAllTracks)
          window.activeCameraStreams = []
        }
      }

      // Limpiar permisos en almacenamiento local
      localStorage.removeItem('cameraPermissionGranted')
      console.log('✅ Cámara limpiada durante logout')
    } catch (error) {
      console.error('Error limpiando cámara:', error)
    }
  }

  // Cerrar sesión
  static logout(): void {
    // 🔧 LIMPIAR CÁMARA ANTES DE HACER LOGOUT
    this.cleanupCamera()

    localStorage.removeItem('auth_data_aquamind')
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new Event('authStateChanged'))

    console.log('🚪 Sesión cerrada y cámara liberada')
  }

  // Verificar si el token ha expirado (opcional)
  static isTokenExpired(maxAgeHours: number = 24): boolean {
    const authData = this.getAuthData()
    if (!authData) return true

    const tokenTime = new Date(authData.timestamp).getTime()
    const currentTime = new Date().getTime()
    const hoursDiff = (currentTime - tokenTime) / (1000 * 60 * 60)

    return hoursDiff > maxAgeHours
  }

  // Forzar logout si el token expiró
  static validateToken(): boolean {
    if (this.isTokenExpired()) {
      this.logout()
      return false
    }
    return true
  }
}

// 🔧 EXTENDER LA INTERFAZ WINDOW PARA STREAMS GLOBALES
declare global {
  interface Window {
    activeCameraStreams?: MediaStream[]
  }
}
