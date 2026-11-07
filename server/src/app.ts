import express from 'express';
import cors from 'cors';
import { config } from './config.ts';
import { authRouter } from './routes/auth.routes.ts';
import { meRouter } from './routes/me.routes.ts';
import { transfersRouter } from './routes/transfers.routes.ts';
import { errorHandler, notFound } from './middleware/errorHandler.ts';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/transfers', transfersRouter);

app.use(notFound);
app.use(errorHandler);
