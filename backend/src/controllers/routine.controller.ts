import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * @route   POST /api/routines
 * @desc    Create a new reusable workout template/routine
 * @access  Private
 */
export const createRoutine = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name, exerciseIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Routine name is required.' });
    }

    if (!exerciseIds || !Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      return res.status(400).json({ error: 'At least one exercise is required to save a routine.' });
    }

    // 1. Verify all exercises exist
    const exercisesExist = await prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds }
      }
    });

    if (exercisesExist.length !== exerciseIds.length) {
      return res.status(400).json({ error: 'One or more selected exercises do not exist in library.' });
    }

    // 2. Save Routine & RoutineExercises inside a single transaction
    const routine = await prisma.$transaction(async (tx) => {
      const newRoutine = await tx.routine.create({
        data: {
          userId,
          name: name.trim()
        }
      });

      // Save each routine exercise mapping
      for (let i = 0; i < exerciseIds.length; i++) {
        await tx.routineExercise.create({
          data: {
            routineId: newRoutine.id,
            exerciseId: exerciseIds[i],
            order: i
          }
        });
      }

      return tx.routine.findUnique({
        where: { id: newRoutine.id },
        include: {
          exercises: {
            include: {
              exercise: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    });

    return res.status(201).json({
      message: 'Routine template saved successfully',
      routine
    });
  } catch (error) {
    console.error('Error creating routine:', error);
    return res.status(500).json({ error: 'Internal server error saving routine template.' });
  }
};

/**
 * @route   GET /api/routines
 * @desc    Get all reusable routines for the authenticated user
 * @access  Private
 */
export const getRoutines = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const routines = await prisma.routine.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroups: true,
                difficulty: true,
                equipment: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({ routines });
  } catch (error) {
    console.error('Error fetching routines:', error);
    return res.status(500).json({ error: 'Internal server error fetching routines.' });
  }
};

/**
 * @route   DELETE /api/routines/:id
 * @desc    Delete a routine template
 * @access  Private
 */
export const deleteRoutine = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const routine = await prisma.routine.findFirst({
      where: { id, userId }
    });

    if (!routine) {
      return res.status(404).json({ error: 'Routine template not found.' });
    }

    await prisma.routine.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Routine template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return res.status(500).json({ error: 'Internal server error deleting routine template.' });
  }
};
