// Usage: node --env-file=.env scripts/seed-admin.js [email] [password] [name]
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db.js';
import { INITIAL_BALANCE_CENTS } from '../src/config.js';

const [email = 'admin@admin.com', password = 'admin', name = 'Admin'] = process.argv.slice(2);

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`Ya existe ${email}`);
} else {
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      account: { create: { balance: INITIAL_BALANCE_CENTS } },
    },
  });
  console.log(`Creado ${email} / ${password} (saldo inicial $1000)`);
}
await prisma.$disconnect();
