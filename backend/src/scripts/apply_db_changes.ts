import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- Applying missing columns and tables to database ---');

  // 1. Update itineraries table with public_token and feedback_status
  console.log('Updating itineraries table...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS public_token TEXT;
  `);

  // Generate uuid for any existing rows that lack public_token
  await prisma.$executeRawUnsafe(`
    UPDATE itineraries SET public_token = gen_random_uuid()::text WHERE public_token IS NULL;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE itineraries ALTER COLUMN public_token SET NOT NULL;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'itineraries_public_token_key'
      ) THEN
        ALTER TABLE itineraries ADD CONSTRAINT itineraries_public_token_key UNIQUE (public_token);
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS feedback_status TEXT DEFAULT 'pending';
  `);

  // 2. Update clients table
  console.log('Updating clients table...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS hotel_id BIGINT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS room_number TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS acquisition_channel TEXT DEFAULT 'Recomendación de Hotel';
  `);

  // 3. Create hotels table if not exists
  console.log('Ensuring hotels table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      zone TEXT,
      sector TEXT,
      contact_phone TEXT,
      commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
      user_id UUID NOT NULL REFERENCES users(id),
      status VARCHAR NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE hotels ADD COLUMN IF NOT EXISTS address TEXT;
  `);

  // Foreign key for clients -> hotels
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'clients_hotel_id_fkey'
      ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  // 4. Create tour_plans table if not exists
  console.log('Ensuring tour_plans table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tour_plans (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
      discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
      status VARCHAR NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 5. Create tour_plan_activities table if not exists
  console.log('Ensuring tour_plan_activities table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tour_plan_activities (
      id SERIAL PRIMARY KEY,
      tour_plan_id INTEGER NOT NULL REFERENCES tour_plans(id) ON DELETE CASCADE,
      activity_id BIGINT NOT NULL REFERENCES activities(id),
      quantity_people INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT tour_plan_activity_unique UNIQUE (tour_plan_id, activity_id)
    );
  `);

  // 6. Create reviews table if not exists
  console.log('Ensuring reviews table exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      itinerary_item_id BIGINT NOT NULL,
      rating_overall INTEGER NOT NULL,
      rating_lunch INTEGER,
      rating_guide INTEGER,
      rating_transport INTEGER,
      comment TEXT,
      client_ip TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log('--- All database updates applied successfully! ---');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error applying DB changes:', e);
  process.exit(1);
});
