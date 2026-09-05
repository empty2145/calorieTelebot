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
    const match = foods.find(food => food.dataType === "SR Legacy") || foods.find(food => food.dataType === "Branded");

    //search for nutrients
    const nutrients = match.foodNutrients;

    // energy protein fat carbs data
    const energyData = nutrients.find(n => n.nutrientName === "Energy");
    const proteinData = nutrients.find(n => n.nutrientName === "Protein");
    const fatData = nutrients.find(n => n.nutrientName === "Total lipid (fat");
    const carbsData = nutrients.find(n => n.nutrientName === "Carbohydrate, by difference");

    // extract the numbers
    const calories = energyData?.value || 0;
    const protein = proteinData?.value || 0;
    const fat = fatData?.value || 0;
    const carbs = carbsData?.value || 0;

    console.log(`Calories: ${calories}, Protein: ${protein}g, Fat: ${fat}g, Carbs: ${carbs}g`);
}

module.exports = { getAxiosInstance: getAxiosInstance };