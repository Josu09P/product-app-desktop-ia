import type { FacialAuthRequest, FacialAuthResponse } from '@/domain/models/RFacialModel'
import FacialAuthService from '@/data/services/FacialAuthService'
import { showToast } from '@/utils/toast' // Asegúrate de que esta utilidad exista

export default class RegisterFacialUseCase {
  static async ejecutar(request: FacialAuthRequest): Promise<FacialAuthResponse | null> {
    if (!request.user_id.trim()) {
      showToast('El ID de usuario no puede estar vacío.', 'error')
      return null
    }
    if (!request.image_base64.trim()) {
      showToast('No se capturó la imagen del rostro.', 'error')
      return null
    }

    try {
      const result = await FacialAuthService.registerFacialId(request)

      if (result.success) {
        showToast('✅ Registro facial completado.', 'success')
      } else {
        // Esto debería ser capturado por el catch si el backend retorna !response.ok, pero es un fallback
        showToast(result.message, 'error')
      }

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error en el caso de uso de Registro:', error)
      showToast(error.message || 'Fallo al intentar registrar el rostro.', 'error')
      return null
    }
  }
}
