import ApiConection from '@/data/api/ApiConection'
import type { SentimientosModel } from '@/domain/models/SentimientosModel'

export default class YoutubeService {
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${ApiConection.BASE_URL}/health`)
      const data = await response.json()
      return data.ok === true
    } catch (error) {
      console.error('Error verificando backend:', error)
      return false
    }
  }

  // 🎯 CORRECCIÓN 1: Aceptar el parámetro maxComments
  static async analizarVideo(url: string, maxComments: number): Promise<SentimientosModel> {
    try {
      const response = await fetch(`${ApiConection.BASE_URL}/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🎯 CORRECCIÓN 2: Incluir max_comments en el body
        body: JSON.stringify({ url, max_comments: maxComments }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en el análisis')
      }

      return await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error analizando video:', error)
      throw new Error(error.message || 'Error desconocido')
    }
  }
}
