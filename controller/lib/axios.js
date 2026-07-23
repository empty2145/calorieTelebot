const axios = require('axios');
const MY_TOKEN = process.env.MY_TOKEN
const BASE_URL = "https://api.telegram.org/bot" + MY_TOKEN;

function getAxiosInstance() {
    return {
        get(method, params) {
            return axios.get(`/${method}`, {
                baseURL: BASE_URL,
                params,
            })
        },
        post(url, data, config) {
            return axios.post(`/${url}`, data, {baseURL: BASE_URL })
        }
    }
}

module.exports = { getAxiosInstance: getAxiosInstance };