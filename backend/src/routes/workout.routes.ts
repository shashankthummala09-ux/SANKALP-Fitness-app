import { Router } from 'express';
import { logWorkoutSession, getLastWorkout, getWorkoutHistory } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Log finished workout session
router.post('/log', logWorkoutSession);

// Fetch last logged workout session details
router.get('/last', getLastWorkout);

// Fetch all logged workout history
router.get('/', getWorkoutHistory);

export default router;
