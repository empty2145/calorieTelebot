const axios = require('axios');
const MY_TOKEN = process.env.MY_TOKEN;
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

function lookupNutrition(foodName) {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search`, {
        params: {
            api_key: process.env.USDA_API_KEY,
            query: foodName
        }
    });

    const foods = response.data.foods;
    const match = foods.find(food => food.dataType === "SR Legacy");

}

module.exports = { getAxiosInstance: getAxiosInstance };