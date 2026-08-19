import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import {
  addItineraryItem,
  createItinerary,
  createSchedule,
  generateItineraryPdfController,
  listItineraries,
  listSchedules,
  updateItinerary,
} from '../../controllers/itinerary.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/schedules', listSchedules);
router.post('/schedules', createSchedule);
router.get('/', listItineraries);
router.post('/', createItinerary);
router.patch('/:id', updateItinerary);
router.post('/:id/items', addItineraryItem);
router.post('/:id/generate-pdf', generateItineraryPdfController);

export default router;
