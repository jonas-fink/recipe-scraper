import { Schema, model } from 'mongoose';

const ingredientSchema = new Schema(
    {
        name: { type: String, required: true },
        amount: { type: Number, default: null },
        unit: { type: String, default: null },
    },
    { _id: false },
);

const recipeSchema = new Schema(
    {
        title: { type: String, required: true },
        ingredients: [ingredientSchema],
        instructions: [String],
        sourceUrl: { type: String, required: true },
        status: { type: String, enum: ['draft', 'saved'], default: 'saved' },
    },
    { timestamps: true },
);

export default model('Recipe', recipeSchema);
