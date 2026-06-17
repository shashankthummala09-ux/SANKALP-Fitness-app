import { Router } from 'express';
import { createRoutine, getRoutines, deleteRoutine } from '../controllers/routine.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Routine endpoints
router.post('/', createRoutine);
router.get('/', getRoutines);
router.delete('/:id', deleteRoutine);

export default router;
