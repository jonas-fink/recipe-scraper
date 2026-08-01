import assert from 'node:assert/strict';
import { mergeIngredients } from './cart.ts';

const flour = { name: 'Mehl', amount: 500, unit: 'g' };

// same name+unit -> amounts summed
let out = mergeIngredients([flour], [{ name: 'mehl', amount: 200, unit: 'g' }]);
assert.equal(out.length, 1);
assert.equal(out[0].amount, 700);

// different unit -> separate entry
out = mergeIngredients([flour], [{ name: 'Mehl', amount: 1, unit: 'kg' }]);
assert.equal(out.length, 2);

// null amount -> no sum, existing kept, no duplicate
out = mergeIngredients([flour], [{ name: 'Mehl', amount: null, unit: 'g' }]);
assert.equal(out.length, 1);
assert.equal(out[0].amount, 500);

// new ingredient -> appended
out = mergeIngredients([flour], [{ name: 'Salz', amount: null, unit: null }]);
assert.equal(out.length, 2);

// input not mutated
assert.equal(flour.amount, 500);

console.log('mergeIngredients: alle Checks bestanden ✓');
