import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import {
  addItineraryItem,
  createItinerary,
  createSchedule,
  deleteItinerary,
  deleteSchedule,
  generateItineraryPdfController,
  getItineraryById,
  listItineraries,
  listSchedules,
  updateItinerary,
  updateSchedule,
} from '../../controllers/itinerary.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/schedules', listSchedules);
router.post('/schedules', createSchedule);
router.patch('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);
router.get('/', listItineraries);
router.post('/', createItinerary);
router.get('/:id', getItineraryById);
router.patch('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);
router.post('/:id/items', addItineraryItem);
router.post('/:id/generate-pdf', generateItineraryPdfController);

export default router;
