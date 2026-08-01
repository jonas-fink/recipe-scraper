import { Router } from 'express';
import { validateBody, protect } from '#middlewares';
import { cartSchema } from '#schemas';
import { getCart, addToCart, setCart } from '#controllers';

const router = Router();

router.get('/', protect, getCart);
router.post('/', protect, validateBody(cartSchema), addToCart);
router.put('/', protect, validateBody(cartSchema), setCart);

export default router;
