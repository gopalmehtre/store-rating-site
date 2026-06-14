import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';

export const getOwnerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      res.status(404).json({ message: 'No store found for this owner.' });
      return;
    }

    const avgRating =
      store.ratings.length > 0
        ? parseFloat(
            (store.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / store.ratings.length).toFixed(1)
          )
        : null;

    const ratersList = store.ratings.map((r: {
      id: number; rating: number; createdAt: Date;
      user: { id: number; name: string; email: string };
    }) => ({
      ratingId: r.id,
      rating: r.rating,
      ratedAt: r.createdAt,
      user: r.user,
    }));

    res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      avgRating,
      totalRatings: store.ratings.length,
      raters: ratersList,
    });
  } catch {
    res.status(500).json({ message: 'Error fetching owner dashboard.' });
  }
};
