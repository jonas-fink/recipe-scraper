import assert from 'node:assert/strict';
import { recipeSchema } from './recipe.ts';

const valid = {
    title: 'Pasta',
    ingredients: [{ name: 'Mehl', amount: 500, unit: 'g' }, { name: 'Salz', amount: null, unit: null }],
    instructions: ['Kneten', 'Kochen'],
};
assert.ok(recipeSchema.safeParse(valid).success);

// fehlender Titel
assert.equal(recipeSchema.safeParse({ ...valid, title: '' }).success, false);
// Zutat ohne name
assert.equal(
    recipeSchema.safeParse({ ...valid, ingredients: [{ amount: 1, unit: 'g' }] }).success,
    false,
);
// amount als String statt number/null
assert.equal(
    recipeSchema.safeParse({ ...valid, ingredients: [{ name: 'x', amount: '1', unit: 'g' }] })
        .success,
    false,
);

console.log('recipeSchema: alle Checks bestanden ✓');
