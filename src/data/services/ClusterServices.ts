import ApiConection from '@/data/api/ApiConection'
import type { KMeansResult, KMeansTrainRequest } from '@/domain/models/ClusterModel'

export default class KMeansService {
  /**
   * Envía los datos limpios al backend para entrenar el modelo K-Means.
   * @param data Los datos formateados para el entrenamiento.
   * @returns Los resultados del entrenamiento (centroides, distribución, etc.).
   */
  public static async train(data: KMeansTrainRequest): Promise<KMeansResult | null> {
    try {
      const response = await fetch(`${ApiConection.BASE_URL}/cluster/kmeans/fit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: Error al entrenar el modelo.`)
      }

      return (await response.json()) as KMeansResult
    } catch (error) {
      console.error('Error en el servicio KMeansService.train:', error)
      throw error
    }
  }
}
