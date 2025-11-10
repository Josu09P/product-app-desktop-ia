import RLSimpleService from '@/data/services/RLSimpleServices'
import type { DataPoint, RLMultipleResult } from '@/domain/models/RLMultipleModel'
import { showToast } from '@/utils/toast'

class PostRLSimpleUseCase {
  async ejecutar(
    dataPoints: DataPoint[],
    variableNames: string[],
  ): Promise<RLMultipleResult | null> {
    try {
      if (!dataPoints || dataPoints.length === 0) {
        showToast('No se han ingresado datos para el análisis.', 'error')
        return null
      }

      // CLAVE: Solo una variable X para RLS
      if (variableNames.length !== 1) {
        showToast(
          'La Regresión Lineal Simple requiere seleccionar exactamente una Variable Independiente (X).',
          'error',
        )
        return null
      }

      // Llamamos al servicio RLS
      const result = await RLSimpleService.postAnalisis(dataPoints, variableNames)
      showToast('Análisis de Regresión Simple completado con éxito.', 'success')
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error desconocido al ejecutar la regresión.'
      showToast(errorMessage, 'error')
      console.error('[RLSimpleUseCase Error]:', error)
      return null
    }
  }
}

export default new PostRLSimpleUseCase()
