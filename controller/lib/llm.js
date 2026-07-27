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
                maxOutputTokens: 120,
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
        const prompt = `Analyze this food image and reply concisely.
        Format:
        Estimated calories: <number or range> kcal
        Items: <short comma-separated list>
        Portions: <brief estimate>
        Notes: <one short sentence if uncertain>

        Rules:
        - Maximum 4 lines.
        - No detailed visual description.
        - No markdown table.
        - Keep it under 500 characters.`;

        // Generate content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        errorHandler(error, "analyzeImageWithGemini");
        return "Failed to analyze the image";
    }
}

module.exports = {
    analyzeImageWithGemini,
};
