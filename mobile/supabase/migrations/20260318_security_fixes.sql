-- =============================================================================
-- SECURITY FIXES - 2026-03-18
-- Addresses vulnerabilities flagged by Supabase Security Advisor:
-- 1. SECURITY DEFINER functions missing SET search_path (schema injection risk)
-- 2. handle_new_user trusts user-supplied user_type (privilege escalation risk)
-- 3. Move trial claim tracking to database with RLS (removes exposed API secret)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- FIX 1: Secure all SECURITY DEFINER functions with fixed search_path
-- and validate user_type to prevent privilege escalation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_user_type TEXT;
BEGIN
  -- SECURITY: Only allow 'customer' or 'professional'.
  -- Never trust arbitrary user_type from signup metadata — reject anything else.
  safe_user_type := CASE
    WHEN NEW.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'
    ELSE 'customer'
  END;

  INSERT INTO public.profiles (id, user_type, name, phone)
  VALUES (
    NEW.id,
    safe_user_type,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger (no change, just ensures it uses the updated function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- FIX 2: Secure update_professional_rating with fixed search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE professional_id = NEW.professional_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE professional_id = NEW.professional_id)
  WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_professional_rating();

-- ---------------------------------------------------------------------------
-- FIX 3: Secure increment_job_interested_count with fixed search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_job_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs SET interested_count = interested_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS on_job_purchase ON job_purchases;
CREATE TRIGGER on_job_purchase AFTER INSERT ON job_purchases
  FOR EACH ROW EXECUTE FUNCTION public.increment_job_interested_count();

-- ---------------------------------------------------------------------------
-- FIX 4: Secure deduct_credits_on_purchase with fixed search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.deduct_credits_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT credits FROM public.profiles WHERE id = NEW.professional_id) < NEW.credits_spent THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  UPDATE public.profiles SET credits = credits - NEW.credits_spent WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS on_job_purchase_deduct_credits ON job_purchases;
CREATE TRIGGER on_job_purchase_deduct_credits BEFORE INSERT ON job_purchases
  FOR EACH ROW EXECUTE FUNCTION public.deduct_credits_on_purchase();

-- ---------------------------------------------------------------------------
-- FIX 5: Secure update_updated_at_column with fixed search_path
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Re-create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- FIX 6: Move trial claim tracking to Supabase with proper RLS
-- Removes reliance on the EXPO_PUBLIC_INTERNAL_API_SECRET being exposed
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.trial_claims (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  claimed_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT trial_claims_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.trial_claims ENABLE ROW LEVEL SECURITY;

-- Users can only see their own trial claim record
DROP POLICY IF EXISTS "Users can view own trial claim" ON public.trial_claims;
CREATE POLICY "Users can view own trial claim"
  ON public.trial_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert a record for themselves (UNIQUE constraint prevents duplicates)
DROP POLICY IF EXISTS "Users can claim trial once" ON public.trial_claims;
CREATE POLICY "Users can claim trial once"
  ON public.trial_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE allowed — trial claims are permanent
