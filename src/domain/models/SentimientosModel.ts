// src/domain/models/SentimientosModel.ts
export interface SentimentResult {
  Comentario: string
  Sentimiento: string
}

export interface KeywordResult {
  word: string
  count: number
}

export interface SentimientosModel {
  titulo_video: string
  canal: string
  fecha_publicacion: string
  miniatura: string
  likes: number
  vistas: number
  total_comentarios: number
  total_comentarios_video: number
  conteo: Record<string, number>
  palabras_clave: KeywordResult[]
  resultados: SentimentResult[]
  url: string | null
}
