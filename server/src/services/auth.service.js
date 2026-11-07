import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { config, INITIAL_BALANCE_CENTS } from '../config.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 10;

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function signToken(userId) {
  return jwt.sign({}, config.jwtSecret, { subject: userId, expiresIn: config.jwtExpiresIn });
}

export async function register({ name, email, password }) {
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
      throw new AppError(409, 'EMAIL_TAKEN', 'Ya existe un usuario con ese email');
    }
    throw err;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }
  return { token: signToken(user.id), user: publicUser(user) };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { account: true },
  });
  if (!user || !user.account) {
    throw new AppError(401, 'UNAUTHORIZED', 'El usuario del token ya no existe');
  }
  return { user: publicUser(user), account: { balance: user.account.balance } };
}
