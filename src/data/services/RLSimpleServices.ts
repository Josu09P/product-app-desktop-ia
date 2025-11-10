import ApiConection from '@/data/api/ApiConection'
import type { DataPoint, RLMultipleResult } from '@/domain/models/RLMultipleModel'

export default class RLSimpleService {
  static async postAnalisis(data: DataPoint[], variables: string[]): Promise<RLMultipleResult> {
    if (data.length < 3) {
      throw new Error('Se requieren al menos 3 puntos de datos para la regresión.')
    }

    try {
      const payload = {
        data_points: data,
        nombres_variables: variables,
      }

      const response = await fetch(`${ApiConection.BASE_URL}/rl-simple/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(
          responseData.error || `Error ${response.status}: Error al procesar la regresión.`,
        )
      }

      return await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[RLSimpleService Error]:', error)
      throw new Error(error.message || 'Error de red o fallo de la API.')
    }
  }
}
