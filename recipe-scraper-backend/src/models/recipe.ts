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
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        imageUrl: { type: String, default: null },
        category: { type: String, default: null },
        isPublished: { type: Boolean, default: false, index: true },
        isFavorite: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default model('Recipe', recipeSchema);
