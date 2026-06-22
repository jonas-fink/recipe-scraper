import { Router } from 'express';
import { validateBody, extractRateLimiter } from '#middlewares';
import { extractSchema, saveRecipeSchema } from '#schemas';
import { extract, create, list } from '#controllers';

const router = Router();

router.post(
    '/extract',
    extractRateLimiter,
    validateBody(extractSchema),
    extract,
);
router.post('/', validateBody(saveRecipeSchema), create);
router.get('/', list);

export default router;
