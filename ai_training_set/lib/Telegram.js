// lib/telegram.js
const { axiosInstance} = require('./axios');

function sendMessage(messageObj, messageText) {
    return axiosInstance.post("sendMessage", {
        chat_id: messageObj.chat.id,
        text: messageText,
    })
}

function handleMessage(messageObj) {
    if (!(messageObj.text || messageObj.photo)) return;
    if (messageObj.photo) handlePhoto(messageObj);
    if (messageObj.text) handleText(messageObj);
}

function handleText(messageObj) {
    const messageText = messageObj.text;

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


function handlePhoto(messageObj) {
    
}

module.exports = { handleMessage };