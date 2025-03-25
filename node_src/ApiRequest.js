const axios = require("axios");
require("dotenv").config();

const cloudECG_URL = process.env.FHIR_API_URL;
const authorization_code = process.env.AUTHORIZATION_CODE;
const client_id = process.env.CLIENT_ID;

const api = axios.create({
    baseURL: cloudECG_URL
});

let token = null;
let refreshToken = null;
let isRefreshing = null;
let refreshSubscribers = [];

const authenticate = async () => {
    try {
        const response = await axios.post(`${cloudECG_URL}auth/token`, {
            code: `${authorization_code}`,
            client_id: `${client_id}`
        });

        token = response.data.access_token;
        refreshToken = response.data.refresh_token || null;
        api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
        console.error("Erro na autenticação", error);
        throw error;
    }
}

const refreshAuthToken = async () => {
    if (!refreshToken) {
        await authenticate();
        return;
    }

    if (isRefreshing) {
        return new Promise((resolve) => {
            refreshSubscribers.push((newToken) => {
                resolve(newToken);
            })
        })
    }

    isRefreshing = true;

    try {
        const response = await axios.post(`${cloudECG_URL}/auth/token/refresh`, {
            refresh_token: refreshToken
        });

        token = response.data.access_token;
        refreshToken = response.data.refresh_token || refreshToken;
        api.defaults.headers["Authorization"] = `Bearer ${token}`;

        refreshSubscribers.forEach((callback) => callback(token));
        refreshSubscribers = [];
    } catch (error) {
        console.error("Erro ao renovar token", error);
        await authenticate();
    } finally {
        isRefreshing = false;
    }
};

api.interceptors.request.use(async (config) => {
    if (!token) {
        await authenticate();
    }
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await refreshAuthToken();
            error.config.headers["Authorization"] = `Bearer ${token}`;
            return axios(error.config);
        }
        return Promise.reject(error);
    }
)

module.exports = api;