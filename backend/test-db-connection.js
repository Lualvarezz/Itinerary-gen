import { PrismaClient } from '@prisma/client';

const pass = encodeURIComponent('BOGOTA$2219%');
const projectRef = 'jfpqrwwlfugmcaxsrzec';

const hosts = [
  `aws-0-sa-east-1.pooler.supabase.com:6543`,
  `aws-0-us-east-1.pooler.supabase.com:6543`,
  `aws-1-us-east-2.pooler.supabase.com:6543`,
  `aws-0-us-west-1.pooler.supabase.com:6543`,
];

async function testHost(host) {
  const url = `postgresql://postgres.${projectRef}:${pass}@${host}/postgres?sslmode=require&pgbouncer=true`;
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    const user = await prisma.user.findFirst();
    console.log(`SUCCESS with host ${host}! Found user:`, user?.email || 'None');
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`FAIL with host ${host}:`, err.message.slice(0, 150));
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  for (const h of hosts) {
    console.log(`Testing host ${h}...`);
    const ok = await testHost(h);
    if (ok) {
      console.log(`\n===> WORKING HOST: ${h} <===`);
      break;
    }
  }
}

run();
