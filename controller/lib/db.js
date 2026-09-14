// controller/lib/db.js
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

const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    calorieGoal: { type: Number, required: true }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function connectDB() {
    try {
        console.log("⏳ Attempting to connect to Logistics Storage...");
        console.log("🔍 URI Check:", process.env.MONGO_URI);



        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("🟢 Logistics Storage Network Connected!");
    } catch (error) {
        console.error("🔴 Database Connection Failed:", error.message);
    }
};

module.exports = { connectDB, Meal, User };