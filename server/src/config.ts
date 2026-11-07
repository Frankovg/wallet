import type { SignOptions } from 'jsonwebtoken';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key} (see .env.example)`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as NonNullable<SignOptions['expiresIn']>,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

export const INITIAL_BALANCE_CENTS = 100000; // $1000.00
