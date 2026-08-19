import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- Inspecting Database Types & Sequences ---');

  // 1. Check columns and types for categories, tourist_places, clients
  const columns = await prisma.$queryRaw<Array<{ table_name: string; column_name: string; udt_name: string; data_type: string }>>`
    SELECT table_name, column_name, udt_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('categories', 'tourist_places', 'clients', 'activities', 'schedules', 'itineraries')
    ORDER BY table_name, ordinal_position;
  `;

  console.log('Columns:', JSON.stringify(columns, null, 2));

  // 2. Check enums
  const enums = await prisma.$queryRaw<Array<{ enum_name: string; enum_value: string }>>`
    SELECT t.typname AS enum_name, e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public';
  `;

  console.log('Enums in DB:', JSON.stringify(enums, null, 2));

  // 3. Fix sequences
  const tables = ['categories', 'tourist_places', 'clients', 'activities', 'schedules', 'itineraries', 'itinerary_items'];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(max(id), 1)) FROM ${table};
      `);
      console.log(`Sequence for ${table} reset successfully.`);
    } catch (e: any) {
      console.log(`Could not reset sequence for ${table}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
