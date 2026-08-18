// lib/telegram.js
// lib/telegram.js
const { getAxiosInstance } = require('./axios');
const { errorHandler } = require("./helpers");
const { analyzeImageWithGemini, classifyAndRefineFoods, estimatePortionsAndNutrition } = require("./llm");

const MY_TOKEN = process.env.MY_TOKEN
const BASE_URL = "https://api.telegram.org/bot" + MY_TOKEN;
const axiosInstance = getAxiosInstance();

function getFile(fileId) {
    return axiosInstance.get("getFile", { file_id: fileId})
}

function sendMessage(messageObj, messageText) {
    return axiosInstance.post("sendMessage", {
        chat_id: messageObj.chat.id,
        text: messageText,
    })
}

async function handleMessage(messageObj) {
    if (!(messageObj.text || messageObj.photo)) return;
    if (messageObj.photo) await processThePhoto(messageObj);
    if (messageObj.text) handleText(messageObj);
}

function handleText(messageObj) {
    const messageText = messageObj.text || "";

    if (messageText.charAt(0) === "/") {
        const command = messageText.substr(1);
        switch (command) {
            case "start":
                return sendMessage(
                    messageObj,
                    "Hi! I am a bot. I can help you to get started"
                );
            default:
                return sendMessage(messageObj, "Hey hi, I don't know that command")
        }
    } else {
        return sendMessage(messageObj, messageText);
    }
}

async function processThePhoto(messageObj) {
    if (messageObj.photo && messageObj.photo.length !== 0) {
        try {
            // Send initial message to user
            await sendMessage(messageObj, "Analyzing your food image...");
        
            //Taking the file id from the photo
            const fileId = messageObj.photo[messageObj.photo.length - 1].file_id;

            //Getting the file data using that file id
            const fileData = await getFile(fileId);

            if (fileData.data && fileData.data.result) {
                const fileName = fileData.data.result.file_path;
                const file_public_path = `https://api.telegram.org/file/bot${MY_TOKEN}/${fileName}`;

                // Step 1: Initial image analysis
                await sendMessage(messageObj, "Step 1: Analyzing the image...");
                const initialAnalysis = await analyzeImageWithGemini(file_public_path);

                await sendMessage(messageObj,"Initial analysis:\n\n" + initialAnalysis);

                //Step 2: Classify and refine foods
                await sendMessage(messageObj, "Step 2: Classifying and refining the foods...");
                const refinedClassification = await classifyAndRefineFoods(initialAnalysis);

                await sendMessage(messageObj, "Refined classification of the foods:\n\n" + refinedClassification);

                //Step 3 Estimate portions and nutritional content
                await sendMessage(messageObj, "Step 3: Estimating portions and nutritional content...");
                const nutritionalAnalysis = await estimatePortionsAndNutrition(file_public_path, refinedClassification);
                
                await sendMessage(messageObj, "Nutritional analysis:\n\n" + nutritionalAnalysis);


                return true;

                /*
                // Analyze the image using Gemini
                const analysis = await analyzeImageWithGemini(file_public_path);

                // Send the analysis back to the user
                const conciseAnalysis = analysis.length > 700
                    ? analysis.slice(0,697) + "..."
                    : analysis;

                await sendMessage(messageObj, conciseAnalysis);*/
            }
        } catch (error) {
            errorHandler(error, "processThePhoto");
            await sendMessage(messageObj, "Failed to analyze the image. Please try again later.");
            return false;
        }
    }
    return false;
}

module.exports = { handleMessage };