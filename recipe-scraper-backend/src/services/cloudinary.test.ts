import assert from 'node:assert/strict';
import { publicIdFromUrl } from './cloudinary.ts';

assert.equal(
    publicIdFromUrl(
        'https://res.cloudinary.com/demo/image/upload/v1699999999/recipes/user_abc/recipe_123.jpg',
    ),
    'recipes/user_abc/recipe_123',
);
// No version segment.
assert.equal(
    publicIdFromUrl(
        'https://res.cloudinary.com/demo/image/upload/recipes/user_abc/recipe_123.png',
    ),
    'recipes/user_abc/recipe_123',
);
// Not a Cloudinary upload URL.
assert.equal(publicIdFromUrl('https://example.com/photo.jpg'), null);
