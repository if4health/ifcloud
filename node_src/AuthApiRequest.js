const axios = require("axios");
require("dotenv").config();

const cloudECG_URL = process.env.FHIR_API_URL;
const grant_type = process.env.GRANT_TYPE;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const api = axios.create({
    baseURL: cloudECG_URL
});

let token = null;

const authenticate = async () => {
    try {
        const response = await axios.post(`${cloudECG_URL}/auth/token`, {
            grant_type: `${grant_type}`,
            client_id: `${client_id}`,
            client_secret: `${client_secret}`
        });

        token = response.data.access_token;
        api.defaults.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
        console.error("Erro na autenticação", error);
        throw error;
    }
}

api.interceptors.request.use(async (config) => {
    console.log(cloudECG_URL)
    // if (!token) {
    //     await authenticate();
    // }
    await authenticate()
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
})

module.exports = api;