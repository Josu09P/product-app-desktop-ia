import type { SentimientosModel } from '@/domain/models/SentimientosModel'
import YoutubeService from '@/data/services/SentimientosServices'
import { showToast } from '@/utils/toast'

export default class PostSentimientosUseCase {
  static async ejecutar(url: string, limit: number): Promise<SentimientosModel | null> {
    if (!url.trim()) {
      showToast('Por favor ingresa una URL válida de YouTube', 'error')
      return null
    }
    const commentsLimit = Math.max(1, limit)
    try {
      const result = await YoutubeService.analizarVideo(url, commentsLimit)
      showToast('Análisis completado exitosamente', 'success')
      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error en el caso de uso:', error)
      showToast(error.message || 'Error al analizar el video', 'error')
      return null
    }
  }
}
