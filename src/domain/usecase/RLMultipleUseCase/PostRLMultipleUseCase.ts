import RLMultipleService from '@/data/services/RLMultipleServices'
import type { DataPoint, RLMultipleResult } from '@/domain/models/RLMultipleModel'
import { showToast } from '@/utils/toast'

class PostRLMultipleUseCase {
  async ejecutar(
    dataPoints: DataPoint[],
    variableNames: string[],
  ): Promise<RLMultipleResult | null> {
    try {
      if (!dataPoints || dataPoints.length === 0) {
        showToast('No se han ingresado datos para el análisis.', 'error')
        return null
      }

      const result = await RLMultipleService.postAnalisis(dataPoints, variableNames)
      showToast('Análisis de Regresión Múltiple completado con éxito.', 'success')
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error desconocido al ejecutar la regresión.'
      showToast(errorMessage, 'error')
      console.error('[RLMultipleUseCase Error]:', error)
      return null
    }
  }
}

export default new PostRLMultipleUseCase()
