import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.ts';
import { parseAmountToCents } from '../utils/money.ts';
import { createTransfer, listTransfers } from '../services/transfer.service.ts';

const transferSchema = z.object({
  toEmail: z.string({ required_error: 'Recipient email is required' })
    .trim().toLowerCase().email('Invalid recipient email'),
  // Decimal amount as a string ("12.50"); converted to cents without floats.
  amount: z.union([z.string(), z.number()], { required_error: 'Amount is required' }),
});

export const transfersRouter = Router();
transfersRouter.use(requireAuth);

transfersRouter.post('/', async (req, res) => {
  const { toEmail, amount } = transferSchema.parse(req.body ?? {});
  const cents = parseAmountToCents(amount);
  // The sender always comes from the token, never from the body.
  const result = await createTransfer({ userId: req.user!.id, toEmail, amount: cents });
  res.status(201).json(result);
});

transfersRouter.get('/', async (req, res) => {
  res.json(await listTransfers(req.user!.id));
});
