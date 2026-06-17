import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * @route   POST /api/gyms/:gymId/reviews
 * @desc    Submit a review for a gym and recalculate its average rating
 * @access  Private
 */
export const submitReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { gymId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!gymId) {
      return res.status(400).json({ error: 'Gym ID is required.' });
    }

    const ratingVal = parseFloat(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment must not be empty.' });
    }

    // 1. Check if gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      return res.status(404).json({ error: 'Gym not found.' });
    }

    // 2. Save the review inside a transaction
    const reviewResult = await prisma.$transaction(async (tx) => {
      // Create Review
      const review = await tx.review.create({
        data: {
          userId,
          gymId,
          rating: ratingVal,
          comment: comment.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Fetch all reviews for this gym to calculate new average
      const gymReviews = await tx.review.findMany({
        where: { gymId },
        select: { rating: true },
      });

      const totalRating = gymReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / gymReviews.length;
      const roundedAvg = Math.round(avgRating * 10) / 10; // Round to 1 decimal place

      // Update Gym average rating
      await tx.gym.update({
        where: { id: gymId },
        data: {
          rating: roundedAvg,
        },
      });

      return { review, roundedAvg };
    });

    return res.status(201).json({
      message: 'Review submitted successfully',
      review: reviewResult.review,
      updatedGymRating: reviewResult.roundedAvg,
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return res.status(500).json({ error: 'Internal server error submitting review.' });
  }
};
