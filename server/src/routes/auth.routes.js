import { Router } from 'express';
import { z } from 'zod';
import * as auth from '../services/auth.service.js';

const email = z.string({ required_error: 'El email es obligatorio' })
  .trim().toLowerCase().email('Email inválido');

const registerSchema = z.object({
  name: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio').max(100),
  email,
  password: z.string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'La contraseña es obligatoria' }).min(1, 'La contraseña es obligatoria'),
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
