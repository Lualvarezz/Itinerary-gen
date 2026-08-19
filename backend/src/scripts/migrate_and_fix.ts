import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- Converting all enum columns to VARCHAR ---');

  const alterStatements = [
    `ALTER TABLE IF EXISTS users ALTER COLUMN role DROP DEFAULT;`,
    `ALTER TABLE IF EXISTS users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;`,
    `ALTER TABLE IF EXISTS users ALTER COLUMN role SET DEFAULT 'operator';`,

    `ALTER TABLE IF EXISTS users ALTER COLUMN status DROP DEFAULT;`,
    `ALTER TABLE IF EXISTS users ALTER COLUMN status TYPE VARCHAR(50) USING status::text;`,
    `ALTER TABLE IF EXISTS users ALTER COLUMN status SET DEFAULT 'active';`,
  ];

  for (const sql of alterStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e: any) {
      console.error('Error on SQL:', sql, e.message);
    }
  }

  console.log('--- Testing User and Client Queries ---');
  const user = await prisma.user.findFirst();
  console.log('Found user:', user?.id, user?.email, user?.role);

  const userId = user?.id || '11111111-1111-1111-1111-111111111111';
  const client = await prisma.client.create({
    data: {
      fullName: 'Cliente de Prueba Automatizado',
      documentNumber: `DOC-${Date.now()}`,
      nationality: 'Colombiana',
      numberOfPeople: 3,
      status: 'active',
      createdByUserId: userId,
    },
  });
  console.log('Successfully created client:', client.id, client.fullName);

  await prisma.client.delete({ where: { id: client.id } });
  console.log('Client cleaned up successfully.');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
