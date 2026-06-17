import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * @route   POST /api/measurements
 * @desc    Log new body measurements (chest, waist, arms, thighs, optional photo)
 * @access  Private
 */
export const logMeasurements = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { chest, waist, arms, thighs, photo } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const chestVal = parseFloat(chest);
    const waistVal = parseFloat(waist);
    const armsVal = parseFloat(arms);
    const thighsVal = parseFloat(thighs);

    // Validate positive numbers
    if (isNaN(chestVal) || chestVal <= 0) {
      return res.status(400).json({ error: 'Chest measurement must be a positive number.' });
    }
    if (isNaN(waistVal) || waistVal <= 0) {
      return res.status(400).json({ error: 'Waist measurement must be a positive number.' });
    }
    if (isNaN(armsVal) || armsVal <= 0) {
      return res.status(400).json({ error: 'Arms measurement must be a positive number.' });
    }
    if (isNaN(thighsVal) || thighsVal <= 0) {
      return res.status(400).json({ error: 'Thighs measurement must be a positive number.' });
    }

    // Optional photo length limit to prevent database overload (e.g. max 15MB)
    if (photo && photo.length > 20000000) {
      return res.status(400).json({ error: 'Progress photo size is too large. Max allowed size is roughly 15MB.' });
    }

    const measurement = await prisma.measurement.create({
      data: {
        userId,
        chest: chestVal,
        waist: waistVal,
        arms: armsVal,
        thighs: thighsVal,
        photo: photo || null,
      },
    });

    return res.status(201).json({
      message: 'Body measurements logged successfully',
      measurement,
    });
  } catch (error) {
    console.error('Error logging body measurements:', error);
    return res.status(500).json({ error: 'Internal server error logging body measurements.' });
  }
};

/**
 * @route   GET /api/measurements
 * @desc    Get all historical logged measurements for the user
 * @access  Private
 */
export const getMeasurementHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Retrieve logs sorted chronologically (oldest first)
    const history = await prisma.measurement.findMany({
      where: { userId },
      orderBy: {
        loggedAt: 'asc',
      },
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching measurements history:', error);
    return res.status(500).json({ error: 'Internal server error fetching measurements history.' });
  }
};
