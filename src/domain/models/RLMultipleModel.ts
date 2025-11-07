export interface DataPoint {
  x: number[]
  y: number
}

export interface RLMultipleResult {
  coeficientes: number[]
  r2: number
  ecuacion: string
  predicciones: number[]
  residuos: number[]
  datos_entrada: DataPoint[]
  nombres_variables: string[]
}
