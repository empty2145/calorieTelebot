// lib/db.js
const mongoose = require('mongoose');

const mealSchema = new mongoose,Schema({
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

