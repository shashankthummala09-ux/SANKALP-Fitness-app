import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

/**
 * @route   GET /api/gyms/cities
 * @desc    Get autocomplete list of cities where gyms are located
 * @access  Public
 */
export const getCities = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const querySearch = typeof search === 'string' ? search.trim() : '';

    const gyms = await prisma.gym.findMany({
      where: querySearch
        ? {
            city: {
              contains: querySearch,
              mode: 'insensitive',
            },
          }
        : {},
      select: {
        city: true,
      },
      distinct: ['city'],
    });

    const cities = gyms.map((g) => g.city);
    return res.status(200).json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return res.status(500).json({ error: 'Internal server error fetching cities.' });
  }
};

/**
 * @route   GET /api/gyms
 * @desc    Get filtered and sorted gym listing for a city
 * @access  Public
 */
export const getGyms = async (req: Request, res: Response) => {
  try {
    const {
      city,
      minFee,
      maxFee,
      minRating,
      amenities,
      hasTrainers,
      sortBy,
      sortOrder,
    } = req.query;

    const where: any = {};

    // 1. City Filter (Case Insensitive)
    if (typeof city === 'string' && city.trim()) {
      where.city = {
        equals: city.trim(),
        mode: 'insensitive',
      };
    }

    // 2. Fee Filter (Range)
    const min = parseFloat(typeof minFee === 'string' ? minFee : '0');
    const max = parseFloat(typeof maxFee === 'string' ? maxFee : '5000');
    where.fee = {
      gte: isNaN(min) ? 0 : min,
      lte: isNaN(max) ? 5000 : max,
    };

    // 3. Rating Filter (e.g. >= 3, >= 4)
    if (typeof minRating === 'string') {
      const ratingVal = parseFloat(minRating);
      if (!isNaN(ratingVal)) {
        where.rating = { gte: ratingVal };
      }
    }

    // 4. Amenities Filter (Has every amenity selected)
    if (typeof amenities === 'string' && amenities.trim()) {
      const amenitiesList = amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
      
      if (amenitiesList.length > 0) {
        where.amenities = {
          hasEvery: amenitiesList,
        };
      }
    }

    // 5. Trainer Availability Filter
    if (hasTrainers === 'true') {
      where.trainers = { some: {} };
    } else if (hasTrainers === 'false') {
      where.trainers = { none: {} };
    }

    // 6. Sorting
    const orderBy: any = {};
    if (sortBy === 'fee') {
      orderBy.fee = sortOrder === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder === 'asc' ? 'asc' : 'desc'; // Ratings usually sort highest first
    } else {
      orderBy.rating = 'desc'; // Default sorting
    }

    // 7. Query DB including the trainer records to count them
    const gyms = await prisma.gym.findMany({
      where,
      orderBy,
      include: {
        trainers: {
          select: { id: true }, // We only need ids to calculate count
        },
      },
    });

    // 8. Format response (calculate trainerCount and remove raw trainers array)
    const formattedGyms = gyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      city: gym.city,
      address: gym.address,
      fee: gym.fee,
      rating: gym.rating,
      amenities: gym.amenities,
      trainerCount: gym.trainers.length,
    }));

    return res.status(200).json({ gyms: formattedGyms });
  } catch (error) {
    console.error('Error fetching gyms:', error);
    return res.status(500).json({ error: 'Internal server error fetching gyms.' });
  }
};

/**
 * @route   GET /api/gyms/:gymId
 * @desc    Get detailed gym information. Conditionally displays trainer phone numbers based on Auth status.
 * @access  Public (Phone numbers are login restricted)
 */
export const getGymDetail = async (req: Request, res: Response) => {
  try {
    const { gymId } = req.params;

    if (!gymId) {
      return res.status(400).json({ error: 'Gym ID is required.' });
    }

    // 1. Query Gym, including trainers and reviews (with reviewer name)
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      include: {
        trainers: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!gym) {
      return res.status(404).json({ error: 'Gym not found.' });
    }

    // 2. Perform inline authentication check to decide if we show trainer contact details
    let isAuthenticated = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
          jwt.verify(token, secret);
          isAuthenticated = true;
        } catch (err) {
          // Token invalid/expired; treat user as guest
        }
      }
    }

    // 3. Conditionally mask trainer phone numbers if not logged in
    const processedTrainers = gym.trainers.map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      specialization: trainer.specialization,
      fee: trainer.fee,
      experience: trainer.experience,
      // Mask phone number if unauthenticated
      phone: isAuthenticated ? trainer.phone : 'Login to view contact info',
    }));

    const responseData = {
      ...gym,
      trainers: processedTrainers,
      loginRequiredForContact: !isAuthenticated,
    };

    return res.status(200).json({ gym: responseData });
  } catch (error) {
    console.error('Error fetching gym details:', error);
    return res.status(500).json({ error: 'Internal server error fetching gym details.' });
  }
};
