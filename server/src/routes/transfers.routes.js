import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { parseAmountToCents } from '../utils/money.js';
import { createTransfer, listTransfers } from '../services/transfer.service.js';

const transferSchema = z.object({
  toEmail: z.string({ required_error: 'El email del destinatario es obligatorio' })
    .trim().toLowerCase().email('Email del destinatario inválido'),
  // Decimal amount as a string ("12.50"); converted to cents without floats.
  amount: z.union([z.string(), z.number()], { required_error: 'El monto es obligatorio' }),
});

export const transfersRouter = Router();
transfersRouter.use(requireAuth);

transfersRouter.post('/', async (req, res) => {
  const { toEmail, amount } = transferSchema.parse(req.body ?? {});
  const cents = parseAmountToCents(amount);
  // The sender always comes from the token, never from the body.
  const result = await createTransfer({ userId: req.user.id, toEmail, amount: cents });
  res.status(201).json(result);
});

transfersRouter.get('/', async (req, res) => {
  res.json(await listTransfers(req.user.id));
});
