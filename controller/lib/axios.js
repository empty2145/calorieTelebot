const axios = require('axios');
process.env.MY_TOKEN = process.env.MY_TOKEN
const BASE_URL = "https://api.telegram.org/bot" + MY_TOKEN;

function getAxiosInstance() {
    return {
        get(method, params) {
            return axios.get(`/${method}`, {
                baseURL: BASE_URL,
                params,
            })
        },
        post(method, data) {
            return axios.post({
                method: "post",
                baseURL: BASE_URL,
                url: `/${method}`,
                data
            })
        }
    }
}

module.exports = { axiosInstance: getAxiosInstance() };