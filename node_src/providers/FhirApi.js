import axios from "axios";

class FhirApi {
  constructor() {
    this.baseURL = process.env.FHIR_API_URL;
    this.grantType = process.env.GRANT_TYPE;
    this.clientId = process.env.CLIENT_ID;
    this.clientSecret = process.env.CLIENT_SECRET;

    this.token = null;
    this.tokenExpiresAt = 0;

    this.client = axios.create({
      baseURL: this.baseURL
    });

    this._setupInterceptor();
  }

  async _authenticate() {
    const response = await axios.post(`${this.baseURL}/auth/token`, {
      grant_type: this.grantType,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    this.token = response.data.access_token;

    const expiresIn = response.data.expires_in;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;

    this.client.defaults.headers.Authorization = `Bearer ${this.token}`;
  }

  _tokenExpired() {
    return !this.token || Date.now() >= this.tokenExpiresAt;
  }

  _setupInterceptor() {
    this.client.interceptors.request.use(async (config) => {
      if (this._tokenExpired()) {
        try {
          await this._authenticate();
        } catch (error) {
          throw new Error(`FHIR authentication failed: ${error.message}`);
        }
      }

      config.headers.Authorization = `Bearer ${this.token}`;
      return config;
    });
  }

  async get(resource) {
    const response = await this.client.get(resource);
    return response.data;
  }

  async teste() {
    console.log(this.baseURL)
  }
}

export default new FhirApi();
