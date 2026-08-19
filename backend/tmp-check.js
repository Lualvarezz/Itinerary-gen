import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.user.findFirst({ where: { email: 'carmenalvarezmar@gmail.com' } })
  .then((user) => {
    console.log(JSON.stringify(user, null, 2));
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
