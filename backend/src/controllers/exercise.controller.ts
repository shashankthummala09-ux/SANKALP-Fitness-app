import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * @route   GET /api/exercises
 * @desc    Get all exercises with search and filters
 * @access  Public
 */
export const getExercises = async (req: Request, res: Response) => {
  try {
    const { search, muscleGroup, difficulty, equipment } = req.query;

    const where: any = {};

    // 1. Text Search (checks name or muscleGroups containing string)
    if (typeof search === 'string' && search.trim()) {
      const searchStr = search.trim();
      where.OR = [
        {
          name: {
            contains: searchStr,
            mode: 'insensitive',
          },
        },
        {
          muscleGroups: {
            has: searchStr.toLowerCase(),
          },
        },
      ];
    }

    // 2. Specific Muscle Group Filter
    if (typeof muscleGroup === 'string' && muscleGroup.trim()) {
      where.muscleGroups = {
        has: muscleGroup.trim().toLowerCase(),
      };
    }

    // 3. Difficulty Filter
    if (typeof difficulty === 'string' && difficulty.trim()) {
      where.difficulty = {
        equals: difficulty.trim(),
        mode: 'insensitive',
      };
    }

    // 4. Equipment Filter
    if (typeof equipment === 'string' && equipment.trim()) {
      where.equipment = {
        equals: equipment.trim(),
        mode: 'insensitive',
      };
    }

    // Fetch exercises matching dynamic criteria
    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return res.status(500).json({ error: 'Internal server error fetching exercises.' });
  }
};

/**
 * @route   GET /api/exercises/:id
 * @desc    Get details of a single exercise
 * @access  Public
 */
export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Exercise ID is required.' });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }

    return res.status(200).json({ exercise });
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    return res.status(500).json({ error: 'Internal server error fetching exercise details.' });
  }
};

/**
 * @route   POST /api/exercises
 * @desc    Create a new exercise (Admin CRUD endpoint)
 * @access  Private (Admin checks can be added later, protected by auth for MVP)
 */
export const createExercise = async (req: Request, res: Response) => {
  try {
    const {
      name,
      muscleGroups,
      difficulty,
      equipment,
      gifUrl,
      imageUrl,
      videoUrl,
      formSteps,
      commonMistakes,
      proTips,
      breathingCue,
    } = req.body;

    if (!name || !muscleGroups || !difficulty || !equipment) {
      return res.status(400).json({ 
        error: 'Name, muscleGroups array, difficulty, and equipment are required.' 
      });
    }

    if (!Array.isArray(muscleGroups) || muscleGroups.length === 0) {
      return res.status(400).json({ error: 'muscleGroups must be a non-empty string array.' });
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        muscleGroups: muscleGroups.map(m => m.toLowerCase()),
        difficulty,
        equipment,
        gifUrl,
        imageUrl,
        videoUrl,
        formSteps: Array.isArray(formSteps) ? formSteps : [],
        commonMistakes: Array.isArray(commonMistakes) ? commonMistakes : [],
        proTips: Array.isArray(proTips) ? proTips : [],
        breathingCue,
      },
    });

    return res.status(201).json({
      message: 'Exercise created successfully',
      exercise,
    });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return res.status(500).json({ error: 'Internal server error creating exercise.' });
  }
};

/**
 * @route   PUT /api/exercises/:id
 * @desc    Update an existing exercise (Admin CRUD endpoint)
 * @access  Private
 */
export const updateExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      muscleGroups,
      difficulty,
      equipment,
      gifUrl,
      imageUrl,
      videoUrl,
      formSteps,
      commonMistakes,
      proTips,
      breathingCue,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Exercise ID is required.' });
    }

    // Verify it exists
    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (Array.isArray(muscleGroups)) updateData.muscleGroups = muscleGroups.map(m => m.toLowerCase());
    if (difficulty) updateData.difficulty = difficulty;
    if (equipment) updateData.equipment = equipment;
    if (gifUrl !== undefined) updateData.gifUrl = gifUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (Array.isArray(formSteps)) updateData.formSteps = formSteps;
    if (Array.isArray(commonMistakes)) updateData.commonMistakes = commonMistakes;
    if (Array.isArray(proTips)) updateData.proTips = proTips;
    if (breathingCue !== undefined) updateData.breathingCue = breathingCue;

    const updated = await prisma.exercise.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      message: 'Exercise updated successfully',
      exercise: updated,
    });
  } catch (error) {
    console.error('Error updating exercise:', error);
    return res.status(500).json({ error: 'Internal server error updating exercise.' });
  }
};

/**
 * @route   DELETE /api/exercises/:id
 * @desc    Delete an exercise (Admin CRUD endpoint)
 * @access  Private
 */
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Exercise ID is required.' });
    }

    const existing = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return res.status(500).json({ error: 'Internal server error deleting exercise.' });
  }
};
