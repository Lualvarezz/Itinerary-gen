import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import {
  createActivity,
  createCategory,
  createTouristPlace,
  deleteActivity,
  listActivities,
  listCategories,
  listTouristPlaces,
  updateActivity,
} from '../../controllers/catalog.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.get('/tourist-places', listTouristPlaces);
router.post('/tourist-places', createTouristPlace);
router.get('/activities', listActivities);
router.post('/activities', createActivity);
router.patch('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

export default router;
