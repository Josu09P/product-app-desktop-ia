import KMeansService from '@/data/services/ClusterServices'
import type { KMeansResult, KMeansTrainRequest } from '@/domain/models/ClusterModel'

/**
 * Caso de Uso para ejecutar el entrenamiento de Clustering K-Means.
 */
export default class PostKMeansTrainUseCase {
  public static async ejecutar(requestData: KMeansTrainRequest): Promise<KMeansResult | null> {
    try {
      // 1. Validaciones mínimas
      if (!requestData.data || requestData.data.length < 5) {
        throw new Error('Se requieren al menos 5 puntos de datos para el clustering.')
      }
      if (!requestData.features || requestData.features.length < 2) {
        throw new Error('Se requieren al menos 2 características (features).')
      }
      if (requestData.n_clusters < 2 || requestData.n_clusters > 10) {
        throw new Error('El número de clusters debe estar entre 2 y 10.')
      }

      // 2. Llamar al servicio
      return await KMeansService.train(requestData)
    } catch (error) {
      console.error('Error en el UseCase PostKMeansTrainUseCase:', error)
      // Re-lanzar el error para que la vista lo muestre con 'showToast'
      throw error
    }
  }
}
