// lib/axios.js

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

async function lookupNutrition(foodName) {
    // Step 1: finds the item
    try {
        const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search`, {
            params: {
                api_key: process.env.USDA_API_KEY,
                query: foodName
            }
        });
        // changing the logic, instead of taking the first object it will choose deliberateky
        // 2.0 2 new machines a filter inserter and smart splitter
        let foods = response.data.foods;

        if (!foods || foods.length === 0) {
            return null;
        }
        // 2.0 filter inserter - throws away highly processed junk unless asked for
        // 2.1 upgraded filter - in general checks inside the entry if its blank
        // 2.2 changed from hasData to hasMacros that checks onyl specific values
        const cleanFoods = foods.filter(food => {
            const desc = food.description.toLowerCase();

            const isNotPowder = !desc.includes("powder") && !desc.includes("dried");
            const hasMacros = food.foodNutrients && food.foodNutrients.some(n => {
                const isMacro = n.nutrientName === "Protein" ||
                                n.nutrientName === "Total lipid (fat)" ||
                                n.nutrientName === "Total Fat" ||
                                n.nutrientName === "Carbohydrates, by difference";
                
                return isMacro && n.value > 0;

            });

            return isNotPowder && hasMacros;
        });

        if (cleanFoods.length > 0) {
            foods = cleanFoods;
        }
        //splitter
        const match = foods.find(food => food.dataType === "Foundation")
        || foods.find(food => food.dataType === "SR Legacy") 
        || foods.find(food => food.dataType === "Branded") 
        || foods [0];
    
        //search for nutrients
        const nutrients = match.foodNutrients;
    
        // energy protein fat carbs data
        const energyData = nutrients.find(n => n.nutrientName === "Energy" && n.unitName === "kcal");
        const proteinData = nutrients.find(n => n.nutrientName === "Protein");
        const fatData = nutrients.find(n => n.nutrientName === "Total lipid (fat)" || n.nutrientName === "Total Fat");
        const carbsData = nutrients.find(n => n.nutrientName === "Carbohydrate, by difference");
    
        // extract the numbers
        const protein = proteinData?.value || 0;
        const fat = fatData?.value || 0;
        const carbs = carbsData?.value || 0;
        // calorie backup
        let calories = energyData?.value;
        if (!calories) {
            calories = (protein *4) + (carbs * 4) + (fat * 9);
        }
    
        console.log(`Calories: ${calories}, Protein: ${protein}g, Fat: ${fat}g, Carbs: ${carbs}g`);
    
        return {
            name: match.description,
            calories: calories,
            protein: protein,
            fat: fat,
            carbs: carbs
        };

    } catch (error) {
        console.error("Failed to fetch from USDA:", error);
        return null;
    }
}

module.exports = { getAxiosInstance: getAxiosInstance, lookupNutrition: lookupNutrition};