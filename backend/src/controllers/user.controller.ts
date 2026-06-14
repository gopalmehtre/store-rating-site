import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validatePassword } from '../utils/validators';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, address: true, role: true },
    });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) { res.status(400).json({ message: 'Current password is incorrect.' }); return; }

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) { res.status(400).json({ message: passwordErr }); return; }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ message: 'Password updated successfully.' });
  } catch {
    res.status(500).json({ message: 'Error changing password.' });
  }
};

export const getStoreOwners = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'STORE_OWNER', store: null },
      select: { id: true, name: true, email: true },
    });
    res.json(owners);
  } catch {
    res.status(500).json({ message: 'Error fetching store owners.' });
  }
};
