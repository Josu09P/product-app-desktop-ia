export interface SentimentResult {
  Comentario: string
  Sentimiento: string
}
export interface SentimientosModel {
  titulo_video: string
  total_comentarios: number
  total_comentarios_video: number
  conteo: Record<string, number>
  resultados: SentimentResult[]
}
