# calorieTelebot
project to learn how express mongodb telgram and vercel work together
Fully functional full-stack distributed system using Node.js, Express, MongoDB Atlas, and the Telegram API.

# 🍎 ZeRoCalorie Telegram Bot

A lightweight, serverless Telegram bot designed for seamless daily calorie and macronutrient tracking. Built to run perfectly on Vercel's serverless infrastructure with a MongoDB Atlas backend.

## ✨ Features

* **Custom Daily Goals:** Users can set and update their personal daily calorie targets.
* **Macro Tracking:** Logs and calculates total calories, protein, fats, and carbs for the day.
* **Real-time Dashboard:** Generates a daily summary comparing consumed calories against the user's custom goal.
* **Serverless Optimized:** Utilizes concurrent database fetching (`Promise.all`) and connection caching to thrive within Vercel's execution time limits.
* **Timezone Aware:** Automatically resets the daily tracker at midnight.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas
* **ODM:** Mongoose
* **Deployment:** Vercel (Serverless Functions)
* **API:** Telegram Bot API (via Webhooks)

## 🚀 Commands

| Command | Description |
| :--- | :--- |
| `/start` | Initializes the bot and provides the instruction manual. |
| `/help` | Displays the help menu and formatting rules. |
| `/setgoal [number]` | Sets a custom daily calorie limit (e.g., `/setgoal 2500`). |
| `/today` | Pulls the daily dashboard, showing remaining calories and macro totals. |

*(Note: To log a meal, users simply send a text description or a photo to the bot—no slash command required!)*

## 💻 Local Development Setup

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/YOUR-USERNAME/calorieTelebot.git
cd calorieTelebot
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Create a `.env` file in the root directory and add your secure keys:
\`\`\`env
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=your_mongodb_atlas_connection_string
\`\`\`

### 4. Run the Server
\`\`\`bash
npm start
\`\`\`

## ☁️ Deployment (Vercel)

This bot is designed to be deployed as a webhook rather than long-polling. 
1. Connect your GitHub repository to Vercel.
2. Add your `BOT_TOKEN` and `MONGODB_URI` to the Vercel Environment Variables settings.
3. Deploy the project.
4. Set your Telegram Webhook to point to your new Vercel domain:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/webhook`

---
*Built for fast, frictionless health tracking right from your chat list.*