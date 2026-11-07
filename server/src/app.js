import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './routes/auth.routes.js';
import { meRouter } from './routes/me.routes.js';
import { transfersRouter } from './routes/transfers.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/transfers', transfersRouter);

app.use(notFound);
app.use(errorHandler);
