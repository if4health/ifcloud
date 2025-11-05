import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

class FhirApi {
  constructor() {
    this.baseURL = process.env.FHIR_API_URL;
    this.grantType = process.env.GRANT_TYPE;
    this.clientId = process.env.CLIENT_ID;
    this.clientSecret = process.env.CLIENT_SECRET;

    this.token = null;
    this.tokenExpiresAt = 0; // timestamp da expiração

    this.client = axios.create({
      baseURL: this.baseURL
    });

    this._setupInterceptor();
  }

  /**
   * Solicita um novo token ao servidor
   */
  async _authenticate() {
    const response = await axios.post(`${this.baseURL}/auth/token`, {
      grant_type: this.grantType,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    this.token = response.data.access_token;

    // expires_in vem em segundos → converter para timestamp
    const expiresIn = response.data.expires_in;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;

    this.client.defaults.headers.Authorization = `Bearer ${this.token}`;
  }

  /**
   * Verifica se o token está expirado
   */
  _tokenExpired() {
    return !this.token || Date.now() >= this.tokenExpiresAt;
  }

  /**
   * Interceptor → insere token automaticamente
   */
  _setupInterceptor() {
    this.client.interceptors.request.use(async (config) => {

      // Se o token não existe ou expirou → renova
      if (this._tokenExpired()) {
        await this._authenticate();
      }

      config.headers.Authorization = `Bearer ${this.token}`;
      return config;
    });
  }

  /**
   * Métodos públicos
   */
  async get(resource) {
    const response = await this.client.get(resource);
    return response.data;
  }

  async teste() {
    console.log(this.baseURL)
  }
}

export default new FhirApi();
