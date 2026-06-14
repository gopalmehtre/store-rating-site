import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, sortBy = 'name', order = 'asc' } = req.query as Record<string, string>;
    const userId = req.user!.userId;

    const validSortFields: Record<string, boolean> = { name: true, address: true };
    const sortField = validSortFields[sortBy] ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: 'insensitive' } } : {},
          address ? { address: { contains: address, mode: 'insensitive' } } : {},
        ],
      },
      include: {
        ratings: true,
      },
      orderBy: { [sortField]: sortOrder },
    });

    const result = stores.map((s: {
      id: number; name: string; email: string; address: string;
      ratings: { id: number; userId: number; storeId: number; rating: number }[];
    }) => {
      const avgRating =
        s.ratings.length > 0
          ? parseFloat((s.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / s.ratings.length).toFixed(1))
          : null;
      const userRating = s.ratings.find((r: { userId: number }) => r.userId === userId);
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        avgRating,
        userRating: userRating ? userRating.rating : null,
        userRatingId: userRating ? userRating.id : null,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Error fetching stores.' });
  }
};
