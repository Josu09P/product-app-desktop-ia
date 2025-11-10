// domain/usecase/FacialAuthUsecase/LoginFacialUseCase.ts
import FacialAuthService from '@/data/services/FacialAuthService'
import type { FacialAuthRequest, FacialAuthResponse } from '@/domain/models/RFacialModel'
import { showToast } from '@/utils/toast'

export default class LoginFacialUseCase {
  static async ejecutar(request: FacialAuthRequest): Promise<FacialAuthResponse | null> {
    if (!request.image_base64.trim()) {
      showToast('No se capturó la imagen para la verificación.', 'error')
      return null
    }

    try {
      const result = await FacialAuthService.loginFacial(request)

      if (result.success) {
        showToast('✅ Autenticación facial exitosa. ¡Bienvenido!', 'success')
        // Guardar token en localStorage o store
        if (result.token) {
          localStorage.setItem('auth_token', result.token)
          localStorage.setItem('user_id', result.user_id || '')
        }
      } else {
        showToast(result.message, 'error')
      }

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error en el caso de uso de Login:', error)
      showToast(error.message || 'Fallo de conexión o verificación.', 'error')
      return null
    }
  }
}
