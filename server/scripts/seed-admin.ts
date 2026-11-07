// Usage: node --env-file=.env scripts/seed-admin.ts [email] [password] [name]
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db.ts';
import { INITIAL_BALANCE_CENTS } from '../src/config.ts';

const [email = 'admin@admin.com', password = 'admin', name = 'Admin'] = process.argv.slice(2);

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log(`${email} already exists`);
} else {
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      account: { create: { balance: INITIAL_BALANCE_CENTS } },
    },
  });
  console.log(`Created ${email} / ${password} (initial balance $1000)`);
}
await prisma.$disconnect();
