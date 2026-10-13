// Run: node src/utils/aisles.check.ts
import assert from 'node:assert/strict';
import { aisleOf } from './aisles.ts';

const cases: [string, string][] = [
    ['Tomaten', 'produce'],
    ['red onion', 'produce'],
    ['Hähnchenbrust', 'meat'],
    ['ground beef', 'meat'],
    ['Milch', 'dairy'],
    ['2 Eier', 'dairy'],
    ['Weizenmehl', 'pantry'], // "ei" darf nicht in "Weizen" treffen
    ['Olivenöl', 'pantry'],
    ['Salz', 'spices'],
    ['frozen peas', 'frozen'],
    ['Kokosmilch', 'pantry'], // längstes Keyword schlägt "milch"
    ['Tomatenmark', 'pantry'],
    ['Paprikapulver', 'spices'],
    ['Drachenfrucht', 'other'],
];

for (const [name, want] of cases) {
    assert.equal(aisleOf({ name }), want, name);
}
assert.equal(aisleOf({ name: 'Tomaten', aisle: 'frozen' }), 'frozen'); // Override gewinnt
console.log('aisleOf: alle Checks bestanden ✓');
