import assert from 'node:assert/strict';
import { recipeSchema } from './recipe.ts';

const valid = {
    title: 'Pasta',
    ingredients: [
        { name: 'Mehl', amount: 500, unit: 'g' },
        { name: 'Salz', amount: null, unit: null },
    ],
    instructions: ['Kneten', 'Kochen'],
    category: null,
    cookTimeMinutes: null,
    servings: null,
};
assert.ok(recipeSchema.safeParse(valid).success);

// gefüllte Meta-Felder
assert.ok(
    recipeSchema.safeParse({
        ...valid,
        category: 'Dinner',
        cookTimeMinutes: 30,
        servings: 4,
    }).success,
);
// cookTimeMinutes als String statt number/null
assert.equal(
    recipeSchema.safeParse({ ...valid, cookTimeMinutes: '30' }).success,
    false,
);

// fehlender Titel
assert.equal(recipeSchema.safeParse({ ...valid, title: '' }).success, false);
// Zutat ohne name
assert.equal(
    recipeSchema.safeParse({
        ...valid,
        ingredients: [{ amount: 1, unit: 'g' }],
    }).success,
    false,
);
// amount als String statt number/null
assert.equal(
    recipeSchema.safeParse({
        ...valid,
        ingredients: [{ name: 'x', amount: '1', unit: 'g' }],
    }).success,
    false,
);

console.log('recipeSchema: alle Checks bestanden ✓');
