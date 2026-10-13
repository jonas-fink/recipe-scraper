import { Schema, model } from 'mongoose';

const mealPlanSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // 'YYYY-MM-DD' — Kalendertag ohne Zeitzone; String-Vergleich = Datumsvergleich.
        date: { type: String, required: true },
        recipeId: {
            type: Schema.Types.ObjectId,
            ref: 'Recipe',
            required: true,
        },
        // Gewünschte Portionen; null = Portionen des Rezepts.
        servings: { type: Number, default: null },
    },
    { timestamps: true },
);

export default model('MealPlan', mealPlanSchema);
