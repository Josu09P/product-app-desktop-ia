/**
 * Define el cuerpo de la petición (request) para registro o login facial.
 */
export interface FacialAuthRequest {
  user_id: string
  image_base64: string // El frame de la cámara en Base64
}

export interface FacialAuthResponse {
  success: boolean
  message: string
  token?: string
  user_id?: string
}
