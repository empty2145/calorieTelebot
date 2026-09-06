// lib/llm.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { errorHandler } = require("./helpers");
const { lookupNutrition } = require("./axios");

// Initialize the Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function analyzeImageWithGemini(imageUrl) {
    try {
        //Get the image data
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.arrayBuffer();

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 12000,
                temperature: 0.2,
            },
        });
        // Prepare the image data
        const imagePart = {
            inlineData: {
                data: Buffer.from(imageData).toString('base64'),
                mimeType: "image/jpeg"
            }
        };

        // Prepare the prompt
        const prompt = `Analyze this food image and identify the items.
            Estimate the weight of each item in grams based on standard portion sizes. 
            You MUST return an array of objects using exactly this JSON format:
            [
              {
                "name": "name of the food (be specific, e.g., 'raw sweet corn', 'fresh cherry tomatoes', 'grilled chicken breast'",
                "weightInGrams": 150
              }
            ]
            Return ONLY the JSON array with no other commentary or markdown formatting.
        `;

        // Generate content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        console.log("Gemini response:", response);

        const rawText = response.text();
        const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
        return JSON.parse(cleanText);
    } catch (error) {
        errorHandler(error, "analyzeImageWithGemini");
        return null;
    }
}

async function lookupNutritionForItems(foodItems) {
    //  STEP 2 takes that array, loops over each item, calls USDA search
    // final processed items
    const finalResults = [];

    // loop over every item
    for (const item of foodItems) {
        // send to USDA and wait for it to finish
        const usdaData = await lookupNutrition(item.name);
        if (usdaData) {

            const ratio = (item.weightInGrams || 100) / 100;

            finalResults.push({
                foodName: item.name,
                portion: `${item.weightInGrams}g`,
                calories: Math.round(usdaData.calories * ratio),
                protein: Math.round(usdaData.protein * ratio),
                fat: Math.round(usdaData.fat * ratio),
                carbs: Math.round(usdaData.carbs * ratio)
            });
        }
    }


    return finalResults;
}

module.exports = {
    analyzeImageWithGemini,
    lookupNutritionForItems,
};
