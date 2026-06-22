import { Router } from 'express';
import { validateBody, extractRateLimiter, protect } from '#middlewares';
import { extractSchema, saveRecipeSchema, updateRecipeSchema } from '#schemas';
import { extract, create, list, update, community } from '#controllers';

const router = Router();

router.get('/community', community);

router.post(
    '/extract',
    extractRateLimiter,
    validateBody(extractSchema),
    extract,
);
router.post('/', protect, validateBody(saveRecipeSchema), create);
router.get('/', protect, list);
router.patch('/:id', protect, validateBody(updateRecipeSchema), update);

export default router;
