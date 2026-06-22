import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '#controllers';
import { protect, adminOnly, validateBody } from '#middlewares';
import { updateUserSchema } from '#schemas';

const router = Router();

router.use(protect, adminOnly);

router.get('/', getUsers);
router.patch('/:id', validateBody(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
