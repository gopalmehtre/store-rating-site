import { Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validateRating } from '../utils/validators';

export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user!.userId;

    const ratingErr = validateRating(Number(rating));
    if (ratingErr) { res.status(400).json({ message: ratingErr }); return; }

    const store = await prisma.store.findUnique({ where: { id: Number(storeId) } });
    if (!store) { res.status(404).json({ message: 'Store not found.' }); return; }

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId: Number(storeId) } },
    });

    if (existing) {
      res.status(409).json({ message: 'You have already rated this store. Update your rating instead.' });
      return;
    }

    const newRating = await prisma.rating.create({
      data: { userId, storeId: Number(storeId), rating: Number(rating) },
    });

    res.status(201).json(newRating);
  } catch {
    res.status(500).json({ message: 'Error submitting rating.' });
  }
};

export const updateRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user!.userId;

    const ratingErr = validateRating(Number(rating));
    if (ratingErr) { res.status(400).json({ message: ratingErr }); return; }

    const existing = await prisma.rating.findUnique({ where: { id: Number(id) } });
    if (!existing) { res.status(404).json({ message: 'Rating not found.' }); return; }
    if (existing.userId !== userId) { res.status(403).json({ message: 'Forbidden: Not your rating.' }); return; }

    const updated = await prisma.rating.update({
      where: { id: Number(id) },
      data: { rating: Number(rating) },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error updating rating.' });
  }
};
