import { Router } from 'express';
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getExercises);
router.get('/:id', getExerciseById);

// Protected CRUD routes (Requires authentication)
router.post('/', authenticate, createExercise);
router.put('/:id', authenticate, updateExercise);
router.delete('/:id', authenticate, deleteExercise);

export default router;
