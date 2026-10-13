import { Router } from 'express';
import { validateBody, validateQuery, protect } from '#middlewares';
import {
    mealPlanEntrySchema,
    mealPlanQuerySchema,
    mealPlanUpdateSchema,
} from '#schemas';
import { getMealPlan, addMeal, updateMeal, removeMeal } from '#controllers';

const router = Router();

router.get('/', protect, validateQuery(mealPlanQuerySchema), getMealPlan);
router.post('/', protect, validateBody(mealPlanEntrySchema), addMeal);
router.patch('/:id', protect, validateBody(mealPlanUpdateSchema), updateMeal);
router.delete('/:id', protect, removeMeal);

export default router;
