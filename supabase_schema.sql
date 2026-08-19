-- =========================================================
-- MVP: Generador de Itinerarios Turísticos Personalizados
-- Script SQL para Supabase PostgreSQL
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE entity_status AS ENUM ('active', 'inactive');
CREATE TYPE activity_status AS ENUM ('available', 'unavailable');
CREATE TYPE schedule_status AS ENUM ('available', 'complete', 'cancelled');
CREATE TYPE itinerary_status AS ENUM ('draft', 'pending', 'confirmed', 'cancelled', 'finished');

-- =========================================================
-- 1. Usuarios y configuración
-- =========================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    phone TEXT,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.agency_profiles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'Cartagena',
    phone TEXT,
    email TEXT,
    nit TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. Catálogos
-- =========================================================
CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.tourist_places (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    city TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. Actividades
-- =========================================================
CREATE TABLE public.activities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    tourist_place_id BIGINT NOT NULL REFERENCES public.tourist_places(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    image_url TEXT,
    status activity_status NOT NULL DEFAULT 'available',
    created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. Clientes
-- =========================================================
CREATE TABLE public.clients (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    document_number TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    nationality TEXT NOT NULL,
    number_of_people INTEGER NOT NULL DEFAULT 1 CHECK (number_of_people > 0),
    observations TEXT,
    status entity_status NOT NULL DEFAULT 'active',
    created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 5. Horarios
-- =========================================================
CREATE TABLE public.schedules (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES public.activities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    available_slots INTEGER NOT NULL DEFAULT 0 CHECK (available_slots >= 0),
    status schedule_status NOT NULL DEFAULT 'available',
    created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time)
);

-- =========================================================
-- 6. Itinerarios
-- =========================================================
CREATE TABLE public.itineraries (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    operator_user_id UUID NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status itinerary_status NOT NULL DEFAULT 'draft',
    observations TEXT,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 7. Detalle del itinerario
-- =========================================================
CREATE TABLE public.itinerary_items (
    id BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL REFERENCES public.itineraries(id) ON UPDATE CASCADE ON DELETE CASCADE,
    activity_id BIGINT NOT NULL REFERENCES public.activities(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    schedule_id BIGINT NOT NULL REFERENCES public.schedules(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    quantity_people INTEGER NOT NULL CHECK (quantity_people > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_itinerary_schedule UNIQUE (itinerary_id, schedule_id)
);

-- =========================================================
-- Índices
-- =========================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_categories_status ON public.categories(status);
CREATE INDEX idx_tourist_places_city ON public.tourist_places(city);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_activities_category ON public.activities(category_id);
CREATE INDEX idx_activities_place ON public.activities(tourist_place_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_document ON public.clients(document_number);
CREATE INDEX idx_schedules_date ON public.schedules(schedule_date);
CREATE INDEX idx_schedules_activity ON public.schedules(activity_id);
CREATE INDEX idx_itineraries_status ON public.itineraries(status);
CREATE INDEX idx_itineraries_client ON public.itineraries(client_id);
CREATE INDEX idx_itinerary_items_itinerary ON public.itinerary_items(itinerary_id);
CREATE INDEX idx_itinerary_items_schedule ON public.itinerary_items(schedule_id);

-- =========================================================
-- Triggers y funciones para reglas de negocio
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_schedule_available_slots()
RETURNS TRIGGER AS $$
DECLARE
    v_booked INTEGER;
    v_schedule_id BIGINT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_schedule_id := OLD.schedule_id;
    ELSE
        v_schedule_id := NEW.schedule_id;
    END IF;

    SELECT COALESCE(SUM(quantity_people), 0)
    INTO v_booked
    FROM public.itinerary_items
    WHERE schedule_id = v_schedule_id;

    UPDATE public.schedules
    SET available_slots = GREATEST(0, capacity - v_booked),
        updated_at = NOW()
    WHERE id = v_schedule_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.enforce_schedule_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_booked INTEGER;
    v_capacity INTEGER;
BEGIN
    SELECT capacity
    INTO v_capacity
    FROM public.schedules
    WHERE id = NEW.schedule_id;

    SELECT COALESCE(SUM(quantity_people), 0)
    INTO v_booked
    FROM public.itinerary_items
    WHERE schedule_id = NEW.schedule_id
      AND id <> COALESCE(NEW.id, -1);

    IF v_capacity - v_booked < NEW.quantity_people THEN
        RAISE EXCEPTION 'No hay capacidad suficiente para este horario.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_itinerary_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.itineraries
        SET total_amount = COALESCE((
            SELECT SUM(subtotal) FROM public.itinerary_items WHERE itinerary_id = OLD.itinerary_id
        ), 0),
            updated_at = NOW()
        WHERE id = OLD.itinerary_id;
        RETURN OLD;
    ELSE
        UPDATE public.itineraries
        SET total_amount = COALESCE((
            SELECT SUM(subtotal) FROM public.itinerary_items WHERE itinerary_id = NEW.itinerary_id
        ), 0),
            updated_at = NOW()
        WHERE id = NEW.itinerary_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_itinerary_item_capacity
BEFORE INSERT OR UPDATE OF quantity_people, schedule_id ON public.itinerary_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_schedule_capacity();

CREATE TRIGGER trg_itinerary_item_schedule_slots
AFTER INSERT OR UPDATE OR DELETE ON public.itinerary_items
FOR EACH ROW
EXECUTE FUNCTION public.update_schedule_available_slots();

CREATE TRIGGER trg_itinerary_item_total
AFTER INSERT OR UPDATE OR DELETE ON public.itinerary_items
FOR EACH ROW
EXECUTE FUNCTION public.update_itinerary_total();

-- =========================================================
-- Datos iniciales sugeridos (opcional)
-- =========================================================
-- INSERT INTO public.agency_profiles (name, city, phone, email, nit)
-- VALUES ('Agencia Cartagena Tours', 'Cartagena', '+57 300 000 0000', 'info@cartagenatours.com', '900123456-7');

-- =========================================================
-- Fin del script
-- =========================================================