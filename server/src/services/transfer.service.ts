import { prisma } from '../db.ts';
import { AppError } from '../utils/AppError.ts';

/**
 * Transfers `amount` cents from the authenticated user's account
 * to the account of the user with email `toEmail`.
 * Debit, credit and record creation happen in a single transaction.
 */
export async function createTransfer({
  userId,
  toEmail,
  amount,
}: {
  userId: string;
  toEmail: string;
  amount: number;
}) {
  return prisma.$transaction(async (tx) => {
    const from = await tx.account.findUnique({ where: { userId } });
    if (!from) throw new AppError(401, 'UNAUTHORIZED', 'The token user no longer exists');

    const to = await tx.account.findFirst({ where: { user: { email: toEmail } } });
    if (!to) throw new AppError(404, 'RECIPIENT_NOT_FOUND', 'No user exists with that email');
    if (to.id === from.id) throw new AppError(400, 'SELF_TRANSFER', 'You cannot transfer to yourself');

    // Check-and-debit in a single conditional UPDATE: Postgres takes the row lock,
    // so two concurrent transfers cannot spend the same balance.
    const debit = await tx.account.updateMany({
      where: { id: from.id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
    if (debit.count === 0) throw new AppError(422, 'INSUFFICIENT_FUNDS', 'Insufficient funds');

    await tx.account.update({
      where: { id: to.id },
      data: { balance: { increment: amount } },
    });

    const transfer = await tx.transfer.create({
      data: { fromAccountId: from.id, toAccountId: to.id, amount },
    });

    const { balance } = await tx.account.findUniqueOrThrow({
      where: { id: from.id },
      select: { balance: true },
    });

    return {
      transfer: {
        id: transfer.id,
        direction: 'sent' as const,
        counterpartEmail: toEmail,
        amount: transfer.amount,
        createdAt: transfer.createdAt,
      },
      balance,
    };
  });
}

export async function listTransfers(userId: string) {
  const account = await prisma.account.findUnique({ where: { userId } });
  if (!account) throw new AppError(401, 'UNAUTHORIZED', 'The token user no longer exists');

  const transfers = await prisma.transfer.findMany({
    where: { OR: [{ fromAccountId: account.id }, { toAccountId: account.id }] },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      fromAccount: { select: { user: { select: { email: true, name: true } } } },
      toAccount: { select: { user: { select: { email: true, name: true } } } },
    },
  });

  return transfers.map((t) => {
    const sent = t.fromAccountId === account.id;
    const counterpart = sent ? t.toAccount.user : t.fromAccount.user;
    return {
      id: t.id,
      direction: sent ? ('sent' as const) : ('received' as const),
      counterpartEmail: counterpart.email,
      counterpartName: counterpart.name,
      amount: t.amount,
      createdAt: t.createdAt,
    };
  });
}
