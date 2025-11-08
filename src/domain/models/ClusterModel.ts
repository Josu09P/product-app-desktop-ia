/** Define la estructura de un punto de datos de entrada. */
export interface ClusterDataPoint {
  [key: string]: number // Clave: Nombre de la columna, Valor: El dato numérico
}

/** Define la estructura de los parámetros de la petición de entrenamiento. */
export interface KMeansTrainRequest {
  data: ClusterDataPoint[] // Los datos de entrenamiento limpios del CSV
  features: string[] // Los nombres de las columnas usadas
  n_clusters: number // Número de clusters deseado
}

/** Define la estructura de los resultados devueltos por el backend. */
export interface KMeansResult {
  características: string[]
  n_clusters: number
  centroides: number[][] // Coordenadas de los centroides (escalados inversamente)
  distribución_clusters: {
    [clusterId: string]: number // { "0": 150, "1": 200, ... }
  }
  filas_entrenadas: number
  muestra_etiquetada: (ClusterDataPoint & { cluster: number })[]
}
