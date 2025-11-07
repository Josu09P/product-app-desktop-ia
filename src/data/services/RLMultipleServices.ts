import ApiConection from '@/data/api/ApiConection'
import type { DataPoint, RLMultipleResult } from '@/domain/models/RLMultipleModel'

export default class RLMultipleService {
  /**
   * Ejecuta el análisis de Regresión Lineal Múltiple enviando los datos a la API.
   * @param data Los puntos de datos (X y Y) del frontend.
   * @param variables Los nombres de las variables predictoras (X1, X2, etc.).
   * @returns Una promesa que resuelve con los resultados de la regresión.
   */
  static async postAnalisis(data: DataPoint[], variables: string[]): Promise<RLMultipleResult> {
    if (data.length < 3) {
      throw new Error('Se requieren al menos 3 puntos de datos para la regresión.')
    }

    try {
      // ✅ Payload idéntico al que espera la API de Python
      const payload = {
        data_points: data,
        nombres_variables: variables,
      }

      // Construcción de la URL usando ApiConection.BASE_URL
      const response = await fetch(`${ApiConection.BASE_URL}/rl-multiple/analizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const responseData = await response.json()
        // Lanza el error capturado del backend, si existe
        throw new Error(
          responseData.error || `Error ${response.status}: Error al procesar la regresión.`,
        )
      }

      // Si la respuesta es exitosa (200 OK), devolvemos los resultados.
      return await response.json()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[RLMultipleService Error]:', error)
      // Propagamos el error para que sea capturado por el UseCase
      throw new Error(error.message || 'Error de red o fallo de la API.')
    }
  }

  // Ejemplo de un método estático de verificación de salud, siguiendo el patrón.
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
}
