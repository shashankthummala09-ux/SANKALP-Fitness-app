import { Request, Response } from 'express';
import prisma from '../config/db';

// Helper to calculate BMI
const calculateBmi = (weight: number, heightCm: number): number => {
  if (heightCm <= 0) return 0;
  const heightMeters = heightCm / 100;
  const bmi = weight / (heightMeters * heightMeters);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
};

/**
 * @route   POST /api/goals/onboarding
 * @desc    Create or update user onboarding fitness goals
 * @access  Private
 */
export const createOrUpdateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { currentWeight, goalWeight, height, activityLevel, primaryGoal, targetDate, sankalpText } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // 1. Validate inputs
    const weightVal = parseFloat(currentWeight);
    const goalWeightVal = parseFloat(goalWeight);
    const heightVal = parseFloat(height);

    if (isNaN(weightVal) || weightVal <= 0) {
      return res.status(400).json({ error: 'Current weight must be a positive number.' });
    }
    if (isNaN(goalWeightVal) || goalWeightVal <= 0) {
      return res.status(400).json({ error: 'Goal weight must be a positive number.' });
    }
    if (isNaN(heightVal) || heightVal <= 0) {
      return res.status(400).json({ error: 'Height must be a positive number.' });
    }
    if (!activityLevel || !primaryGoal) {
      return res.status(400).json({ error: 'Activity level and primary goal are required.' });
    }

    const parsedTargetDate = targetDate ? new Date(targetDate) : null;
    if (parsedTargetDate && isNaN(parsedTargetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid target date format.' });
    }

    if (sankalpText !== undefined && sankalpText !== null && sankalpText.length > 150) {
      return res.status(400).json({ error: 'Sankalp vow text cannot exceed 150 characters.' });
    }

    // 2. Check if a goal already exists
    const existingGoal = await prisma.goal.findFirst({
      where: { userId },
    });

    let goal;

    if (existingGoal) {
      // Update existing goal
      goal = await prisma.goal.update({
        where: { id: existingGoal.id },
        data: {
          currentWeight: weightVal,
          goalWeight: goalWeightVal,
          height: heightVal,
          activityLevel,
          primaryGoal,
          targetDate: parsedTargetDate,
          sankalpText: sankalpText || null,
        },
      });
    } else {
      // Create new goal
      goal = await prisma.goal.create({
        data: {
          userId,
          currentWeight: weightVal,
          goalWeight: goalWeightVal,
          height: heightVal,
          activityLevel,
          primaryGoal,
          targetDate: parsedTargetDate,
          sankalpText: sankalpText || null,
        },
      });
    }

    // 3. Log initial weight in WeightLog history
    const weightLog = await prisma.weightLog.create({
      data: {
        userId,
        weight: weightVal,
      },
    });

    const bmi = calculateBmi(weightVal, heightVal);

    return res.status(200).json({
      message: 'Goal saved successfully',
      goal,
      bmi,
      initialWeightLog: weightLog,
    });
  } catch (error) {
    console.error('Onboarding goal error:', error);
    return res.status(500).json({ error: 'Internal server error saving goal details.' });
  }
};

/**
 * @route   GET /api/goals/dashboard
 * @desc    Get user goal metrics and BMI for the dashboard widget
 * @access  Private
 */
export const getGoalDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Retrieve active goal
    const goal = await prisma.goal.findFirst({
      where: { userId },
    });

    if (!goal) {
      return res.status(200).json({
        onboardingRequired: true,
        message: 'No fitness goals configured. Please complete onboarding.',
      });
    }

    // Calculate dynamic stats
    const bmi = calculateBmi(goal.currentWeight, goal.height);

    // Days since goal set
    const now = new Date();
    const createdTime = new Date(goal.createdAt);
    const diffTime = Math.abs(now.getTime() - createdTime.getTime());
    const daysSinceSet = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Progress and other metrics can be expanded in subsequent features

    return res.status(200).json({
      onboardingRequired: false,
      goal,
      bmi,
      daysSinceSet,
    });
  } catch (error) {
    console.error('Fetch dashboard metrics error:', error);
    return res.status(500).json({ error: 'Internal server error loading dashboard metrics.' });
  }
};

/**
 * @route   POST /api/goals/weight
 * @desc    Log a new weight entry and update current goal weight
 * @access  Private
 */
export const logWeight = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { weight } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 0) {
      return res.status(400).json({ error: 'Weight must be a positive number.' });
    }

    // 1. Create a new WeightLog entry
    const newLog = await prisma.weightLog.create({
      data: {
        userId,
        weight: weightVal,
      },
    });

    // 2. Find and update the active Goal's currentWeight
    const activeGoal = await prisma.goal.findFirst({
      where: { userId },
    });

    let updatedGoal = null;
    let bmi = 0;

    if (activeGoal) {
      updatedGoal = await prisma.goal.update({
        where: { id: activeGoal.id },
        data: {
          currentWeight: weightVal,
        },
      });
      bmi = calculateBmi(weightVal, activeGoal.height);
    }

    return res.status(200).json({
      message: 'Weight logged successfully',
      weightLog: newLog,
      goal: updatedGoal,
      bmi,
    });
  } catch (error) {
    console.error('Log weight error:', error);
    return res.status(500).json({ error: 'Internal server error logging weight.' });
  }
};

/**
 * @route   GET /api/goals/history
 * @desc    Get user chronological weight history logs for charting
 * @access  Private
 */
export const getWeightHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Fetch logs ordered chronologically (oldest first)
    const logs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: {
        loggedAt: 'asc',
      },
    });

    return res.status(200).json({ history: logs });
  } catch (error) {
    console.error('Fetch weight logs error:', error);
    return res.status(500).json({ error: 'Internal server error fetching weight logs.' });
  }
};

/**
 * @route   PUT /api/goals/sankalp
 * @desc    Update user sankalp vow text
 * @access  Private
 */
export const updateSankalpText = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { sankalpText } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (sankalpText !== undefined && sankalpText !== null && sankalpText.length > 150) {
      return res.status(400).json({ error: 'Sankalp vow text cannot exceed 150 characters.' });
    }

    const activeGoal = await prisma.goal.findFirst({
      where: { userId },
    });

    if (!activeGoal) {
      return res.status(404).json({ error: 'Active goal not found. Please complete onboarding first.' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: activeGoal.id },
      data: {
        sankalpText: sankalpText || null,
      },
    });

    return res.status(200).json({
      message: 'Sankalp updated successfully',
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('Update sankalp error:', error);
    return res.status(500).json({ error: 'Internal server error updating sankalp.' });
  }
};
