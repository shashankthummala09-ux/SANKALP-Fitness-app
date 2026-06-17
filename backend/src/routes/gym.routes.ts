import { Router } from 'express';
import { getCities, getGyms, getGymDetail } from '../controllers/gym.controller';
import { submitReview } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// City autocomplete
router.get('/cities', getCities);

// Gym listing (filtered & sorted)
router.get('/', getGyms);

// Gym detail (public access, phone numbers conditionally masked)
router.get('/:gymId', getGymDetail);

// Submit gym review
router.post('/:gymId/reviews', authenticate, submitReview);

export default router;
