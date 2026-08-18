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
                maxOutputTokens: 8000,
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
        console.log("Gemini response:", response);
        return response.text();
    } catch (error) {
        errorHandler(error, "analyzeImageWithGemini");
        return "Failed to analyze the image";
    }
}

async function classifyAndRefineFoods(initialAnalysis) {
    try {
        if (!initialAnalysis || typeof initialAnalysis !== 'string') {
            throw new Error("Invalid initial analysis input");
        }

        // Initialize the model (using regular Gemini Flash not Vision)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prepare prompt
        const prompt = `As a nutrition expert, analyze the following food description and provide a refined classification
        
        Input Description:
    ${initialAnalysis}

    Please:
    1. Identify and list each distinct food item
    2. Provide the precise, standardized name for each food item
    3. Specify the standard unit of measurement for each item (e.g., grams, cups, pieces)
    4. If there are any ambiguous items, suggest the most likely alternatives
    5. Consider any visible preparation methods that might affect classification

    Format your response as a clear, detailed list focusing on accuracy and standardization.`

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (!response.text) {
            throw new Error('Empty response from LLM');
        }

        return response.text();
    } catch (error) {
        errorHandler(error, "classifyAndRefineFoods");
        return "Failed to classify and refine the foods";
    }
}

async function estimatePortionsAndNutrition(imageUrl, refinedClassification) {
    try {
        // Get the image data
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.arrayBuffer();

        // Initialise the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 10000,
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
        const prompt = `As a nutrition expert, analyze this image along with the following food classification:
            ${refinedClassification}

            Please provide:

            1. PORTION SIZES:
            - Estimate the absolute portion size for each food item
            - Use visual cues from the image to make accurate estimations
            - Express portions in standard measurements (grams, cups, pieces, etc.)

            2. NUTRITIONAL ANALYSIS:
            - Using reliable nutritional databases as reference
            - For each food item, provide:
                * Calories
                * Protein (g)
                * Carbohydrates (g)
                * Fat (g)
                * Fiber (g)
                * Any other significant nutrients

            3. TOTAL MEAL ANALYSIS:
            - Sum up the total calories
            - Provide macronutrient breakdown
            - Include any relevant dietary considerations

            Please be as specific and detailed as possible in your analysis. Format your response in clear sections for easy reading.`;

        // Generate content
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;

        if (!response.text()) {
            throw new Error("Empty response from LLM");
        }

        return response.text();

    } catch (error) {
        errorHandler(error, "estimatePortionsAndNutrition");
        return "Failed to estimate portions and nutrition";
    }
}

module.exports = {
    analyzeImageWithGemini,
    classifyAndRefineFoods,
    estimatePortionsAndNutrition
};
