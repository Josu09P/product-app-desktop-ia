import { ApiAuth } from '@/data/api/ApiConection'
import type { FacialAuthRequest, FacialAuthResponse } from '@/domain/models/RFacialModel'

export default class FacialAuthService {
  static async registerFacialId(request: FacialAuthRequest): Promise<FacialAuthResponse> {
    try {
      const response = await fetch(`${ApiAuth.FACIAL_PATH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const data: FacialAuthResponse = await response.json()

      if (!response.ok) throw new Error(data.message || 'Error al registrar la huella facial.')

      return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error en registerFacialId Service:', error)
      throw new Error(error.message || 'Error de conexión con el servidor.')
    }
  }

  static async loginFacial(request: FacialAuthRequest): Promise<FacialAuthResponse> {
    try {
      const response = await fetch(`${ApiAuth.FACIAL_PATH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const data: FacialAuthResponse = await response.json()

      if (!response.ok) throw new Error(data.message || 'Fallo en la verificación facial.')

      return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error en loginFacial Service:', error)
      throw new Error(error.message || 'Error de conexión con el servidor.')
    }
  }
}
