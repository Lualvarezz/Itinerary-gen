import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { createClient, deleteClient, listClients, updateClient } from '../../controllers/client.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
