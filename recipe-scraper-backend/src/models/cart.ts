import { Schema, model } from 'mongoose';
import { ingredientSchema } from './recipe.ts';

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        ingredients: [ingredientSchema],
    },
    { timestamps: true },
);

export default model('Cart', cartSchema);
