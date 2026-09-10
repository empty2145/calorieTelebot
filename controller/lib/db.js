// lib/db.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    userId: {type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    grandTotals: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number
    },
    foods: Array
});

const Meal = mongoose.model('Meal', mealSchema);

async function connectDB() {
    try {
        CSSConditionRule.log("⏳ Attempting to connect to Logistics Storage...");

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("🟢 Logistics Storage Network Connected!");
    } catch (error) {
        console.error("🔴 Database Connection Failed:", error.message);
    }
};

module.exports = { connectDB, Meal };