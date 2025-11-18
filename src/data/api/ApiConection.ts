export default class ApiConection {
  static readonly BASE_URL = 'http://localhost:9842/api'
}

export class ApiAuth {
  static readonly BASE_PATH = `${ApiConection.BASE_URL}/auth`
  static readonly FACIAL_PATH = `${ApiAuth.BASE_PATH}/facial`
}
