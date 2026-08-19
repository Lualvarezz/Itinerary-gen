import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { getDashboardSummary } from '../../controllers/dashboard.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/summary', getDashboardSummary);

export default router;
