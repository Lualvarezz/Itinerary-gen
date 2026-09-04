import { Router } from 'express';
import { listHotels, createHotel } from '../../controllers/hotel.controller.js';

const router = Router();

router.get('/', listHotels);
router.post('/', createHotel);

export default router;
