import { Router } from 'express';
import { z } from 'zod';
import * as auth from '../services/auth.service.ts';

const email = z.string({ required_error: 'Email is required' })
  .trim().toLowerCase().email('Invalid email');

const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name is required').max(100),
  email,
  password: z.string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const data = registerSchema.parse(req.body ?? {});
  res.status(201).json(await auth.register(data));
});

authRouter.post('/login', async (req, res) => {
  const data = loginSchema.parse(req.body ?? {});
  res.json(await auth.login(data));
});
