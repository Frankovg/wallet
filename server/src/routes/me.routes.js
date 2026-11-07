import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe } from '../services/auth.service.js';

export const meRouter = Router();

meRouter.get('/', requireAuth, async (req, res) => {
  res.json(await getMe(req.user.id));
});
