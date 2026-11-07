import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { getMe } from '../services/auth.service.ts';

export const meRouter = Router();

meRouter.get('/', requireAuth, async (req, res) => {
  res.json(await getMe(req.user!.id));
});
