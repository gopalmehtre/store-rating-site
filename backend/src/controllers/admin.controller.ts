import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/auth';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../utils/validators';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch {
    res.status(500).json({ message: 'Error fetching stats.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'asc' } = req.query as Record<string, string>;

    const validSortFields: Record<string, boolean> = { name: true, email: true, address: true, role: true };
    const sortField = validSortFields[sortBy] ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const users = await prisma.user.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: 'insensitive' } } : {},
          email ? { email: { contains: email, mode: 'insensitive' } } : {},
          address ? { address: { contains: address, mode: 'insensitive' } } : {},
          role ? { role: role as string } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: { select: { rating: true } },
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
    });

    const result = users.map((u: {
      id: number; name: string; email: string; address: string; role: string;
      store: { id: number; name: string; ratings: { rating: number }[] } | null;
    }) => {
      let avgRating = null;
      if (u.store && u.store.ratings.length > 0) {
        const sum = u.store.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
        avgRating = parseFloat((sum / u.store.ratings.length).toFixed(1));
      }
      return { ...u, store: u.store ? { id: u.store.id, name: u.store.name, avgRating } : null };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true, name: true, email: true, address: true, role: true,
        store: {
          select: {
            id: true, name: true,
            ratings: { select: { rating: true } },
          },
        },
      },
    });
    if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

    let avgRating = null;
    if (user.store && user.store.ratings.length > 0) {
      const sum = user.store.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
      avgRating = parseFloat((sum / user.store.ratings.length).toFixed(1));
    }

    res.json({ ...user, store: user.store ? { ...user.store, avgRating, ratings: undefined } : null });
  } catch {
    res.status(500).json({ message: 'Error fetching user.' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const nameErr = validateName(name);
    if (nameErr) { res.status(400).json({ message: nameErr }); return; }
    const emailErr = validateEmail(email);
    if (emailErr) { res.status(400).json({ message: emailErr }); return; }
    const passwordErr = validatePassword(password);
    if (passwordErr) { res.status(400).json({ message: passwordErr }); return; }
    const addressErr = validateAddress(address);
    if (addressErr) { res.status(400).json({ message: addressErr }); return; }

    if (!['ADMIN', 'USER', 'STORE_OWNER'].includes(role)) {
      res.status(400).json({ message: 'Invalid role.' }); return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ message: 'Email already registered.' }); return; }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role },
      select: { id: true, name: true, email: true, address: true, role: true },
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ message: 'Error creating user.' });
  }
};

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, sortBy = 'name', order = 'asc' } = req.query as Record<string, string>;

    const validSortFields: Record<string, boolean> = { name: true, email: true, address: true };
    const sortField = validSortFields[sortBy] ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where: {
        AND: [
          name ? { name: { contains: name, mode: 'insensitive' } } : {},
          email ? { email: { contains: email, mode: 'insensitive' } } : {},
          address ? { address: { contains: address, mode: 'insensitive' } } : {},
        ],
      },
      include: {
        ratings: { select: { rating: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [sortField]: sortOrder },
    });

    const result = stores.map((s: {
      id: number; name: string; email: string; address: string;
      ratings: { rating: number }[];
      owner: { id: number; name: string; email: string };
    }) => {
      const avgRating =
        s.ratings.length > 0
          ? parseFloat((s.ratings.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / s.ratings.length).toFixed(1))
          : null;
      return { id: s.id, name: s.name, email: s.email, address: s.address, avgRating, owner: s.owner };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Error fetching stores.' });
  }
};

export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameErr = validateName(name);
    if (nameErr) { res.status(400).json({ message: nameErr }); return; }
    const emailErr = validateEmail(email);
    if (emailErr) { res.status(400).json({ message: emailErr }); return; }
    const addressErr = validateAddress(address);
    if (addressErr) { res.status(400).json({ message: addressErr }); return; }
    if (!ownerId) { res.status(400).json({ message: 'Store owner is required.' }); return; }

    const owner = await prisma.user.findUnique({ where: { id: Number(ownerId) } });
    if (!owner || owner.role !== 'STORE_OWNER') {
      res.status(400).json({ message: 'Owner must be a user with STORE_OWNER role.' }); return;
    }

    const existingStore = await prisma.store.findUnique({ where: { ownerId: Number(ownerId) } });
    if (existingStore) {
      res.status(409).json({ message: 'This store owner already has a store.' }); return;
    }

    const emailExists = await prisma.store.findUnique({ where: { email } });
    if (emailExists) { res.status(409).json({ message: 'Store email already in use.' }); return; }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: Number(ownerId) },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(store);
  } catch {
    res.status(500).json({ message: 'Error creating store.' });
  }
};
