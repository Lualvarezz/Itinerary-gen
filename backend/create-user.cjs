const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  await prisma.user.createMany({
    data: [{
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Carmen Alvarez',
      email: 'carmenalvarezmar@gmail.com',
      passwordHash: '$2a$10$QYlnm7o0Ae58W6SgS2dJx.6wC6D5J0dqF4yq4iVYB3M5szwWnQ6s2',
      role: 'admin',
      status: 'active',
    }],
    skipDuplicates: true,
  });
  console.log('operator user ready');
  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
