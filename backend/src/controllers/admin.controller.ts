import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Helper middleware or check inside controller to verify admin privileges.
 */
const verifyAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  });
  return !!user?.isAdmin;
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Fetch lists of users, gyms, and activity logs
 * @access  Private (Admin Only)
 */
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        lastLoginAt: true,
        isAdmin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const gyms = await prisma.gym.findMany({
      include: {
        trainers: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    const activityLogs = await prisma.activityLog.findMany({
      orderBy: {
        loggedAt: 'desc'
      },
      take: 100
    });

    return res.status(200).json({
      users,
      gyms,
      activityLogs
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return res.status(500).json({ error: 'Internal server error fetching admin details.' });
  }
};

/**
 * @route   POST /api/admin/gyms
 * @desc    Create a new gym listing
 * @access  Private (Admin Only)
 */
export const createGym = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { name, city, address, fee, amenities } = req.body;

    if (!name || !city || !address || isNaN(parseFloat(fee))) {
      return res.status(400).json({ error: 'Name, city, address, and numeric fee are required.' });
    }

    const parsedAmenities = Array.isArray(amenities) ? amenities : [];

    const gym = await prisma.gym.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        address: address.trim(),
        fee: parseFloat(fee),
        amenities: parsedAmenities
      }
    });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'GYM_CREATED',
        details: `Admin ${adminUser?.name} created gym "${gym.name}" in ${gym.city}.`
      }
    });

    return res.status(201).json({ message: 'Gym created successfully', gym });
  } catch (error) {
    console.error('Error creating gym:', error);
    return res.status(500).json({ error: 'Internal server error creating gym.' });
  }
};

/**
 * @route   PUT /api/admin/gyms/:id
 * @desc    Update an existing gym listing
 * @access  Private (Admin Only)
 */
export const updateGym = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;
    const { name, city, address, fee, rating, amenities } = req.body;

    const existingGym = await prisma.gym.findUnique({ where: { id } });
    if (!existingGym) {
      return res.status(404).json({ error: 'Gym not found.' });
    }

    const updatedData: any = {};
    if (name) updatedData.name = name.trim();
    if (city) updatedData.city = city.trim();
    if (address) updatedData.address = address.trim();
    if (fee !== undefined) updatedData.fee = parseFloat(fee);
    if (rating !== undefined) updatedData.rating = parseFloat(rating);
    if (amenities !== undefined) updatedData.amenities = Array.isArray(amenities) ? amenities : [];

    const gym = await prisma.gym.update({
      where: { id },
      data: updatedData
    });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'GYM_UPDATED',
        details: `Admin ${adminUser?.name} updated gym "${gym.name}" details.`
      }
    });

    return res.status(200).json({ message: 'Gym updated successfully', gym });
  } catch (error) {
    console.error('Error updating gym:', error);
    return res.status(500).json({ error: 'Internal server error updating gym.' });
  }
};

/**
 * @route   DELETE /api/admin/gyms/:id
 * @desc    Delete a gym listing
 * @access  Private (Admin Only)
 */
export const deleteGym = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;
    const gym = await prisma.gym.findUnique({ where: { id } });
    if (!gym) {
      return res.status(404).json({ error: 'Gym not found.' });
    }

    await prisma.gym.delete({ where: { id } });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'GYM_DELETED',
        details: `Admin ${adminUser?.name} deleted gym "${gym.name}".`
      }
    });

    return res.status(200).json({ message: 'Gym deleted successfully' });
  } catch (error) {
    console.error('Error deleting gym:', error);
    return res.status(500).json({ error: 'Internal server error deleting gym.' });
  }
};

/**
 * @route   POST /api/admin/trainers
 * @desc    Create a new trainer linked to a gym
 * @access  Private (Admin Only)
 */
export const createTrainer = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { gymId, name, phone, specialization, fee, experience } = req.body;

    if (!gymId || !name || !phone || !specialization || isNaN(parseFloat(fee)) || isNaN(parseInt(experience))) {
      return res.status(400).json({ error: 'All trainer fields (gymId, name, phone, specialization, fee, experience) are required.' });
    }

    const gymExists = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gymExists) {
      return res.status(400).json({ error: 'Referenced gym does not exist.' });
    }

    const trainer = await prisma.trainer.create({
      data: {
        gymId,
        name: name.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        fee: parseFloat(fee),
        experience: parseInt(experience)
      }
    });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'TRAINER_CREATED',
        details: `Admin ${adminUser?.name} registered trainer "${trainer.name}" to gym "${gymExists.name}".`
      }
    });

    return res.status(201).json({ message: 'Trainer registered successfully', trainer });
  } catch (error) {
    console.error('Error creating trainer:', error);
    return res.status(500).json({ error: 'Internal server error creating trainer.' });
  }
};

/**
 * @route   PUT /api/admin/trainers/:id
 * @desc    Update trainer details
 * @access  Private (Admin Only)
 */
export const updateTrainer = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;
    const { name, phone, specialization, fee, experience } = req.body;

    const existingTrainer = await prisma.trainer.findUnique({ where: { id } });
    if (!existingTrainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    const updatedData: any = {};
    if (name) updatedData.name = name.trim();
    if (phone) updatedData.phone = phone.trim();
    if (specialization) updatedData.specialization = specialization.trim();
    if (fee !== undefined) updatedData.fee = parseFloat(fee);
    if (experience !== undefined) updatedData.experience = parseInt(experience);

    const trainer = await prisma.trainer.update({
      where: { id },
      data: updatedData
    });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'TRAINER_UPDATED',
        details: `Admin ${adminUser?.name} updated trainer "${trainer.name}" details.`
      }
    });

    return res.status(200).json({ message: 'Trainer updated successfully', trainer });
  } catch (error) {
    console.error('Error updating trainer:', error);
    return res.status(500).json({ error: 'Internal server error updating trainer.' });
  }
};

/**
 * @route   DELETE /api/admin/trainers/:id
 * @desc    Delete a trainer listing
 * @access  Private (Admin Only)
 */
export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId || !(await verifyAdmin(userId))) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id } = req.params;
    const trainer = await prisma.trainer.findUnique({ where: { id } });
    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found.' });
    }

    await prisma.trainer.delete({ where: { id } });

    // Log admin activity
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.activityLog.create({
      data: {
        action: 'TRAINER_DELETED',
        details: `Admin ${adminUser?.name} deleted trainer "${trainer.name}".`
      }
    });

    return res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    return res.status(500).json({ error: 'Internal server error deleting trainer.' });
  }
};
