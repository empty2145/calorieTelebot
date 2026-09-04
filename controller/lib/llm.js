// lib/llm.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { errorHandler } = require("./helpers");

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
        const prompt = `Analyze this food image and return an array of objects
            each with a food name a estimated portion
            send it in JSON with no other commentary
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
        return "Failed to analyze the image";
    }
}

async function lookupNutritionForItems(foodItems) {
    //  STEP 2 takes that array, loops over each item, calls USDA search 
}

module.exports = {
    analyzeImageWithGemini
};
