// lib/llm.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { errorHandler } = require("./helpers");

// Initialize the Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function analyzeImageWithGemini(imageUrl) {
    try {
        //Get the image data
        const imageResponse = await fetch(ImageUrl());
        const imageData = await imageResponse.arrayBuffer();

        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-vision"});

        // Prepare the image data
        const imagePart = {
            inlineData: {
                data: Buffer.from(imageData).toString('base64'),
                mimeType: "image/jpeg"
            }
        };

        // Prepare the prompt
        const prompt = `Analyze this image and provide a detailed description of the food items present.
        Include the following details for each food item:
        - The name of the food
        - Visible characteristics (color, texture, shape)
        - Any discernible ingredients or preparation methods
        - Estimate the portion size relative to other items in the image
        
        Be as detailed and specific as possible in your description.`;

        // Generate content
        const result = await model.generativeContent([prompt, imagePart]);
        const response = await result.response;
        return response,text();
    } catch (error) {
        errorHandler(error, "analyzeImageWithGemini");
        return "Failed to analyze the image";
    }
}

module.exports = {
    analyzeImageWithGemini,
};
