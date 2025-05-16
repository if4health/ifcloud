const axios = require("axios");
require("dotenv").config();

const FASSECG_API_URL = process.env.FASSECG_API_URL;

const api = axios.create({
    baseURL: FASSECG_API_URL
});

module.exports = api;