// controller/lib/telegram.js
const { getAxiosInstance } = require('./axios');
const { errorHandler, circumcizeMessage } = require("./helpers");
const { analyzeImageWithGemini, classifyAndRefineFoods, estimatePortionsAndNutrition, lookupNutritionForItems } = require("./llm");
const { Meal } = require('./db');

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

async function handleText(messageObj) {
    const messageText = messageObj.text || "";

    if (messageText.charAt(0) === "/") {
        const command = messageText.substr(1);
        switch (command) {
            case "start":
                return sendMessage(
                    messageObj,
                    "Hi! I am the ZeRoCalorie bot. Send me a photo of your food to track macros! 📸"
                );
            case "today":
                const startOfDay =new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                try {
                    const todaysMeals = await Meal.find({
                        userId: messageObj.from.id,
                        timestamp: { $gte: startOfDay, $lte: endOfDay }
                    });

                    if (todaysMeals.length === 0) {
                        return sendMessage(messageObj, "You haven't logged any meals today! Send me a food picture to get started. 📸");
                    }

                    let totalCals = 0, totalPro, totalFat, totalCarbs = 0;
                    todaysMeals.forEach(meal => {
                        totalCals += meal.grandTotals.calories
                        totalPro
                        totalFat
                        totalCarbs
                    })
                } catch (error) {

                }
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

                // SAFETY CHECK
                if (!initialAnalysis || !Array.isArray(initialAnalysis)) {
                    await sendMessage(messageObj, "Gemini is experiencing high traffic right now! Please try sending the photo again");
                    return false;
                }

                //const circumsizedInitialanalysis = await circumcizeMessage(initialAnalysis, 1000);
                //await sendMessage(messageObj,"Initial analysis:\n\n" + circumsizedInitialanalysis);

                // Step 2 Gleba: USDA Nutrition Lookup
                await sendMessage(messageObj, "Step 2: Extracting biological data from USDA...")
                const nutritionalData = await lookupNutritionForItems(initialAnalysis);

                // final message formatting and pretty loop

                let finalMessage = "🌟 **Meal Analysis Complete!** 🌟\n\n";

                // storage tanks
                let totalCalories = 0;
                let totalProtein = 0;
                let totalFat = 0;
                let totalCarbs = 0;

                for (const item of nutritionalData) {
                    finalMessage += `🍽️ **${item.foodName}** (Est. ${item.portion})\n`;
                    finalMessage += `   🔥 Calories: ${item.calories}\n`;
                    finalMessage += `   🥩 Protein: ${item.protein}g\n`;
                    finalMessage += `   🥑 Fat: ${item.fat}g\n`;
                    finalMessage += `   🍞 Carbs: ${item.carbs}g\n\n`;

                    totalCalories += item.calories;
                    totalProtein += item.protein;
                    totalFat += item.fat;
                    totalCarbs += item.carbs;
                }

                finalMessage += `======================\n`;
                finalMessage += `🏆 **GRAND TOTAL**\n`;
                finalMessage += `   🔥 Calories: ${Math.round(totalCalories)}\n`;
                finalMessage += `   🥩 Protein: ${Math.round(totalProtein)}g\n`;
                finalMessage += `   🥑 Fat: ${Math.round(totalFat)}g\n`;
                finalMessage += `   🍞 Carbs: ${Math.round(totalCarbs)}g\n`;

                // droppod
                await sendMessage(messageObj, finalMessage);

                try {
                    await Meal.create({
                        userId: messageObj.from.id,
                        grandTotals: {
                            calories: Math.round(totalCalories),
                            protein: Math.round(totalProtein),
                            fat: Math.round(totalFat),
                            carbs: Math.round(totalCarbs)
                        },
                        foods: nutritionalData
                    });
                    console.log("✅ Meal saved to Logistics Storage!")
                } catch (dbError) {
                    console.error("❌ Failed to save meal:", dbError);
                }

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