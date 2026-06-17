import { Request, Response } from 'express';
import prisma from '../config/db';

interface SetInput {
  setNumber: number;
  weight: number;
  reps: number;
  restTime: number;
}

interface ExerciseInput {
  exerciseId: string;
  note?: string;
  sets: SetInput[];
}

/**
 * @route   POST /api/workouts/log
 * @desc    Save a complete workout session and check for personal records (PRs)
 * @access  Private
 */
export const logWorkoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { startTime, endTime, note, moodRating, exercises } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!startTime || !endTime || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: 'Start time, end time, and a list of logged exercises are required.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date formats for start or end time.' });
    }

    // 1. Run database operations inside a single transactional context
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the base WorkoutSession
      const session = await tx.workoutSession.create({
        data: {
          userId,
          startTime: start,
          endTime: end,
          note,
          moodRating: moodRating ? parseInt(moodRating) : null,
        },
      });

      let totalVolume = 0;
      const brokenPrsList: { id: string; name: string; maxWeight: number }[] = [];

      // B. Loop over each exercise in the payload
      for (const exerciseData of exercises as ExerciseInput[]) {
        const { exerciseId, note: exerciseNote, sets } = exerciseData;

        // Verify exercise exists
        const exerciseRecord = await tx.exercise.findUnique({
          where: { id: exerciseId },
        });

        if (!exerciseRecord) {
          throw new Error(`Exercise with ID ${exerciseId} not found.`);
        }

        // Create SessionExercise
        const sessionExercise = await tx.sessionExercise.create({
          data: {
            sessionId: session.id,
            exerciseId,
            note: exerciseNote,
          },
        });

        let exerciseMaxWeight = 0;

        // C. Loop over sets and save them
        for (const setData of sets) {
          const { setNumber, weight, reps, restTime } = setData;

          await tx.set.create({
            data: {
              sessionExerciseId: sessionExercise.id,
              setNumber,
              weight,
              reps,
              restTime,
            },
          });

          // Accumulate volume
          totalVolume += weight * reps;

          // Track max weight lifted for this exercise in current session
          if (weight > exerciseMaxWeight) {
            exerciseMaxWeight = weight;
          }
        }

        // D. Personal Record (PR) Detection
        if (exerciseMaxWeight > 0) {
          // Look up existing PR for this exercise
          const existingPr = await tx.pRRecord.findFirst({
            where: {
              userId,
              exerciseId,
            },
          });

          if (!existingPr) {
            // New exercise PR
            await tx.pRRecord.create({
              data: {
                userId,
                exerciseId,
                maxWeight: exerciseMaxWeight,
                achievedAt: end,
              },
            });
            brokenPrsList.push({
              id: exerciseId,
              name: exerciseRecord.name,
              maxWeight: exerciseMaxWeight,
            });
          } else if (exerciseMaxWeight > existingPr.maxWeight) {
            // Broken existing PR
            await tx.pRRecord.update({
              where: { id: existingPr.id },
              data: {
                maxWeight: exerciseMaxWeight,
                achievedAt: end,
              },
            });
            brokenPrsList.push({
              id: exerciseId,
              name: exerciseRecord.name,
              maxWeight: exerciseMaxWeight,
            });
          }
        }
      }

      const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

      return {
        session,
        summary: {
          durationMinutes,
          totalVolume,
          brokenPrs: brokenPrsList,
        },
      };
    });

    // Log workout session activity
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'WORKOUT_LOGGED',
        details: `User ${userObj?.name || 'Unknown'} logged a workout session of ${result.summary.durationMinutes} mins (Volume: ${result.summary.totalVolume} kg).`,
      },
    });

    return res.status(201).json({
      message: 'Workout session logged successfully',
      session: result.session,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error('Error logging workout session:', error);
    return res.status(500).json({ error: error.message || 'Internal server error logging workout.' });
  }
};

/**
 * @route   GET /api/workouts/last
 * @desc    Fetch the last logged workout session for quick re-logging pre-fills
 * @access  Private
 */
export const getLastWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Find the most recent session
    const lastSession = await prisma.workoutSession.findFirst({
      where: { userId },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                equipment: true,
                muscleGroups: true,
              },
            },
            sets: {
              orderBy: {
                setNumber: 'asc',
              },
            },
          },
        },
      },
    });

    if (!lastSession) {
      return res.status(200).json({
        hasHistory: false,
        message: 'No previous workout history found to repeat.',
      });
    }

    return res.status(200).json({
      hasHistory: true,
      session: lastSession,
    });
  } catch (error) {
    console.error('Error fetching last workout:', error);
    return res.status(500).json({ error: 'Internal server error fetching workout history.' });
  }
};

/**
 * @route   GET /api/workouts
 * @desc    Get all logged workout sessions for history lists
 * @access  Private
 */
export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const history = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                equipment: true,
                muscleGroups: true,
              },
            },
            sets: {
              orderBy: {
                setNumber: 'asc',
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return res.status(500).json({ error: 'Internal server error fetching workout history.' });
  }
};
