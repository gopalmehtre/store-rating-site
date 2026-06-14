import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { signToken } from '../utils/jwt';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../utils/validators';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address } = req.body;

    const nameErr = validateName(name);
    if (nameErr) { res.status(400).json({ message: nameErr }); return; }

    const emailErr = validateEmail(email);
    if (emailErr) { res.status(400).json({ message: emailErr }); return; }

    const passwordErr = validatePassword(password);
    if (passwordErr) { res.status(400).json({ message: passwordErr }); return; }

    const addressErr = validateAddress(address);
    if (addressErr) { res.status(400).json({ message: addressErr }); return; }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ message: 'Email already registered.' }); return; }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role: 'USER' },
    });

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ message: 'Invalid email or password.' }); return; }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { res.status(401).json({ message: 'Invalid email or password.' }); return; }

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ message: 'Server error during login.' });
  }
};
