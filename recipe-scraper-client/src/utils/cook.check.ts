// Run: node src/utils/cook.check.ts
import assert from 'node:assert/strict';
import { stepIngredients } from './cook.ts';

const ing = (name: string) => ({ name, amount: null, unit: null });
const all = [
    ing('passierte Tomaten'),
    ing('Knoblauch'),
    ing('Orzo'),
    ing('Olivenöl'),
    ing('Ei'),
];
const names = (step: string) => stepIngredients(step, all).map((i) => i.name);

assert.deepEqual(names('Knoblauch fein hacken und in Olivenöl anschwitzen.'), [
    'Knoblauch',
    'Olivenöl',
]);
assert.deepEqual(names('Mit den passierten Tomaten ablöschen.'), [
    'passierte Tomaten',
]); // gebeugte Form trifft
assert.deepEqual(names('Orzo zugeben.'), ['Orzo']);
assert.deepEqual(names('Mit Salz abschmecken.'), []);
assert.deepEqual(names('Ein Ei verquirlen.'), []); // ponytail: zu kurze Namen werden nie gefunden
console.log('stepIngredients: alle Checks bestanden ✓');
