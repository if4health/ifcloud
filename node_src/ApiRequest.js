const axios = require("axios");
require("dotenv").config();

const FHIR_API_URL = process.env.FHIR_API_URL;

const api = axios.create({
    baseURL: FHIR_API_URL
});

module.exports = api;