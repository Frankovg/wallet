import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.ts';
import { config, INITIAL_BALANCE_CENTS } from '../config.ts';
import { AppError } from '../utils/AppError.ts';

const SALT_ROUNDS = 10;

interface PublicUser {
  id: string;
  name: string;
  email: string;
}

const publicUser = (u: PublicUser): PublicUser => ({ id: u.id, name: u.name, email: u.email });

function signToken(userId: string): string {
  return jwt.sign({}, config.jwtSecret, { subject: userId, expiresIn: config.jwtExpiresIn });
}

export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    // Nested create: User + Account in a single transaction.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        account: { create: { balance: INITIAL_BALANCE_CENTS } },
      },
    });
    return { token: signToken(user.id), user: publicUser(user) };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'EMAIL_TAKEN', 'A user with that email already exists');
    }
    throw err;
  }
}

export async function login({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
  }
  return { token: signToken(user.id), user: publicUser(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { account: true },
  });
  if (!user || !user.account) {
    throw new AppError(401, 'UNAUTHORIZED', 'The token user no longer exists');
  }
  return { user: publicUser(user), account: { balance: user.account.balance } };
}
