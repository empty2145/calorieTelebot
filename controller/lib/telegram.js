// lib/telegram.js
const { getAxiosInstance } = require('./axios');
const { errorHandler, circumcizeMessage } = require("./helpers");
const { analyzeImageWithGemini, classifyAndRefineFoods, estimatePortionsAndNutrition, lookupNutritionForItems } = require("./llm");

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

                // Step 1 Fulgora: Initial image analysis
                await sendMessage(messageObj, "Step 1: Analyzing the image...");
                const initialAnalysis = await analyzeImageWithGemini(file_public_path);

                //const circumsizedInitialanalysis = await circumcizeMessage(initialAnalysis, 1000);
                //await sendMessage(messageObj,"Initial analysis:\n\n" + circumsizedInitialanalysis);

                // Step 2 Gleba: USDA Nutrition Lookup
                await sendMessage(messageObj, "Step 2: Extracting bilogical data from USDA...")
                const nutritionalData = await lookupNutritionForItems(initialAnalysis);

                // final message formatting and pretty loop

                let finalMessage = "🌟 **Meal Analysis Complete!** 🌟\n\n";

                for (const item of nutritionalData) {
                    finalMessage += `🍽️ **${item.foodName}** (Est. ${item.portion})\n`;
                    finalMessage += `   🔥 Calories: ${item.calories}\n`;
                    finalMessage += `   🥩 Protein: ${item.protein}g\n`;
                    finalMessage += `   🥑 Fat: ${item.fat}g\n`;
                    finalMessage += `   🍞 Carbs: ${item.carbs}g\n\n`;
                }

                // droppod
                await sendMessage(messageObj, finalMessage);

                return true;
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